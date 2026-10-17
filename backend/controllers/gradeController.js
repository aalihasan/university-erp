const Grade = require('../models/Grade');
const User = require('../models/User');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// হেল্পার ফাংশন: সর্বমোট নম্বরের ওপর ভিত্তি করে ইউজিসি গ্রেড ও জিপিএ হিসাব করার লজিক
const calculateUGCGrade = total => {
  if (total >= 80) return { gpa: 4.0, letterGrade: 'A+' };
  if (total >= 75) return { gpa: 3.75, letterGrade: 'A' };
  if (total >= 70) return { gpa: 3.5, letterGrade: 'A-' };
  if (total >= 65) return { gpa: 3.25, letterGrade: 'B+' };
  if (total >= 60) return { gpa: 3.0, letterGrade: 'B' };
  if (total >= 55) return { gpa: 2.75, letterGrade: 'B-' };
  if (total >= 50) return { gpa: 2.5, letterGrade: 'C+' };
  if (total >= 45) return { gpa: 2.25, letterGrade: 'C' };
  if (total >= 40) return { gpa: 2.0, letterGrade: 'D' };
  return { gpa: 0.0, letterGrade: 'F' };
};

// ১. প্রফেসরের গ্রেডিং ফর্মের ড্রপডাউন ডাটা লোড করা
const getGradeFormData = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const [students, semesters, subjects] = await Promise.all([
      User.find({ role: 'Student', university: uniId }).select(
        'name email enrollmentId',
      ),
      Semester.find({ university: uniId }),
      Subject.find({ university: uniId }),
    ]);
    res.json({ students, semesters, subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. প্রফেসর কর্তৃক নম্বর ইনপুট বা গ্রেড সাবমিট ও আপডেট করা
const submitStudentGrade = async (req, res) => {
  try {
    const {
      student,
      semester,
      subject,
      midMarks,
      finalMarks,
      assignmentMarks,
    } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const mid = Number(midMarks) || 0;
    const final = Number(finalMarks) || 0;
    const assign = Number(assignmentMarks) || 0;
    const total = mid + final + assign;

    const { gpa, letterGrade } = calculateUGCGrade(total);

    // যদি আগে থেকেই রেকর্ড থাকে তবে আপডেট হবে, না থাকলে নতুন তৈরি হবে (Upsert)
    const grade = await Grade.findOneAndUpdate(
      {
        student: new mongoose.Types.ObjectId(student),
        semester: new mongoose.Types.ObjectId(semester),
        subject: new mongoose.Types.ObjectId(subject),
        university: uniId,
      },
      {
        midMarks: mid,
        finalMarks: final,
        assignmentMarks: assign,
        totalMarks: total,
        gpa,
        letterGrade,
      },
      { new: true, upsert: true },
    );

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. স্টুডেন্টের নিজের প্যানেল থেকে তার সমস্ত রেজাল্ট বা গ্রেড শিট দেখা
const getStudentReportCard = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const studentId = req.user._id; // লগইন থাকা স্টুডেন্টের নিজস্ব আইডি

    const report = await Grade.find({ student: studentId, university: uniId })
      .populate('semester', 'name year')
      .populate('subject', 'name code credits')
      .sort({ createdAt: -1 });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGradeFormData, submitStudentGrade, getStudentReportCard };
