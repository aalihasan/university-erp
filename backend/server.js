const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
const app = express();

// 🌟 সমাধান: ভার্সেল এবং রেন্ডার ক্লাউডের মধ্যে ডাটা আদান-প্রদান নিশ্চিত করতে CORS সম্পূর্ণ ওপেন করা হলো
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// বেস রুট চেকার
app.get('/', (req, res) => {
  res.send('University Management System API is running');
});

// অ্যাডমিন ও ইআরপি রাউট মাউন্টিং
app.use('/api/admin', adminRoutes);

// ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
