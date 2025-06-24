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
const { cookieAuth } = require('../middleware/cookie');

// 创建文件 (需要认证)
router.post('/', cookieAuth, authenticateToken, validateFile, createFile);

// 更新文件 (需要认证)
router.put('/:fileId', cookieAuth, authenticateToken, validateFile, updateFile);

// 删除文件 (需要认证)
router.delete('/:fileId', cookieAuth, authenticateToken, deleteFile);

// 获取文件
router.get('/:fileId', getFile);

module.exports = router;

