from pathlib import Path


def test_backend_ai_imports_resolve_to_canonical_root_package():
    import ai.preprocessing.chunk as chunk
    import ai.retrieval.index as index
    import ai.timeline.extract as timeline

    root = Path(__file__).resolve().parents[3] / "ai"
    for module in (chunk, index, timeline):
        assert Path(module.__file__).resolve().is_relative_to(root.resolve())
        assert "apps/api/ai" not in Path(module.__file__).as_posix()
