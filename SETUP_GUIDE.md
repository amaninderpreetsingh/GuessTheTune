# GuessTheTune Setup Guide 🚀

This guide will walk you through setting up GuessTheTune from scratch.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js installed (v14 or higher) - [Download here](https://nodejs.org/)
- [ ] npm or yarn package manager
- [ ] A Spotify account
- [ ] A Spotify Premium account (for hosting games)
- [ ] A Spotify Developer account

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create an App"**
4. Fill in the details:
   - **App Name**: GuessTheTune (or any name you like)
   - **App Description**: Real-time music trivia game
   - **Redirect URI**: `http://localhost:8080/auth/callback`
5. Check the agreement boxes and click **"Create"**
6. On your app's dashboard, click **"Edit Settings"**
7. Under **Redirect URIs**, add:
   - `http://127.0.0.1:8080/auth/callback` (Spotify requires 127.0.0.1, not localhost)
   - Click **"Add"** then **"Save"**
8. Copy your **Client ID** and **Client Secret** (click "Show Client Secret")

## Step 2: Install Dependencies

### Server Dependencies

```bash
cd server
npm install
```

This installs:
- express (web server)
- socket.io (real-time communication)
- cors (cross-origin requests)
- axios (HTTP client)
- dotenv (environment variables)
- cookie-parser (cookie handling)
- nodemon (development auto-restart)

### Client Dependencies

```bash
cd client
npm install
```

This installs:
- react & react-dom
- react-router-dom (routing)
- socket.io-client (real-time client)
- axios (HTTP client)
- framer-motion (animations)
- tailwindcss (styling)

## Step 3: Configure Environment Variables

### Server Configuration

1. In the `server/` directory, you'll find a `.env` file
2. Open it and replace the placeholder values:

```env
PORT=8080
CLIENT_URL=http://127.0.0.1:3000

# Replace with your Spotify app credentials
SPOTIFY_CLIENT_ID=abc123xyz789...
SPOTIFY_CLIENT_SECRET=def456uvw012...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/auth/callback

# Generate a random string for session security
SESSION_SECRET=some_random_long_string_here_12345
```

**Tips:**
- For `SESSION_SECRET`, use a random string (at least 32 characters)
- You can generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Client Configuration

1. In the `client/` directory, you'll find a `.env` file
2. It should contain:

```env
REACT_APP_SERVER_URL=http://127.0.0.1:8080
```

This tells the React app where to find your backend server.

## Step 4: Start the Application

You'll need **two terminal windows** open.

### Terminal 1: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
🎵 GuessTheTune server running on port 8080
📡 Socket.io ready for connections
```

### Terminal 2: Start the Client

```bash
cd client
npm start
```

The React app will automatically open in your browser at `http://127.0.0.1:3000` or `http://localhost:3000`

## Step 5: Test the Application

### Test as Host

1. Click **"Host a Game"**
2. You'll be redirected to Spotify login
3. Log in with a Spotify Premium account
4. Authorize the app
5. Enter your display name
6. You should see a 4-letter room code

### Test as Player

1. Open a new incognito/private browser window
2. Go to `http://127.0.0.1:3000` (or `http://localhost:3000`)
3. Click **"Join a Game"**
4. Enter a display name and the room code from the host
5. You should join the lobby

### Test Gameplay

1. As the host, select a playlist
2. Click **"Start Game"**
3. The host's browser will start playing music
4. Players can click **"I Know It!"** to buzz in
5. The judge decides if the guess is correct
6. First to 10 points wins!

## Troubleshooting

### "Spotify SDK not loaded"

**Solution:** Make sure the Spotify SDK script is in `client/public/index.html`:
```html
<script src="https://sdk.scdn.co/spotify-player.js"></script>
```

### "Token expired" or "Authentication error"

**Solutions:**
1. Refresh the page and log in again
2. Check that your Spotify Client ID and Secret are correct
3. Make sure the redirect URI matches exactly in both:
   - Your Spotify app settings
   - Your `.env` file

### Socket connection errors

**Solutions:**
1. Make sure the server is running on port 8080
2. Check that `REACT_APP_SERVER_URL` in client `.env` is correct
3. Verify CORS is configured properly

### "Room not found" when joining

**Solutions:**
1. Make sure you're entering the exact 4-letter code
2. Check that the host's room is still active
3. Verify the server is running

### Player can't hear music

**This is expected!** Only the host hears the music through Spotify. Players rely on their knowledge to buzz in and guess.

### Judge controls not appearing

**Solution:** Make sure you're not the host and someone has buzzed in. The judge role rotates among non-host players.

## Production Deployment

### Prepare for Production

1. **Update Environment Variables**
   - Change `CLIENT_URL` to your production frontend URL
   - Change `SPOTIFY_REDIRECT_URI` to your production callback URL
   - Update Spotify app settings with production redirect URI

2. **Build the Client**
```bash
cd client
npm run build
```

3. **Deploy Backend** (Heroku, Railway, Render, etc.)
   - Set all environment variables
   - Deploy the `server/` directory

4. **Deploy Frontend** (Vercel, Netlify, etc.)
   - Set `REACT_APP_SERVER_URL` to your production backend URL
   - Deploy the `client/build` directory

## Need Help?

- Check the main [README.md](README.md) for more information
- Review the code comments for implementation details
- Open an issue on GitHub
- Check Spotify's [Web Playback SDK documentation](https://developer.spotify.com/documentation/web-playback-sdk)

## Next Steps

- Customize the color scheme in `client/tailwind.config.js`
- Add more features (hints, different game modes, etc.)
- Improve the UI with custom animations
- Add a leaderboard system
- Implement the AI judging feature

Happy gaming! 🎵🎮
