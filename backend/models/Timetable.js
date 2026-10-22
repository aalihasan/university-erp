const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: [
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
    },
    startTime: { type: String, required: true }, // Format: "HH:MM" (e.g., "08:30", "11:45")
    endTime: { type: String, required: true }, // Format: "HH:MM" (e.g., "10:00", "13:15")
    roomNumber: { type: String, required: true },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Timetable', timetableSchema);
