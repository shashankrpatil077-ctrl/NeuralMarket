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