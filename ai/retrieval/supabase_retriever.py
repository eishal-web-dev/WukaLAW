"""Backend-only Supabase pgvector retriever for Pakistani judgments."""
from __future__ import annotations

import httpx
from urllib.parse import urlsplit

from .models import LegalSearchQuery, LegalSearchResult
from .query_builder import build_query_text


def normalize_supabase_project_url(url: str) -> str:
    """Return the Data API origin even when a Storage/S3 URL was supplied.

    Supabase displays a separate ``<ref>.storage.supabase.co/storage/v1/s3``
    endpoint for S3 clients. PostgREST RPCs live on ``<ref>.supabase.co``.
    Accepting either avoids a hard-to-diagnose 404 while keeping the service
    role credential server-side.
    """
    value = url.strip()
    parsed = urlsplit(value if "://" in value else f"https://{value}")
    hostname = (parsed.hostname or "").casefold()
    if hostname.endswith(".storage.supabase.co"):
        hostname = hostname.replace(".storage.supabase.co", ".supabase.co")
    if not hostname:
        raise RuntimeError("SUPABASE_URL is not a valid Supabase project URL.")
    scheme = parsed.scheme or "https"
    port = f":{parsed.port}" if parsed.port else ""
    return f"{scheme}://{hostname}{port}"


