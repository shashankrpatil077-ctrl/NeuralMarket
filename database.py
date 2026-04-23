# database.py
import aiosqlite
import json
from datetime import datetime

DB_PATH = "neuralmarket.db"

async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Transactions table
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
        
        # Agent reputations table
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
    print("✅ Database initialized")

async def log_transaction(entry: dict):
    """Save a transaction to the database."""
    async with aiosqlite.connect(DB_PATH) as db:
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
    """Fetch all transactions ordered by newest first."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM transactions ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_transaction_count():
    """Return total number of transactions."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM transactions") as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0

async def update_agent_reputation(agent_name: str, reputation: int, earned_usdc: float = 0.0):
    """Update or insert an agent's reputation record."""
    async with aiosqlite.connect(DB_PATH) as db:
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