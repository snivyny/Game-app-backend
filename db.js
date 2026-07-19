const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "app.db"));
db.pragma("journal_mode = WAL");

// ── Schema ──
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,           -- telegram id or device id
  name TEXT,
  role TEXT DEFAULT 'user',      -- 'user' | 'moderator' | 'mother'
  money INTEGER DEFAULT 0,
  bank INTEGER DEFAULT 0,
  exp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  vipExpiresAt INTEGER DEFAULT NULL,
  vipSource TEXT DEFAULT NULL,
  streakShieldUsedToday INTEGER DEFAULT 0,
  lastVipBonusDate TEXT DEFAULT NULL,

  wordGameStreak INTEGER DEFAULT 0,
  wordGameFailsToday INTEGER DEFAULT 0,

  gamePlaysToday TEXT DEFAULT '{}',  -- JSON: { "general": 0, "slot": 0, ... }
  lastPlayedDate TEXT DEFAULT NULL,  -- for daily reset checks

  banned INTEGER DEFAULT 0,
  createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
);

CREATE TABLE IF NOT EXISTS game_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  gameType TEXT NOT NULL,
  result TEXT,
  moneyChange INTEGER DEFAULT 0,
  expChange INTEGER DEFAULT 0,
  timestamp INTEGER DEFAULT (strftime('%s','now') * 1000)
);

CREATE TABLE IF NOT EXISTS transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fromUserId TEXT NOT NULL,
  toUserId TEXT NOT NULL,
  amountSent INTEGER,
  taxBurned INTEGER,
  amountReceived INTEGER,
  timestamp INTEGER DEFAULT (strftime('%s','now') * 1000)
);
`);

module.exports = db;
