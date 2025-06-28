const redis = require('../utils/redis');

exports.getCode = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const data = await redis.hgetall(`code:${userId}`);

    if (!data?.html) {
      return res.status(404).json({
        error: 'No code found for this user',
        solution: 'Please save code first',
      });
    }

    res.json({
      html: JSON.parse(data.html),
      css: data.css ? JSON.parse(data.css) : '',
      js: data.js ? JSON.parse(data.js) : '',
      lastUpdated: data.lastUpdated || null,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET Error:`, error);
    res.status(500).json({
      error: 'Failed to get code',
      requestId: `req-${Date.now()}`,
    });
  }
};

exports.saveCode = async (req, res) => {
  const { userId, html, css, js } = req.body;

  if (!userId || !html) {
    return res.status(400).json({
      error: 'userId and html are required',
      received: { userId, hasHtml: !!html },
    });
  }

  try {
    await redis.hset(`code:${userId}`, {
      html: JSON.stringify(html),
      css: JSON.stringify(css || ''),
      js: JSON.stringify(js || ''),
      lastUpdated: Date.now(),
    });
    await redis.expire(`code:${userId}`, 86400);

    res.json({
      success: true,
      savedAt: new Date().toISOString(),
      key: `code:${userId}`,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] SAVE Error:`, error);
    res.status(503).json({
      error: 'Service unavailable',
      retryAfter: '5 minutes',
    });
  }
};
