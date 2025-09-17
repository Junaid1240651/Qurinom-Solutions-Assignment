import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Set timeout for all requests (25 seconds to stay under Vercel's 30s limit)
app.use((req, res, next) => {
  req.setTimeout(25000, () => {
    res.status(408).json({
      success: false,
      message: 'Request timeout'
    });
  });
  next();
});

// Middleware
app.use(cors({
  origin: ['https://qurinom-solutions-assignment.vercel.app','http://localhost:3001'],
  credentials: true,
}));
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware handles preflight requests automatically
// No need for manual OPTIONS handler

// Routes
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import userRoutes from './routes/users.js';

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB with timeout handling
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log('MongoDB connected');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log('MongoDB connection error:', err);
    process.exit(1); // Exit if can't connect to database
  }
}

// Start the server only after MongoDB connection is established
startServer();

export default app;
