
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true },
);

// একই ইউনিভার্সিটির আন্ডারে একই কোর্সে সাবজেক্টের নাম ইউনিক করার জন্য ইনডেক্স
subjectSchema.index({ name: 1, course: 1, university: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
