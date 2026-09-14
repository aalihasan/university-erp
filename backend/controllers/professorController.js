
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const Course = require('../models/Course');

const getDashboardStats = async (req, res) => {
  try {
    const uni = req.user.university;
    const assignedCourses = req.user.assignedCourses;

    const studentsCount = await User.countDocuments({
      role: 'Student',
      enrolledCourse: { $in: assignedCourses },
      university: uni,
    });
    const noticesCount = await Notice.countDocuments({
      audience: { $in: ['All', 'Professor'] },
      university: uni,
    });
    const studentIds = await User.find({
      enrolledCourse: { $in: assignedCourses },
      university: uni,
    }).distinct('_id');
    const leavesCount = await Leave.countDocuments({
      student: { $in: studentIds },
      status: 'Pending',
      university: uni,
    });

    const students = await User.find({
      role: 'Student',
      enrolledCourse: { $in: assignedCourses },
      university: uni,
    }).populate('enrolledCourse', 'name');
    const courseMap = {};
    students.forEach(s => {
      const name = s.enrolledCourse?.name || 'Unknown';
      courseMap[name] = (courseMap[name] || 0) + 1;
    });
    const studentDistribution = Object.entries(courseMap).map(
      ([name, value]) => ({ name, value }),
    );

    const allLeaves = await Leave.find({
      student: { $in: studentIds },
      university: uni,
    });
    const leaveMap = { Pending: 0, Approved: 0, Rejected: 0 };
    allLeaves.forEach(l => {
      leaveMap[l.status] = (leaveMap[l.status] || 0) + 1;
    });
    const leaveStatus = Object.entries(leaveMap)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    res.json({
      studentsCount,
      noticesCount,
      leavesCount,
      studentDistribution,
      leaveStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: 'Student',
      enrolledCourse: { $in: req.user.assignedCourses },
      university: req.user.university,
    })
      .select('-password')
      .populate('enrolledCourse');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      audience: { $in: ['All', 'Professor'] },
      university: req.user.university,
    }).populate('createdBy', 'name');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentLeaves = async (req, res) => {
  try {
    const studentIds = await User.find({
      enrolledCourse: { $in: req.user.assignedCourses },
      university: req.user.university,
    }).distinct('_id');
    const leaves = await Leave.find({
      student: { $in: studentIds },
      university: req.user.university,
    }).populate({
      path: 'student',
      select: 'name email enrolledCourse',
      populate: { path: 'enrolledCourse', select: 'name' },
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const respondToLeave = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findOne({
      _id: req.params.id,
      university: req.user.university,
    });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAttendance = async (req, res) => {
  try {
    const uni = req.user.university;
    const records = req.body.records;
    const savedRecords = [];
    for (let record of records) {
      const existing = await Attendance.findOne({
        student: record.student,
        course: record.course,
        date: new Date(record.date),
        university: uni,
      });
      if (existing) {
        existing.status = record.status;
        existing.markedBy = req.user._id;
        await existing.save();
        savedRecords.push(existing);
      } else {
        const newRecord = new Attendance({
          student: record.student,
          course: record.course,
          date: record.date,
          status: record.status,
          markedBy: req.user._id,
          university: uni,
        });
        await newRecord.save();
        savedRecords.push(newRecord);
      }
    }
    res.status(201).json(savedRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadStudyMaterial = async (req, res) => {
  try {
    const { title, description, course } = req.body;
    const mongoose = require('mongoose');

    if (!req.file)
      return res.status(400).json({ message: 'Please upload a file' });

    
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const courseId = new mongoose.Types.ObjectId(course);

    const owns = await Course.findOne({
      _id: courseId,
      university: uniId,
    });
    if (!owns) return res.status(400).json({ message: 'Invalid course' });

    const material = new StudyMaterial({
      title: title.trim(),
      description: description ? description.trim() : '',
      fileUrl: `/uploads/${req.file.filename}`,
      course: courseId,
      uploadedBy: new mongoose.Types.ObjectId(req.user._id),
      university: uniId,
    });

    await material.save();
    res.status(201).json(material);
  } catch (error) {
    console.error('Upload Error Log:', error);
    res.status(500).json({ message: error.message });
  }
};

const getStudyMaterials = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const profId = new mongoose.Types.ObjectId(req.user._id);
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const materials = await StudyMaterial.find({
      uploadedBy: profId,
      university: uniId,
    }).populate('course');

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      university: req.user.university,
    });
    if (
      material &&
      material.uploadedBy.toString() === req.user._id.toString()
    ) {
      await material.deleteOne();
      res.json({ message: 'Study material deleted' });
    } else {
      res.status(401).json({ message: 'Not authorized or not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyAssignedCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      _id: { $in: req.user.assignedCourses },
      university: req.user.university,
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const prof = await User.findById(req.user._id);
    if (!prof) return res.status(404).json({ message: 'User not found' });
    if (email) prof.email = email;
    if (password) {
      const bcrypt = require('bcrypt');
      prof.password = await bcrypt.hash(password, 10);
    }
    await prof.save();
    res.json({
      message: 'Profile updated successfully',
      email: prof.email,
      name: prof.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getMyStudents,
  getNotices,
  getStudentLeaves,
  respondToLeave,
  addAttendance,
  uploadStudyMaterial,
  getStudyMaterials,
  deleteStudyMaterial,
  getMyAssignedCourses,
  updateProfile,
};
