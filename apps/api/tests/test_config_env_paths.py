from pathlib import Path

from app.config import API_ROOT, ENV_FILES, REPOSITORY_ROOT, Settings


def test_backend_env_files_do_not_depend_on_launch_directory():
    assert API_ROOT.name == "api"
    assert (REPOSITORY_ROOT / "apps" / "api").is_dir()
    assert ENV_FILES == (REPOSITORY_ROOT / ".env", API_ROOT / ".env")
    assert tuple(Path(path) for path in Settings.model_config["env_file"]) == ENV_FILES
