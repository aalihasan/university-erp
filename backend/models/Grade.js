const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    midMarks: { type: Number, default: 0 }, // সর্বোচ্চ ৩০
    finalMarks: { type: Number, default: 0 }, // সর্বোচ্চ ৪০
    assignmentMarks: { type: Number, default: 0 }, // সর্বোচ্চ ৩০ (Attendance + Quiz + Assignment)
    totalMarks: { type: Number, default: 0 }, // সর্বমোট ১০০
    gpa: { type: Number, default: 0.0 }, // ৪.০০ স্কেলে
    letterGrade: { type: String, default: 'F' }, // A+, A, B, ইত্যাদি
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true },
);

// একই সেমিস্টারে একটি সাবজেক্টে একজন শিক্ষার্থীর একটাই গ্রেড শিট থাকবে
gradeSchema.index(
  { student: 1, semester: 1, subject: 1, university: 1 },
  { unique: true },
);

module.exports = mongoose.model('Grade', gradeSchema);
