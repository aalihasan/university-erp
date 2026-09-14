const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  updateProfile,
  getNotices,
  getLeaves,
  applyLeave,
  getAttendance,
  getStudyMaterials,
} = require('../controllers/studentController');

// গ্লোবাল প্রটেক্ট মিডলওয়্যার
router.use(protect);

// সমাধান: মিডলওয়্যারের বডিতে সঠিকভাবে রিটার্ন স্টেটমেন্ট যুক্ত করা হলো যাতে রেসপন্স ব্লক না হয়
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Student') {
    return next(); // সমাধান: return যুক্ত করা হয়েছে
  } else {
    return res.status(403).json({ message: 'Not authorized as a student' });
  }
};

router.use(studentOnly);

// আপনার ফ্রন্টঅ্যান্ড এবং নোটিফিকেশন সিস্টেমের সাথে পাথ সামঞ্জস্য করা হলো
router.get('/dashboard', getDashboardStats);
router.get('/dashboard-stats', getDashboardStats); // সেফটি রুট
router.put('/profile', updateProfile);
router.get('/notices', getNotices);

// লিভ রিকোয়েস্টের রাউটসমূহ
router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);

// অ্যাটেনডেন্স এবং স্টাডি ম্যাটেরিয়াল রাউটসমূহ
router.get('/attendance', getAttendance);
router.get('/studymaterial', getStudyMaterials);
router.get('/study-materials', getStudyMaterials); // সেফটি রুট

module.exports = router;
