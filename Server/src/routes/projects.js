const express = require('express');
const router = express.Router();

const { 
  createProject, 
  getProject, 
  updateProject, 
  deleteProject, 
  getShareLink 
} = require('../controllers/projectController');

const { authenticateToken } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

// 创建项目 (需要认证)
router.post('/', authenticateToken, validateProject, createProject);

// 获取单个项目
router.get('/:projectId', getProject);

// 更新项目 (需要认证)
router.put('/:projectId', authenticateToken, validateProject, updateProject);

// 删除项目 (需要认证)
router.delete('/:projectId', authenticateToken, deleteProject);

// 获取分享短链 (需要认证)
router.get('/share/:projectId', authenticateToken, getShareLink);

module.exports = router;

