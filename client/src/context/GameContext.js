import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  const [hostToken, setHostToken] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [room, setRoom] = useState(null);

  // Initialize socket connection

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

  // Auto-reconnect as host if hostToken exists in localStorage
  useEffect(() => {
    if (!socket || !isConnected || isReconnecting) return;

    const storedToken = localStorage.getItem('hostToken');
    const storedRoomCode = localStorage.getItem('roomCode');
    const storedDisplayName = localStorage.getItem('displayName');

    if (storedToken && storedRoomCode && storedDisplayName && !roomCode) {
      setIsReconnecting(true);
      console.log('Attempting to rejoin as host...');

      socket.emit('rejoinAsHost', {
        roomCode: storedRoomCode,
        hostToken: storedToken,
      });

      // Handle successful rejoin
      socket.once('hostRejoined', ({ roomCode: joinedRoomCode, room, hostToken: newToken }) => {
        console.log('Successfully rejoined as host');
        setRoomCode(joinedRoomCode);
        setPlayers(room.players);
        setIsHost(true);
        setDisplayName(storedDisplayName);
        setHostToken(newToken);
        setGameState(room.gameState === 'lobby' ? 'lobby' : 'playing');
        setIsReconnecting(false);
      });

      // Handle failed rejoin
      socket.once('rejoinFailed', () => {
        console.log('Failed to rejoin as host - clearing stored token');
        localStorage.removeItem('hostToken');
        localStorage.removeItem('roomCode');
        localStorage.removeItem('displayName');
        setIsReconnecting(false);
      });
    }
  }, [socket, isConnected, roomCode, isReconnecting]);

  // Listen for host-related socket events
  useEffect(() => {
    if (!socket) return;

    // Handle host disconnection notifications (for other players)
    socket.on('hostDisconnected', ({ message, waitingForReconnect }) => {
      console.log(message);
      if (waitingForReconnect) {
        setGameState('waiting');
      }
    });

    // Handle host reconnection notifications (for other players)
    socket.on('hostReconnected', ({ message, room }) => {
      console.log(message);
      setPlayers(room.players);
      setGameState(room.gameState);
    });

    return () => {
      socket.off('hostDisconnected');
      socket.off('hostReconnected');
    };
  }, [socket]);

  // Function to create a room and store the host token
  const createRoom = useCallback((displayName, callback) => {
    if (!socket) return;

    socket.emit('createRoom', { displayName, isHost: true });

    socket.once('roomCreated', ({ roomCode: newRoomCode, room, hostToken: newHostToken }) => {
      setRoomCode(newRoomCode);
      setIsHost(true);
      setPlayers(room.players);
      setGameState('lobby');
      setHostToken(newHostToken);

      // Store in localStorage for auto-reconnection
      localStorage.setItem('hostToken', newHostToken);
      localStorage.setItem('roomCode', newRoomCode);
      localStorage.setItem('displayName', displayName);

      console.log('Room created and host token stored');
      if (callback) callback(newRoomCode);
    });
  }, [socket]);

  // Function to leave the room and clear host token
  const leaveRoom = useCallback(() => {
    if (isHost) {
      localStorage.removeItem('hostToken');
      localStorage.removeItem('roomCode');
      localStorage.removeItem('displayName');
    }
    setRoomCode('');
    setIsHost(false);
    setPlayers([]);
    setGameState('idle');
    setHostToken(null);
  }, [isHost]);

  const value = useMemo(() => ({
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
    hostToken,
    setHostToken,
    isReconnecting,
    createRoom,
    leaveRoom,
    room, // Add this
    setRoom, // Add this
  }), [socket, isHost, displayName, roomCode, players, gameState, currentScore, isConnected, hostToken, isReconnecting, createRoom, leaveRoom, room, setRoom]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
