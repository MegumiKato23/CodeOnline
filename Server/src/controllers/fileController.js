const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// 创建文件
const createFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectId = req.params.projectId;
    const { name, path, content, type } = req.body;

    // 检查项目是否存在并且用户有权限
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const file = await prisma.file.create({
      data: {
        name: name,
        path: path,
        content: content,
        type: type,
        ownerId: projectId
      }
    });

    // 更新项目
    await prisma.project.update({
      where: { id: projectId },
      data: {
        files: {
          connect: { id: file.id }
        }
      }
    });

    res.status(200).json({
      id: file.id,
      name: file.name,
      path: file.path,
      content: file.content,
      type: file.type,
      projectId: projectId,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
};

// 更新文件
const updateFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectId = req.params.projectId;
    const fileId = req.params.fileId;
    const { name, path, content, type } = req.body;

    // 检查项目是否存在并且用户有权限
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // 检查文件是否存在并且属于该项目
    const existingFile = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: projectId
      }
    });

    if (!existingFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        name: name,
        path: path,
        content: content,
        type: type
      }
    });

    res.status(200).json({
      id: updatedFile.id,
      name: updatedFile.name,
      path: updatedFile.path,
      content: updatedFile.content,
      type: updatedFile.type,
      projectId: projectId,
      createdAt: updatedFile.createdAt.toISOString(),
      updatedAt: updatedFile.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
};

// 删除文件
const deleteFile = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const fileId = req.params.fileId;

    // 检查项目是否存在并且用户有权限
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.session.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // 检查文件是否存在并且属于该项目
    const existingFile = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: projectId
      }
    });

    if (!existingFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    await prisma.file.delete({
      where: { id: fileId }
    });

    res.status(200).json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

// 获取文件
const getFile = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const fileId = req.params.fileId;

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 检查文件是否存在并且属于该项目
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: projectId
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({
      id: file.id,
      name: file.name,
      path: file.path,
      content: file.content,
      type: file.type,
      projectId: projectId,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
};

module.exports = {
  createFile,
  updateFile,
  deleteFile,
  getFile
};

