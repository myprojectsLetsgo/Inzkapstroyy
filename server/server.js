const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// Конфигурация подключения к SQL Server
const dbConfig = {
    server: 'NURIYAMIR\\SQLEXPRESS',  // как в вашем подключении
    database: 'auth_db',               // база данных с пользователями
    options: {
        trustedConnection: true,        // Windows аутентификация
        encrypt: false,
        trustServerCertificate: true
    }
};

// Проверка подключения к БД
app.get('/api/health', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        res.json({ status: '✅ Connected to SQL Server' });
    } catch (err) {
        res.status(500).json({ status: '❌ Error', error: err.message });
    }
});

// API для сохранения заявки с лендинга
app.post('/api/consultation', async (req, res) => {
    try {
        const { name, email, phone, description } = req.body;
        
        // Проверка обязательных полей
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Заполните имя, email и телефон' });
        }
        
        // Подключаемся к БД
        let pool = await sql.connect(dbConfig);
        
        // Создаем таблицу для заявок, если её нет
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='consultations' AND xtype='U')
            CREATE TABLE consultations (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL,
                email NVARCHAR(100) NOT NULL,
                phone NVARCHAR(20) NOT NULL,
                project_description NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                status NVARCHAR(20) DEFAULT 'new'
            )
        `);
        
        // Вставляем заявку
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('description', sql.NVarChar, description || '')
            .query(`
                INSERT INTO consultations (name, email, phone, project_description)
                VALUES (@name, @email, @phone, @description);
                SELECT SCOPE_IDENTITY() as id;
            `);
        
        console.log(`✅ Заявка сохранена, ID: ${result.recordset[0].id}`);
        
        res.json({ 
            success: true, 
            message: 'Заявка успешно отправлена',
            id: result.recordset[0].id 
        });
        
    } catch (err) {
        console.error('❌ Ошибка:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API для получения всех заявок
app.get('/api/consultations', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM consultations ORDER BY created_at DESC');
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📡 Эндпоинты:`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/consultation  - для формы заявки`);
    console.log(`   GET  /api/consultations - список заявок\n`);
});