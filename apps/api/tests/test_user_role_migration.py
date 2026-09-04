"""Existing accounts must survive the role-column addition on API startup."""
import os
from pathlib import Path
import sqlite3
import subprocess
import sys

import pytest


@pytest.mark.parametrize('has_role_column', [False, True])
def test_startup_backfills_existing_accounts_without_changing_their_data(tmp_path, has_role_column):
    database = tmp_path / 'existing.db'
    with sqlite3.connect(database) as connection:
        connection.execute('''CREATE TABLE users (
            id INTEGER PRIMARY KEY, email VARCHAR(255), name VARCHAR(255),
            password_hash VARCHAR(255), notifications_enabled BOOLEAN,
            created_at DATETIME
        )''')
        connection.execute('''INSERT INTO users VALUES (
            7, 'existing@example.com', 'Existing Lawyer', 'unchanged-hash', 0,
            '2026-09-01 12:00:00'
        )''')
        if has_role_column:
            # A previous run of the incomplete branch allowed NULL roles.
            connection.execute('ALTER TABLE users ADD COLUMN role VARCHAR(50)')

    api_root = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        'DATABASE_URL': f'sqlite:///{database}',
        'UPLOAD_DIR': str(tmp_path / 'uploads'),
        'STORAGE_DIR': str(tmp_path / 'storage'),
    }
    for _ in range(2):  # Startup migration must also be safe on restart.
        result = subprocess.run(
            [sys.executable, '-c', 'import app.main'], cwd=api_root, env=env,
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0, result.stderr

    with sqlite3.connect(database) as connection:
        assert connection.execute(
            'SELECT id, email, name, password_hash, notifications_enabled, role FROM users'
        ).fetchall() == [(7, 'existing@example.com', 'Existing Lawyer', 'unchanged-hash', 0, 'lawyer')]
