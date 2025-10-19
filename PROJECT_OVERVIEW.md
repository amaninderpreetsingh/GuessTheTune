# GuessTheTune - Complete Project Overview

## 📁 Complete File Structure

```
GuessTheTune/
│
├── 📄 README.md                    # Main project documentation
├── 📄 SETUP_GUIDE.md               # Step-by-step setup instructions
├── 📄 NEXT_STEPS.md                # What to do next
├── 📄 PROJECT_OVERVIEW.md          # This file
├── 📄 package.json                 # Root package.json with helper scripts
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 client/                      # React Frontend (Port 3000)
│   ├── 📁 public/
│   │   └── index.html              # HTML template with Spotify SDK script
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI Components
│   │   │   ├── BuzzButton.js       # Large animated buzz-in button
│   │   │   ├── GameplayView.js     # Main gameplay interface
│   │   │   ├── JoinGameModal.js    # Modal for joining games
│   │   │   ├── JudgeControls.js    # Correct/Incorrect buttons for judge
│   │   │   ├── PlayerList.js       # Real-time player list with scores
│   │   │   ├── PlaylistSelector.js # Spotify playlist selection UI
│   │   │   └── WinnerModal.js      # Game over screen with leaderboard
│   │   │
│   │   ├── 📁 pages/               # Page-level Components
│   │   │   ├── HomePage.js         # Landing page (Host/Join options)
│   │   │   ├── LobbyPage.js        # Pre-game lobby with room code
│   │   │   └── GameRoomPage.js     # Main game room page
│   │   │
│   │   ├── 📁 context/             # React Context for State Management
│   │   │   └── GameContext.js      # Global game state & Socket.io connection
│   │   │
│   │   ├── 📁 hooks/               # Custom React Hooks
│   │   │   └── useSpotifyPlayer.js # Spotify Web Playback SDK integration
│   │   │
│   │   ├── 📁 utils/               # Utility Functions & Constants
│   │   │   └── constants.js        # Game config, socket events, states
│   │   │
│   │   ├── App.js                  # Main app component with routing
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles with Tailwind
│   │
│   ├── .env                        # Client environment variables
│   ├── .env.example                # Template for environment variables
│   ├── .gitignore                  # Client-specific git ignore
│   ├── package.json                # Client dependencies
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── README.md                   # Client documentation
│
└── 📁 server/                      # Node.js Backend (Port 8080)
    ├── 📁 controllers/             # Route Handlers & Socket Logic
    │   ├── authController.js       # Spotify OAuth endpoints
    │   ├── playlistController.js   # Playlist & track endpoints
    │   └── socketController.js     # Socket.io event handlers
    │
    ├── 📁 services/                # Business Logic
    │   ├── gameManager.js          # In-memory game state management
    │   └── spotifyService.js       # Spotify API integration
    │
    ├── 📁 middleware/              # Custom Middleware
    │   └── authMiddleware.js       # Authentication verification
    │
    ├── index.js                    # Server entry point
    ├── .env                        # Server environment variables
    ├── .env.example                # Template for environment variables
    ├── .gitignore                  # Server-specific git ignore
    ├── package.json                # Server dependencies
    └── README.md                   # Server documentation
```

## 🎯 Component Responsibilities

### Client Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **HomePage** | Landing page | Host/Join buttons, feature showcase, how to play |
| **LobbyPage** | Pre-game waiting room | Room code display, player list, start button |
| **GameRoomPage** | Main game container | Playlist selection, gameplay view, player sidebar |
| **PlaylistSelector** | Spotify playlist UI | Fetch & display playlists, select tracks |
| **GameplayView** | Core gameplay | Buzz-in logic, guessing, judging, score updates |
| **BuzzButton** | Interactive button | Large animated button, pulse effects |
| **JudgeControls** | Judge interface | Correct/Incorrect buttons |
| **PlayerList** | Player sidebar | Real-time updates, scores, host indicator |
| **WinnerModal** | Victory screen | Winner announcement, final leaderboard |
| **JoinGameModal** | Join flow | Display name & room code inputs |

### Server Modules

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **authController** | Spotify OAuth | Login, callback, refresh, logout endpoints |
| **playlistController** | Playlist API | Fetch user playlists and tracks |
| **socketController** | Real-time events | Room creation, joining, gameplay events |
| **gameManager** | Game state | In-memory room management, scoring, judging |
| **spotifyService** | Spotify integration | Token exchange, API calls |
| **authMiddleware** | Security | Token verification for protected endpoints |

## 🔄 Data Flow

### Authentication Flow (Host Only)
```
1. User clicks "Host a Game"
2. Redirected to Spotify login
3. Spotify redirects back with auth code
4. Server exchanges code for tokens
5. Tokens stored in httpOnly cookie
6. User redirected to lobby
```

### Room Creation Flow
```
1. Host enters display name
2. Socket emits "createRoom" event
3. Server generates 4-letter code
4. Server creates room in gameManager
5. Host receives room code
6. Other players can join with code
```

