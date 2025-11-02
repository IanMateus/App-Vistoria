const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

const requireEngineerOrAdmin = requireRole(['engineer', 'admin']);
const requireAdmin = requireRole(['admin']);
const requireEngineer = requireRole(['engineer']);
const requireClient = requireRole(['client']);

module.exports = {
  requireRole,
  requireEngineerOrAdmin,
  requireAdmin,
  requireEngineer,
  requireClient
};