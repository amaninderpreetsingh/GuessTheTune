/**
 * In-memory game state manager
 * Handles all game room logic and state
 */

const crypto = require('crypto');

const rooms = new Map();

/**
 * Generates a random 4-letter room code
 * @returns {string} 4-letter room code
 */
function generateRoomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  // Check if code already exists, regenerate if it does
  return rooms.has(code) ? generateRoomCode() : code;
}

/**
 * Creates a new game room
 * @param {string} hostSocketId - Socket ID of the host
 * @param {string} hostDisplayName - Display name of the host
 * @returns {Object} Created room object
 */
function createRoom(hostSocketId, hostDisplayName) {
  const roomCode = generateRoomCode();
  const hostToken = crypto.randomBytes(32).toString('hex');

  const room = {
    id: roomCode,
    hostSocketId,
    hostToken,
    disconnectedAt: null,
    players: [
      {
        socketId: hostSocketId,
        displayName: hostDisplayName,
        score: 0,
        isHost: true,
      },
    ],
    gameState: 'lobby', // lobby, playing, guessing, gameOver
    playlist: null,
    currentTrackIndex: 0,
    currentGuesser: null,
    currentJudgeIndex: 0, // Host is always the judge
    rotateJudge: false, // Whether to rotate judge after each correct guess
    createdAt: Date.now(),
  };

  rooms.set(roomCode, room);
  return room;
}

/**
 * Adds a player to an existing room
 * @param {string} roomCode - Room code to join
 * @param {string} socketId - Socket ID of the player
 * @param {string} displayName - Display name of the player
 * @returns {Object|null} Updated room object or null if room not found
 */
function joinRoom(roomCode, socketId, displayName) {
  const room = rooms.get(roomCode);

  if (!room) {
    return null;
  }

  if (room.gameState !== 'lobby') {
    throw new Error('Cannot join a game in progress');
  }

  // Check if player already in room
  const existingPlayer = room.players.find(p => p.socketId === socketId);
  if (existingPlayer) {
    return room;
  }

  room.players.push({
    socketId,
    displayName,
    score: 0,
    isHost: false,
  });

  return room;
}

/**
 * Starts the game
 * @param {string} roomCode - Room code
 * @param {Array} playlist - Array of track objects
 * @param {boolean} shuffle - Whether to shuffle the playlist
 * @param {boolean} rotateJudge - Whether to rotate judge after each correct guess
 */
function startGame(roomCode, playlist, shuffle = true, rotateJudge = false) {
  const room = rooms.get(roomCode);

  if (!room) {
    throw new Error('Room not found');
  }

  let finalPlaylist = playlist;
  if (shuffle) {
    // Shuffle the playlist
    finalPlaylist = [...playlist].sort(() => Math.random() - 0.5);
  }

  room.gameState = 'playing';
  room.playlist = finalPlaylist;
  room.currentTrackIndex = 0;
  room.rotateJudge = rotateJudge;
}

/**
 * Handles a player buzzing in
 * @param {string} roomCode - Room code
 * @param {string} socketId - Socket ID of the player buzzing in
 * @returns {Object} Result object with success status and player info
 */
function handleBuzzIn(roomCode, socketId) {
  const room = rooms.get(roomCode);

  if (!room) {
    return { success: false, message: 'Room not found' };
  }

  if (room.gameState !== 'playing') {
    return { success: false, message: 'Game is not in playing state' };
  }

  if (room.currentGuesser) {
    return { success: false, message: 'Someone is already guessing' };
  }

  // Check if this is the current judge
  const currentJudge = room.players[room.currentJudgeIndex];
  if (currentJudge && currentJudge.socketId === socketId) {
    return { success: false, message: 'Judge cannot buzz in' };
  }

  const player = room.players.find(p => p.socketId === socketId);

  if (!player) {
    return { success: false, message: 'Player not found in room' };
  }

  room.currentGuesser = socketId;
  room.gameState = 'guessing';

  return { success: true, player };
}

/**
 * Clears the current guesser (when time expires)
 * @param {string} roomCode - Room code
 */
function clearGuesser(roomCode) {
  const room = rooms.get(roomCode);

  if (room) {
    room.currentGuesser = null;
    room.gameState = 'playing';
  }
}

/**
 * Handles judge's decision on a guess
 * @param {string} roomCode - Room code
 * @param {string} judgeSocketId - Socket ID of the judge
 * @param {boolean} isCorrect - Whether the guess was correct
 * @returns {Object} Result object
 */
