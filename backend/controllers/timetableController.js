const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Semester = require('../models/Semester');
const mongoose = require('mongoose');

// ১. এই ইউনিভার্সিটির সম্পূর্ণ ক্লাস রুটিন লিস্ট লোড করা
const getTimetables = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const list = await Timetable.find({ university: uniId })
      .populate('semester', 'name year')
      .populate('course', 'name')
      .populate('subject', 'name')
      .populate('professor', 'name');
    res.json(list || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. ফর্মের ড্রপডাউনগুলোর জন্য প্রয়োজনীয় সব সোর্স ডাটা একবারে গেট করা
const getTimetableFormData = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const [semesters, courses, subjects, professors] = await Promise.all([
      Semester.find({ university: uniId }),
      Course.find({ university: uniId }),
      Subject.find({ university: uniId }),
      User.find({ role: 'Professor', university: uniId }).select('name'),
    ]);
    res.json({
      semesters: semesters || [],
      courses: courses || [],
      subjects: subjects || [],
      professors: professors || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. নতুন ক্লাস শিডিউল তৈরি করা (কনф্লিক্ট ও ওভারল্যাপ চেকার - ব্যাকস্ল্যাশ সম্পূর্ণ মুক্ত)
const createTimetable = async (req, res) => {
  try {
    const {
      semester,
      course,
      subject,
      professor,
      day,
      startTime,
      endTime,
      roomNumber,
    } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    // সমাধান: কুয়েরির ভেতর থেকে অবৈধ ব্যাকস্ল্যাশ রিমুভ করে পিওর মঙ্গোডিবি সিনট্যাক্স লক করা হলো
    const roomConflict = await Timetable.findOne({
      university: uniId,
      semester,
      day,
      roomNumber,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
        { startTime: { $lte: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (roomConflict) {
      return res
        .status(400)
        .json({
          message: `Conflict! Room ${roomNumber} is already booked from ${roomConflict.startTime} to ${roomConflict.endTime} on this day.`,
        });
    }

    const professorConflict = await Timetable.findOne({
      university: uniId,
      semester,
      day,
      professor,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
        { startTime: { $lte: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (professorConflict) {
      return res
        .status(400)
        .json({
          message: `Conflict! This Professor is already busy teaching another class from ${professorConflict.startTime} to ${professorConflict.endTime} on this day.`,
        });
    }

    const newSchedule = new Timetable({
      semester: new mongoose.Types.ObjectId(semester),
      course: new mongoose.Types.ObjectId(course),
      subject: new mongoose.Types.ObjectId(subject),
      professor: new mongoose.Types.ObjectId(professor),
      day,
      startTime,
      endTime,
      roomNumber,
      university: uniId,
    });

    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৪. ক্লাস শিডিউল ডিলিট করা
const deleteTimetable = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const deleted = await Timetable.findOneAndDelete({
      _id: req.params.id,
      university: uniId,
    });
    if (!deleted)
      return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Class schedule removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৫. প্রফেসরের নিজস্ব রুটিন দেখার ফাংশন
const getProfessorTimetable = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const mySchedule = await Timetable.find({
      professor: req.user._id,
      university: uniId,
    })
      .populate('semester', 'name year')
      .populate('course', 'name')
      .populate('subject', 'name')
      .populate('professor', 'name');
    res.json(mySchedule || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTimetables,
  getTimetableFormData,
  createTimetable,
  deleteTimetable,
  getProfessorTimetable,
};
