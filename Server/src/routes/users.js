const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  updateProfile,
  getProfile,
  getUserProjects,
  refreshToken,
} = require('../controllers/userController');

const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { cookieAuth } = require('../middleware/cookie');

// 用户注册
router.post('/register', validateRegister, register);

// 用户登录
router.post('/login', validateLogin, login);

// 用户登出
router.post('/logout', authenticateToken, logout);

// 更新用户资料（需要认证）
router.put('/profile', cookieAuth, authenticateToken, updateProfile);

// 获取用户资料
router.get('/profile', cookieAuth, getProfile);

// 获取用户项目集
router.get('/project', cookieAuth, getUserProjects);

// 更新token
router.post('/auth/refresh', cookieAuth, authenticateRefreshToken, refreshToken);

module.exports = router;
