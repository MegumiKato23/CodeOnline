const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
require('dotenv').config();
const codeRoutes = require('./routes/code');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const fileRoutes = require('./routes/files');
const { startCleanupJob } = require('./utils/cleanup');

const app = express();
app.use(cookieParser());

// 会话存储配置
const sessionStore = new session.MemoryStore();

// 清理过期分享链接任务
startCleanupJob();

app.use(
  session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// 安全中间件
app.use(helmet());

// CORS配置
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// 日志中间件
app.use(morgan('combined'));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ code: 200, message: 'OK', timestamp: new Date().toISOString() });
});

// API路由
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/projects/:projectId/files', fileRoutes);
app.use('/api/code', codeRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
const config = require('../config');
const PORT1 = config.server.port;
app.listen(PORT1, () => {
  console.log(`
    Redis: ${config.redis.host}:${config.redis.port}
  `);
});
module.exports = app;