class SupabaseLegalRetriever:
    def __init__(self, url: str, service_role_key: str, provider, timeout: float = 30.0):
        if not url.strip() or not service_role_key.strip():
            raise RuntimeError("Supabase legal corpus credentials are not configured.")
        self.url = normalize_supabase_project_url(url)
        self.key = service_role_key
        self.provider = provider
        self.timeout = timeout

    @property
    def headers(self) -> dict[str, str]:
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    def search(self, query: LegalSearchQuery) -> list[LegalSearchResult]:
        # Exact document lookup is not a semantic-search operation. The RPC
        # intentionally has no document-id argument, so sending an embedding
        # query here used to return an entirely different judgment. Read the
        # requested rows directly through PostgREST instead.
        if query.document_ids:
            return self._exact_documents(query)

        vectors, _ = self.provider.encode_dense([build_query_text(query)], 1, True)
        if vectors.shape != (1, 1024):
            raise ValueError(
                f"Supabase legal index expects 1024-dimensional BGE-M3 embeddings; got {vectors.shape[1]}."
            )
        body = {
            "query_embedding": vectors[0].tolist(),
            "match_count": min(max(query.top_k * 4, query.top_k), 100),
            "match_threshold": query.score_threshold if query.score_threshold is not None else 0.2,
            "filter_court": query.courts[0] if query.courts else None,
            "filter_jurisdiction": query.jurisdictions[0] if query.jurisdictions else "Pakistan",
            "filter_category": query.case_categories[0] if query.case_categories else None,
            "require_outcome": query.require_outcome,
        }
        try:
            response = httpx.post(
                f"{self.url}/rest/v1/rpc/match_legal_judgments",
                headers=self.headers,
                json=body,
                timeout=self.timeout,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise self._status_error("search", exc) from exc
        except httpx.TimeoutException as exc:
            raise RuntimeError("Supabase legal corpus HTTPS request timed out.") from exc
        except httpx.LocalProtocolError as exc:
            raise RuntimeError("Supabase legal corpus request configuration is invalid; check URL/key formatting.") from exc
        except httpx.ConnectError as exc:
            detail = str(exc).casefold()
            if any(token in detail for token in ("getaddrinfo", "name resolution", "nodename")):
                raise RuntimeError("Supabase legal corpus DNS lookup failed.") from exc
            if any(token in detail for token in ("certificate", "ssl", "tls")):
                raise RuntimeError("Supabase legal corpus TLS verification failed.") from exc
            raise RuntimeError("Supabase legal corpus HTTPS connection failed.") from exc
        except httpx.HTTPError as exc:
            raise RuntimeError("Supabase legal corpus network request failed.") from exc

        return self._map_rows(response.json(), "Retrieved from Supabase pgvector.")

    def _exact_documents(self, query: LegalSearchQuery) -> list[LegalSearchResult]:
        columns = ",".join((
            "canonical_chunk_id", "source_path", "source_dataset", "document_id",
            "title", "court", "jurisdiction", "case_category", "case_number",
            "decision_date", "language", "chunk_type", "heading", "text_content",
            "text_preview", "explicit_outcome_phrase", "legal_citations", "laws_cited",
            "sections_cited", "articles_cited", "metadata",
        ))
        rows: list[dict] = []
        for document_id in query.document_ids:
            try:
                response = httpx.get(
                    f"{self.url}/rest/v1/legal_judgment_chunks",
                    headers=self.headers,
                    params={
                        "select": columns,
                        "document_id": f"eq.{document_id}",
                        "order": "id.asc",
                        "limit": str(min(max(query.top_k, 1), 100)),
                    },
                    timeout=self.timeout,
                )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise self._status_error("document lookup", exc) from exc
            except httpx.TimeoutException as exc:
                raise RuntimeError("Supabase legal corpus HTTPS request timed out.") from exc
            except httpx.LocalProtocolError as exc:
                raise RuntimeError("Supabase legal corpus request configuration is invalid; check URL/key formatting.") from exc
            except httpx.ConnectError as exc:
                detail = str(exc).casefold()
                if any(token in detail for token in ("getaddrinfo", "name resolution", "nodename")):
                    raise RuntimeError("Supabase legal corpus DNS lookup failed.") from exc
                if any(token in detail for token in ("certificate", "ssl", "tls")):
                    raise RuntimeError("Supabase legal corpus TLS verification failed.") from exc
                raise RuntimeError("Supabase legal corpus HTTPS connection failed.") from exc
            except httpx.HTTPError as exc:
                raise RuntimeError("Supabase legal corpus network request failed.") from exc
            rows.extend(response.json())
        return self._map_rows(rows, "Retrieved by exact document ID from Supabase.")

    @staticmethod
    def _status_error(action: str, exc: httpx.HTTPStatusError) -> RuntimeError:
        status = exc.response.status_code
        if status in {401, 403}:
            return RuntimeError(
                "Supabase legal corpus authentication failed; check the backend service-role key."
            )
        if status == 404:
            return RuntimeError(
                "Supabase legal corpus RPC/table was not found; verify that the legal-index migration was applied."
            )
        if status == 400:
            return RuntimeError(
                "Supabase legal corpus rejected the vector search request; verify the migration and embedding dimensions."
            )
        return RuntimeError(f"Supabase legal corpus {action} failed with HTTP {status}.")

    @staticmethod
    def _map_rows(rows: list[dict], warning: str) -> list[LegalSearchResult]:
        results: list[LegalSearchResult] = []
        seen: set[str] = set()
        for row in rows:
            chunk_id = str(row.get("canonical_chunk_id") or "")
            if not chunk_id or chunk_id in seen:
                continue
            seen.add(chunk_id)
            metadata = dict(row.get("metadata") or {})
            metadata.update(row)
            results.append(LegalSearchResult(
                rank=len(results) + 1,
                score=float(row.get("similarity") or 0),
                canonical_chunk_id=chunk_id,
                source_chunk_ids=[chunk_id],
                document_id=str(row.get("document_id") or ""),
                title=row.get("title"),
                source_path=str(row.get("source_path") or ""),
                source_dataset=str(row.get("source_dataset") or "supabase-storage"),
                document_type="judgment",
                court=row.get("court"),
                jurisdiction=row.get("jurisdiction"),
                case_category=row.get("case_category"),
                case_number=row.get("case_number"),
                chunk_type=str(row.get("chunk_type") or "judgment"),
                heading=row.get("heading"), section_number=None, article_number=None,
                language=row.get("language"),
                text_preview=str(row.get("text_content") or row.get("text_preview") or ""),
                explicit_outcome_phrase=row.get("explicit_outcome_phrase"),
                legal_citations=list(row.get("legal_citations") or []),
                laws_cited=list(row.get("laws_cited") or []),
                sections_cited=list(row.get("sections_cited") or []),
                articles_cited=list(row.get("articles_cited") or []),
                duplicate_sources=[], payload=metadata, warnings=[warning],
            ))
        return results
