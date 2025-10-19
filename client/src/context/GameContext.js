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

    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);

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


      socket.emit('rejoinAsHost', {
        roomCode: storedRoomCode,
        hostToken: storedToken,
      });

      // Handle successful rejoin
      socket.once('hostRejoined', ({ roomCode: joinedRoomCode, room, hostToken: newToken }) => {

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
      if (waitingForReconnect) {
        setGameState('waiting');
      }
    });

    // Handle host reconnection notifications (for other players)
    socket.on('hostReconnected', ({ message, room }) => {
      setPlayers(room.players);
      setGameState(room.gameState);
    });

    return () => {
      socket.off('hostDisconnected');
      socket.off('hostReconnected');
    };
  }, [socket]);

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
    isConnected,
    hostToken,
    setHostToken,
    isReconnecting,
    room, // Add this
    setRoom, // Add this
  }), [socket, isHost, displayName, roomCode, players, gameState, isConnected, hostToken, isReconnecting, room, setRoom]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
