const { body } = require('express-validator');

// 用户注册验证
const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),

  body('account').notEmpty().withMessage('账户不能为空'),

  body('password')
    .isLength({ min: 6, max: 30 })
    .withMessage('密码必须在6-30个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('密码必须包含大小写字母和数字'),

  body('confirmPassword').notEmpty().withMessage('确认密码不能为空'),
];

// 用户登录验证
const validateLogin = [
  body('account').notEmpty().withMessage('账户不能为空'),

  body('password').notEmpty().withMessage('密码不能为空'),
];

// 项目创建/更新验证
const validateProject = [
  body('name')
    .notEmpty()
    .withMessage('项目名称不能为空')
    .isLength({ max: 100 })
    .withMessage('项目名称不能超过100个字符'),
];

// 文件创建/更新验证
const validateFile = [
  body('name').notEmpty().withMessage('文件名不能为空').isLength({ max: 255 }).withMessage('文件名不能超过255个字符'),

  body('path')
    .notEmpty()
    .withMessage('文件路径不能为空')
    .isLength({ max: 500 })
    .withMessage('文件路径不能超过500个字符'),

  body('type').isIn(['HTML', 'CSS', 'JS', 'JSX', 'TS', 'VUE', 'SCSS', 'LESS']).withMessage('无效的文件类型'),

  body('content').optional().isString().withMessage('文件内容必须是字符串'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateFile,
};
