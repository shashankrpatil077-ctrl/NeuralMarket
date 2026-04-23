import os
import aiosqlite
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

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
            conn = await asyncpg.connect(DATABASE_URL)
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
            await conn.close()
            print("✅ Database initialized (PostgreSQL)")
        except Exception as e:
            print(f"⚠️ PostgreSQL connection failed: {e}")
            print("⚠️ Falling back to SQLite")
            await _init_sqlite()
    else:
        await _init_sqlite()

async def log_transaction(entry: dict):
    if DATABASE_URL:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            INSERT INTO transactions 
            (task, category, complexity, winner, amount_usdc, quality_score, 
             tx_id, fee_tx_id, bonus_tx_id, slash_tx_id, credential_tx_id, on_chain_txns)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """, 
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
        )
        await conn.close()
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
        conn = await asyncpg.connect(DATABASE_URL)
        rows = await conn.fetch("SELECT * FROM transactions ORDER BY created_at DESC")
        await conn.close()
        return [dict(row) for row in rows]
    else:
        async with aiosqlite.connect("neuralmarket.db") as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM transactions ORDER BY created_at DESC") as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

async def get_transaction_count():
    if DATABASE_URL:
        conn = await asyncpg.connect(DATABASE_URL)
        count = await conn.fetchval("SELECT COUNT(*) FROM transactions")
        await conn.close()
        return count
    else:
        async with aiosqlite.connect("neuralmarket.db") as db:
            async with db.execute("SELECT COUNT(*) FROM transactions") as cursor:
                row = await cursor.fetchone()
                return row[0] if row else 0

async def update_agent_reputation(agent_name: str, reputation: int, earned_usdc: float = 0.0):
    if DATABASE_URL:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            INSERT INTO agent_reputations (agent, reputation, total_tasks, total_earned)
            VALUES ($1, $2, 1, $3)
            ON CONFLICT (agent) DO UPDATE SET
                reputation = $2,
                total_tasks = agent_reputations.total_tasks + 1,
                total_earned = agent_reputations.total_earned + $3,
                updated_at = CURRENT_TIMESTAMP
        """, agent_name, reputation, earned_usdc)
        await conn.close()
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
