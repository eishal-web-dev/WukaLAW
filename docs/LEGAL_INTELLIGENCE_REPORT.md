# WakuLAW Legal Intelligence Engine

## Purpose and architecture

The engine converts a user question into an explainable structured retrieval plan. It runs entirely offline and performs no retrieval, embedding, vector search, LLM call, OCR, document generation, legal reasoning, outcome prediction, or corpus mutation.

Flow: language detection → conservative cleaning → intent classification → domain scoring → entity extraction → jurisdiction detection → source recommendation → retrieval-oriented normalization → typed legal query.

## Deterministic stages

- Language detection counts Urdu/Arabic-script and Latin characters and otherwise reports `Unknown`.
- Intent classification uses ordered regex rules and reports confidence tied to the matched rule.
- Domain classification scores explicit domain dictionaries. The strongest domain is primary; other material matches are secondary.
- Entity extraction uses regex for Acts, articles, sections, rules, cases, courts, judges, money, dates, CNIC and FIR, plus explicit legal concepts.
- Jurisdiction detection recognizes Pakistan, Punjab, Sindh, KPK, Balochistan, ICT, AJK and Gilgit Baltistan only when place terms occur.
- Source recommendation maps domains to collection families; it does not access those collections.
- Normalization expands a small, audited conversational phrase table and appends classified legal context. It does not translate or infer facts.

## API

`POST /api/legal-intelligence/analyze`

Request: `{"question": "My boss fired me in Lahore"}`

Response: intent, confidence, primary and secondary domains, language, jurisdiction, extracted entities, recommended sources, normalized query, warnings and `pipeline_version`.

## Coverage

Domains: Family, Criminal, Civil, Constitutional, Labour, Property, Corporate, Tax, Service, Cyber Crime, Banking, Consumer Protection, Immigration and Human Rights, plus Unknown.

Intents: legal advice, law lookup, similar-case search, document explanation, procedure, document generation, evidence question, appeal, settlement, rights, obligations and unknown.

## Limitations and future work

Rules prioritize precision and do not resolve legal ambiguity. Urdu script is detected but not translated; Urdu-domain dictionaries and Roman Urdu normalization should be added from evaluated examples. Future versions should add citation-pattern entities, broader Pakistan court aliases, configurable taxonomy dictionaries, rule-trace output, multilingual tests, calibrated confidence, and integration of this structured object as an optional pre-retrieval input to RAG.
