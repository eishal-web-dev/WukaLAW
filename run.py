#!/usr/bin/env python3
"""WakuLaw one-command launcher — works on Windows, macOS, and Linux.

    python run.py            # sets everything up and starts backend + frontend
    python run.py --setup    # only install dependencies, don't start servers

Requires: Python 3.10+ and Node.js 18+ on PATH. Everything else (virtualenv,
Python packages, npm packages) is installed automatically on first run.
"""

import hashlib
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
API_DIR = ROOT / "apps" / "api"
WEB_DIR = ROOT / "apps" / "web"
VENV_DIR = API_DIR / ".venv"
IS_WINDOWS = os.name == "nt"
VENV_PYTHON = VENV_DIR / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")


def fail(message: str) -> None:
    print(f"\n[run.py] ERROR: {message}")
    sys.exit(1)


def info(message: str) -> None:
    print(f"[run.py] {message}")


def check_prerequisites() -> str:
    if sys.version_info < (3, 10):
        fail(f"Python 3.10+ required, found {sys.version.split()[0]}. Install from python.org.")
    npm = shutil.which("npm")
    if npm is None:
        fail("Node.js/npm not found on PATH. Install Node 18+ from nodejs.org.")
    return npm


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def setup_backend() -> None:
    if not VENV_PYTHON.exists():
        info("Creating Python virtual environment (first run only)...")
        subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)

    requirements = API_DIR / "requirements.txt"
    marker = VENV_DIR / ".requirements.sha256"
    if not marker.exists() or marker.read_text().strip() != file_hash(requirements):
        info("Installing Python dependencies (first run downloads ~1.5 GB, please wait)...")
        subprocess.run(
            [str(VENV_PYTHON), "-m", "pip", "install", "-r", str(requirements), "--quiet"],
            check=True,
            cwd=API_DIR,
        )
        marker.write_text(file_hash(requirements))
    info("Backend dependencies OK.")


def setup_frontend(npm: str) -> None:
    lock = WEB_DIR / "package-lock.json"
    marker = WEB_DIR / "node_modules" / ".package-lock.sha256"
    if not marker.exists() or (lock.exists() and marker.read_text().strip() != file_hash(lock)):
        info("Installing frontend dependencies...")
        subprocess.run([npm, "install", "--no-fund", "--no-audit"], check=True, cwd=WEB_DIR)
        if lock.exists():
            marker.parent.mkdir(exist_ok=True)
            marker.write_text(file_hash(lock))
    info("Frontend dependencies OK.")


def port_in_use(port: int) -> bool:
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=1)
        return True
    except Exception:
        import socket

        with socket.socket() as sock:
            return sock.connect_ex(("127.0.0.1", port)) == 0


def wait_for(url: str, timeout_seconds: int = 90) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except Exception:
            time.sleep(1)
    return False


def start_servers(npm: str) -> None:
    for port, what in ((8000, "backend"), (5173, "frontend")):
        if port_in_use(port):
            fail(f"Port {port} is already in use — stop the other {what} first.")

    info("Starting backend on http://localhost:8000 ...")
    backend = subprocess.Popen(
        [str(VENV_PYTHON), "-m", "uvicorn", "app.main:app", "--port", "8000"],
        cwd=API_DIR,
    )
    if not wait_for("http://127.0.0.1:8000/api/v1/health"):
        backend.terminate()
        fail("Backend failed to start — scroll up for the Python error.")

    info("Starting frontend on http://localhost:5173 ...")
    frontend = subprocess.Popen([npm, "run", "dev"], cwd=WEB_DIR)

    print()
    info("=" * 56)
    info("WakuLaw is running:")
    info("  App:      http://localhost:5173")
    info("  API docs: http://localhost:8000/docs")
    info("Press Ctrl+C to stop both servers.")
    info("Tip: for AI-written answers install Ollama (ollama.com)")
    info("     and run: ollama pull qwen2.5:3b  — optional & free.")
    info("=" * 56)

    try:
        while True:
            if backend.poll() is not None:
                frontend.terminate()
                fail("Backend stopped unexpectedly.")
            if frontend.poll() is not None:
                backend.terminate()
                fail("Frontend stopped unexpectedly.")
            time.sleep(2)
    except KeyboardInterrupt:
        info("Stopping...")
        for process in (frontend, backend):
            process.terminate()
        for process in (frontend, backend):
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
        info("Stopped. Bye.")


def main() -> None:
    npm = check_prerequisites()
    setup_backend()
    setup_frontend(npm)
    if "--setup" in sys.argv:
        info("Setup complete. Start the app with: python run.py")
        return
    start_servers(npm)


if __name__ == "__main__":
    main()
