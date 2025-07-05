const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { generateAccessToken, generateRefreshToken, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

// 用户注册
const register = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '注册参数格式错误',
        errors: errors.array(),
      });
    }

    const { username, account, password, confirmPassword } = req.body;

    // 验证密码一致性
    if (password !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: '注册参数密码不一致',
      });
    }

    // 检查用账户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        account: account,
      },
    });

    if (existingUser) {
      return res.status(200).json({
        code: 1001,
        message: '账户已存在',
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    await prisma.user.create({
      data: {
        name: username,
        account: account,
        password: hashedPassword,
        status: 'left',
      },
    });

    res.status(200).json({
      code: 200,
      message: '注册成功',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败',
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '登录参数格式错误',
        errors: errors.array(),
      });
    }

    const { account, password } = req.body;

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        account: account,
      },
    });

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: '用户不存在',
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        code: 400,
        message: '密码错误',
      });
    }

    // 生成JWT令牌
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.name,
      account: user.account,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.name,
      account: user.account,
    });

    //设置HttpOnly Cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/auth/refresh',
    });

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 在会话中存储用户id
    req.session.userId = user.id;

    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.name,
          account: user.account,
          avatar: user.avatar || null,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败',
      data: null,
    });
  }
};

// 用户登出
const logout = async (req, res) => {
  try {
    // 清除会话中的用户id
    req.session.userId = null;

    // 清除HttpOnly Cookie
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({
      code: 200,
      message: '登出成功',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      code: 500,
      message: '登出失败',
    });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const { user: userData } = req.body;
    const userId = userData.id;

    // 验证用户是否有权限更新此资料
    if (req.session.userId !== userId) {
      return res.status(400).json({
        code: 400,
        message: '权限不足',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.username,
        account: userData.account,
        avatar: userData.avatar,
        status: userData.status,
      },
    });

    res.status(200).json({
      code: 200,
      message: '更新成功',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.name,
          account: updatedUser.account,
          avatar: updatedUser.avatar,
          status: updatedUser.status,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      code: 500,
      message: '更新失败',
      data: null,
    });
  }
};

// 获取用户资料
const getProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        account: true,
        avatar: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.status(200).json({
      code: 200,
      message: '用户资料获取成功',
      data: {
        user: {
          id: user.id,
          username: user.name,
          account: user.account,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      code: 500,
      message: '用户资料获取失败',
      data: null,
    });
  }
};

// 获取用户项目集
const getUserProjects = async (req, res) => {
  try {
    const userId = req.session.userId;

    const userWithProjects = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!userWithProjects) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.status(200).json({
      code: 200,
      message: '用户项目集获取成功',
      data: {
        projects: userWithProjects.projects.map((project) => ({
          id: project.id,
          name: project.name,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      code: 500,
      message: '用户项目集获取失败',
      data: null,
    });
  }
};

// 更新token，验证用户状态
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(200).json({
        code: 1002,
        message: 'token不存在',
        data: null,
      });
    }

    // 验证token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    return res.status(200).json({
      code: 200,
      message: 'token验证成功',
      data: {
        user: {
          id: user.id,
          username: user.name,
          account: user.account,
          avatar: user.avatar || null,
          status: user.status,
        },
      },
    });
  } catch (error) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(200).json({
          code: 1002,
          message: 'refreshToken不存在',
          data: null,
        });
      }

      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(200).json({
          code: 1002,
          message: 'refreshToken验证失败',
          data: null,
        });
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        username: user.name,
        account: user.account,
      });

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24小时
        path: '/',
      });

      return res.status(200).json({
        code: 200,
        message: '刷新token成功',
        data: {
          user: {
            id: user.id,
            username: user.name,
            account: user.account,
            avatar: user.avatar || null,
            status: user.status,
          },
        }
      });
    } catch(refreshError) {
      console.error('Refresh token error:', refreshError);
      return res.status(200).json({
        code: 1002,
        message: '刷新token失败',
        data: null,
      });
    }
  }
};

module.exports = {
  register,
  login,
  logout,
  updateProfile,
  getProfile,
  getUserProjects,
  refreshToken,
};
