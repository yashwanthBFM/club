"use client";

import React, { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { fetchGames, registerForGame } from '../api';

interface Game {
  id: number;
  title: string;
  description: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadGames = async () => {
    try {
      const data = await fetchGames();
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(env.auth.tokenKey);
    setIsLoggedIn(!!token);
    loadGames();
  }, []);

  const handleRegister = async (gameId: number) => {
    try {
      setLoading(true);
      await registerForGame(gameId);
      alert('Successfully registered for the game!');
      // Refresh the games list to show updated registration status
      await loadGames();
    } catch (error) {
      console.error('Error registering for game:', error);
      alert('Failed to register for the game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Available Games</h1>
      <ul>
        {games.map((game) => (
          <li key={game.id} style={{ marginBottom: '2rem' }}>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <p>Max Participants: {game.maxParticipants}</p>
            <p>Start Date: {new Date(game.startDate).toLocaleString()}</p>
            <p>End Date: {new Date(game.endDate).toLocaleString()}</p>
            <p>Location: {game.location}</p>
            {isLoggedIn ? (
              <button 
                onClick={() => handleRegister(game.id)}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            ) : (
              <p>Please log in to register for this game.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 