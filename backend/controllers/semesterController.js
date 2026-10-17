const Semester = require('../models/Semester');
const mongoose = require('mongoose');

// সব সেমিস্টার লিস্ট গেট করা
const getSemesters = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const semesters = await Semester.find({ university: uniId }).sort({
      year: -1,
      createdAt: -1,
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// নতুন সেমিস্টার তৈরি করা
const createSemester = async (req, res) => {
  try {
    const {
      name,
      year,
      status,
      startDate,
      endDate,
      midTermDate,
      finalExamDate,
      maxCredits,
      paymentDeadline,
    } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    if (status === 'Active') {
      await Semester.updateMany(
        { university: uniId, status: 'Active' },
        { status: 'Passed' },
      );
    }

    const semester = new Semester({
      name,
      year: parseInt(year),
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      midTermDate: midTermDate ? new Date(midTermDate) : null,
      finalExamDate: finalExamDate ? new Date(finalExamDate) : null,
      maxCredits: parseInt(maxCredits) || 15,
      paymentDeadline: paymentDeadline ? new Date(paymentDeadline) : null,
      university: uniId,
    });

    await semester.save();
    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// সেমিস্টারের স্ট্যাটাস পরিবর্তন করা (Toggle Active)
const updateSemesterStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    if (status === 'Active') {
      await Semester.updateMany(
        { university: uniId, status: 'Active' },
        { status: 'Passed' },
      );
    }

    const semester = await Semester.findOneAndUpdate(
      { _id: req.params.id, university: uniId },
      { status },
      { new: true },
    );

    if (!semester)
      return res.status(404).json({ message: 'Semester not found' });
    res.json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// সেমিস্টার এডিট বা আপডেট করার ফাংশন
const updateSemester = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const {
      name,
      year,
      status,
      startDate,
      endDate,
      midTermDate,
      finalExamDate,
      maxCredits,
      paymentDeadline,
    } = req.body;

    if (status === 'Active') {
      await Semester.updateMany(
        { university: uniId, _id: { $ne: req.params.id }, status: 'Active' },
        { status: 'Passed' },
      );
    }

    const updatedSemester = await Semester.findOneAndUpdate(
      { _id: req.params.id, university: uniId },
      {
        name,
        year: parseInt(year),
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        midTermDate: midTermDate ? new Date(midTermDate) : null,
        finalExamDate: finalExamDate ? new Date(finalExamDate) : null,
        maxCredits: parseInt(maxCredits) || 15,
        paymentDeadline: paymentDeadline ? new Date(paymentDeadline) : null,
      },
      { new: true },
    );

    if (!updatedSemester)
      return res.status(404).json({ message: 'Semester not found' });
    res.json(updatedSemester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// সেমিস্টার ডিলিট করার ফাংশন
const deleteSemester = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const semester = await Semester.findOneAndDelete({
      _id: req.params.id,
      university: uniId,
    });
    if (!semester)
      return res.status(404).json({ message: 'Semester not found' });
    res.json({ message: 'Semester session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSemesters,
  createSemester,
  updateSemesterStatus,
  updateSemester,
  deleteSemester,
};
