

const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    description: { type: String },
    duration: { type: String },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true },
);

// Course names only need to be unique within a single university, not
// globally across every customer.
courseSchema.index({ name: 1, university: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
