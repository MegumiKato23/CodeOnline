const Redis = require('ioredis');
const config = require('../../config'); // 修正路径

const redis = new Redis(config.redis);

// 连接事件监听
redis.on('connect', () => {
  console.log(`[${new Date().toISOString()}] Redis connected`);
});

redis.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] Redis error:`, err);
});

module.exports = {
  hset: async (key, fieldValues) => {
    return redis.hset(key, fieldValues);
  },

  hgetall: async (key) => {
    const data = await redis.hgetall(key);
    return data && Object.keys(data).length > 0 ? data : null;
  },

  expire: (key, seconds) => redis.expire(key, seconds),

  ping: async () => {
    try {
      await redis.ping();
      return true;
    } catch (err) {
      console.error('Redis ping failed:', err);
      return false;
    }
  },
};
