

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Course = require('../models/Course');
const University = require('../models/University');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateUniversityCode = async () => {
  // Loop instead of trusting a single random suffix, in case of a collision.
  for (let i = 0; i < 5; i++) {
    const candidate = crypto.randomBytes(4).toString('hex').toUpperCase();
    const exists = await University.findOne({ code: candidate });
    if (!exists) return candidate;
  }
  throw new Error(
    'Could not generate a unique university code, please try again',
  );
};



const registerUniversity = async (req, res) => {
  const { universityName, name, email, password, confirmPassword } = req.body;
  try {
    if (!universityName || !universityName.trim()) {
      return res.status(400).json({ message: 'University name is required' });
    }
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const code = await generateUniversityCode();
    const logo = req.file ? `/uploads/${req.file.filename}` : undefined;

  
    const university = await University.create({
      name: universityName.trim(),
      email: email.trim(),
      logo,
      code,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminName = name && name.trim() ? name.trim() : email.split('@')[0];

    const user = await User.create({
      name: adminName,
      email,
      password: hashedPassword,
      role: 'Admin',
      university: university._id,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: {
        _id: university._id,
        name: university.name,
        logo: university.logo,
        code: university.code,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const registerStudent = async (req, res) => {
  const { name, email, password, universityCode, enrolledCourse } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (!universityCode) {
      return res
        .status(400)
        .json({ message: 'universityCode is required to register' });
    }
    const university = await University.findOne({
      code: universityCode.trim().toUpperCase(),
    });
    if (!university) {
      return res.status(400).json({ message: 'Invalid university code' });
    }
    if (!enrolledCourse) {
      return res
        .status(400)
        .json({
          message: 'enrolledCourse is required to register as a student',
        });
    }
    const course = await Course.findOne({
      _id: enrolledCourse,
      university: university._id,
    });
    if (!course) {
      return res
        .status(400)
        .json({ message: 'Invalid enrolledCourse for this university' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Student',
      enrolledCourse,
      university: university._id,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate(
      'enrolledCourse assignedCourses university',
    );
    if (user && (await bcrypt.compare(password, user.password))) {
      const userObj = user.toObject();
      delete userObj.password;
      res.json({
        ...userObj,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'enrolledCourse assignedCourses university',
    );
    if (user) {
      const userObj = user.toObject();
      delete userObj.password;
      res.json(userObj);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUniversity,
  registerStudent,
  authUser,
  getUserProfile,
};
