from pathlib import Path


def resolve_project_roots(module_file: str | Path) -> tuple[Path, Path]:
    """Return the API root and repository root in source and Docker layouts."""
    resolved = Path(module_file).resolve()
    api_root = resolved.parent.parent

    # A source checkout contains apps/api/app. The production Docker image
    # copies apps/api directly to /app, so that marker is intentionally absent.
    repository_root = next(
        (
            parent
            for parent in resolved.parents
            if (parent / "apps" / "api" / "app").is_dir()
        ),
        api_root,
    )
    return api_root, repository_root
