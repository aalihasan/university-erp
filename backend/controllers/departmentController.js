const Department = require('../models/Department');
const mongoose = require('mongoose');

// উত্তরা ইউনিভার্সিটির ডিপার্টমেন্ট ডাটা সিড (Seed) করার ফাংশন
const seedUttaraUniversityDepartments = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const uttaraDepartments = [
      // ১. স্কুল অব সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং
      {
        facultyName: 'School of Science & Engineering',
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of CSE',
        university: uniId,
      },
      {
        facultyName: 'School of Science & Engineering',
        name: 'Electrical & Electronic Engineering',
        code: 'EEE',
        description: 'Department of EEE',
        university: uniId,
      },
      {
        facultyName: 'School of Science & Engineering',
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Department of Civil Engineering',
        university: uniId,
      },
      {
        facultyName: 'School of Science & Engineering',
        name: 'Mathematics',
        code: 'MATH',
        description: 'Department of Mathematics',
        university: uniId,
      },
      {
        facultyName: 'School of Science & Engineering',
        name: 'Physics',
        code: 'PHY',
        description: 'Department of Physics',
        university: uniId,
      },

      // ২. স্কুল অব বিজনেস
      {
        facultyName: 'School of Business',
        name: 'Bachelor of Business Administration',
        code: 'BBA',
        description: 'Department of Business Administration',
        university: uniId,
      },
      {
        facultyName: 'School of Business',
        name: 'Master of Business Administration',
        code: 'MBA',
        description: 'Postgraduate Business Programs',
        university: uniId,
      },

      // ৩. স্কুল অব আর্টস অ্যান্ড সোশ্যাল সায়েন্সেস
      {
        facultyName: 'School of Arts & Social Sciences',
        name: 'English',
        code: 'ENG',
        description: 'Department of English',
        university: uniId,
      },
      {
        facultyName: 'School of Arts & Social Sciences',
        name: 'Law',
        code: 'LAW',
        description: 'Department of Law',
        university: uniId,
      },
      {
        facultyName: 'School of Arts & Social Sciences',
        name: 'Economics',
        code: 'ECO',
        description: 'Department of Economics',
        university: uniId,
      },
      {
        facultyName: 'School of Arts & Social Sciences',
        name: 'Bangla',
        code: 'BNG',
        description: 'Department of Bangla',
        university: uniId,
      },
      {
        facultyName: 'School of Arts & Social Sciences',
        name: 'Islamic Studies',
        code: 'IS',
        description: 'Department of Islamic Studies',
        university: uniId,
      },

      // ৪. স্কুল অব এডুকেশন অ্যান্ড ফিজিক্যাল এডুকেশন
      {
        facultyName: 'School of Education & Physical Education',
        name: 'Education',
        code: 'EDU',
        description: 'Department of Education',
        university: uniId,
      },
      {
        facultyName: 'School of Education & Physical Education',
        name: 'Physical Education',
        code: 'PE',
        description: 'Department of Physical Education and Sports Science',
        university: uniId,
      },
    ];

    // ডুপ্লিকেট এন্ট্রি এড়াতে 기존 ডাটা চেক করে ইনসার্ট করা
    let addedCount = 0;
    for (const dept of uttaraDepartments) {
      const exists = await Department.findOne({
        code: dept.code,
        university: uniId,
      });
      if (!exists) {
        await Department.create(dept);
        addedCount++;
      }
    }

    res
      .status(201)
      .json({
        message: `${addedCount} Uttara University departments seeded successfully.`,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// নির্দিষ্ট ডিপার্টমেন্টের লিস্ট লোড করা
const getDepartments = async (req, res) => {
  try {
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );
    const departments = await Department.find({ university: uniId }).populate(
      'headOfDepartment',
      'name email',
    );
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ম্যানুয়ালি নতুন কোনো সাব-ডিপার্টমেন্ট যোগ করা
const createDepartment = async (req, res) => {
  try {
    const { facultyName, name, code, description, headOfDepartment } = req.body;
    const uniId = new mongoose.Types.ObjectId(
      req.user.university?._id || req.user.university,
    );

    const department = new Department({
      facultyName,
      name,
      code: code.trim().toUpperCase(),
      description,
      headOfDepartment: headOfDepartment
        ? new mongoose.Types.ObjectId(headOfDepartment)
        : undefined,
      university: uniId,
    });

    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  seedUttaraUniversityDepartments,
  getDepartments,
  createDepartment,
};
