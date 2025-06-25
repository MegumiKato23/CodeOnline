const { verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateRefreshToken = (req, res, next) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try { 
    const decoded = verifyRefreshToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateToken,
  authenticateRefreshToken
};

