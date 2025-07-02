const cookieAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};

module.exports = {
  cookieAuth,
};
