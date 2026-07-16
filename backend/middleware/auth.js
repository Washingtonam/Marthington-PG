const { ADMIN_API_KEY } = require('../config/keys');

const authenticateAdmin = (req, res, next) => {
  const providedKey = req.header('x-admin-key') || req.header('authorization')?.replace('Bearer ', '');

  if (!providedKey || providedKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access. Provide a valid admin key.'
    });
  }

  next();
};

module.exports = {
  authenticateAdmin
};
