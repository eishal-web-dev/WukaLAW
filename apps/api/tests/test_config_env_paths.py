from pathlib import Path

from app.config import API_ROOT, ENV_FILES, REPOSITORY_ROOT, Settings
from app.paths import resolve_project_roots


def test_backend_env_files_do_not_depend_on_launch_directory():
    assert API_ROOT.name == "api"
    assert (REPOSITORY_ROOT / "apps" / "api").is_dir()
    assert ENV_FILES == (REPOSITORY_ROOT / ".env", API_ROOT / ".env")
    assert tuple(Path(path) for path in Settings.model_config["env_file"]) == ENV_FILES


def test_project_roots_support_shallow_docker_layout(tmp_path):
    module_file = tmp_path / "app" / "config.py"
    module_file.parent.mkdir()
    module_file.touch()

    api_root, repository_root = resolve_project_roots(module_file)

    assert api_root == tmp_path
    assert repository_root == tmp_path
