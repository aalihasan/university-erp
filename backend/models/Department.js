const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "Computer Science & Engineering"
    code: { type: String, required: true, unique: true }, // e.g., "CSE"
    batches: [{ type: String }], // e.g., ["Batch 44", "Batch 45"]
  },
  { timestamps: true },
);

module.exports = mongoose.model('Department', departmentSchema);
