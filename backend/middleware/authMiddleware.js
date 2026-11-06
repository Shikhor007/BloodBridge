const jwt = require('jsonwebtoken');
const { db } = require('../models/dbAdapter');

const JWT_SECRET = process.env.JWT_SECRET || 'bloodbridge_super_secure_jwt_secret_key_2026';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findOne('users', u => u.user_id === decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: user not found.' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Account suspended. Please contact administrator.' });
    }

    // Role mapping
    const roles = await db.find('roles');
    const userRole = roles.find(r => r.role_id === user.role_id);

    req.user = {
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: userRole ? userRole.role_name : 'UNKNOWN',
      phone: user.phone
    };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = { authenticateToken, JWT_SECRET };
