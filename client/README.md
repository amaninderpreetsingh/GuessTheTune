# GuessTheTune Client

React frontend for the GuessTheTune real-time music trivia game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the client directory:
```
REACT_APP_SERVER_URL=http://127.0.0.1:8080
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://127.0.0.1:3000` or `http://localhost:3000`.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page-level components
├── context/        # React Context for state management
├── hooks/          # Custom React hooks
├── utils/          # Utility functions and constants
└── styles/         # Global styles (handled by Tailwind)
```

## Tech Stack

- React 18
- React Router v6
- Socket.io Client
- Axios
- Framer Motion
- Tailwind CSS

## Color Palette

- Primary Background: #121212
- Secondary Background: #1E1E1E
- Primary Accent (Spotify Green): #1DB954
- Primary Text: #FFFFFF
- Secondary Text: #B3B3B3
