const Fee = require('../models/Fee');
const User = require('../models/User');
const Semester = require('../models/Semester');
const mongoose = require('mongoose');

// সব ফি ইনভয়েস গেট করা (Admin View)
const getAllFees = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    // ডাটাবেজ ফাঁকা থাকলেও যেন ক্র্যাশ না করে, সেজন্য সেফ কোয়েরি লজিক
    const fees = await Fee.find({ university: uniId })
      .populate('student', 'name email enrollmentId')
      .populate('semester', 'name year')
      .sort({ createdAt: -1 });

    res.json(fees || []);
  } catch (error) {
    console.error('Get All Fees Backend Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ড্রপডাউনের জন্য সরাসরি সব স্টুডেন্ট এবং সেমিস্টার একসাথে গেট করার ফাংশন
const getFeeFormData = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const [students, semesters] = await Promise.all([
      User.find({ role: 'Student', university: uniId }).select(
        'name email enrollmentId',
      ),
      Semester.find({ university: uniId }).sort({ year: -1 }),
    ]);

    res.json({
      students: students || [],
      semesters: semesters || [],
    });
  } catch (error) {
    console.error('Get Fee Form Data Backend Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// নতুন ফি ইনভয়েস তৈরি করা
const createFee = async (req, res) => {
  try {
    const { student, semester, title, amount, dueDate } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    if (!student || !semester || !title || !amount || !dueDate) {
      return res
        .status(400)
        .json({ message: 'All fields are strictly required' });
    }

    const fee = new Fee({
      student: new mongoose.Types.ObjectId(student),
      semester: new mongoose.Types.ObjectId(semester),
      title: title.trim(),
      amount: Number(amount),
      dueDate: new Date(dueDate),
      university: uniId,
    });

    await fee.save();
    res.status(201).json(fee);
  } catch (error) {
    console.error('Create Fee Backend Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// পেমেন্ট কালেক্ট বা আপডেট করা
const collectPayment = async (req, res) => {
  try {
    const { amountPaid } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const fee = await Fee.findOne({ _id: req.params.id, university: uniId });
    if (!fee) return res.status(404).json({ message: 'Invoice not found' });

    fee.paidAmount += Number(amountPaid);
    if (fee.paidAmount >= fee.amount) {
      fee.status = 'Paid';
    } else if (fee.paidAmount > 0) {
      fee.status = 'Partial';
    }

    await fee.save();
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFees,
  getFeeFormData,
  createFee,
  collectPayment,
};
