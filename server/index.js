const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const applicationsFile = path.join(__dirname, 'applications.json');

if (!fs.existsSync(applicationsFile)) {
  fs.writeFileSync(applicationsFile, '[]');
}

// ТЯ
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'InzhKapStroy2026!';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('Требуется авторизация');
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
  return res.status(401).send('еверный логин или пароль');
};

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send('<h1>Сервер работает</h1><a href="/admin">дмин-панель</a>');
});

app.get('/api/health', (req, res) => {
  const apps = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
  res.json({ status: 'OK', applications: apps.length });
});

app.get('/api/applications', requireAuth, (req, res) => {
  const data = fs.readFileSync(applicationsFile, 'utf8');
  res.json(JSON.parse(data));
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'аполните все поля' });
  }
  const data = fs.readFileSync(applicationsFile, 'utf8');
  const applications = JSON.parse(data);
  const newApp = {
    id: Date.now(), name, email, phone: phone || '', message,
    date: new Date().toISOString(), status: 'новая', ip: req.ip
  };
  applications.push(newApp);
  fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));
  console.log('📩 овая заявка:', name, email);
  res.json({ success: true, message: '✅ аявка отправлена!' });
});

app.get('/admin', requireAuth, (req, res) => {
  const applications = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
  let html = '<!DOCTYPE html><html><head><title>дмин-панель</title><meta charset="UTF-8"><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.header{background:#366c60;color:white;padding:20px;border-radius:10px}table{width:100%;border-collapse:collapse;background:white}th,td{padding:10px;border-bottom:1px solid #ddd}th{background:#366c60;color:white}.btn{background:#366c60;color:white;padding:10px;margin:10px;border:none;border-radius:5px;cursor:pointer}</style></head><body>';
  html += '<div class="header"><h1>📊 дмин-панель</h1><p>сего заявок: ' + applications.length + '</p></div>';
  html += '<button class="btn" onclick="location.reload()">🔄 бновить</button>';
  html += '<button class="btn" onclick="exportJSON()">📥 кспорт JSON</button>';
  html += '<table><thead><tr><th>ID</th><th>ата</th><th>мя</th><th>Email</th><th>Телефон</th><th>Сообщение</th><th>IP</th></tr></thead><tbody>';
  [...applications].reverse().forEach(app => {
    const date = new Date(app.date);
    html += `<tr><td>#${app.id}</td><td>${date.toLocaleString()}</td><td>${app.name}</td><td>${app.email}</td><td>${app.phone || '—'}</td><td style="max-width:300px">${app.message}</td><td>${app.ip || '—'}</td></tr>`;
  });
  html += '</tbody></table><br><a href="/">← а сайт</a><script>function exportJSON(){const data=' + JSON.stringify(applications) + ';const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="applications.json";a.click();URL.revokeObjectURL(blob);}</script></body></html>';
  res.send(html);
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('✅ С Щ');
  console.log('='.repeat(50));
  console.log(`🔗 дмин-панель: http://localhost:${PORT}/admin`);
  console.log(`🔐 огин: admin`);
  console.log(`🔐 ароль: InzhKapStroy2026!`);
  console.log('='.repeat(50));
});
