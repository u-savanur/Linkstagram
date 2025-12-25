const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const profileRoutes = require('./routes/profiles');
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Large limit for HTML bodies

// Database Sync
sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
}).catch(err => {
    console.error('Database sync error:', err);
});

// Routes
app.use('/api', profileRoutes);

// Health Check
app.get('/health', (req, res) => res.send('OK'));

// Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Linkstagram Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      scrape: 'POST /api/scrape-profile'
    }
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
