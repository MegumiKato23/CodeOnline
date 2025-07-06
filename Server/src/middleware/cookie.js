const cookieAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      code: 401,
      message: 'cookie未验证',
    });
  }
  next();
};

module.exports = {
  cookieAuth,
};
