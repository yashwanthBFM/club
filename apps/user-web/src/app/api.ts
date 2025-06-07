import api from '@/lib/api';
import { env } from '@/config/env';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://https://club-m1gy.onrender.com';

export const createGame = async (gameData: {
  title: string;
  description: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location?: string;
}) => {
  const response = await api.post('/api/games', gameData);
  return response.data;
};

export const fetchGames = async () => {
  const response = await api.get('/games');
  return response.data;
};

export const registerForGame = async (gameId: number) => {
  const response = await api.post(`/games/${gameId}/register`);
  return response.data;
}; 