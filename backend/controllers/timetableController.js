const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Semester = require('../models/Semester');
const mongoose = require('mongoose');

// ১. এই ইউনিভার্সিটির সম্পূর্ণ ক্লাস রুটিন লিস্ট লোড করা
const getTimetables = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(req.user.university?._id || req.user.university);
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

// ২. ফর্মের ড্রপডাউনগুলোর জন্য ডাটা গেট করা
const getTimetableFormData = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(req.user.university?._id || req.user.university);
    const [semesters, courses, subjects, professors] = await Promise.all([
      Semester.find({ university: uniId }),
      Course.find({ university: uniId }),
      Subject.find({ university: uniId }),
      User.find({ role: 'Professor', university: uniId }).select('name')
    ]);
    res.json({ semesters, courses, subjects, professors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. স্মার্ট রুটিন জেনারেটর এবং ওভারল্যাপ প্রটেকশন লজিক
const createTimetable = async (req, res) => {
  try {
    const { semester, course, subject, professor, day, startTime, endTime, roomNumber } = req.body;
    const uniId = new mongoose.Types.ObjectId(req.user.university?._id || req.user.university);

    // [অ্যালগরিদম চেক ১]: রুমে কোনো টাইম ওভারল্যাপ আছে কি না
    const roomConflict = await Timetable.findOne({
      university: uniId,
      day,
      roomNumber,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });
    if (roomConflict) {
       return res.status(400).json({ message: `Smart Shield: Room ${roomNumber} is already booked from ${roomConflict.startTime} to ${roomConflict.endTime}.` });
    }

    // [অ্যালগরিদম চেক ২]: প্রফেসরের সিডিউলে কোনো ওভারল্যাপ আছে কি না
    const profConflict = await Timetable.findOne({
      university: uniId,
      day,
      professor,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });
    if (profConflict) {
       return res.status(400).json({ message: `Smart Shield: Professor already has a class from ${profConflict.startTime} to ${profConflict.endTime}.` });
    }

    // [অ্যালগরিদম চেক ৩]: একই কোর্সের/ব্যাচের অন্য ক্লাস এই স্লটে আছে কি না
    const courseConflict = await Timetable.findOne({
      university: uniId,
      semester,
      day,
      course,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });
    if (courseConflict) {
       return res.status(400).json({ message: `Smart Shield: This Batch/Course already has another class scheduled in this timeslot.` });
    }

    // কোনো কনফ্লিক্ট না থাকলে সাকসেসফুলি সেভ হবে
    const newSchedule = new Timetable({
      semester: new mongoose.Types.ObjectId(semester),
      course: new mongoose.Types.ObjectId(course),
      subject: new mongoose.Types.ObjectId(subject),
      professor: new mongoose.Types.ObjectId(professor),
      day, startTime, endTime, roomNumber, university: uniId
    });

    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৪. রুটিন ডিলিট করা
const deleteTimetable = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(req.user.university?._id || req.user.university);
    const deleted = await Timetable.findOneAndDelete({ _id: req.params.id, university: uniId });
    if (!deleted) return res.status(404).json({ message: 'Schedule record not found' });
    res.json({ message: 'Class slot removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// প্রফেসরদের জন্য তাদের নিজস্ব ক্লাস রুটিন দেখার ডেডিকেটেড ফাংশন
const getProfessorTimetable = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(req.user.university?._id || req.user.university);
    const professorId = req.user._id; // লগইন থাকা প্রফেসরের নিজস্ব আইডি সেশন থেকে নেওয়া হলো

    // ডাটাবেজ থেকে সরাসরি এই প্রফেসরের এবং এই ইউনিভার্সিটির ক্লাসগুলো ফিল্টার করে আনা হচ্ছে
    const mySchedule = await Timetable.find({ professor: professorId, university: uniId })
      .populate('semester', 'name year')
      .populate('course', 'name')
      .populate('subject', 'name')
      .populate('professor', 'name');

    res.json(mySchedule || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// module.exports এর ভেতর getProfessorTimetable নামটি যুক্ত করুন, যেমন:
module.exports = { 
  getTimetables, 
  getTimetableFormData, 
  createTimetable, 
  deleteTimetable,
  getProfessorTimetable // ➕ এই নামটি এখানে যোগ করুন
};