function submitJudgment(roomCode, judgeSocketId, isCorrect) {
  const room = rooms.get(roomCode);

  if (!room) {
    return { success: false, message: 'Room not found' };
  }

  const currentJudge = room.players[room.currentJudgeIndex];

  if (!currentJudge || currentJudge.socketId !== judgeSocketId) {
    return { success: false, message: 'You are not the current judge' };
  }

  const guesser = room.players.find(p => p.socketId === room.currentGuesser);

  if (!guesser) {
    return { success: false, message: 'No active guesser' };
  }

  if (isCorrect) {
    guesser.score += 1;

    // Check for winner
    if (guesser.score >= 10) {
      room.gameState = 'gameOver';
      return {
        success: true,
        gameOver: true,
        winner: guesser,
        room,
      };
    }

    // Rotate judge if enabled (after correct guess only)
    if (room.rotateJudge) {
      room.currentJudgeIndex = (room.currentJudgeIndex + 1) % room.players.length;
    }
  }

  room.currentGuesser = null;
  room.gameState = 'playing';

  return {
    success: true,
    gameOver: false,
    guesser,
    room,
  };
}

/**
 * Moves to the next song in the playlist
 * @param {string} roomCode - Room code
 */
function nextSong(roomCode) {
  const room = rooms.get(roomCode);

  if (room && room.playlist) {
    room.currentTrackIndex = (room.currentTrackIndex + 1) % room.playlist.length;
    room.currentGuesser = null;
    room.gameState = 'playing';
  }
}

/**
 * Handles player disconnect
 * @param {string} socketId - Socket ID of disconnected player
 * @returns {Object|null} Information about the disconnect
 */
function handleDisconnect(socketId) {
  for (const [roomCode, room] of rooms.entries()) {
    const playerIndex = room.players.findIndex(p => p.socketId === socketId);

    if (playerIndex !== -1) {
      const wasHost = room.players[playerIndex].isHost;

      if (wasHost) {
        rooms.delete(roomCode);
        return { roomCode, wasHost: true, room: null };
      } else {
        // Regular player disconnected - remove them
        room.players.splice(playerIndex, 1);

        // If room is now empty, delete it
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          return { roomCode, wasHost: false, room: null };
        }

        return { roomCode, wasHost: false, room };
      }
    }
  }

  return null;
}

/**
 * Rejoins a host to their room using their host token
 * @param {string} roomCode - Room code
 * @param {string} hostToken - Host authentication token
 * @param {string} newSocketId - New socket ID for the reconnected host
 * @returns {Object|null} Room object if successful, null otherwise
 */
function rejoinAsHost(roomCode, hostToken, newSocketId) {
  const room = rooms.get(roomCode);

  if (!room) {
    return null;
  }

  if (room.hostToken !== hostToken) {
    return null;
  }

  // Find the host player and update their socket ID
  const hostPlayer = room.players.find(p => p.isHost);
  if (hostPlayer) {
    hostPlayer.socketId = newSocketId;
  }

  // Update the room's host socket ID
  room.hostSocketId = newSocketId;
  room.disconnectedAt = null;

  return room;
}

/**
 * Promotes a player to host
 * @param {string} roomCode - Room code
 * @param {string} newHostSocketId - Socket ID of the new host
 * @returns {Object|null} Updated room or null if failed
 */
function getRoom(roomCode) {
  return rooms.get(roomCode);
}

/**
 * Deletes a room
 * @param {string} roomCode - Room code
 */
function deleteRoom(roomCode) {
  rooms.delete(roomCode);
}

/**
 * Forces a specific track to be the next song
 * @param {string} roomCode - Room code
 * @param {Object} track - The track object to play next
 */
function forceNextSong(roomCode, track) {
  const room = rooms.get(roomCode);

  if (!room) {
    throw new Error('Room not found');
  }

  if (!room.playlist) {
    room.playlist = [];
  }

  // Insert the new track at the current position + 1
  // This makes it the "next" song to play
  room.playlist.splice(room.currentTrackIndex + 1, 0, track);

  // Move to the next song (which is now the forced track)
  room.currentTrackIndex = (room.currentTrackIndex + 1) % room.playlist.length;
  room.currentGuesser = null;
  room.gameState = 'playing';
}

/**
 * Returns a list of active rooms with basic information.
 * @returns {Array} Array of room info objects.
 */
function getAllRoomsInfo() {
  const activeRooms = [];
  for (const [roomCode, room] of rooms.entries()) {
    activeRooms.push({
      id: room.id,
      playerCount: room.players.length,
      gameState: room.gameState,
      hostDisplayName: room.players.find(p => p.isHost)?.displayName || 'N/A',
      currentTrack: room.playlist && room.currentTrackIndex !== undefined && room.playlist[room.currentTrackIndex]
        ? `${room.playlist[room.currentTrackIndex].name} by ${room.playlist[room.currentTrackIndex].artist}`
        : 'N/A',
    });
  }
  return activeRooms;
}

module.exports = {
  createRoom,
  joinRoom,
  startGame,
  handleBuzzIn,
  clearGuesser,
  submitJudgment,
  nextSong,
  handleDisconnect,
  rejoinAsHost,
  getRoom,
  deleteRoom,
  forceNextSong,
  getAllRoomsInfo, // Export the new function
};
