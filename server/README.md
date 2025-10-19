# GuessTheTune Server

Node.js backend server for the GuessTheTune real-time music trivia game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```
PORT=8080
CLIENT_URL=http://127.0.0.1:3000

SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/auth/callback

SESSION_SECRET=your_random_session_secret_here
```

3. Get Spotify API credentials:
   - Go to https://developer.spotify.com/dashboard
   - Create a new app
   - Copy your Client ID and Client Secret
   - Add `http://127.0.0.1:8080/auth/callback` to Redirect URIs (Spotify requires 127.0.0.1)

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:8080`.

## Project Structure

```
server/
├── controllers/     # Route handlers and Socket.io logic
├── services/        # Business logic (Spotify API, game manager)
├── middleware/      # Custom middleware (auth verification)
└── utils/           # Helper functions
```

## API Endpoints

### Authentication
- `GET /auth/login` - Initiates Spotify OAuth flow
- `GET /auth/callback` - Handles Spotify OAuth callback
- `POST /auth/refresh` - Refreshes access token
- `POST /auth/logout` - Clears authentication

### Health Check
- `GET /health` - Server health check

## Socket.io Events

### Client → Server
- `createRoom` - Create a new game room (host only)
- `joinRoom` - Join an existing room
- `startGame` - Start the game (host only)
- `buzzIn` - Player buzzes in to guess
- `submitJudgment` - Judge submits decision
- `nextSong` - Move to next song (host only)

### Server → Client
- `roomCreated` - Room successfully created
- `playerJoined` - Player joined the room
- `playerLeft` - Player left the room
- `gameStarted` - Game has started
- `playerIsGuessing` - A player is currently guessing
- `roundOver` - Round completed
- `gameOver` - Game finished, winner declared
- `guessTimeExpired` - Guess timer expired
- `error` - Error occurred

## Tech Stack

- Node.js
- Express
- Socket.io
- Axios
- Spotify Web API
