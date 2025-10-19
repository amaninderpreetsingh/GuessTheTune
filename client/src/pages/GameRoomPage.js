import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import PlayerList from '../components/PlayerList';
import PlaylistSelector from '../components/PlaylistSelector';
import GameplayView from '../components/GameplayView';

const GameRoomPage = () => {
  const { roomCode: urlRoomCode } = useParams();
  const navigate = useNavigate();
  const {
    socket,
    isHost,
    roomCode: globalRoomCode,
    setRoomCode,
    players,
    setPlayers,
    setGameState,
    setRoom,
  } = useGame();

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [currentView, setCurrentView] = useState('playlist'); // playlist, playing

  const roomCode = globalRoomCode || urlRoomCode;

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    setRoomCode(roomCode);
  }, [roomCode, navigate, setRoomCode]);

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Listen for game started event
    socket.on('gameStarted', ({ room }) => {
      setGameState('playing');
      setCurrentView('playing');
      setPlayers(room.players);
      setRoom(room);
    });

    // Listen for player updates
    socket.on('playerJoined', ({ room }) => {
      setPlayers(room.players);
      setRoom(room);
    });

    socket.on('playerLeft', ({ room }) => {
      setPlayers(room.players);
      setRoom(room);
    });

    // Listen for host disconnect
    socket.on('hostDisconnected', () => {
      alert('The host has left. Returning to home page.');
      navigate('/');
    });

    return () => {
      socket.off('gameStarted');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('hostDisconnected');
    };
  }, [socket, navigate, setGameState, setPlayers, setRoom]);

  const handlePlaylistSelected = (playlist, tracks) => {
    setSelectedPlaylist(playlist);
    setPlaylistTracks(tracks);
  };

  const handleStartGame = () => {
    if (!socket || !selectedPlaylist || playlistTracks.length === 0) {
      return;
    }

    // Emit start game event
    socket.emit('startGame', {
      roomCode,
      playlist: playlistTracks,
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">GuessTheTune</h1>
            <p className="text-secondary-text">Room: {roomCode}</p>
          </div>
          <div className="card py-2 px-4">
            <p className="text-sm text-secondary-text">Players</p>
            <p className="text-2xl font-bold">{players.length}</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {currentView === 'playlist' && isHost && (
                <motion.div
                  key="playlist"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <PlaylistSelector
                    onPlaylistSelected={handlePlaylistSelected}
                    selectedPlaylist={selectedPlaylist}
                  />

                  {selectedPlaylist && playlistTracks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartGame}
                        className="btn-primary text-lg px-12 py-4"
                      >
                        Start Game
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {currentView === 'playlist' && !isHost && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card text-center py-16"
                >
                  <div className="text-6xl mb-4">🎵</div>
                  <h2 className="text-2xl font-bold mb-2">
                    Waiting for Host
                  </h2>
                  <p className="text-secondary-text">
                    The host is selecting a playlist...
                  </p>
                </motion.div>
              )}

              {currentView === 'playing' && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GameplayView
                    roomCode={roomCode}
                    playlistTracks={playlistTracks}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Player List */}
          <div className="md:col-span-1">
            <PlayerList players={players} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoomPage;
