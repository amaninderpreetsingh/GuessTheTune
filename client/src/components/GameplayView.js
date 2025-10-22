import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, ListMusic, AlertCircle, Loader, CheckCircle2, Disc3 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import BuzzButton from './BuzzButton';
import JudgeControls from './JudgeControls';
import WinnerModal from './WinnerModal';
import TrackSearch from './TrackSearch';
import { SOCKET_EVENTS } from '../utils/constants';

const GameplayView = ({ roomCode, onChangePlaylist }) => {
  const { socket, isHost, players, setPlayers, room, setRoom, displayName } = useGame();
  const [currentGuesser, setCurrentGuesser] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [winner, setWinner] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState('initializing'); // initializing, waiting, starting, playing, error
  const playbackInitiatedRef = useRef(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showTrackSearch, setShowTrackSearch] = useState(false); // New state

  useEffect(() => {
    // Use room.playlist as the source of truth (it's shuffled by the server)
    if (room && room.playlist && room.currentTrackIndex >= 0 && room.currentTrackIndex < room.playlist.length) {
      setCurrentTrack(room.playlist[room.currentTrackIndex]);
    }
  }, [room]);

  // Spotify player hook (only for host)
  const {
    isReady,
    deviceId,
    error: playerError,
    startPlayback,
    verifyPlayerReady,
    pausePlayback,
    resumePlayback,
  } = useSpotifyPlayer(isHost);

  // Dynamically determine if current player is the judge
  const currentJudge = room?.players?.[room.currentJudgeIndex];
  const isJudge = currentJudge?.socketId === socket?.id;
  const canBuzzIn = !isJudge && !currentGuesser;

  // Start playback when Spotify player is ready (host only)
  useEffect(() => {
    // Use room.playlist as the source of truth
    const playlist = room?.playlist;

    if (!isHost || !isReady || !deviceId || !playlist || playlist.length === 0 || isPlaying) {
      return;
    }

    // Prevent multiple playback initiations
    if (playbackInitiatedRef.current) {
      return;
    }

    const initializePlayback = async () => {
      playbackInitiatedRef.current = true;

      try {
        setPlaybackStatus('verifying');

        // Verify the player is ready with retry logic
        const verification = await verifyPlayerReady();

        if (!verification.ready) {
          setPlaybackStatus('verification_failed');
          playbackInitiatedRef.current = false; // Allow retry on failure
          return;
        }

        setPlaybackStatus('starting');

        // Get track URIs for the playlist
        const uris = playlist.map(track => track.uri);

        // Try to start playback
        const success = await startPlayback(uris, verification.deviceId);

        if (success) {
          setIsPlaying(true);
          setPlaybackStatus('playing');
        } else {
          // If SDK method fails, show error
          setPlaybackStatus('error');
          playbackInitiatedRef.current = false; // Allow retry on failure
        }
      } catch (error) {
        setPlaybackStatus('error');
        playbackInitiatedRef.current = false; // Allow retry on failure
      }
    };

    initializePlayback();
  }, [isHost, isReady, deviceId, isPlaying, startPlayback, verifyPlayerReady, room]);

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
      if (isHost) {
        const newTrack = room.playlist[room.currentTrackIndex];
        if (newTrack) {
          startPlayback([newTrack.uri]);
        }
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_IS_GUESSING);
      socket.off(SOCKET_EVENTS.ROUND_OVER);
      socket.off(SOCKET_EVENTS.GUESS_TIME_EXPIRED);
      socket.off(SOCKET_EVENTS.GAME_OVER);
      socket.off('songChanged');
    };
  }, [socket, isHost, setPlayers, pausePlayback, resumePlayback, setRoom, startPlayback]);

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

  const handleNextSong = async () => {
    if (!socket || !isHost) return;

    socket.emit(SOCKET_EVENTS.NEXT_SONG, { roomCode });
  };

  const handleJudgment = (isCorrect) => {
    if (!socket || !isJudge) return;

    socket.emit(SOCKET_EVENTS.SUBMIT_JUDGMENT, {
      roomCode,
      isCorrect,
    });
  };

  const handlePauseSong = async () => {
    if (!socket || !isHost) return;
    await pausePlayback();
    setIsPlaying(false);
  };

  const handleResumeSong = async () => {
    if (!socket || !isHost) return;
    await resumePlayback();
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6">
      {/* Player Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass text-center py-3"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="text-2xl">{isJudge ? '⚖️' : '🎮'}</div>
          <div>
            <p className="text-lg font-bold gradient-text">{displayName}</p>
            <p className="text-xs text-secondary-text">
              {isJudge ? 'You are the Judge' : 'Player'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Game Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass"
      >
        <div className="text-center">
          {/* Judge Info - Shows song to the judge */}
          {isJudge && currentTrack && (
            <div className="mb-6">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Disc3 className="text-neon-purple" size={20} />
                <span className="text-sm font-semibold gradient-text">Judge Info</span>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 card-glass"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center flex-shrink-0 shadow-glow-purple">
                    <Music className="text-white" size={32} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xl font-bold mb-1 gradient-text">{currentTrack.name}</p>
                    <p className="text-sm text-secondary-text">{currentTrack.artist}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Host Controls - Spotify player controls */}
          {isHost && (
            <div className="mb-6">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Disc3 className="text-neon-purple" size={20} />
                <span className="text-sm font-semibold gradient-text">Music Player</span>
              </div>
              {playerError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 rounded-xl p-4 mb-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-red-400 font-semibold mb-1">Error</p>
                      <p className="text-sm text-red-300">{playerError}</p>
                      <p className="text-xs text-secondary-text mt-2">
                        Make sure you're logged in with a Spotify Premium account
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {!isReady && !playerError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-3 text-neon-cyan mb-4"
                >
                  <Loader className="animate-spin" size={20} />
                  <p>Initializing Spotify Player...</p>
                </motion.div>
              )}
              {isReady && playbackStatus === 'verifying' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 flex flex-col items-center gap-2"
                >
                  <Loader className="text-neon-cyan animate-spin" size={24} />
                  <p className="text-neon-cyan font-semibold">
                    Verifying device is ready...
                  </p>
                  <p className="text-xs text-secondary-text">
                    This may take a few seconds
                  </p>
                </motion.div>
              )}
              {isReady && playbackStatus === 'starting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-3 text-neon-purple mb-4"
                >
                  <Loader className="animate-spin" size={20} />
                  <p className="font-semibold">Starting playback...</p>
                </motion.div>
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 mb-6"
                  >
                    <CheckCircle2 className="text-spotify-green" size={24} />
                    <p className="text-spotify-green font-semibold text-lg">
                      Music is playing!
                    </p>
                  </motion.div>
                  <div className="flex justify-center gap-3 mb-4 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextSong}
                      className="btn-secondary flex items-center gap-2"
                      disabled={currentGuesser !== null}
                    >
                      <SkipForward size={18} />
                      <span>Next Song</span>
                    </motion.button>
                    {isPlaying ? (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePauseSong}
                        className="btn-secondary flex items-center gap-2"
                        disabled={currentGuesser !== null}
                      >
                        <Pause size={18} />
                        <span>Pause</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleResumeSong}
                        className="btn-secondary flex items-center gap-2"
                        disabled={currentGuesser !== null}
                      >
                        <Play size={18} />
                        <span>Resume</span>
                      </motion.button>
                    )}
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTrackSearch(true)}
                      className="btn-tertiary flex items-center gap-2"
                      disabled={currentGuesser !== null}
                    >
                      <Music size={18} />
                      <span>Choose Next Song</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onChangePlaylist}
                      className="btn-tertiary flex items-center gap-2"
                      disabled={currentGuesser !== null}
                    >
                      <ListMusic size={18} />
                      <span>Change Playlist</span>
                    </motion.button>
                  </div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-4"
              >
                <Music className="mx-auto text-neon-purple" size={64} />
              </motion.div>
              <p className="text-2xl font-bold mb-2 gradient-text">
                Listen to the music!
              </p>
              <p className="text-secondary-text">
                Click "I Know It!" when you recognize the song
              </p>
            </motion.div>
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

      {/* Track Search Modal */}
      {isHost && showTrackSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-primary-bg rounded-lg p-6 w-full max-w-md"
          >
            <button
              onClick={() => setShowTrackSearch(false)}
              className="absolute top-3 right-3 text-secondary-text hover:text-white text-2xl"
            >
              &times;
            </button>
            <TrackSearch onTrackSelected={() => setShowTrackSearch(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GameplayView;
