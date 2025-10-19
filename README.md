# GuessTheTune 🎵

A real-time, social music trivia game that brings friends together through the power of their shared favorite songs. Built with React, Node.js, Socket.io, and the Spotify API.

![GuessTheTune](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node](https://img.shields.io/badge/Node-Express-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6.0-black)

## ✨ Features

- 🎤 **Host a Game**: Use your own Spotify playlists
- 🎮 **Multiplayer**: Real-time gameplay with friends
- ⚡ **Fast-Paced**: "Fastest-finger-first" buzz-in mechanic
- 👥 **Social**: Rotating judge system for fair play
- 🏆 **Competitive**: First to 10 points wins
- 🎨 **Modern UI**: Sleek dark-mode design with smooth animations
- 📱 **Responsive**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify Premium account (for hosts only)
- Spotify Developer Account ([Get one here](https://developer.spotify.com/dashboard))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/GuessTheTune.git
cd GuessTheTune
```

2. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://127.0.0.1:8080/auth/callback` to Redirect URIs (Spotify requires 127.0.0.1, not localhost)
   - Copy your Client ID and Client Secret

3. **Configure Server**
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your Spotify credentials:
```env
PORT=8080
CLIENT_URL=http://127.0.0.1:3000

SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/auth/callback

SESSION_SECRET=your_random_secret_here
```

4. **Configure Client**
```bash
cd ../client
npm install
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_SERVER_URL=http://127.0.0.1:8080
```

5. **Start the Application**

Open two terminal windows:

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm start
```

The app will open at `http://127.0.0.1:3000` (or `http://localhost:3000` in your browser - both work for accessing the app)

## 🎮 How to Play

1. **Host Creates a Game**
   - Click "Host a Game"
   - Login with Spotify (Premium account required)
   - Select a playlist
   - Share the 4-letter room code with friends

2. **Players Join**
   - Click "Join a Game"
   - Enter display name and room code
   - Wait for the host to start

3. **Gameplay**
   - Host plays songs from their playlist (only they hear the music)
   - Players buzz in by clicking "I Know It!" when they recognize the song
   - First player to buzz in has 30 seconds to guess
   - A rotating judge decides if the guess is correct
   - Correct guesses earn 1 point

4. **Winning**
   - First player to reach 10 points wins!

## 🏗️ Project Structure

```
GuessTheTune/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page-level components
│       ├── context/       # React Context for state
│       ├── hooks/         # Custom React hooks
│       ├── utils/         # Utility functions
│       └── App.js
├── server/                # Node.js Backend
│   ├── controllers/       # Route handlers & Socket.io logic
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   └── index.js
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Socket.io Client
- Framer Motion (animations)
- Tailwind CSS
- Axios
- Spotify Web Playback SDK

### Backend
- Node.js
- Express
- Socket.io
- Spotify Web API
- Axios
- Cookie Parser

## 🎨 Design System

**Color Palette:**
- Primary Background: `#121212`
- Secondary Background: `#1E1E1E`
- Primary Accent: `#1DB954` (Spotify Green)
- Primary Text: `#FFFFFF`
- Secondary Text: `#B3B3B3`

**Typography:**
- Font Family: Inter

## 📝 API Documentation

### Authentication Endpoints
- `GET /auth/login` - Initiates Spotify OAuth
- `GET /auth/callback` - OAuth callback handler
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Clear auth cookies

### Playlist Endpoints
- `GET /api/playlists` - Get user's playlists
- `GET /api/playlist-tracks/:id` - Get playlist tracks

### Socket.io Events

**Client → Server:**
- `createRoom` - Create game room
- `joinRoom` - Join existing room
- `startGame` - Start the game
- `buzzIn` - Player buzzes in
- `submitJudgment` - Judge's decision
- `nextSong` - Move to next song

**Server → Client:**
- `roomCreated` - Room created successfully
- `playerJoined` - Player joined room
- `playerLeft` - Player left room
- `gameStarted` - Game started
- `playerIsGuessing` - Someone is guessing
- `roundOver` - Round completed
- `gameOver` - Game finished
- `guessTimeExpired` - Time ran out

## 🔒 Security Features

- HttpOnly cookies for token storage
- CORS protection
- Environment variable configuration
- Secure Spotify OAuth 2.0 flow
- Client secret never exposed to frontend

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Heroku/Railway/Render)
```bash
cd server
npm start
```

Update environment variables in your hosting platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Spotify for their amazing API and Web Playback SDK
- The React and Node.js communities
- All contributors and players

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ and 🎵 by the GuessTheTune team
