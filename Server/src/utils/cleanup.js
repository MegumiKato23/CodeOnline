const cron = require('node-cron');
const prisma = require('../utils/prisma');

function startCleanupJob() {
  // 每小时运行一次清理任务（每小时的第0分钟执行）
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const result = await prisma.shareLink.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      console.log(`[${now.toISOString()}] 清理了 ${result.count} 条过期分享链接`);
    } catch (error) {
      console.error('清理过期分享链接失败:', error);
    }
  });

  console.log('过期分享链接清理任务已启动');
}

module.exports = { startCleanupJob };
