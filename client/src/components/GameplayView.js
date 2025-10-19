import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import BuzzButton from './BuzzButton';
import JudgeControls from './JudgeControls';
import WinnerModal from './WinnerModal';
import { SOCKET_EVENTS } from '../utils/constants';

const GameplayView = ({ roomCode, playlistTracks }) => {
  const { socket, isHost, players, setPlayers } = useGame();
  const [currentGuesser, setCurrentGuesser] = useState(null);
  const [currentJudge, setCurrentJudge] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [winner, setWinner] = useState(null);
  const [roundResult, setRoundResult] = useState(null);

  // Spotify player hook (only for host)
  const { player, isReady, error: playerError } = useSpotifyPlayer(isHost);

  // Determine if current user is the judge
  const isJudge = currentJudge && currentJudge.socketId === socket?.id;
  const canBuzzIn = !isHost && !isJudge && !currentGuesser;

  useEffect(() => {
    if (!socket) return;

    // Listen for player is guessing event
    socket.on(SOCKET_EVENTS.PLAYER_IS_GUESSING, ({ player, timeLimit }) => {
      setCurrentGuesser(player);
      setTimeRemaining(timeLimit);

      // Pause music for host
      if (isHost && player) {
        player.pause();
      }
    });

    // Listen for round over event
    socket.on(SOCKET_EVENTS.ROUND_OVER, ({ isCorrect, guesser, room }) => {
      setRoundResult({ isCorrect, guesser });
      setPlayers(room.players);
      setCurrentGuesser(null);
      setTimeRemaining(null);

      // Show result for 3 seconds
      setTimeout(() => {
        setRoundResult(null);

        // Resume music if incorrect
        if (!isCorrect && isHost && player) {
          player.togglePlay();
        }
      }, 3000);
    });

    // Listen for guess time expired
    socket.on(SOCKET_EVENTS.GUESS_TIME_EXPIRED, () => {
      setCurrentGuesser(null);
      setTimeRemaining(null);

      // Resume music for host
      if (isHost && player) {
        player.togglePlay();
      }
    });

    // Listen for game over
    socket.on(SOCKET_EVENTS.GAME_OVER, ({ winner: gameWinner, finalScores }) => {
      setWinner(gameWinner);
      setPlayers(finalScores);

      // Pause music for host
      if (isHost && player) {
        player.pause();
      }
    });

    // Listen for song changed
    socket.on('songChanged', () => {
      setCurrentGuesser(null);
      setTimeRemaining(null);
      setRoundResult(null);
    });

    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_IS_GUESSING);
      socket.off(SOCKET_EVENTS.ROUND_OVER);
      socket.off(SOCKET_EVENTS.GUESS_TIME_EXPIRED);
      socket.off(SOCKET_EVENTS.GAME_OVER);
      socket.off('songChanged');
    };
  }, [socket, isHost, player, setPlayers]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) {
      setTimeRemaining(null);
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining]);

  // Update current judge based on players
  useEffect(() => {
    if (players.length > 0) {
      // Find the judge (rotation logic handled by server)
      // For now, we'll just use player tracking from server
      const nonHostPlayers = players.filter((p) => !p.isHost);
      if (nonHostPlayers.length > 0) {
        // The server manages judge rotation
        setCurrentJudge(nonHostPlayers[0]); // Placeholder
      }
    }
  }, [players]);

  const handleBuzzIn = () => {
    if (!socket || !canBuzzIn) return;

    socket.emit(SOCKET_EVENTS.BUZZ_IN, { roomCode });
  };

  const handleJudgment = (isCorrect) => {
    if (!socket || !isJudge) return;

    socket.emit(SOCKET_EVENTS.SUBMIT_JUDGMENT, {
      roomCode,
      isCorrect,
    });
  };

  const handleNextSong = () => {
    if (!socket || !isHost) return;

    socket.emit(SOCKET_EVENTS.NEXT_SONG, { roomCode });

    // Play next track via Spotify SDK
    if (player) {
      player.nextTrack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center">
          {/* Host Controls */}
          {isHost && (
            <div className="mb-6">
              <div className="text-sm text-secondary-text mb-2">Host Controls</div>
              {playerError && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-400 font-semibold mb-2">Error</p>
                  <p className="text-sm">{playerError}</p>
                  <p className="text-xs text-secondary-text mt-2">
                    Make sure you're logged in with a Spotify Premium account
                  </p>
                </div>
              )}
              {!isReady && !playerError && (
                <p className="text-yellow-400 mb-4">
                  Initializing Spotify Player...
                </p>
              )}
              {isReady && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextSong}
                  className="btn-secondary"
                  disabled={currentGuesser !== null}
                >
                  Next Song
                </motion.button>
              )}
              <p className="text-xs text-secondary-text mt-2">
                Only you can hear the music
              </p>
            </div>
          )}

          {/* Round Result */}
          <AnimatePresence>
            {roundResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`p-6 rounded-lg mb-4 ${
                  roundResult.isCorrect
                    ? 'bg-green-500 bg-opacity-20 border border-green-500'
                    : 'bg-red-500 bg-opacity-20 border border-red-500'
                }`}
              >
                <div className="text-4xl mb-2">
                  {roundResult.isCorrect ? '✅' : '❌'}
                </div>
                <p className="text-xl font-bold">
                  {roundResult.isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-secondary-text">
                  {roundResult.guesser.displayName}
                  {roundResult.isCorrect ? ' gets a point!' : ' - Keep trying!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Guesser Display */}
          {currentGuesser && !roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-spotify-green bg-opacity-20 border border-spotify-green rounded-lg p-6 mb-4"
            >
              <div className="text-4xl mb-2">🎤</div>
              <p className="text-xl font-bold mb-2">
                {currentGuesser.displayName} is guessing...
              </p>
              {timeRemaining !== null && (
                <div className="text-3xl font-bold text-spotify-green">
                  {timeRemaining}s
                </div>
              )}
            </motion.div>
          )}

          {/* Buzz In Button */}
          {canBuzzIn && !roundResult && (
            <BuzzButton onClick={handleBuzzIn} />
          )}

          {/* Judge Controls */}
          {isJudge && currentGuesser && !roundResult && (
            <JudgeControls
              guesser={currentGuesser}
              onJudgment={handleJudgment}
            />
          )}

          {/* Waiting State */}
          {!currentGuesser && !isHost && !roundResult && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-xl font-semibold mb-2">
                Listen to the music!
              </p>
              <p className="text-secondary-text">
                Click "I Know It!" when you recognize the song
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Winner Modal */}
      {winner && (
        <WinnerModal
          winner={winner}
          players={players}
          onClose={() => setWinner(null)}
        />
      )}
    </div>
  );
};

export default GameplayView;
