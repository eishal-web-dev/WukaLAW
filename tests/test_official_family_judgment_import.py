from scripts.import_official_family_judgments import balanced_selection, classify, parse_listing


def test_rejects_customs_custody_false_positive():
    assert classify({"title": "Collector of Customs", "matter": "CUSTODY MATTER", "summary": ""}) is None


def test_accepts_specific_family_categories():
    assert classify({"title": "Family Court", "matter": "FAMILY MATTER", "summary": "recovery of dower / haq mehr"}) == "dower_mehr"
    assert classify({"title": "Guardian Court", "matter": "FAMILY MATTER", "summary": "welfare of minor"}) == "custody_guardianship"


def test_parses_official_listing_record():
    html = '''
    <blockquote>
      <a href="download-file.php?doc=abc123&amp;citation=2025+SHC+1">1.Const. P. 1/2025 A V/S B Sindh High Court</a>
      <div class="readmore">Recovery of dower and dowry articles.</div>
      Matter:-<b>FAMILY MATTER</b>
      <textarea class="reference">CITATION:2025 SHC 1 SHC Citation: SHC-1 Tag:Dower</textarea>
      <cite title="Source Title">Order Date: 01-JAN-25</cite>
    </blockquote>
    '''
    result = parse_listing(html)
    assert len(result) == 1
    assert result[0].official_id == "abc123"
    assert result[0].category == "dower_mehr"
    assert result[0].citation == "2025 SHC 1"


def test_balanced_selection_does_not_exceed_limit():
    html = "".join(
        f'''<blockquote><a href="download-file.php?doc=id{i}">Family Court case {i}</a>
        <div class="readmore">dower haq mehr</div><b>FAMILY MATTER</b></blockquote>'''
        for i in range(8)
    )
    assert len(balanced_selection(parse_listing(html), 5)) == 5
