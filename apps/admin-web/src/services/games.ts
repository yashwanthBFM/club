import api from '@/lib/api';

export interface Game {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  createdById: number;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateGameData {
  name: string;
  description: string;
  imageUrl: string;
}

export interface UpdateGameData {
  name?: string;
  description?: string;
  imageUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const getGames = async (): Promise<Game[]> => {
  const response = await api.get('/games');
  return response.data;
};

export const getGame = async (id: number): Promise<Game> => {
  const response = await api.get(`/games/${id}`);
  return response.data;
};

export const createGame = async (gameData: CreateGameData): Promise<Game> => {
  const response = await api.post('/games', gameData);
  return response.data;
};

export const updateGame = async (id: number, gameData: UpdateGameData): Promise<Game> => {
  const response = await api.put(`/games/${id}`, gameData);
  return response.data;
};

export const deleteGame = async (id: number): Promise<void> => {
  await api.delete(`/games/${id}`);
};

export const updateGameStatus = async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Game> => {
  const response = await api.put(`/games/${id}/status`, { status });
  return response.data;
}; 