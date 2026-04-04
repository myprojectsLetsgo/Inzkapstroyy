const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Файл для заявок
const applicationsFile = path.join(__dirname, 'applications.json');

// Создаем файл если его нет
if (!fs.existsSync(applicationsFile)) {
  fs.writeFileSync(applicationsFile, '[]');
}

// Middleware
app.use(cors());
app.use(express.json());

// ===================== РАЗДАЧА ФРОНТЕНДА (СТАТИКИ) =====================
// ЭТО ДОЛЖНО БЫТЬ ПЕРЕД ВСЕМИ МАРШРУТАМИ!
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  console.log('✅ Папка public найдена, раздаём статические файлы');
  app.use(express.static(publicPath));
} else {
  console.log('⚠️ Папка public не найдена, создайте её и добавьте фронтенд');
}

// ==================== ГЛАВНАЯ СТРАНИЦА С ИНФО =====================
app.get('/', (req, res) => {
  // Проверяем, есть ли index.html в public
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    // Если есть файл фронтенда - отдаём его
    return res.sendFile(indexPath);
  }
  
  // Иначе показываем страницу сервера
  const apps = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Сервер ИнжКапСтрой</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #366c60, #2c3e50); color: white; text-align: center; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; }
        h1 { color: #2ecc71; }
        .status { background: #2ecc71; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; }
        .link { background: #366c60; color: white; padding: 10px; margin: 5px; display: inline-block; border-radius: 5px; text-decoration: none; }
        .info-box { background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status">🟢 СЕРВЕР РАБОТАЕТ</div>
        <h1>🚀 Сервер ИнжКапСтрой</h1>
        <div class="info-box">
          <p><strong>Порт:</strong> ${PORT}</p>
          <p><strong>Заявок сохранено:</strong> ${apps.length}</p>
          <p><strong>Статус фронтенда:</strong> ${fs.existsSync(indexPath) ? '✅ React загружен' : '⚠️ Файлы не найдены'}</p>
        </div>
        <a href="/admin" class="link">📊 Админ-панель</a>
        <a href="/api/health" class="link">🔍 API Health</a>
      </div>
    </body>
    </html>
  `);
});

// ===================== API =====================
app.get('/api/health', (req, res) => {
  const apps = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
  res.json({
    status: 'OK',
    message: 'Сервер ИнжКапСтрой работает!',
    timestamp: new Date().toISOString(),
    port: PORT,
    applications: apps.length
  });
});

app.get('/api/applications', (req, res) => {
  try {
    const data = fs.readFileSync(applicationsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения данных' });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Заполните имя, email и сообщение'
      });
    }

    const data = fs.readFileSync(applicationsFile, 'utf8');
    const applications = JSON.parse(data);

    const newApp = {
      id: Date.now(),
      name,
      email,
      phone: phone || '',
      message,
      date: new Date().toISOString(),
      status: 'новая',
      ip: req.ip
    };

    applications.push(newApp);
    fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));

    console.log('📩 НОВАЯ ЗАЯВКА:', name, email);
    
    res.json({
      success: true,
      message: '✅ Заявка успешно отправлена!',
      id: newApp.id
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ===================== АДМИН-ПАНЕЛЬ =====================
app.get('/admin', (req, res) => {
  try {
    const applications = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Админ-панель - ИнжКапСтрой</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .header { background: linear-gradient(135deg, #366c60, #2c3e50); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; }
          th { background: #366c60; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .btn { background: #366c60; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Админ-панель ИнжКапСтрой</h1>
          <p>Всего заявок: ${applications.length}</p>
        </div>
        <button class="btn" onclick="location.reload()">🔄 Обновить</button>
        <button class="btn" onclick="exportToJSON()">📥 Экспорт JSON</button>
        <table>
          <thead><tr><th>ID</th><th>Дата</th><th>Имя</th><th>Email</th><th>Сообщение</th></tr></thead>
          <tbody>
    `;
    
    [...applications].reverse().forEach(app => {
      const date = new Date(app.date);
      html += `<tr><td>#${app.id}</td><td>${date.toLocaleString('ru-RU')}</td><td>${app.name}</td><td>${app.email}</td><td>${app.message}</td></tr>`;
    });
    
    html += `
          </tbody>
        </table>
        <script>
          function exportToJSON() {
            const data = ${JSON.stringify(applications)};
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'applications.json';
            a.click();
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.send('<h1>Ошибка</h1><p>' + error.message + '</p>');
  }
});

// ===================== ЗАПУСК СЕРВЕРА =====================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(' СЕРВЕР ИНЖКАПСТРОЙ ЗАПУЩЕН!');
  console.log('='.repeat(60));
  console.log(` Главная страница: http://localhost:${PORT}`);
  console.log(` Админ-панель: http://localhost:${PORT}/admin`);
  console.log(` API проверка: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log(` Статика из public: ${fs.existsSync(publicPath) ? '✅ включена' : '❌ нет'}`);
  console.log(` Файл index.html: ${fs.existsSync(path.join(publicPath, 'index.html')) ? '✅ есть' : '❌ нет'}`);
  console.log('='.repeat(60));
  console.log(` Заявки сохраняются в: ${applicationsFile}`);
  console.log('='.repeat(60));
});