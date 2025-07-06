const express = require('express');
const router = express.Router();

const {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getShareLink,
  getShareProject,
} = require('../controllers/projectController');

const { authenticateToken } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');
const { cookieAuth } = require('../middleware/cookie');

// 创建项目 (需要认证)
router.post('/', cookieAuth, authenticateToken, validateProject, createProject);

// 获取单个项目
router.get('/:projectId', getProject);

// 更新项目 (需要认证)
router.put('/:projectId', cookieAuth, authenticateToken, validateProject, updateProject);

// 删除项目 (需要认证)
router.delete('/:projectId', cookieAuth, authenticateToken, deleteProject);

// 获取分享短链 (需要认证)
router.get('/share/:projectId', authenticateToken, getShareLink);

// 获取分享项目（避免和获取分享短链撞路由）
router.get('/share/to/:shareId', getShareProject);

module.exports = router;
