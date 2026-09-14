const User = require('../models/User');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const mongoose = require('mongoose'); // মঙ্গুজ ইমপোর্ট করা হলো টাইপ সেফটির জন্য

const getDashboardStats = async (req, res) => {
  try {
    const uni = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const courseId = req.user.enrolledCourse;
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    const presentCount = await Attendance.countDocuments({
      student: studentId,
      status: 'Present',
      university: uni,
    });
    const totalAttendance = await Attendance.countDocuments({
      student: studentId,
      university: uni,
    });
    const absentCount = totalAttendance - presentCount;
    const attendancePercentage =
      totalAttendance > 0
        ? ((presentCount / totalAttendance) * 100).toFixed(2)
        : 0;
    const noticesCount = await Notice.countDocuments({
      audience: { $in: ['All', 'Student'] },
      university: uni,
    });
    const studyMaterialsCount = courseId
      ? await StudyMaterial.countDocuments({
          course: courseId,
          university: uni,
        })
      : 0;

    const attendanceData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount },
    ].filter(d => d.value > 0);

    const leaves = await Leave.find({ student: studentId, university: uni });
    const leaveMap = { Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach(l => {
      leaveMap[l.status] = (leaveMap[l.status] || 0) + 1;
    });
    const leaveData = Object.entries(leaveMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    const subjects = courseId
      ? await Subject.find({ course: courseId, university: uni })
          .populate('professor', 'name')
          .select('name professor')
      : [];
    const subjectList = subjects.map(s => ({
      name: s.name,
      professor: s.professor?.name || 'Unassigned',
    }));

    res.json({
      attendancePercentage,
      noticesCount,
      studyMaterialsCount,
      attendanceData,
      leaveData,
      subjectList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.email) user.email = req.body.email;
    if (req.body.mobileNumber !== undefined)
      user.mobileNumber = req.body.mobileNumber;
    if (req.body.password) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrolledCourse: user.enrolledCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const notices = await Notice.find({
      audience: { $in: ['All', 'Student'] },
      university: uniId,
    }).populate('createdBy', 'name');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// সমাধান: এখানে টাইপ-সেফ অবজেক্ট আইডি দিয়ে প্রপার কুয়েরি নিশ্চিত করা হলো
const getLeaves = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const leaves = await Leave.find({
      student: studentId,
      university: uniId,
    }).sort({ createdAt: -1 }); // সর্টিং ফিক্স করা হলো

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// সমাধান: এখানে ডাটাবেজে সেভ করার সময় নিখুঁত ObjectId টাইপ সিঙ্ক করা হলো
const applyLeave = async (req, res) => {
  try {
    const { date, reason } = req.body;
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const leave = new Leave({
      student: studentId,
      date,
      reason,
      university: uniId,
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const attendanceRecords = await Attendance.find({
      student: studentId,
      university: uniId,
    })
      .populate('course')
      .populate('markedBy', 'name');
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudyMaterials = async (req, res) => {
  try {
    if (!req.user.enrolledCourse) {
      return res.json([]);
    }
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const materials = await StudyMaterial.find({
      course: req.user.enrolledCourse,
      university: uniId,
    }).populate('course');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  updateProfile,
  getNotices,
  getLeaves,
  applyLeave,
  getAttendance,
  getStudyMaterials,
};
