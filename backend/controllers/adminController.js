
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');

const bcrypt = require('bcrypt');

const getDashboardStats = async (req, res) => {
  try {
    const uni = req.user.university;
    const totalStudents = await User.countDocuments({
      role: 'Student',
      university: uni,
    });
    const totalProfessors = await User.countDocuments({
      role: 'Professor',
      university: uni,
    });
    const totalCourses = await Course.countDocuments({ university: uni });

    const courses = await Course.find({ university: uni });
    const students = await User.find({ role: 'Student', university: uni });
    const subjects = await Subject.find({ university: uni });
    const leaves = await Leave.find({ university: uni });

    const courseMap = {};
    courses.forEach(c => (courseMap[c._id.toString()] = c.name));

    const studentCountMap = {};
    students.forEach(s => {
      const courseId = s.enrolledCourse
        ? s.enrolledCourse.toString()
        : 'Unassigned';
      const courseName = courseMap[courseId] || 'Unassigned';
      studentCountMap[courseName] = (studentCountMap[courseName] || 0) + 1;
    });
    const studentDistribution = Object.keys(studentCountMap).map(name => ({
      name,
      value: studentCountMap[name],
    }));

    const subjectCountMap = {};
    subjects.forEach(s => {
      const courseId = s.course ? s.course.toString() : 'Unassigned';
      const courseName = courseMap[courseId] || 'Unassigned';
      subjectCountMap[courseName] = (subjectCountMap[courseName] || 0) + 1;
    });
    const subjectsPerCourse = Object.keys(subjectCountMap).map(name => ({
      name,
      count: subjectCountMap[name],
    }));

    const leaveStatusMap = { Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach(l => {
      if (leaveStatusMap[l.status] !== undefined) {
        leaveStatusMap[l.status]++;
      }
    });
    const leaveStatus = Object.keys(leaveStatusMap).map(name => ({
      name,
      value: leaveStatusMap[name],
    }));

    res.json({
      totalStudents,
      totalProfessors,
      totalCourses,
      studentDistribution,
      subjectsPerCourse,
      leaveStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const query = role
      ? { role, university: req.user.university }
      : { role: { $ne: 'Admin' }, university: req.user.university };
    const users = await User.find(query)
      .populate('enrolledCourse assignedCourses')
      .select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      enrolledCourse,
      assignedCourses,
      gender,
      dateOfBirth,
      mobileNumber,
      category,
      address,
      parentName,
      parentContact,
      isHandicapped,
    } = req.body;
    const uni = req.user.university;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    let studentData = {};
    if (role === 'Student') {
      // Course must belong to this Admin's own university, otherwise a
      // stray/guessed course id from another tenant could be used.
      const course = await Course.findOne({
        _id: enrolledCourse,
        university: uni,
      });
      if (!course)
        return res.status(400).json({ message: 'Invalid enrolledCourse' });
      const admissionDate = new Date();
      const startYear = admissionDate.getFullYear();

      const yearPrefix = startYear.toString().slice(-2);
      let courseShort = 'UNK';
      if (course && course.name) {
        courseShort = course.name
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
          .substring(0, 5);
      }
      const count = await User.countDocuments({
        role: 'Student',
        enrolledCourse,
        university: uni,
      });
      const sequentialStr = (count + 1).toString().padStart(3, '0');
      const enrollmentNumber = `${yearPrefix}${courseShort}${sequentialStr}`;

      let durationYears = 1;
      if (course && course.duration) {
        const match = course.duration.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (course.duration.toLowerCase().includes('semester')) {
            durationYears = Math.ceil(num / 2);
          } else {
            durationYears = num;
          }
        }
      }
      const endYear = startYear + durationYears;
      const yearStr = `${startYear} - ${endYear}`;
      studentData = {
        enrolledCourse,
        enrollmentNumber,
        admissionDate,
        year: yearStr,
        gender,
        dateOfBirth,
        mobileNumber,
        category,
        address,
        parentName,
        parentContact,
        isHandicapped: isHandicapped === 'true' || isHandicapped === true,
      };
    }

    let validAssignedCourses = [];
    if (role === 'Professor' && assignedCourses?.length > 0) {
      // Only keep course ids that actually belong to this university.
      const owned = await Course.find({
        _id: { $in: assignedCourses },
        university: uni,
      }).distinct('_id');
      validAssignedCourses = owned;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      university: uni,
      assignedCourses: role === 'Professor' ? validAssignedCourses : [],
      ...studentData,
    });
    await newUser.save();
    if (role === 'Professor' && req.body.selectedSubjects?.length > 0) {
      await Subject.updateMany(
        { _id: { $in: req.body.selectedSubjects }, university: uni },
        { professor: newUser._id },
      );
    }
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      university: req.user.university,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (user.role === 'Student') {
      if (req.body.enrolledCourse !== undefined) {
        const course = await Course.findOne({
          _id: req.body.enrolledCourse,
          university: req.user.university,
        });
        if (!course)
          return res.status(400).json({ message: 'Invalid enrolledCourse' });
        user.enrolledCourse = req.body.enrolledCourse;
      }
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.dateOfBirth !== undefined)
        user.dateOfBirth = req.body.dateOfBirth;
      if (req.body.mobileNumber !== undefined)
        user.mobileNumber = req.body.mobileNumber;
      if (req.body.category !== undefined) user.category = req.body.category;
      if (req.body.address !== undefined) user.address = req.body.address;
      if (req.body.parentName !== undefined)
        user.parentName = req.body.parentName;
      if (req.body.parentContact !== undefined)
        user.parentContact = req.body.parentContact;
      if (req.body.isHandicapped !== undefined)
        user.isHandicapped =
          req.body.isHandicapped === 'true' || req.body.isHandicapped === true;

      if (!user.enrollmentNumber) {
        const course = await Course.findOne({
          _id: user.enrolledCourse,
          university: req.user.university,
        });
        const startYear = (user.admissionDate || new Date()).getFullYear();
        const yearPrefix = startYear.toString().slice(-2);
        let courseShort = 'UNK';
        if (course && course.name) {
          courseShort = course.name
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase()
            .substring(0, 5);
        }
        const count = await User.countDocuments({
          role: 'Student',
          enrolledCourse: user.enrolledCourse,
          university: req.user.university,
          enrollmentNumber: { $exists: true },
        });
        const sequentialStr = (count + 1).toString().padStart(3, '0');
        user.enrollmentNumber = `${yearPrefix}${courseShort}${sequentialStr}`;

        if (!user.admissionDate) {
          user.admissionDate = new Date();
        }
        if (!user.year) {
          let durationYears = 1;
          if (course && course.duration) {
            const match = course.duration.match(/(\d+)/);
            if (match) {
              const num = parseInt(match[1]);
              durationYears = course.duration.toLowerCase().includes('semester')
                ? Math.ceil(num / 2)
                : num;
            }
          }
          user.year = `${startYear} - ${startYear + durationYears}`;
        }
      }
    }
    if (user.role === 'Professor') {
      if (req.body.assignedCourses) {
        const owned = await Course.find({
          _id: { $in: req.body.assignedCourses },
          university: req.user.university,
        }).distinct('_id');
        user.assignedCourses = owned;
      }
      if (req.body.selectedSubjects !== undefined) {
        const courseId = (req.body.assignedCourses ||
          user.assignedCourses)?.[0];
        if (courseId) {
          await Subject.updateMany(
            {
              course: courseId,
              professor: user._id,
              university: req.user.university,
            },
            { $unset: { professor: '' } },
          );
        }
        if (req.body.selectedSubjects.length > 0) {
          await Subject.updateMany(
            {
              _id: { $in: req.body.selectedSubjects },
              university: req.user.university,
            },
            { professor: user._id },
          );
        }
      }
    }
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({
      _id: req.params.id,
      university: req.user.university,
    });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ university: req.user.university });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const course = new Course({ ...req.body, university: req.user.university });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { university, ...updates } = req.body; // never let the tenant be changed via this route
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, university: req.user.university },
      updates,
      { new: true },
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findOneAndDelete({
      _id: req.params.id,
      university: req.user.university,
    });
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ university: req.user.university })
      .populate('course')
      .populate('professor', 'name email');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubjectsByCourse = async (req, res) => {
  try {
    const subjects = await Subject.find({
      course: req.params.courseId,
      university: req.user.university,
    }).populate('professor', 'name _id');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.body.course,
      university: req.user.university,
    });
    if (!course) return res.status(400).json({ message: 'Invalid course' });
    const subject = new Subject({
      ...req.body,
      university: req.user.university,
    });
    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { university, ...updates } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, university: req.user.university },
      updates,
      { new: true },
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findOneAndDelete({
      _id: req.params.id,
      university: req.user.university,
    });
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      university: req.user.university,
    }).populate('createdBy', 'name');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotice = async (req, res) => {
  try {
    const notice = new Notice({
      ...req.body,
      createdBy: req.user._id,
      university: req.user.university,
    });
    const createdNotice = await notice.save();
    res.status(201).json(createdNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    await Notice.findOneAndDelete({
      _id: req.params.id,
      university: req.user.university,
    });
    res.json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
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
    if (leave) {
      leave.status = status;
      leave.approvedBy = req.user._id;
      const updatedLeave = await leave.save();
      res.json(updatedLeave);
    } else {
      res.status(404).json({ message: 'Leave not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    await Leave.findOneAndDelete({
      _id: req.params.id,
      university: req.user.university,
    });
    res.json({ message: 'Leave removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubjects,
  getSubjectsByCourse,
  createSubject,
  updateSubject,
  deleteSubject,
  getNotices,
  createNotice,
  deleteNotice,
  getAllLeaves,
  respondToLeave,
  deleteLeave,
};
