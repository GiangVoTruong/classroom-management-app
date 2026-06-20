require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const instructorRoutes = require('./routes/instructor');
const studentRoutes = require('./routes/student');

function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api', (_req, res) => res.json({ message: 'Express API is running' }));
  app.get('/', (_req, res) => res.json({ message: 'Express API is running' }));

  app.use('/', authRoutes);
  app.use('/', instructorRoutes);
  app.use('/student', studentRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
