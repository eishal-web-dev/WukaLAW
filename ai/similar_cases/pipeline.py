"""End-to-end deterministic similar Pakistani judgment search."""
from __future__ import annotations
import time
from ai.legal_intelligence.pipeline import analyze
from .candidate_retriever import CandidateRetriever
from .explanation_builder import build_differences, build_explanation
from .models import SimilarCaseRequest, SimilarCaseResponse, SimilarCaseResult
from .query_builder import build_candidate_query
from .result_ranker import label, rank_candidates, SimilarityThresholds


class SimilarCasePipeline:
    def __init__(self, retriever, intelligence_analyzer=analyze, adapter=None, weights=None, thresholds=None):
        self.candidates = CandidateRetriever(retriever)
        self.analyze = intelligence_analyzer
        self.adapter = adapter
        self.weights = weights
        self.thresholds = thresholds or SimilarityThresholds()

    def run(self, request):
        started = time.perf_counter()
        request.validate()
        warnings = []
        seed = (request.situation or request.case_number or request.document_id).strip()
        exclude = None
        source_chunks = []

        if request.document_id:
            source_chunks, profile = self.candidates.source_profile(request.document_id, seed)
            if not profile:
                return SimilarCaseResponse(
                    request.situation,
                    "",
                    {},
                    {"document_types": ["judgment"]},
                    0,
                    [],
                    ["Source document was not found or had no searchable chunks."],
                    (time.perf_counter() - started) * 1000,
                )
            seed = profile
            exclude = request.document_id

        intelligence = self.analyze(seed)
        instructions = build_candidate_query(request, intelligence, self.adapter)
        instructions.retrieval_query = intelligence.normalized_query or seed
        raw = self.candidates.retrieve(instructions, exclude)

        source_hashes = {
            x.payload.get("duplicate_hash")
            for x in source_chunks
            if x.payload.get("duplicate_hash")
        }
        raw = [
            x for x in raw
            if not x.payload.get("duplicate_hash")
            or x.payload.get("duplicate_hash") not in source_hashes
        ]

        ranked = rank_candidates(raw, intelligence, request, self.weights, self.thresholds)

        # Do not show weak semantic neighbours as legal precedents. The previous
        # implementation displayed every top vector hit, which made unrelated tax,
        # constitutional or generic judgments look deceptively similar.
        ranked = [row for row in ranked if row[0] >= self.thresholds.possibly_relevant]
        results = []

        for rank, (ranking_score, vector_score, candidate, factors) in enumerate(
            ranked[:request.top_k], 1
        ):
            payload = candidate.payload
            outcome = candidate.explicit_outcome_phrase if request.include_outcomes else None
            candidate_warnings = list(candidate.warnings)
            candidate_warnings.append(f"Raw vector relevance: {vector_score:.4f}")

            # IMPORTANT: expose the final issue-aware ranking score, not the raw
            # embedding score. This was the main cause of misleading percentages.
            results.append(
                SimilarCaseResult(
                    rank,
                    round(ranking_score, 6),
                    label(ranking_score, self.thresholds),
                    candidate.canonical_chunk_id,
                    candidate.document_id,
                    candidate.title,
                    candidate.court,
                    candidate.jurisdiction,
                    candidate.case_category,
                    candidate.case_number,
                    payload.get("decision_date"),
                    list(payload.get("judges") or []),
                    candidate.source_path,
                    candidate.source_dataset,
                    candidate.chunk_type,
                    candidate.heading,
                    candidate.text_preview,
                    outcome,
                    candidate.legal_citations,
                    candidate.laws_cited,
                    candidate.sections_cited,
                    candidate.articles_cited,
                    factors,
                    build_differences(candidate, request, intelligence),
                    build_explanation(candidate, factors),
                    candidate.duplicate_sources,
                    candidate_warnings,
                )
            )

        if not results:
            warnings.append(
                "No sufficiently relevant historical judgment passed the legal match threshold."
            )
        warnings.extend(instructions.adapter_warnings)
        return SimilarCaseResponse(
            request.situation,
            instructions.retrieval_query,
            intelligence.to_dict(),
            instructions.applied_filters(),
            len(raw),
            results,
            list(dict.fromkeys(warnings)),
            (time.perf_counter() - started) * 1000,
        )
