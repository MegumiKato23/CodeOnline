const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { generateShareId } = require('../utils/jwt');
const crypto = require('crypto');

// 创建项目
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    const userId = req.session.userId;

    const project = await prisma.project.create({
      data: {
        name: name,
        ownerId: userId,
      },
    });

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        }
      }
    })
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      code: 500,
      message: 'Create project failed',
      data: null,
    });
  }
};

// 获取单个项目
const getProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        files: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        code: 404,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        project: {
          id: project.id,
          name: project.name,
          files: project.files,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      code: 500,
      message: 'Get project failed',
      data: null,
    });
  }
};

// 更新项目
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, files } = req.body;

    // 检查项目是否存在并且用户有权限
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return res.status(404).json({
        code: 404,
        message: 'Project not found',
      });
    }

    if (existingProject.ownerId !== req.session.userId) {
      return res.status(400).json({
        code: 400,
        message: 'Permission denied',
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: name, files: files },
    });

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        project: {
          id: updatedProject.id,
          name: updatedProject.name,
          createdAt: updatedProject.createdAt.toISOString(),
          updatedAt: updatedProject.updatedAt.toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      code: 500,
      message: 'Update project failed',
      data: null,
    });
  }
};

// 删除项目
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // 检查项目是否存在并且用户有权限
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return res.status(404).json({
        code: 404,
        message: 'Project not found',
      });
    }

    if (existingProject.ownerId !== req.session.userId) {
      return res.status(400).json({
        code: 400,
        message: 'Permission denied',
      });
    }

    // 删除项目
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(200).json({
      code: 200,
      message: 'success',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to delete project',
    });
  }
};

// 获取分享短链
const getShareLink = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        code: 404,
        message: 'Project not found',
      });
    }

    // 通过项目id和用户id生成token
    const token = generateShareId({ projectId: projectId, userId: req.session.userId });

    const digest = crypto.createHash('sha256')
    .update(token)
    .digest('hex')
    .substring(0, 16);
    
    // 生成分享记录
    const keeptime = new Date();
    keeptime.setDate(keeptime.getDate() + 7); // 默认7天有效期

    const share = await prisma.share.create({
      data: {
        id: digest,
        projectId: projectId,
        keeptime: keeptime,
      },
    });

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        shareId: share.id,
        expiresAt: keeptime.toISOString(),
      }
    });
  } catch (error) {
    console.error('Get share link error:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to generate share link',
      data: null,
    });
  }
};

// 获取分享项目
const getShareProject = async (req, res) => {
  try {
    const shareId = req.params.shareId;

    const share = await prisma.share.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      return res.status(404).json({
        code: 404,
        message: 'Share not found',
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: share.projectId },
      include: {
        files: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        code: 404,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        project: {
          id: project.id,
          name: project.name,
          files: project.files,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('Get share project error:', error);
    res.status(500).json({
      code: 500,
      message: 'Get share project failed',
      data: null,
    });
  }
};

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getShareLink,
  getShareProject,
};
