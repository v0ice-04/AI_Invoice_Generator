const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Added
const invoiceRoutes = require('./routes/invoiceRoutes');
const settingsRoutes = require('./routes/settingsRoutes'); // Added

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// URL Cleanup Middleware (Prevention for Preflight Redirects)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/\/+/g, '/');
  }
  next();
});

app.use(cors({
  origin: [FRONTEND_URL, 'https://ai-invoice-generator-w4vi.vercel.app'], // Include production domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve uploaded logos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('AI Invoice Generator Backend is Running!');
});
app.use('/api/invoice', invoiceRoutes);
app.use('/api/settings', settingsRoutes); // Added

// Database Connection optimized for Serverless
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  try {
    const PORT = process.env.PORT || 5000;
    let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-invoice-app';

    if (process.env.DB_PASSWORD) {
      MONGO_URI = MONGO_URI.replace('<db_password>', encodeURIComponent(process.env.DB_PASSWORD));
    }

    // Disable buffering - fail fast instead of hanging
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
    cachedConnection = conn;
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// Middleware to ensure DB is connected before any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
