# Similar Cases — Final Regression Matrix

Use this matrix before demos or after retrieval/filter changes. Normal matching is dataset-powered; the optional full case story is a separate generation step.

## Family cases

| Case input | Auto Search should focus on | Useful Search My Way filters | Must avoid |
|---|---|---|---|
| Wife seeks khula after cruelty; evidence completed | Divorce/Khula + cruelty + stage | Divorce / Khula, Cruelty, Evidence | Custody unless mentioned |
| Dowry articles retained; receipts available | Dowry recovery + documentary proof | Dowry recovery, Dowry kept by other side, Receipts | Criminal/property results |
| Mehr unpaid; nikahnama states amount | Dower/Mehr | Dower / Mehr, Mehr unpaid, Nikahnama | Dowry unless facts mention it |
| Divorce + maintenance + child custody | Multi-issue family precedents | Divorce / Khula, Maintenance, Child custody | Treating one issue as the whole case |

## Criminal cases

| Case input | Auto Search should focus on | Useful Search My Way filters | Must avoid |
|---|---|---|---|
| Murder allegation; firearm; eyewitness | Murder/Homicide + firearm + eyewitness | Murder / Homicide, Gun / Firearm, Eyewitness | Generic constitutional cases |
| Murder allegation; accused says he was elsewhere; CCTV | Murder/Homicide + alibi + CCTV | Murder / Homicide, CCTV / Video, I was elsewhere (Alibi) | Self-defence unless stated |
| Death alleged accidental; no intention | Homicide + accidental/no intention | Murder / Homicide, Accidental | Ranking intentional murder as identical |
| Bail request after FIR | Bail + criminal procedure | Bail, relevant evidence/defence | Family/civil results |

## Civil cases

| Case input | Auto Search should focus on | Useful Search My Way filters | Must avoid |
|---|---|---|---|
| Land ownership and possession dispute | Property/title/possession | Property ownership, Ownership denied, Possession dispute | Family inheritance unless pleaded |
| Agreement to sell not honoured | Contract/specific performance | Contract / sale agreement, Agreement not honoured, Documents | Generic property cases above stronger contract matches |
| Legal heirs seek partition | Inheritance/partition | Inheritance, Documents, Revenue record | Tenancy |
| Landlord seeks eviction for unpaid rent | Tenancy/eviction | Rent / tenancy, Documents, Appeal if relevant | Ownership cases unless title is disputed |

## UI acceptance checklist

- Auto Search works without choosing filters.
- Search My Way requires a main issue first, then unlocks deeper filters.
- Only two headline statistics are prominent: **Cases we checked** and **Closest match**.
- Four result cards appear first; extra results are behind **Show more cases**.
- Each card shows a short reason and similarity percentage, not a wall of judgment text.
- Detailed explanation, outcome, laws, differences and full case story stay behind **See what happened**.
- Switching cases resets selected filters and expanded cards.
- Empty results suggest changing details or adding case information/documents.
- Search continues to work if the optional generated full case story is unavailable.
- Generic case-type labels never inject unmentioned sub-issues such as custody, maintenance, bail or fraud.

## Commands

Frontend filters/tests:

```bash
cd apps/web
npm test
npm run build
```

Backend custom-search regression:

```bash
cd apps/api
pytest tests/test_similar_custom_search.py -q
```

For a final live check, run one case from each section above against the real Qdrant corpus and confirm that the top results satisfy the **must avoid** column as well as the expected focus.
