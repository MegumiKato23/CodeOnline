const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// 创建项目
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const userId = req.session.userId;

    const project = await prisma.project.create({
      data: {
        name: name,
        ownerId: userId
      }
    });

    res.status(200).json({
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// 获取单个项目
const getProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            account: true
          }
        },
        files: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({
      id: project.id,
      name: project.name,
      owner: {
        id: project.owner.id,
        username: project.owner.name,
        account: project.owner.account
      },
      files: project.files.map(file => file.id),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
};

// 更新项目
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, files } = req.body;

    // 检查项目是否存在并且用户有权限
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: name, files: files }
    });

    res.status(200).json({
      id: updatedProject.id,
      name: updatedProject.name,
      ownerId: updatedProject.ownerId,
      files: updatedProject.files,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// 删除项目
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // 检查项目是否存在并且用户有权限
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // 删除项目
    await prisma.project.delete({
      where: { id: projectId }
    });

    res.status(200).json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// 获取分享短链
const getShareLink = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 生成分享记录
    const keeptime = new Date();
    keeptime.setDate(keeptime.getDate() + 7); // 默认7天有效期

    const share = await prisma.share.create({
      data: {
        projectId: projectId,
        keeptime: keeptime
      }
    });

    const shareUrl = `${req.protocol}://${req.get('host')}/share/${share.id}`;

    res.status(200).json({
      shareUrl: shareUrl,
      shareId: share.id,
      expiresAt: keeptime.toISOString()
    });

  } catch (error) {
    console.error('Get share link error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

// 获取分享项目
const getShareProject = async (req, res) => {
  try {
    const shareId = req.params.shareId;

    const share = await prisma.share.findUnique({
      where: { id: shareId }
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    const project = await prisma.project.findUnique({
      where: { id: share.projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({
      id: project.id,
      name: project.name,
      owner: {
        id: project.owner.id,
        username: project.owner.name,
        account: project.owner.account
      },
      files: project.files.map(file => file.id),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Get share project error:', error);
    res.status(500).json({ error: 'Failed to get share project' });
  }
};

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getShareLink,
  getShareProject
};

