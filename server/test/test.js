const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('✅ Сервер работает!');
});

app.listen(PORT, () => {
  console.log(`🚀 Тестовый сервер на http://localhost:${PORT}`);
});