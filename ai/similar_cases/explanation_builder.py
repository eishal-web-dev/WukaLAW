"""Deterministic relevance explanations and known differences."""


def build_explanation(candidate, factors):
    phrases = []
    for f in factors:
        mapping = {
            "same_issue_family": f"the same core legal/factual issue ({f.value})",
            "same_legal_domain": f"the same detected legal domain ({f.value})",
            "same_case_category": f"the same case category ({f.value})",
            "same_court": f"the same court ({f.value})",
            "same_jurisdiction": f"the same jurisdiction ({f.value})",
            "shared_law": f"the shared law {f.value}",
            "shared_section": f"the shared section {f.value}",
            "shared_article": f"the shared article {f.value}",
            "shared_legal_citation": f"the shared citation {f.value}",
            "shared_explicit_entity": f"the shared specific term {f.value}",
            "matching_outcome_term": f"the explicit outcome term {f.value}",
            "preferred_chunk_type": f"a substantive {f.value} passage",
        }
        if f.factor in mapping and mapping[f.factor] not in phrases:
            phrases.append(mapping[f.factor])

    if not phrases:
        return (
            "This judgment passed the semantic retrieval stage, but the available metadata "
            "does not establish additional shared legal factors."
        )
    return (
        "This judgment may be relevant because it contains "
        + ", ".join(phrases)
        + ". The match score is a retrieval/ranking aid, not a prediction of the legal outcome."
    )


def build_differences(candidate, request, intelligence):
    out = []
    if request.court and candidate.court and request.court != candidate.court:
        out.append(f"Different court: {candidate.court}")
    if request.jurisdiction and candidate.jurisdiction and request.jurisdiction != candidate.jurisdiction:
        out.append(f"Different jurisdiction: {candidate.jurisdiction}")
    if request.case_category and candidate.case_category and request.case_category != candidate.case_category:
        out.append(f"Different case category: {candidate.case_category}")
    if any(f.factor == "issue_mismatch" for f in []):
        pass
    if intelligence.entities.get("sections") and not candidate.sections_cited:
        out.append("No shared legal section is available in candidate metadata.")
    if request.include_outcomes and not candidate.explicit_outcome_phrase:
        out.append("Outcome unavailable; no explicit outcome phrase was extracted.")
    return out
