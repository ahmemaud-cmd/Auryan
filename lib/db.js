const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const DB_PATH = path.join(__dirname, '..', 'data', 'db.sqlite');

// ensure data folder
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);

// create users table
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  passwordHash TEXT,
  firstName TEXT,
  lastName TEXT,
  playerNumber TEXT UNIQUE,
  googleId TEXT,
  facebookId TEXT,
  character TEXT,
  skin TEXT,
  hair TEXT,
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
  findUserByGoogleId(googleId) {
    if (!googleId) return null;
    return db.prepare('SELECT * FROM users WHERE googleId = ?').get(googleId);
  },
  findUserByFacebookId(facebookId) {
    if (!facebookId) return null;
    return db.prepare('SELECT * FROM users WHERE facebookId = ?').get(facebookId);
  },
  findUserByPlayerNumber(num) {
    if (!num) return null;
    return db.prepare('SELECT * FROM users WHERE playerNumber = ?').get(String(num));
  },
  createUser({ username, email, passwordHash, firstName, lastName, playerNumber }) {
    const now = Date.now();
    const stmt = db.prepare('INSERT INTO users (username, email, passwordHash, firstName, lastName, playerNumber, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(username, email || null, passwordHash || null, firstName || null, lastName || null, playerNumber || null, now, now);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  },
  updateUser(username, patch) {
    const cur = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!cur) return null;
    const updated = { ...cur, ...patch, updatedAt: Date.now() };
    db.prepare(`UPDATE users SET email=?, passwordHash=?, firstName=?, lastName=?, playerNumber=?, googleId=?, facebookId=?, character=?, skin=?, hair=?, updatedAt=? WHERE username=?`).run(
      updated.email, updated.passwordHash, updated.firstName, updated.lastName, updated.playerNumber, updated.googleId, updated.facebookId, updated.character, updated.skin, updated.hair, updated.updatedAt, username
    );
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }
};