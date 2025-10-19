import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import BuzzButton from './BuzzButton';
import JudgeControls from './JudgeControls';
import WinnerModal from './WinnerModal';
import { SOCKET_EVENTS } from '../utils/constants';

const GameplayView = ({ roomCode, playlistTracks }) => {
  const { socket, isHost, players, setPlayers, room, setRoom } = useGame();
  const [currentGuesser, setCurrentGuesser] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [winner, setWinner] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState('initializing'); // initializing, waiting, starting, playing, error
  const playbackInitiatedRef = useRef(false);

  // Spotify player hook (only for host)
  const {
    player,
    isReady,
    deviceId,
    error: playerError,
    startPlayback: sdkStartPlayback,
    verifyPlayerReady,
    nextTrack: sdkNextTrack,
    pausePlayback,
    resumePlayback,
  } = useSpotifyPlayer(isHost);

  // The host is always the judge
  const isJudge = isHost;
  const canBuzzIn = !isHost && !currentGuesser;

  const playlistTracksRef = useRef(playlistTracks);

  useEffect(() => {
    playlistTracksRef.current = playlistTracks;
  }, [playlistTracks]);

  // Start playback when Spotify player is ready (host only)
  useEffect(() => {
    if (!isHost || !isReady || !deviceId || !playlistTracksRef.current || playlistTracksRef.current.length === 0 || isPlaying) {
      return;
    }

    // Prevent multiple playback initiations
    if (playbackInitiatedRef.current) {
      return;
    }

    const startPlayback = async () => {
      playbackInitiatedRef.current = true;

      try {
        setPlaybackStatus('verifying');
        console.log('Verifying device is ready...');

        // Verify the player is ready with retry logic
        const verification = await verifyPlayerReady();

        if (!verification.ready) {
          setPlaybackStatus('verification_failed');
          console.error('Device verification failed:', verification.error);
          playbackInitiatedRef.current = false; // Allow retry on failure
          return;
        }

        setPlaybackStatus('starting');
        console.log('Device verified! Starting playback with device:', verification.deviceId || deviceId);

        // Get track URIs for the playlist
        const uris = playlistTracksRef.current.map(track => track.uri);

        // Try to start playback using the SDK method
        const success = await sdkStartPlayback(uris, verification.deviceId);

        if (success) {
          setIsPlaying(true);
          setPlaybackStatus('playing');
          console.log('Playback started successfully!');
        } else {
          // If SDK method fails, show error
          setPlaybackStatus('error');
          console.error('Failed to start playback');
          playbackInitiatedRef.current = false; // Allow retry on failure
        }
      } catch (error) {
        console.error('Error starting playback:', error);
        setPlaybackStatus('error');
        playbackInitiatedRef.current = false; // Allow retry on failure
      }
    };

    startPlayback();
  }, [isHost, isReady, deviceId, isPlaying, sdkStartPlayback, verifyPlayerReady]);

  useEffect(() => {
    if (!socket) return;

    // Listen for player is guessing event
    socket.on(SOCKET_EVENTS.PLAYER_IS_GUESSING, ({ player: guessingPlayer, timeLimit }) => {
      setCurrentGuesser(guessingPlayer);
      setTimeRemaining(timeLimit);

      // Pause music for host
      if (isHost) {
        pausePlayback();
      }
    });

    // Listen for round over event
    socket.on(SOCKET_EVENTS.ROUND_OVER, ({ isCorrect, guesser, room }) => {
      setRoundResult({ isCorrect, guesser });
      setPlayers(room.players);
      setRoom(room);
      setCurrentGuesser(null);
      setTimeRemaining(null);

      // Show result for 3 seconds
      setTimeout(() => {
        setRoundResult(null);

        // Resume music if incorrect
        if (!isCorrect && isHost) {
          resumePlayback();
        }
      }, 3000);
    });

    // Listen for guess time expired
    socket.on(SOCKET_EVENTS.GUESS_TIME_EXPIRED, () => {
      setCurrentGuesser(null);
      setTimeRemaining(null);

      // Resume music for host
      if (isHost) {
        resumePlayback();
      }
    });

    // Listen for game over
    socket.on(SOCKET_EVENTS.GAME_OVER, ({ winner: gameWinner, finalScores }) => {
      setWinner(gameWinner);
      setPlayers(finalScores);

      // Pause music for host
      if (isHost) {
        pausePlayback();
      }
    });

    // Listen for song changed
    socket.on('songChanged', ({ room }) => {
      setCurrentGuesser(null);
      setTimeRemaining(null);
      setRoundResult(null);
      setRoom(room);
    });

    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_IS_GUESSING);
      socket.off(SOCKET_EVENTS.ROUND_OVER);
      socket.off(SOCKET_EVENTS.GUESS_TIME_EXPIRED);
      socket.off(SOCKET_EVENTS.GAME_OVER);
      socket.off('songChanged');
    };
  }, [socket, isHost, setPlayers, pausePlayback, resumePlayback, setRoom]);

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

  const handleNextSong = async () => {
    if (!socket || !isHost) return;

    socket.emit(SOCKET_EVENTS.NEXT_SONG, { roomCode });

    // Play next track via Spotify SDK with readiness check
    await sdkNextTrack();
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
              {isReady && playbackStatus === 'verifying' && (
                <div className="mb-4">
                  <p className="text-yellow-400 mb-2">
                    Verifying device is ready...
                  </p>
                  <p className="text-xs text-secondary-text">
                    This may take a few seconds
                  </p>
                </div>
              )}
              {isReady && playbackStatus === 'starting' && (
                <p className="text-yellow-400 mb-4">
                  Starting playback...
                </p>
              )}
              {isReady && playbackStatus === 'verification_failed' && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-400 font-semibold mb-2">Device Verification Failed</p>
                  <p className="text-sm">Spotify device could not be verified after 5 attempts.</p>
                  <p className="text-xs text-secondary-text mt-2">
                    Try refreshing the page or check your Spotify connection
                  </p>
                </div>
              )}
              {isReady && playbackStatus === 'error' && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-400 font-semibold mb-2">Playback Error</p>
                  <p className="text-sm">Failed to start music. Try refreshing the page.</p>
                </div>
              )}
              {isReady && playbackStatus === 'playing' && (
                <>
                  <p className="text-green-400 mb-3 font-semibold">
                    🎵 Music is playing!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextSong}
                    className="btn-secondary"
                    disabled={currentGuesser !== null}
                  >
                    Next Song
                  </motion.button>
                </>
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
