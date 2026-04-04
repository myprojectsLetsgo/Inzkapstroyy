const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Файл для заявок
const applicationsFile = path.join(__dirname, 'applications.json');

// Создаем файл если его нет
if (!fs.existsSync(applicationsFile)) {
  fs.writeFileSync(applicationsFile, '[]');
}

// Middleware
app.use(cors());
app.use(express.json());

// ... остальной код
// Инициализация БД
// let db;
//initDb().then(database => {
  //db = database;
  //console.log('📊 База данных SQLite готова к работе');
//}).catch(err => {
  //console.error('❌ Ошибка инициализации БД:', err);
//});

// ... остальной код==================== ГЛАВНАЯ СТРАНИЦА С ИНФО =====================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Сервер ИнжКапСтрой</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          background: linear-gradient(135deg, #366c60, #2c3e50);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 {
          color: #2ecc71;
          margin-bottom: 30px;
          border-bottom: 3px solid #2ecc71;
          padding-bottom: 15px;
          display: inline-block;
        }
        .info-box {
          background: rgba(255,255,255,0.15);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: left;
        }
        .links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 30px 0;
        }
        .link {
          background: #366c60;
          color: white;
          padding: 15px;
          border-radius: 8px;
          text-decoration: none;
          transition: transform 0.3s, background 0.3s;
          display: block;
        }
        .link:hover {
          background: #2a574d;
          transform: translateY(-3px);
        }
        .status {
          background: #2ecc71;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 20px;
          font-weight: bold;
        }
        code {
          background: rgba(0,0,0,0.3);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status">🟢 СЕРВЕР РАБОТАЕТ</div>
        <h1>🚀 Сервер ИнжКапСтрой</h1>
        
        <div class="info-box">
          <h3>📊 Информация о сервере:</h3>
          <p><strong>Порт:</strong> ${PORT}</p>
          <p><strong>Запущен:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          <p><strong>Заявок сохранено:</strong> ${JSON.parse(fs.readFileSync(applicationsFile, 'utf8')).length}</p>
          <p><strong>Путь к данным:</strong> ${applicationsFile}</p>
        </div>
        
        <h2>🔗 Ссылки:</h2>
        <div class="links">
          <a href="/api/health" class="link">🔍 Проверка API</a>
          <a href="/api/applications" class="link">📋 Все заявки (JSON)</a>
          <a href="http://localhost:5173" class="link">🌐 Фронтенд (React сайт)</a>
          <a href="/admin" class="link">📊 Админ-панель</a>
        </div>
        
        <div class="info-box">
          <h3>📝 API Endpoints:</h3>
          <p><code>GET /api/health</code> - Проверка работы</p>
          <p><code>GET /api/applications</code> - Получить все заявки</p>
          <p><code>POST /api/contact</code> - Отправить новую заявку</p>
          <p><code>GET /admin</code> - Админ-панель с таблицей</p>
        </div>
        
        <p style="margin-top: 30px; opacity: 0.8;">
          ⚡ React фронтенд работает на порту 5175: <a href="http://localhost:5175" style="color: #2ecc71;">http://localhost:5175</a>
        </p>
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
    applications: apps.length,
    frontend: 'http://localhost:5173',
    admin: `http://localhost:${PORT}/admin`
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

    console.log('='.repeat(50));
    console.log('📩 НОВАЯ ЗАЯВКА С САЙТА!');
    console.log('='.repeat(50));
    console.log(`👤 Имя: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📞 Телефон: ${phone || 'не указан'}`);
    console.log(`💬 Сообщение: ${message}`);
    console.log(`🕐 Время: ${new Date().toLocaleString('ru-RU')}`);
    console.log(`🆔 ID: ${newApp.id}`);
    console.log('='.repeat(50));

    res.json({
      success: true,
      message: '✅ Заявка успешно отправлена! Мы свяжемся с вами в течение 2 часов.',
      id: newApp.id,
      timestamp: newApp.date
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
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
          .header { 
            background: linear-gradient(135deg, #366c60, #2c3e50); 
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .stats { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-bottom: 30px; 
          }
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #366c60;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          th {
            background: #366c60;
            color: white;
            padding: 15px;
            text-align: left;
          }
          td {
            padding: 15px;
            border-bottom: 1px solid #eee;
          }
          tr:hover {
            background: #f9f9f9;
          }
          .status-new {
            background: #ffeb3b;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
          }
          .back-link {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #366c60;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
          .controls {
            margin-bottom: 20px;
          }
          .btn {
            padding: 10px 20px;
            background: #366c60;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>📊 Админ-панель ИнжКапСтрой</h1>
            <p>Все заявки с сайта</p>
          </div>
          <div>
            <a href="http://localhost:5173" class="back-link" target="_blank">🌐 На сайт</a>
            <a href="/" class="back-link" style="background: #2c3e50;">🔙 На сервер</a>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${applications.length}</div>
            <div>Всего заявок</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${applications.filter(a => a.status === 'новая').length}</div>
            <div>Новых</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${new Set(applications.map(a => a.email)).size}</div>
            <div>Уникальных email</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${applications.length > 0 ? new Date(applications[applications.length-1].date).toLocaleDateString('ru-RU') : 'нет'}</div>
            <div>Последняя заявка</div>
          </div>
        </div>
        
        <div class="controls">
          <button class="btn" onclick="location.reload()">🔄 Обновить</button>
          <button class="btn" onclick="exportToJSON()">📥 Экспорт JSON</button>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Дата и время</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Сообщение</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    applications.reverse().forEach(app => {
      const date = new Date(app.date);
      html += `
        <tr>
          <td><strong>#${app.id}</strong></td>
          <td>${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU')}</td>
          <td><strong>${app.name}</strong></td>
          <td>${app.email}</td>
          <td>${app.phone || '—'}</td>
          <td style="max-width: 300px; overflow-wrap: break-word;">${app.message}</td>
          <td><span class="status-new">${app.status}</span></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
        
        <script>
          function exportToJSON() {
            const data = ${JSON.stringify(applications, null, 2)};
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'applications_' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
    
  } catch (error) {
    res.send('<h1>Ошибка загрузки данных</h1><p>' + error.message + '</p>');
  }
});
app.listen(PORT, () => {

app.use(express.static(path.join(__dirname, 'public')));

// Все GET запросы, которые не обработаны выше, отдаём index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

  
// ===================== ЗАПУСК СЕРВЕРА =====================
console.log('='.repeat(60));
  console.log(' СЕРВЕР ИНЖКАПСТРОЙ ЗАПУЩЕН!');
  console.log('='.repeat(60));
  console.log(` Главная страница: http://localhost:${PORT}`);
  console.log(`Админ-панель: http://localhost:${PORT}/admin`);
  console.log(`API проверка: http://localhost:${PORT}/api/health`);
  console.log(` Формы: POST http://localhost:${PORT}/api/contact`);
  console.log('='.repeat(60));
  console.log(`Фронтенд (React): http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n Заявки сохраняются в:', applicationsFile);
  console.log('='.repeat(60));
  console.log('\nНажмите CTRL+C для остановки\n');
});