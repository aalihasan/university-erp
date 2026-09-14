// // const express = require('express');
// // const router = express.Router();
// // const { registerUser, authUser, getUserProfile } = require('../controllers/authController');
// // const { protect } = require('../middleware/authMiddleware');
// // router.post('/register', registerUser);
// // router.post('/login', authUser);
// // router.get('/profile', protect, getUserProfile);
// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const {
//   registerUser,
//   authUser,
//   getUserProfile,
// } = require('../controllers/authController');

// const { protect } = require('../middleware/authMiddleware');

// // ===============================
// // CREATE UPLOAD DIRECTORY
// // ===============================
// const uploadDir = path.join(__dirname, '../uploads/universityLogos');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, {
//     recursive: true,
//   });
// }

// // ===============================
// // MULTER STORAGE
// // ===============================
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },

//   filename: function (req, file, cb) {
//     const extension = path.extname(file.originalname);

//     const filename = 'university-' + Date.now() + extension;

//     cb(null, filename);
//   },
// });

// const upload = multer({
//   storage,

//   limits: {
//     fileSize: 2 * 1024 * 1024,
//   },

//   fileFilter: function (req, file, cb) {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPG, PNG and WEBP images are allowed'));
//     }
//   },
// });

// // ===============================
// // ROUTES
// // ===============================

// router.post('/register', upload.single('universityLogo'), registerUser);

// router.post('/login', authUser);

// router.get('/profile', protect, getUserProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  registerUniversity,
  registerStudent,
  authUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Self-serve signup used by frontend Register.jsx: multipart/form-data with
// universityName, email, password, confirmPassword, universityLogo (optional
// file). Creates a brand new university (tenant) + its Admin.
router.post('/register', upload.single('universityLogo'), registerUniversity);

// A student joining an existing university via that university's join code.
router.post('/register-student', registerStudent);

router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
module.exports = router;
