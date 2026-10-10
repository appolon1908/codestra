from __future__ import annotations

import asyncio
import os
from pathlib import Path

import asyncpg

MIGRATIONS_DIRECTORY = Path(__file__).resolve().parents[1] / "migrations"


async def migrate() -> None:
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise SystemExit("DATABASE_URL is required")

    migrations_directory = MIGRATIONS_DIRECTORY
    migration_files = sorted(migrations_directory.glob("*.sql"))
    if not migration_files:
        raise SystemExit(f"No migrations found in {migrations_directory}")

    connection = await asyncpg.connect(database_url, command_timeout=30)
    try:
        await connection.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        for migration_file in migration_files:
            version = migration_file.name
            already_applied = await connection.fetchval(
                "SELECT TRUE FROM schema_migrations WHERE version = $1",
                version,
            )
            if already_applied:
                print(f"SKIP {version}")
                continue

            sql = migration_file.read_text(encoding="utf-8")
            async with connection.transaction():
                await connection.execute(sql)
                await connection.execute(
                    "INSERT INTO schema_migrations (version) VALUES ($1)",
                    version,
                )
            print(f"APPLIED {version}")
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(migrate())
