// Game configuration constants
export const GAME_CONFIG = {
  WINNING_SCORE: 10,
  GUESS_TIME_LIMIT: 30, // seconds
  ROOM_CODE_LENGTH: 4,
};

// Socket event names
export const SOCKET_EVENTS = {
  // Room events
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  ROOM_CREATED: 'roomCreated',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',

  // Game events
  GAME_STARTED: 'gameStarted',
  SONG_STARTED: 'songStarted',
  BUZZ_IN: 'buzzIn',
  PLAYER_IS_GUESSING: 'playerIsGuessing',
  SUBMIT_JUDGMENT: 'submitJudgment',
  ROUND_OVER: 'roundOver',
  GUESS_TIME_EXPIRED: 'guessTimeExpired',
  GAME_OVER: 'gameOver',
  NEXT_SONG: 'nextSong',

  // Error events
  ERROR: 'error',
  ROOM_NOT_FOUND: 'roomNotFound',
};

// Game states
export const GAME_STATES = {
  IDLE: 'idle',
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GUESSING: 'guessing',
  GAME_OVER: 'gameOver',
};
