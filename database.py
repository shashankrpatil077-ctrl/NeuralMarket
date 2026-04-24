import os
import asyncio
import aiosqlite
import asyncpg
from typing import Any, Optional
from dotenv import load_dotenv

load_dotenv()
_raw_db_url = os.getenv("DATABASE_URL")


def _normalize_database_url(url: str) -> str:
    """asyncpg expects postgresql:// not postgres:// (common on Railway/Heroku)."""
    if not url:
        return url
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


DATABASE_URL = _normalize_database_url(_raw_db_url) if _raw_db_url else None


def _asyncpg_connect_kwargs() -> dict:
    """Neon and many cloud Postgres URLs require TLS; asyncpg needs ssl=True explicitly."""
    if not DATABASE_URL:
        return {}
    if os.getenv("DATABASE_SSL", "").strip().lower() in ("0", "false", "disable"):
        return {}
    u = DATABASE_URL.lower()
    if "neon.tech" in u or "sslmode=require" in u or os.getenv("DATABASE_SSL", "").strip().lower() in ("1", "true", "require"):
        return {"ssl": True}
    return {}


def _asyncpg_pool_kwargs() -> dict:
    """Pool settings for Railway/Neon: avoid stale conns and PgBouncer statement cache issues."""
    kw = dict(_asyncpg_connect_kwargs())
    kw["statement_cache_size"] = 0
    return kw


_pg_pool: Optional[Any] = None


async def _get_pg_pool() -> Any:
    global _pg_pool
    if _pg_pool is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL not set")
        _pg_pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10,
            max_inactive_connection_lifetime=120.0,
            command_timeout=120,
            **_asyncpg_pool_kwargs(),
        )
    return _pg_pool


async def close_pool():
    global _pg_pool
    if _pg_pool is not None:
        await _pg_pool.close()
        _pg_pool = None


async def _pg_run(op):
    """Run ``op(conn)`` with a pooled connection; retry if the server dropped an idle connection."""
    last: Optional[BaseException] = None
    for attempt in range(3):
        try:
            pool = await _get_pg_pool()
            async with pool.acquire() as conn:
                return await op(conn)
        except (asyncpg.ConnectionDoesNotExistError, asyncpg.InterfaceError, OSError) as e:
            last = e
            await close_pool()
            await asyncio.sleep(0.15 * (attempt + 1))
    assert last is not None
    raise last


