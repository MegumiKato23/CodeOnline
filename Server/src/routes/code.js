const express = require('express');
const router = express.Router();
const controller = require('../controllers/codeController');

router.get('/:userId', (req, res, next) => {
  console.log(`请求用户代码:`, req.params.userId);
  controller.getCode(req, res).catch(next);
});

router.post('/save', (req, res, next) => {
  console.log(`保存请求:`, req.body.userId);
  controller.saveCode(req, res).catch(next);
});

// 更新单个文件
router.put('/update/:userId/:fileName', (req, res, next) => {
  console.log(`更新文件请求:`, req.params.userId, req.params.fileName);
  controller.updateFile(req, res).catch(next);
});



module.exports = router;