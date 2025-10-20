require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authController = require('./controllers/authController');
const playlistController = require('./controllers/playlistController');
const tokenController = require('./controllers/tokenController');
const playbackController = require('./controllers/playbackController');
const setupSocketHandlers = require('./controllers/socketController');
const gameManager = require('./services/gameManager'); // New import

const app = express();
const server = http.createServer(app);
// Configure CORS origins for development and production
const developmentOrigins = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://172.23.144.1:3000',
  'https://guessthetune.pages.dev'
];

// In production, CLIENT_URL should be set to your Cloudflare Pages URL
// Example: https://guessthetune.pages.dev
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL].filter(Boolean)
  : [...developmentOrigins, process.env.CLIENT_URL].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authController);
app.use('/api', playlistController);
app.use('/api', tokenController);
app.use('/api', playbackController);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GuessTheTune server is running' });
});

// Endpoint to get a list of active rooms
app.get('/api/rooms', (req, res) => {
  try {
    const roomsInfo = gameManager.getAllRoomsInfo();
    res.json({ rooms: roomsInfo });
  } catch (error) {
    console.error('Error fetching rooms info:', error);
    res.status(500).json({ error: 'Failed to fetch rooms information' });
  }
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🎵 GuessTheTune server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});