async def _init_sqlite():
    """Initialize local SQLite database."""
    async with aiosqlite.connect("neuralmarket.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT,
                category TEXT,
                complexity TEXT,
                winner TEXT,
                amount_usdc REAL,
                quality_score INTEGER,
                tx_id TEXT,
                fee_tx_id TEXT,
                bonus_tx_id TEXT,
                slash_tx_id TEXT,
                credential_tx_id TEXT,
                on_chain_txns INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agent_reputations (
                agent TEXT PRIMARY KEY,
                reputation INTEGER DEFAULT 100,
                total_tasks INTEGER DEFAULT 0,
                total_earned REAL DEFAULT 0.0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()
    print("✅ Database initialized (SQLite)")

async def init_db():
    if DATABASE_URL:
        try:
            await close_pool()
            pool = await _get_pg_pool()
            async with pool.acquire() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS transactions (
                        id SERIAL PRIMARY KEY,
                        task TEXT,
                        category TEXT,
                        complexity TEXT,
                        winner TEXT,
                        amount_usdc REAL,
                        quality_score INTEGER,
                        tx_id TEXT,
                        fee_tx_id TEXT,
                        bonus_tx_id TEXT,
                        slash_tx_id TEXT,
                        credential_tx_id TEXT,
                        on_chain_txns INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS agent_reputations (
                        agent TEXT PRIMARY KEY,
                        reputation INTEGER DEFAULT 100,
                        total_tasks INTEGER DEFAULT 0,
                        total_earned REAL DEFAULT 0.0,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            print("✅ Database initialized (PostgreSQL)")
        except Exception as e:
            print(f"⚠️ PostgreSQL connection failed: {e}")
            print("⚠️ Falling back to SQLite")
            await close_pool()
            await _init_sqlite()
    else:
        await _init_sqlite()

async def log_transaction(entry: dict):
    if DATABASE_URL:
        async def op(conn):
            await conn.execute("""
                INSERT INTO transactions 
                (task, category, complexity, winner, amount_usdc, quality_score, 
                 tx_id, fee_tx_id, bonus_tx_id, slash_tx_id, credential_tx_id, on_chain_txns)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            """,
                entry.get("task", ""),
                entry.get("category") or entry.get("primary_capability", ""),
                entry.get("complexity", ""),
                entry.get("winner", ""),
                entry.get("amount_usdc", 0.0),
                entry.get("quality_score", 0),
                entry.get("tx_id", ""),
                entry.get("fee_tx_id"),
                entry.get("bonus_tx_id"),
                entry.get("slash_tx_id"),
                entry.get("credential_tx_id"),
                entry.get("on_chain_txns", 0)
            )

        await _pg_run(op)
    else:
        async with aiosqlite.connect("neuralmarket.db") as db:
            await db.execute("""
                INSERT INTO transactions 
                (task, category, complexity, winner, amount_usdc, quality_score, 
                 tx_id, fee_tx_id, bonus_tx_id, slash_tx_id, credential_tx_id, on_chain_txns)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry.get("task", ""),
                entry.get("category", ""),
                entry.get("complexity", ""),
                entry.get("winner", ""),
                entry.get("amount_usdc", 0.0),
                entry.get("quality_score", 0),
                entry.get("tx_id", ""),
                entry.get("fee_tx_id"),
                entry.get("bonus_tx_id"),
                entry.get("slash_tx_id"),
                entry.get("credential_tx_id"),
                entry.get("on_chain_txns", 0)
            ))
            await db.commit()

async def get_all_transactions():
    if DATABASE_URL:
        async def op(conn):
            rows = await conn.fetch("SELECT * FROM transactions ORDER BY created_at DESC")
            return [dict(row) for row in rows]

        return await _pg_run(op)
    else:
        async with aiosqlite.connect("neuralmarket.db") as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM transactions ORDER BY created_at DESC") as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

async def get_transaction_count():
    if DATABASE_URL:
        async def op(conn):
            return await conn.fetchval("SELECT COUNT(*) FROM transactions")

        return await _pg_run(op)
    else:
        async with aiosqlite.connect("neuralmarket.db") as db:
            async with db.execute("SELECT COUNT(*) FROM transactions") as cursor:
                row = await cursor.fetchone()
                return row[0] if row else 0

async def update_agent_reputation(agent_name: str, reputation: int, earned_usdc: float = 0.0):
    if DATABASE_URL:
        async def op(conn):
            await conn.execute("""
                INSERT INTO agent_reputations (agent, reputation, total_tasks, total_earned)
                VALUES ($1, $2, 1, $3)
                ON CONFLICT (agent) DO UPDATE SET
                    reputation = $2,
                    total_tasks = agent_reputations.total_tasks + 1,
                    total_earned = agent_reputations.total_earned + $3,
                    updated_at = CURRENT_TIMESTAMP
            """, agent_name, reputation, earned_usdc)

        await _pg_run(op)
    else:
        async with aiosqlite.connect("neuralmarket.db") as db:
            await db.execute("""
                INSERT INTO agent_reputations (agent, reputation, total_tasks, total_earned)
                VALUES (?, ?, 1, ?)
                ON CONFLICT(agent) DO UPDATE SET
                    reputation = ?,
                    total_tasks = total_tasks + 1,
                    total_earned = total_earned + ?,
                    updated_at = CURRENT_TIMESTAMP
            """, (agent_name, reputation, earned_usdc, reputation, earned_usdc))
            await db.commit()