### Gameplay Flow
```
1. Host selects playlist
2. Host clicks "Start Game"
3. Spotify SDK starts playing music (host only)
4. Player clicks "I Know It!" (buzzIn event)
5. Server locks buzzer, starts 30s timer
6. Judge decides (submitJudgment event)
7. Server updates scores
8. Check for winner (10 points)
9. Emit roundOver or gameOver event
```

## 🎨 Design Principles Applied

### Code Organization
- ✅ **Single Responsibility:** Each file/function does one thing
- ✅ **DRY (Don't Repeat Yourself):** Reusable components and utilities
- ✅ **Clear Naming:** Descriptive variable and function names
- ✅ **Separation of Concerns:** UI, logic, and data are separated

### React Best Practices
- ✅ **Functional Components:** Modern hooks-based approach
- ✅ **Custom Hooks:** Reusable logic (useSpotifyPlayer)
- ✅ **Context API:** Centralized state management
- ✅ **Prop Drilling Avoided:** Context for global state
- ✅ **Loading States:** Spinners and skeleton screens
- ✅ **Error Boundaries:** Graceful error handling

### Node.js Best Practices
- ✅ **MVC Pattern:** Controllers, Services, Middleware
- ✅ **Environment Variables:** Secure configuration
- ✅ **Error Handling:** Try-catch blocks and error responses
- ✅ **Async/Await:** Modern promise handling
- ✅ **Modular Code:** Small, focused modules

### UI/UX Best Practices
- ✅ **Responsive Design:** Mobile and desktop support
- ✅ **Smooth Animations:** Framer Motion throughout
- ✅ **Loading States:** Clear feedback for async operations
- ✅ **Error Messages:** User-friendly error display
- ✅ **Accessibility:** Semantic HTML and ARIA labels
- ✅ **Consistent Design:** Unified color palette and typography

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| **Secure Tokens** | HttpOnly cookies, never exposed to client JS |
| **CORS Protection** | Configured for specific origin only |
| **Environment Secrets** | Client secret never sent to frontend |
| **OAuth 2.0** | Industry-standard authentication flow |
| **Input Validation** | Server-side validation of all inputs |

## 🚀 Performance Optimizations

- **Code Splitting:** React Router lazy loading ready
- **Optimized Re-renders:** Proper React memoization
- **Efficient Socket Events:** Room-based broadcasting
- **Small Bundle:** Only necessary dependencies
- **Tailwind CSS:** Purged unused styles in production
- **Framer Motion:** GPU-accelerated animations

## 📊 State Management

### Client State (React Context)
```javascript
{
  socket: Socket.io instance,
  isHost: boolean,
  displayName: string,
  roomCode: string,
  players: Array,
  gameState: string,
  currentScore: Object,
  isConnected: boolean
}
```

### Server State (In-Memory)
```javascript
{
  [roomCode]: {
    id: string,
    hostSocketId: string,
    players: Array,
    gameState: string,
    playlist: Array,
    currentTrackIndex: number,
    currentGuesser: string,
    currentJudgeIndex: number,
    createdAt: timestamp
  }
}
```

## 🔌 Socket.io Events

### Client → Server
- `createRoom` - Create new game room
- `joinRoom` - Join existing room
- `startGame` - Begin gameplay
- `buzzIn` - Player buzzes in to guess
- `submitJudgment` - Judge's decision
- `nextSong` - Move to next track

### Server → Client
- `roomCreated` - Room creation success
- `playerJoined` - New player joined
- `playerLeft` - Player disconnected
- `gameStarted` - Game began
- `playerIsGuessing` - Someone is guessing
- `roundOver` - Round completed
- `gameOver` - Winner declared
- `guessTimeExpired` - 30s timer expired
- `error` - Error occurred

## 📈 Scalability Considerations

### Current Setup (MVP)
- In-memory game state
- Single server instance
- Perfect for development and small groups

### Future Scaling Options
- Redis for shared state across servers
- PostgreSQL for persistent game history
- Load balancer for multiple server instances
- WebSocket clustering
- CDN for static assets

## 🎓 Learning Resources

### Technologies Used
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## ✅ Project Checklist

### Setup
- [x] Project structure created
- [x] Dependencies configured
- [x] Environment variables templated
- [x] Git ignore configured

### Frontend
- [x] React app initialized
- [x] Tailwind CSS configured
- [x] Routing setup
- [x] State management (Context)
- [x] Socket.io client integration
- [x] All page components
- [x] All UI components
- [x] Spotify SDK integration
- [x] Animations with Framer Motion
- [x] Responsive design
- [x] Error handling
- [x] Loading states

### Backend
- [x] Express server setup
- [x] Socket.io server integration
- [x] Spotify OAuth flow
- [x] Game state management
- [x] Room management
- [x] Playlist endpoints
- [x] Authentication middleware
- [x] Error handling
- [x] CORS configuration

### Documentation
- [x] Main README
- [x] Setup guide
- [x] Next steps guide
- [x] Project overview
- [x] Code comments
- [x] API documentation

## 🎉 You're Ready!

Everything is built and documented. Just follow the NEXT_STEPS.md to get started!
