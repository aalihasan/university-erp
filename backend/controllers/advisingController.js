const Advising = require('../models/Advising');
const Subject = require('../models/Subject');
const Semester = require('../models/Semester');
const mongoose = require('mongoose');

// ১. অ্যাডমিনের জন্য সকল পেন্ডিং ও সাবমিট হওয়া রেজিস্ট্রেশন রিকোয়েস্টের তালিকা নিয়ে আসা
const getAllAdvisings = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const list = await Advising.find({ university: uniId })
      .populate('student', 'name email enrollmentId')
      .populate('semester', 'name year')
      .populate('subjects', 'name code credits')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. শিক্ষার্থীর প্যানেল থেকে নতুন সেমিস্টার курс রেজিস্ট্রেশন রিকোয়েস্ট সাবমিট করা
const submitAdvising = async (req, res) => {
  try {
    const { semester, subjects } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const studentId = req.user._id;

    if (!semester || !subjects || subjects.length === 0) {
      return res
        .status(400)
        .json({ message: 'Semester and at least one subject are required.' });
    }

    const dbSubjects = await Subject.find({
      _id: { $in: subjects },
      university: uniId,
    });
    const totalCredits = dbSubjects.reduce(
      (sum, sub) => sum + (sub.credits || 3),
      0,
    );

    const newAdvising = new Advising({
      student: studentId,
      semester: new mongoose.Types.ObjectId(semester),
      subjects: subjects.map(id => new mongoose.Types.ObjectId(id)),
      totalCredits,
      university: uniId,
    });

    await newAdvising.save();
    res.status(201).json(newAdvising);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message:
            'You have already submitted course registration for this semester!',
        });
    }
    res.status(500).json({ message: error.message });
  }
};

// ৩. অ্যাডমিন বা অ্যাডভাইজর কর্তৃক কোর্স রেজিস্ট্রেশন অনুমোদন (Approve/Reject) করা
const respondToAdvising = async (req, res) => {
  try {
    const { status } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    const advising = await Advising.findOneAndUpdate(
      { _id: req.params.id, university: uniId },
      { status },
      { new: true },
    );

    if (!advising)
      return res
        .status(404)
        .json({ message: 'Registration record not found.' });
    res.json(advising);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৪. স্টুডেন্টদের জন্য সেমিস্টার ও সাবজেক্ট লিস্ট গেট করার ডেডিকেটেড ফাংশন
const getStudentAdvisingFormData = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const [semesters, subjects] = await Promise.all([
      Semester.find({
        university: uniId,
        status: { $in: ['Active', 'Upcoming'] },
      }),
      Subject.find({ university: uniId }).select('name code credits'),
    ]);

    res.json({ semesters: semesters || [], subjects: subjects || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAdvisings,
  submitAdvising,
  respondToAdvising,
  getStudentAdvisingFormData,
};
