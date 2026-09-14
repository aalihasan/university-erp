// One-time migration: backfills a "university" (tenant) on every existing
// document that doesn't have one yet. Run this ONCE, before deploying the
// multi-tenant code, for any customer who was already using the
// single-tenant version of the app.
//
// Usage:
//   MONGO_URI="mongodb://127.0.0.1:27017/university_management" \
//   node backend/scripts/migrate_to_multitenant.js "My Existing University Name"
//
// If you have several already-deployed customers sharing ONE database
// (unlikely, but just in case), run this separately per customer after
// manually splitting their data — this script assumes everything currently
// in the DB without a `university` field belongs to a single tenant.

const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const University = require('../models/University');
const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

const run = async () => {
  const universityName = process.argv[2];
  if (!universityName) {
    console.error('Usage: node migrate_to_multitenant.js "University Name"');
    process.exit(1);
  }

  const uri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management';
  await mongoose.connect(uri);
  console.log('Connected to', uri);

  let university = await University.findOne({ name: universityName });
  if (!university) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    university = await University.create({ name: universityName, code });
    console.log(
      `Created university "${university.name}" with join code ${university.code}`,
    );
  } else {
    console.log(
      `Using existing university "${university.name}" (${university.code})`,
    );
  }

  const models = {
    User,
    Course,
    Subject,
    StudyMaterial,
    Notice,
    Leave,
    Attendance,
  };
  for (const [modelName, Model] of Object.entries(models)) {
    const result = await Model.updateMany(
      { university: { $exists: false } },
      { $set: { university: university._id } },
    );
    console.log(`${modelName}: backfilled ${result.modifiedCount} document(s)`);
  }

  console.log(
    '\nDone. Save this join code for the customer if they need Students to',
  );
  console.log(`self-register in future: ${university.code}`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
