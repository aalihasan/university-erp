const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ডাটাবেজ থেকে ইউজার তুলে req.user এ অ্যাসাইন করা
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'Not authorized, user not found' });
      }

      return next(); // সমাধান: কাজ শেষ হলে এখানেই রিটার্ন করে পরের ধাপে চলে যাবে
    } catch (error) {
      console.error('Auth Token Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' }); // সমাধান: return যুক্ত করা হয়েছে
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' }); // সমাধান: return যুক্ত করা হয়েছে
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next(); // সমাধান: return যুক্ত করা হয়েছে
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const professorOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'Professor' || req.user.role === 'Admin')
  ) {
    return next(); // সমাধান: return যুক্ত করা হয়েছে
  } else {
    return res.status(403).json({ message: 'Not authorized as a professor' });
  }
};

module.exports = { protect, adminOnly, professorOnly };
