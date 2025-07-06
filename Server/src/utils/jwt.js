const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_SECRET = crypto.randomBytes(32).toString('base64');
const REFRESH_TOKEN_SECRET = crypto.randomBytes(32).toString('base64');
const SHARE_ID_SECRET = crypto.randomBytes(32).toString('base64');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '24h', algorithm: 'HS256' });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

const generateShareId = (payload) => {
  return jwt.sign(payload, SHARE_ID_SECRET, { expiresIn: '7d' });
};

const verifyShareId = (token) => {
  return jwt.verify(token, SHARE_ID_SECRET);
};

module.exports = {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateShareId,
  verifyShareId,
};
