const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');


const adminController = require('../controllers/adminController') || {};
const departmentController =
  require('../controllers/departmentController') || {};
const semesterController = require('../controllers/semesterController') || {};
const feeController = require('../controllers/feeController') || {};
const advisingController = require('../controllers/advisingController') || {};

const gradeController = require('../controllers/gradeController') || {};

const safeHandler = handler => {
  return typeof handler === 'function'
    ? handler
    : (req, res) => {
        res
          .status(501)
          .json({ message: 'Function not implemented in controller.' });
      };
};


router.get(
  '/advising/student-form',
  protect,
  safeHandler(advisingController.getStudentAdvisingFormData),
);
router.post(
  '/advising/create',
  protect,
  safeHandler(advisingController.submitAdvising),
);


router.get(
  '/grades/form-data',
  protect,
  safeHandler(gradeController.getGradeFormData),
);
router.post(
  '/grades/submit',
  protect,
  safeHandler(gradeController.submitStudentGrade),
);
router.get(
  '/grades/report-card',
  protect,
  safeHandler(gradeController.getStudentReportCard),
);


router.use(protect, adminOnly);

router.get('/dashboard', safeHandler(adminController.getDashboardStats));

router.get('/users', safeHandler(adminController.getUsers));
router.post('/users', safeHandler(adminController.createUser));
router.put('/users/:id', safeHandler(adminController.updateUser));
router.delete('/users/:id', safeHandler(adminController.deleteUser));


router.get('/courses', safeHandler(adminController.getCourses));
router.post('/courses', safeHandler(adminController.createCourse));
router.put('/courses/:id', safeHandler(adminController.updateCourse));
router.delete('/courses/:id', safeHandler(adminController.deleteCourse));

router.get('/subjects', safeHandler(adminController.getSubjects));
router.post('/subjects', safeHandler(adminController.createSubject));
router.get(
  '/subjects/by-course/:courseId',
  safeHandler(adminController.getSubjectsByCourse),
);
router.put('/subjects/:id', safeHandler(adminController.updateSubject));
router.delete('/subjects/:id', safeHandler(adminController.deleteSubject));


router.get('/notices', safeHandler(adminController.getNotices));
router.post('/notices', safeHandler(adminController.createNotice));
router.delete('/notices/:id', safeHandler(adminController.deleteNotice));


router.get('/leaves', safeHandler(adminController.getAllLeaves));
router.put('/leaves/:id', safeHandler(adminController.respondToLeave));
router.delete('/leaves/:id', safeHandler(adminController.deleteLeave));


router.get('/departments', safeHandler(departmentController.getDepartments));
router.post('/departments', safeHandler(departmentController.createDepartment));
router.post(
  '/departments/seed',
  safeHandler(departmentController.seedUttaraUniversityDepartments),
);
router.put(
  '/departments/:id/assign-head',
  safeHandler(departmentController.assignDepartmentHead),
);


router.get('/semesters', safeHandler(semesterController.getSemesters));
router.post('/semesters', safeHandler(semesterController.createSemester));
router.put(
  '/semesters/:id/status',
  safeHandler(semesterController.updateSemesterStatus),
);
router.put('/semesters/:id', safeHandler(semesterController.updateSemester));
router.delete('/semesters/:id', safeHandler(semesterController.deleteSemester));


router.get('/fees/list', safeHandler(feeController.getAllFees));
router.get('/fees/form-data', safeHandler(feeController.getFeeFormData));
router.post('/fees/create', safeHandler(feeController.createFee));
router.put('/fees/pay/:id', safeHandler(feeController.collectPayment));


router.get('/advising/list', safeHandler(advisingController.getAllAdvisings));
router.put(
  '/advising/respond/:id',
  safeHandler(advisingController.respondToAdvising),
);

module.exports = router;
