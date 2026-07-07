from ai.preprocessing.sentences import split_sentences


def test_does_not_split_on_legal_abbreviations():
    text = (
        "PRESENT: Mr. Justice Sh. Riaz Ahmed, C.J. Mr. Justice Qazi Muhammad Farooq "
        "Mr. Justice Mian Muhammad Ajmal heard C.P. No. 12/2002 on that day. "
        "The appeal was later dismissed by the larger bench."
    )
    sentences = split_sentences(text)
    # the bench composition must stay one sentence, not shatter at every "Mr."
    assert len(sentences) == 2
    assert "Qazi Muhammad Farooq" in sentences[0]
    assert sentences[1].startswith("The appeal")


def test_splits_normal_sentences():
    text = "The court heard the arguments today. The verdict was announced later. It was final."
    assert len(split_sentences(text, min_words=3)) == 3


def test_short_fragments_dropped():
    assert split_sentences("Too short. Yes.") == []
