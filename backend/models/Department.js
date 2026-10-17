// const mongoose = require('mongoose');

// const departmentSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, unique: true }, // e.g., "Computer Science & Engineering"
//     code: { type: String, required: true, unique: true }, // e.g., "CSE"
//     batches: [{ type: String }], // e.g., ["Batch 44", "Batch 45"]
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model('Department', departmentSchema);


const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    // মূল অনুষদ বা ফ্যাকাল্টি (যেমন: School of Science & Engineering)
    facultyName: { 
      type: String, 
      required: true,
      enum: [
        'School of Science & Engineering',
        'School of Business',
        'School of Arts & Social Sciences',
        'School of Education & Physical Education'
      ]
    },
    // মূল ডিপার্টমেন্টের নাম (Sub-Department / Program, যেমন: CSE)
    name: { type: String, required: true }, 
    code: { type: String, required: true }, // যেমন: CSE, EEE, BBA
    description: { type: String },
    
    // এই ডিপার্টমেন্টের প্রধান বা ফ্যাকাল্টি মেম্বারদের অ্যাসাইন করার জন্য রেফারেন্স
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // প্রফেসর বা অ্যাডমিন ইউজার
    },
    
    // মাল্টি-টেন্যান্ট বাউন্ডারি
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true
    }
  },
  { timestamps: true }
);

// একই ইউনিভার্সিটির অধীনে একই ডিপার্টমেন্ট কোড ইউনিক রাখার ইনডেক্স
departmentSchema.index({ code: 1, university: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
