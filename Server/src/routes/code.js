const express = require('express');
const router = express.Router();
const controller = require('../controllers/codeController');

// 获取用户代码
router.get('/:userId', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] 请求用户代码:`, req.params.userId);
  controller.getCode(req, res).catch(next);
});

// 保存代码
router.post('/save', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] 保存请求:`, req.body.userId);
  controller.saveCode(req, res).catch(next);
});

module.exports = router;