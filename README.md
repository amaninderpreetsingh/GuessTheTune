# GuessTheTune 🎵

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GCP-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

**A production-ready, real-time multiplayer music trivia game built with modern web technologies**

[Live Demo](#) • [Documentation](DEPLOYMENT.md) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Architecture & Design](#-architecture--design)
- [Key Features](#-key-features)
- [Skills Demonstrated](#-skills-demonstrated)
- [Getting Started](#-getting-started)
- [Production Deployment](#-production-deployment)
- [Project Structure](#-project-structure)
- [How to Play](#-how-to-play)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 About The Project

GuessTheTune is a full-stack, real-time multiplayer music trivia game that leverages the Spotify API to create an engaging social gaming experience. Built with scalability and performance in mind, the application demonstrates modern web development practices including WebSocket communication, OAuth 2.0 authentication, cloud deployment, and responsive design.

**What makes this project stand out:**
- Real-time synchronization across multiple clients using WebSocket technology
- Integration with Spotify's Web API and Web Playback SDK
- Production-ready deployment on Google Cloud Platform and Cloudflare
- Clean, scalable architecture following industry best practices
- Fully responsive UI with smooth animations and modern design

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - Component-based UI architecture with hooks
- **React Router DOM** - Client-side routing and navigation
- **Socket.IO Client** - Real-time bidirectional event-based communication
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Framer Motion** - Production-ready motion library for React animations
- **Axios** - Promise-based HTTP client for API requests
- **Context API** - State management across components
- **Lucide React** - Modern icon library
- **Custom Hooks** - Reusable stateful logic (useSpotifyPlayer)

### Backend
- **Node.js & Express** - RESTful API server with middleware architecture
- **Socket.IO** - WebSocket server for real-time game state synchronization
- **Spotify Web API** - Music streaming and playlist management
- **OAuth 2.0** - Secure authentication flow with Spotify
- **CORS** - Cross-Origin Resource Sharing configuration
- **dotenv** - Environment variable management
- **Cookie Parser** - Session management

### DevOps & Deployment
- **Docker** - Containerization for consistent environments
- **Google Cloud Run** - Serverless container deployment
- **Cloudflare Pages** - Edge-optimized static site hosting
- **CI/CD Ready** - Automated deployment pipelines
- **Environment-based Configuration** - Development vs. Production settings

### Development Tools
- **Git** - Version control
- **Nodemon** - Hot-reloading development server
- **ESLint** - Code quality and consistency
- **PostCSS & Autoprefixer** - CSS processing

---

## 🏗 Architecture & Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React SPA)                      │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐ │
│  │   UI Layer   │  │ State Context │  │ Socket.IO Client│ │
│  │ (Components) │←→│   (Context)   │←→│   (WebSocket)   │ │
│  └──────────────┘  └───────────────┘  └─────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────┴────────────────────────────────┐
│                    Backend (Node.js/Express)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Socket.IO Server (WebSocket)            │  │
│  │         Real-time Game State Synchronization         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Controllers │  │   Services   │  │   Middleware    │   │
│  │  (Routes)   │←→│ (Game Logic) │←→│     (Auth)      │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────┴────────────────────────────────┐
│                      Spotify Web API                        │
│        (Authentication, Playlists, Playback Control)        │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns & Best Practices

**Backend Architecture:**
- **MVC Pattern** - Separation of concerns with Controllers, Services, and Middleware
- **Service Layer** - Business logic encapsulated in `gameManager` and `spotifyService`
- **Middleware Architecture** - Authentication and error handling middleware
- **RESTful API Design** - Standard HTTP methods and status codes
- **Environment-based Configuration** - Different settings for dev/production

**Frontend Architecture:**
- **Component-Based Design** - Reusable, composable UI components
- **Context API** - Centralized state management with `GameContext`
- **Custom Hooks** - Encapsulated logic (e.g., `useSpotifyPlayer`)
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Optimistic UI Updates** - Immediate feedback while awaiting server responses

**Real-Time Communication:**
- **Event-Driven Architecture** - Socket.IO events for game actions
- **Room-Based Multiplayer** - Isolated game sessions using Socket.IO rooms
- **State Synchronization** - Bidirectional updates between server and all clients
- **Connection Management** - Auto-reconnection and error handling

---

## ✨ Key Features

### 🎵 **Spotify Integration**
- OAuth 2.0 authentication flow for secure user login
- Access to user's personal playlists via Spotify Web API
- Integration with Spotify Web Playback SDK for music control
- Real-time playback synchronization across all players

### 🎮 **Real-Time Multiplayer Gameplay**
- WebSocket-based communication using Socket.IO
- Instant synchronization of game state across all connected clients
- "Fastest-finger-first" buzz-in mechanic with sub-second latency
- Room-based architecture supporting multiple concurrent games

### 🎨 **Modern User Interface**
- Responsive design that works seamlessly on desktop and mobile
- Dark mode UI with gradient animations
- Smooth page transitions using Framer Motion
- Interactive components with immediate visual feedback
- Custom animated background with floating music notes

### 🏆 **Game Management**
- Dynamic room creation with unique 4-character codes
- Host controls for game flow and scoring
- Real-time player list updates
- Winner announcement with celebration animations
- Playlist selection and track search functionality

### ☁️ **Cloud-Native Deployment**
- Containerized backend deployed on Google Cloud Run
- Static frontend hosted on Cloudflare Pages CDN
- Auto-scaling based on demand
- Global edge distribution for low latency
- Production-ready CORS and security configurations

---

## 💼 Skills Demonstrated

This project showcases proficiency in:

### Full-Stack Development
- **Frontend Development** - React, modern JavaScript (ES6+), responsive design
- **Backend Development** - Node.js, Express, RESTful API design
- **Real-Time Systems** - WebSocket programming, Socket.IO, event-driven architecture

### API Integration & Authentication
- **Third-Party APIs** - Spotify Web API integration, API request handling
- **OAuth 2.0** - Complete authentication flow implementation
- **Session Management** - Secure token handling and cookie management

### Cloud & DevOps
- **Containerization** - Docker configuration and image optimization
- **Cloud Deployment** - Google Cloud Run, serverless architecture
- **CDN & Edge Computing** - Cloudflare Pages deployment
- **CI/CD** - Automated deployment workflows

### Software Engineering Best Practices
- **Clean Code** - Modular, maintainable, and well-documented code
- **Design Patterns** - MVC, Service Layer, Custom Hooks
- **State Management** - Context API, centralized state handling
- **Error Handling** - Graceful error recovery and user feedback
- **Security** - Environment variables, CORS configuration, secure authentication

### UI/UX Design
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Animation** - Smooth transitions with Framer Motion
- **User Experience** - Intuitive interface with immediate feedback
- **Accessibility** - Semantic HTML and keyboard navigation support

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify Premium account (for hosts)
- Spotify Developer account ([Sign up here](https://developer.spotify.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/GuessTheTune.git
   cd GuessTheTune
   ```

2. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://127.0.0.1:8080/auth/callback` to Redirect URIs
   - Copy your Client ID and Client Secret

3. **Configure Backend**
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

4. **Configure Frontend**
   ```bash
   cd ../client
   npm install
   ```

5. **Start Development Servers**

   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm start
   ```

   The app will open at `http://127.0.0.1:3000`

---

## 🌐 Production Deployment

This application is production-ready and can be deployed using:

- **Backend**: Google Cloud Run (Serverless, auto-scaling)
- **Frontend**: Cloudflare Pages (Global CDN, unlimited bandwidth)

**Deployment Benefits:**
- ✅ Generous free tiers (2M requests/month on GCP)
- ✅ Auto-scaling based on traffic
- ✅ Global edge distribution
- ✅ SSL/TLS encryption included
- ✅ CI/CD integration with GitHub

**📖 [Complete Deployment Guide](DEPLOYMENT.md)**

Includes:
- Step-by-step instructions for both platforms
- Docker configuration
- Environment variable setup
- Spotify OAuth configuration for production
- Troubleshooting guide
- Cost estimates (~$0-15/month)

**Estimated setup time: 20-30 minutes**

---

## 📁 Project Structure

```
GuessTheTune/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable UI components
│       │   ├── AnimatedBackground.js
│       │   ├── BuzzButton.js
│       │   ├── GameplayView.js
│       │   ├── JoinGameModal.js
│       │   ├── JudgeControls.js
│       │   ├── PlayerList.js
│       │   ├── PlaylistSelector.js
│       │   ├── TrackSearch.js
│       │   └── WinnerModal.js
│       ├── context/             # State management
│       │   └── GameContext.js   # Global game state
│       ├── hooks/               # Custom React hooks
│       │   └── useSpotifyPlayer.js
│       ├── pages/               # Route components
│       │   ├── HomePage.js
│       │   ├── LobbyPage.js
│       │   └── GameRoomPage.js
│       ├── utils/               # Helper functions
│       └── App.js               # Root component
│
├── server/                      # Node.js backend
│   ├── controllers/             # Route handlers
│   │   ├── authController.js    # Spotify OAuth
│   │   ├── playlistController.js
│   │   ├── playbackController.js
│   │   ├── tokenController.js
│   │   └── socketController.js  # WebSocket events
│   ├── services/                # Business logic
│   │   ├── gameManager.js       # Game state management
│   │   └── spotifyService.js    # Spotify API wrapper
│   ├── middleware/              # Custom middleware
│   │   └── authMiddleware.js    # JWT verification
│   ├── index.js                 # Server entry point
│   ├── Dockerfile               # Container configuration
│   └── .env.example             # Environment template
│
├── DEPLOYMENT.md                # Production deployment guide
└── README.md                    # Project documentation
```

---

## 🎮 How to Play

1. **Host Creates a Game**
   - Click "Host a Game"
   - Authenticate with Spotify
   - Select a playlist from your library
   - Share the generated 4-letter room code

2. **Players Join**
   - Click "Join a Game"
   - Enter display name and room code
   - Wait in lobby for host to start

3. **Gameplay**
   - Host plays songs from the selected playlist
   - Players compete to buzz in first when they recognize a song
   - Host judges the correctness of guesses
   - Correct answers earn 1 point

4. **Winning**
   - First player to reach 10 points wins!
   - Celebration animation and option to play again

---

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music integration
- [Socket.IO](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) and the amazing React community
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

---

## 🐛 Troubleshooting

### CORS Errors

If you encounter CORS (Cross-Origin Resource Sharing) errors when running the application, it means the server is not configured to accept requests from the frontend's origin. This is a common issue when deploying to new environments.

**Solution:**

1.  **Identify the Frontend URL:** Look at the error message in your browser's developer console. It will specify the `origin` that was blocked. For example: `https://<your-frontend-url>.pages.dev`.

2.  **Update Server Configuration:** Open `server/index.js` and add your frontend URL to the `allowedOrigins` or `developmentOrigins` array:

    ```javascript
    const developmentOrigins = [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'https://your-frontend-url.pages.dev' // Add your URL here
    ];
    ```

3.  **Restart the Server:** Stop and restart the backend server for the changes to take effect.

---

<div align="center">

**Built with ❤️ and modern web technologies**

⭐ Star this repo if you found it interesting!

</div>
