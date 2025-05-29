import api from '@/lib/api';

export interface PollOption {
  id: number;
  text: string;
  pollId: number;
  _count?: {
    votes: number;
  };
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  options: PollOption[];
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  _count: {
    votes: number;
  };
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
}

export interface UpdatePollData {
  title?: string;
  description?: string;
  options?: string[];
}

export const getPolls = async (): Promise<Poll[]> => {
  const response = await api.get('/polls');
  return response.data;
};

export const getPoll = async (id: number): Promise<Poll> => {
  const response = await api.get(`/polls/${id}`);
  return response.data;
};

export const createPoll = async (pollData: CreatePollData): Promise<Poll> => {
  const response = await api.post('/polls', pollData);
  return response.data;
};

export const updatePoll = async (id: number, pollData: UpdatePollData): Promise<Poll> => {
  const response = await api.put(`/polls/${id}`, pollData);
  return response.data;
};

export const deletePoll = async (id: number): Promise<void> => {
  await api.delete(`/polls/${id}`);
};

export const getPollResults = async (id: number): Promise<Poll> => {
  const response = await api.get(`/polls/${id}/results`);
  return response.data;
}; 