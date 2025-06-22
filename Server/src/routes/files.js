const express = require('express');
const router = express.Router({ mergeParams: true }); // 合并父路由参数

const { 
  createFile, 
  updateFile, 
  deleteFile, 
  getFile 
} = require('../controllers/fileController');

const { authenticateToken } = require('../middleware/auth');
const { validateFile } = require('../middleware/validation');

// 创建文件 (需要认证)
router.post('/', authenticateToken, validateFile, createFile);

// 更新文件 (需要认证)
router.put('/:fileId', authenticateToken, validateFile, updateFile);

// 删除文件 (需要认证)
router.delete('/:fileId', authenticateToken, deleteFile);

// 获取文件
router.get('/:fileId', getFile);

module.exports = router;

