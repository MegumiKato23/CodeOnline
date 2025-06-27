const redis = require('../utils/redis');
const prisma = require('../utils/prisma');

// 获取Redis中的文件数据（确保返回您需要的格式）
const getFilesFromRedis = async (userId) => {
  const data = await redis.hgetall(`project:${userId}:New project`);
  if (!data || Object.keys(data).length === 0) return null;
  
  // 转换为标准格式
  return Object.values(data).map(fileStr => {
    const file = JSON.parse(fileStr);
    return {
      name: file.name,
      path: file.path || "New project/",
      content: file.content || "",
      type: file.type || 
           (file.name.endsWith('.css') ? 'CSS' : 
            file.name.endsWith('.js') ? 'JS' : 'HTML')
    };
  });
};

// 修改getCode返回标准格式
exports.getCode = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const files = await getFilesFromRedis(userId) || [];
    res.json({ files }); // 返回标准格式数组
  } catch (error) {
    res.status(500).json({ error: "获取失败" });
  }
};

// 修改saveCode确保存储标准格式
exports.saveCode = async (req, res) => {
  const { userId, files } = req.body;
  
  if (!files.some(f => f.type === "HTML" && f.content)) {
    return res.status(400).json({ error: "HTML内容不能为空" });
  }

  try {
    const serialized = {};
    files.forEach(file => {
      serialized[file.name] = JSON.stringify({
        name: file.name,
        path: file.path || "New project/",
        content: file.content || '',
        type: file.type
      });
    });

    await redis.hset(`project:${userId}:New project`, serialized);
    res.json({ success: true });
  } catch (error) {
    console.error('保存错误:', error);
    res.status(500).json({ error: "存储失败" });
  }
};

// 更新单个文件API（完全匹配您需要的格式）
exports.updateFile = async (req, res) => {
  const { projectId, fileId } = req.params;
  const { name, path, content, type } = req.body;

  try {
    // 1. 验证项目存在
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) {
      return res.status(404).json({ 
        code: 404,
        message: "项目不存在"
      });
    }

    // 2. 更新数据库
    const updatedFile = await prisma.file.upsert({
      where: { 
        projectId_name: {
          projectId,
          name: fileId
        }
      },
      update: {
        content,
        type,
        path,
        name
      },
      create: {
        name: fileId,
        path: path || "New project/",
        content: content || "",
        type: type || (fileId.endsWith('.css') ? 'CSS' : 
                      fileId.endsWith('.js') ? 'JS' : 'HTML'),
        projectId
      }
    });

    res.json({
      code: 200,
      message: "文件更新成功",
      data: updatedFile
    });
  } catch (error) {
    console.error('文件更新失败:', error);
    res.status(500).json({
      code: 500,
      message: "文件更新失败",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};