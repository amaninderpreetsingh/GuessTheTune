require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authController = require('./controllers/authController');
const playlistController = require('./controllers/playlistController');
const tokenController = require('./controllers/tokenController');
const setupSocketHandlers = require('./controllers/socketController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow multiple origins for development
      const allowedOrigins = [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://172.23.144.1:3000',
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// Middleware
// Allow multiple origins for development (localhost, 127.0.0.1, and network IPs)
const allowedOrigins = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://172.23.144.1:3000', // Your network IP
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GuessTheTune server is running' });
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
