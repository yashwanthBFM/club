const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const createGame = async (gameData: {
  title: string;
  description: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(gameData),
  });
  if (!response.ok) {
    throw new Error('Failed to create game');
  }
  return response.json();
};

export const fetchGames = async () => {
  const response = await fetch(`${API_BASE_URL}/games`);
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }
  return response.json();
};

export const registerForGame = async (gameId: number) => {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to register for game');
  }
  return response.json();
}; 