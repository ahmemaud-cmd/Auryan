const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = require('./db'); // قاعدة البيانات
const mapMeta = require('./images/map.json'); // ملف الخريطة

// تجهيز بيانات الخريطة
const chairs = {};
let spawns = [];
let mapBg = mapMeta?.bg || null;
if (Array.isArray(mapMeta?.chairs)) {
  mapMeta.chairs.forEach(c => { chairs[c.id] = { ...c, occupiedBy: null }; });
}
if (Array.isArray(mapMeta?.spawns)) {
  spawns = mapMeta.spawns.slice();
}

// إنشاء السيرفر
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تقديم ملفات الواجهة من public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// فحص السيرفر
app.get('/health', (req, res) => res.send('ok'));

// تسجيل جديد
app.post('/auth/register', (req, res) => {
  const { username, email, password, firstName, lastName } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const byUsername = db.findUserByUsername(username);
  const byEmail = db.findUserByEmail(email);
  if (byUsername) return res.status(400).json({ error: 'Username already exists' });
  if (byEmail) return res.status(400).json({ error: 'Email already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const playerNumber = Date.now().toString();
  const created = db.createUser({
    username,
    email,
    passwordHash: hash,
    firstName: firstName || '',
    lastName: lastName || '',
    playerNumber
  });

  return res.json({ ok: true, username: created.username });
});

// تسجيل الدخول
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.findUserByEmail(email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  const ok = bcrypt.compareSync(password, user.passwordHash || '');
  if (!ok) return res.status(400).json({ error: 'Invalid password' });
  return res.json({ ok: true, username: user.username });
});

// Socket.io اللاعبين
const players = {};
io.on('connection', (socket) => {
  socket.on('join', (data) => {
    players[socket.id] = { id: socket.id, ...data };
    socket.emit('state:init', { players: Object.values(players), chairs, spawns, mapBg });
    socket.broadcast.emit('player:joined', players[socket.id]);
    io.emit('chat:recv', { username: 'System', text: `${data.username} انضم للعبة! 🎉` });
  });

  socket.on('chat:send', (msg) => {
    const user = players[socket.id] || { username: 'Unknown' };
    io.emit('chat:recv', { username: user.username, text: msg.text });
  });

  socket.on('disconnect', () => {
    const player = players[socket.id];
    delete players[socket.id];
    if (player) {
      io.emit('chat:recv', { username: 'System', text: `${player.username} غادر اللعبة.` });
      socket.broadcast.emit('player:left', { id: socket.id });
    }
  });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Orian server is running at http://localhost:${PORT}`);
});
