const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    env: {
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
      firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set'
    }
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
