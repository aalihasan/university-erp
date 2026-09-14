// const mongoose = require('mongoose');

// const universitySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     logo: {
//       type: String,
//       default: '',
//     },

//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// module.exports = mongoose.model('University', universitySchema);


const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: '',
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('University', universitySchema);
