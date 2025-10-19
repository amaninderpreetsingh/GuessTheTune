const gameManager = require('../services/gameManager');

/**
 * Sets up all Socket.io event handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    /**
     * Create a new game room
     * Only hosts can create rooms
     */
    socket.on('createRoom', ({ displayName, isHost }) => {
      try {
        if (!isHost) {
          socket.emit('error', { message: 'Only hosts can create rooms' });
          return;
        }

        const room = gameManager.createRoom(socket.id, displayName);
        socket.join(room.id);

        socket.emit('roomCreated', {
          roomCode: room.id,
          room: room,
        });

        console.log(`🎮 Room created: ${room.id} by ${displayName}`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    /**
     * Join an existing game room
     */
    socket.on('joinRoom', ({ roomCode, displayName }) => {
      try {
        const room = gameManager.joinRoom(roomCode, socket.id, displayName);

        if (!room) {
          socket.emit('roomNotFound', { message: 'Room not found' });
          return;
        }

        socket.join(roomCode);

        // Notify the player who just joined
        socket.emit('playerJoined', { room });

        // Notify all other players in the room
        socket.to(roomCode).emit('playerJoined', { room });

        console.log(`👤 ${displayName} joined room: ${roomCode}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: error.message || 'Failed to join room' });
      }
    });

    /**
     * Handle player disconnect
     */
    socket.on('disconnect', () => {
      const result = gameManager.handleDisconnect(socket.id);

      if (result) {
        const { roomCode, wasHost, room } = result;

        if (wasHost && room) {
          // Host disconnected - notify all players
          io.to(roomCode).emit('hostDisconnected', {
            message: 'The host has left. Game ended.',
          });
          // Clean up the room
          gameManager.deleteRoom(roomCode);
        } else if (room) {
          // Regular player disconnected
          io.to(roomCode).emit('playerLeft', { room });
        }
      }

      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    /**
     * Start the game
     * Only the host can start the game
     */
    socket.on('startGame', ({ roomCode, playlist }) => {
      try {
        const room = gameManager.getRoom(roomCode);

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.hostSocketId !== socket.id) {
          socket.emit('error', { message: 'Only the host can start the game' });
          return;
        }

        gameManager.startGame(roomCode, playlist);

        // Notify all players in the room
        io.to(roomCode).emit('gameStarted', {
          room: gameManager.getRoom(roomCode),
        });

        console.log(`🎮 Game started in room: ${roomCode}`);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    /**
     * Handle buzz-in from a player
     */
    socket.on('buzzIn', ({ roomCode }) => {
      try {
        const result = gameManager.handleBuzzIn(roomCode, socket.id);

        if (!result.success) {
          socket.emit('error', { message: result.message });
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

        console.log(`🔔 Buzz in from ${result.player.displayName} in room ${roomCode}`);
      } catch (error) {
        console.error('Error handling buzz in:', error);
        socket.emit('error', { message: 'Failed to process buzz in' });
      }
    });

    /**
     * Handle judge's decision
     */
    socket.on('submitJudgment', ({ roomCode, isCorrect }) => {
      try {
        const result = gameManager.submitJudgment(roomCode, socket.id, isCorrect);

        if (!result.success) {
          socket.emit('error', { message: result.message });
          return;
        }

        if (result.gameOver) {
          // Game is over, we have a winner
          io.to(roomCode).emit('gameOver', {
            winner: result.winner,
            finalScores: result.room.players,
          });
          console.log(`🏆 Game over in room ${roomCode}! Winner: ${result.winner.displayName}`);
        } else {
          // Round over, continue playing
          io.to(roomCode).emit('roundOver', {
            isCorrect,
            guesser: result.guesser,
            room: result.room,
          });
          console.log(`✅ Round over in room ${roomCode}`);
        }
      } catch (error) {
        console.error('Error submitting judgment:', error);
        socket.emit('error', { message: 'Failed to submit judgment' });
      }
    });

    /**
     * Move to next song
     */
    socket.on('nextSong', ({ roomCode }) => {
      try {
        const room = gameManager.getRoom(roomCode);

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.hostSocketId !== socket.id) {
          socket.emit('error', { message: 'Only the host can change songs' });
          return;
        }

        gameManager.nextSong(roomCode);

        io.to(roomCode).emit('songChanged', {
          room: gameManager.getRoom(roomCode),
        });
      } catch (error) {
        console.error('Error changing song:', error);
        socket.emit('error', { message: 'Failed to change song' });
      }
    });
  });
}

module.exports = setupSocketHandlers;
