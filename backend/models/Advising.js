const mongoose = require('mongoose');

const advisingSchema = new mongoose.Schema(
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
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    totalCredits: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true },
);

// একই সেমিস্টারে একজন স্টুডেন্ট যেন একাধিকবার রেজিস্ট্রেশন রিকোয়েস্ট পাঠাতে না পারে
advisingSchema.index(
  { student: 1, semester: 1, university: 1 },
  { unique: true },
);

module.exports = mongoose.model('Advising', advisingSchema);
