const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Spring', 'Summer', 'Fall'], // উত্তরা ইউনিভার্সিটির অফিসিয়াল ট্রাইমেস্টার কাঠামো
    },
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Active', 'Upcoming', 'Passed'],
      default: 'Upcoming',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    midTermDate: { type: Date },
    finalExamDate: { type: Date },
    maxCredits: { type: Number, default: 15 },
    paymentDeadline: { type: Date },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true },
);

// একই বছরে একই নামের সেমিস্টার ডুপ্লিকেট হওয়া আটকানোর ইনডেক্স
semesterSchema.index({ name: 1, year: 1, university: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
