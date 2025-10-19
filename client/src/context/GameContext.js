import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('idle'); // idle, lobby, playing, guessing, gameOver
  const [currentScore, setCurrentScore] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:8080', {
      autoConnect: false,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    isHost,
    setIsHost,
    displayName,
    setDisplayName,
    roomCode,
    setRoomCode,
    players,
    setPlayers,
    gameState,
    setGameState,
    currentScore,
    setCurrentScore,
    isConnected,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
