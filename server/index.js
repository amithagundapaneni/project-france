const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://project-france-a4iz.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/checklist', require('./routes/checklist'));
app.use('/api/packing', require('./routes/packing'));
app.use('/api/shopping', require('./routes/shopping'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/french', require('./routes/french'));
app.use('/api/bucketlist', require('./routes/bucketlist'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/notes', require('./routes/notes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Project France API running 🗼' });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/project-france';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🗼 Project France server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
