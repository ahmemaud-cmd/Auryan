const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, 'db.sqlite');
const db = new Database(DB_PATH);

// إنشاء جدول المستخدمين
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  passwordHash TEXT,
  firstName TEXT,
  lastName TEXT,
  playerNumber TEXT UNIQUE,
  createdAt INTEGER,
  updatedAt INTEGER
)`).run();

module.exports = {
  findUserByUsername(username) {
    if (!username) return null;
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
  findUserByEmail(email) {
    if (!email) return null;
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },
  createUser({ username, email, passwordHash, firstName, lastName, playerNumber }) {
    const now = Date.now();
    const stmt = db.prepare(
      'INSERT INTO users (username, email, passwordHash, firstName, lastName, playerNumber, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      username,
      email || null,
      passwordHash || null,
      firstName || null,
      lastName || null,
      playerNumber || null,
      now,
      now
    );
    return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }
};
