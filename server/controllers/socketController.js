const gameManager = require('../services/gameManager');

/**
 * Sets up all Socket.io event handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {


    /**
     * Create a new game room
     * Only hosts can create rooms
     */
    socket.on('createRoom', ({ displayName, isHost }) => {
      if (!isHost) {
        return;
      }

      const room = gameManager.createRoom(socket.id, displayName);
      socket.join(room.id);

      socket.emit('roomCreated', {
        roomCode: room.id,
        room: room,
        hostToken: room.hostToken,
      });
    });

    /**
     * Join an existing game room
     */
    socket.on('joinRoom', ({ roomCode, displayName }) => {
      const room = gameManager.joinRoom(roomCode, socket.id, displayName);

      if (!room) {
        return;
      }

      socket.join(roomCode);

      // Notify the player who just joined
      socket.emit('playerJoined', { room });

      // Notify all other players in the room
      socket.to(roomCode).emit('playerJoined', { room });
    });

    /**
     * Rejoin as host with authentication token
     */
    socket.on('rejoinAsHost', ({ roomCode, hostToken }) => {
      const room = gameManager.rejoinAsHost(roomCode, hostToken, socket.id);

      if (!room) {
        return;
      }

      socket.join(roomCode);

      // Notify the host they've successfully rejoined
      socket.emit('hostRejoined', {
        roomCode: room.id,
        room: room,
        hostToken: room.hostToken,
      });

      // Notify all other players that host is back
      socket.to(roomCode).emit('hostReconnected', {
        message: 'Host has reconnected!',
        room: room,
      });
    });

    /**
     * Handle player disconnect
     */
    socket.on('disconnect', () => {
      const result = gameManager.handleDisconnect(socket.id);

      if (result) {
        const { roomCode, wasHost, room, hostDisconnected } = result;

        if (hostDisconnected && room) {
          // Host disconnected but room is kept alive for reconnection
          io.to(roomCode).emit('hostDisconnected', {
            message: 'Host disconnected. Waiting for reconnection...',
            waitingForReconnect: true,
          });
        } else if (wasHost && !room) {
          // Host left and room was deleted (no other players)
        } else if (room) {
          // Regular player disconnected
          io.to(roomCode).emit('playerLeft', { room });
        }
      }
    });

    /**
     * Start the game
     * Only the host can start the game
     */
    socket.on('startGame', ({ roomCode, playlist }) => {
      const room = gameManager.getRoom(roomCode);

      if (!room) {
        return;
      }

      if (room.hostSocketId !== socket.id) {
        return;
      }

      gameManager.startGame(roomCode, playlist);

      // Notify all players in the room
      io.to(roomCode).emit('gameStarted', {
        room: gameManager.getRoom(roomCode),
      });
    });

    /**
     * Handle buzz-in from a player
     */
    socket.on('buzzIn', ({ roomCode }) => {
      const result = gameManager.handleBuzzIn(roomCode, socket.id);

      if (!result.success) {
        return;
      }

      // Notify all players that someone buzzed in
      io.to(roomCode).emit('playerIsGuessing', {
        player: result.player,
        timeLimit: 30,
      });

      // Start a 30-second timer
      setTimeout(() => {
        const room = gameManager.getRoom(roomCode);
        if (room && room.currentGuesser === socket.id) {
          gameManager.clearGuesser(roomCode);
          io.to(roomCode).emit('guessTimeExpired', {
            message: 'Time expired! Continue playing.',
          });
        }
      }, 30000);
    });

    /**
     * Handle judge's decision
     */
    socket.on('submitJudgment', ({ roomCode, isCorrect }) => {
      const result = gameManager.submitJudgment(roomCode, socket.id, isCorrect);

      if (!result.success) {
        return;
      }

      if (result.gameOver) {
        // Game is over, we have a winner
        io.to(roomCode).emit('gameOver', {
          winner: result.winner,
          finalScores: result.room.players,
        });
      } else {
        io.to(roomCode).emit('roundOver', {
          isCorrect,
          guesser: result.guesser,
          room: result.room,
        });

        if (isCorrect) {
          // Automatically go to the next song after a delay
          setTimeout(() => {
            const room = gameManager.getRoom(roomCode);
            if (room && room.gameState !== 'gameOver') {
              gameManager.nextSong(roomCode);
              const updatedRoom = gameManager.getRoom(roomCode);
              io.to(roomCode).emit('songChanged', {
                room: updatedRoom,
              });
            }
          }, 3000); // 3 second delay to show the round result
        }
      }
    });

    /**
     * Move to next song
     */
    socket.on('nextSong', ({ roomCode }) => {
      const room = gameManager.getRoom(roomCode);

      if (!room) {
        return;
      }

      if (room.hostSocketId !== socket.id) {
        return;
      }

      gameManager.nextSong(roomCode);

      io.to(roomCode).emit('songChanged', {
        room: gameManager.getRoom(roomCode),
      });
    });
  });
}

module.exports = setupSocketHandlers;
