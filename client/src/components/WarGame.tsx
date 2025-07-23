import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WarGame.css';

const WarGame: React.FC = () => {
  const [gameState, setGameState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial game state or setup WebSocket connection
    const fetchGameState = async () => {
      try {
        const response = await fetch('/api/war-game/state');
        const data = await response.json();
        setGameState(data);
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    };

    fetchGameState();
  }, []);

  const handleStartGame = async () => {
    try {
      const response = await fetch('/api/war-game/start', { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleLeaveGame = () => {
    navigate('/home');
  };

  return (
    <div className="war-game">
      <h1>War Game</h1>
      {gameState ? (
        <div>
          <p>Game State: {JSON.stringify(gameState)}</p>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      ) : (
        <p>Loading game state...</p>
      )}
      <button onClick={handleLeaveGame}>Leave Game</button>
    </div>
  );
};

export default WarGame;