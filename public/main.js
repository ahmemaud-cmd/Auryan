const socket = io(); // ربط اللعبة بالسيرفر

const loginScreen = document.getElementById('loginScreen');
const loginNowBtn = document.getElementById('loginNowBtn');
const emailLogin = document.getElementById('emailLogin');
const passwordLogin = document.getElementById('passwordLogin');
const appLayout = document.getElementById('app');
const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

// تسجيل الدخول Online
loginNowBtn.addEventListener('click', async () => {
  const email = emailLogin.value.trim();
  const password = passwordLogin.value.trim();

  if (!email || !password) {
    alert('📩 من فضلك اكتب البريد وكلمة المرور');
    return;
  }

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) {
      alert(`❌ ${data.error}`);
      return;
    }

    // الدخول ناجح
    loginScreen.style.display = 'none';
    appLayout.style.display = 'flex';

    // رسالة System ترحيب باللاعب
    addChatMessage('System', `مرحبًا ${data.username}! تم تسجيل دخولك بنجاح 🎮`);

    // انضمام اللاعب للسيرفر
    socket.emit('join', { username: data.username });

  } catch (err) {
    console.error(err);
    alert('❌ حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
  }
});

// إرسال الشات
chatSend.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('chat:send', { text });
  chatInput.value = '';
});

// استقبال رسائل الشات
socket.on('chat:recv', (msg) => {
  addChatMessage(msg.username, msg.text);
});

// دالة لإظهار الرسائل داخل الشات
function addChatMessage(user, text) {
  const line = document.createElement('div');
  line.classList.add('chat-line');
  line.innerHTML = `<span class="name">${user}:</span> ${text}`;
  chatLog.prepend(line);
}
