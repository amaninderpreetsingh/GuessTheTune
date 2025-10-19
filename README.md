# GuessTheTune 🎵

A real-time, social music trivia game that brings friends together through the power of their shared favorite songs. Built with React, Node.js, Socket.io, and the Spotify API.

## ✨ Features

- **Host a Game**: Use your own Spotify playlists.
- **Multiplayer**: Real-time gameplay with friends.
- **Fast-Paced**: "Fastest-finger-first" buzz-in mechanic.
- **Competitive**: First to 10 points wins.
- **Modern UI**: Sleek dark-mode design with smooth animations.
- **Responsive**: Works on desktop and mobile.

## 🚀 Quick Start

### Prerequisites

- Node.js
- npm or yarn
- Spotify Premium account (for hosts only)
- Spotify Developer Account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/GuessTheTune.git
cd GuessTheTune
```

2. **Set up Spotify App**
   - Go to your Spotify Developer Dashboard.
   - Create a new app.
   - Add `http://127.0.0.1:8080/auth/callback` to Redirect URIs.
   - Copy your Client ID and Client Secret.

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

The app will open at `http://127.0.0.1:3000`.

## 🎮 How to Play

1. **Host Creates a Game**
   - Click "Host a Game".
   - Login with Spotify.
   - Select a playlist.
   - Share the 4-letter room code with friends.

2. **Players Join**
   - Click "Join a Game".
   - Enter display name and room code.
   - Wait for the host to start.

3. **Gameplay**
   - The host plays songs from their playlist.
   - Players buzz in by clicking "I Know It!".
   - The host decides if the guess is correct.
   - Correct guesses earn 1 point.

4. **Winning**
   - First player to reach 10 points wins!