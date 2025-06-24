const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

// 用户注册
const register = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, account, password, confirmPassword } = req.body;

    // 验证密码一致性
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // 检查用账户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
          account: account 
      }
    });

    if (existingUser) {
      return res.status(500).json({ error: 'Account already exists' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: username,
        account: account,
        password: hashedPassword,
        status: 'left'
      }
    });

    res.status(200).json({
      id: user.id,
      username: user.name,
      account: user.account,
      createdAt: user.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { account, password } = req.body;

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        account: account
      }
    });

    if (!user) {
      return res.status(500).json({ error: 'Invalid account or password' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(500).json({ error: 'Invalid account or password' });
    }

    // 生成JWT令牌
    const accessToken = generateAccessToken({ 
      id: user.id, 
      username: user.name,
      account: user.account 
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.name,
      account: user.account
    });

    //设置HttpOnly Cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    path: '/'
  });
  
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    path: '/auth/refresh' 
  });

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // 在会话中存储用户id
    req.session.userId = user.id;

    res.status(200).json({
      user: {
        id: user.id,
        username: user.name,
        account: user.account,
        avatar: user.avatar || null,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
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

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const { user: userData } = req.body;
    const userId = userData.id;

    // 验证用户是否有权限更新此资料
    if (req.session.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.username,
        account: userData.account,
        avatar: userData.avatar,
        
      }
    });

    res.status(200).json({
      user: {
        id: updatedUser.id,
        username: updatedUser.name,
        account: updatedUser.account,
        avatar: updatedUser.avatar
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed' });
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
        status: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.name,
        account: user.account,
        avatar: user.avatar,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
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
            updatedAt: true
          }
        }
      }
    });

    if (!userWithProjects) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: userWithProjects.id,
      projects: userWithProjects.projects.map(project => ({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Failed to get user projects' });
  }
};

// 更新token
const refreshToken = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 生成新的访问令牌
    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.name,
      account: user.account
    });

    // 设置HttpOnly Cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      path: '/'
    });

    res.json({ success: true })
  } catch(error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

module.exports = {
  register,
  login,
  logout,
  updateProfile,
  getProfile,
  getUserProjects,
  refreshToken
};

