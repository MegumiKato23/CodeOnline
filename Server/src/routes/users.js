const express = require('express');
const router = express.Router();

const { 
  register, 
  login, 
  updateProfile, 
  getProfile, 
  getUserProjects 
} = require('../controllers/userController');

const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// 用户注册
router.post('/register', validateRegister, register);

// 用户登录
router.post('/login', validateLogin, login);

// 更新用户资料（需要认证）
router.put('/profile', authenticateToken, updateProfile);

// 获取用户资料
router.get('/profile/:userId', getProfile);

// 获取用户项目集
router.get('/project/:userId', getUserProjects);

module.exports = router;

