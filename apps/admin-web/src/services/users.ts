import api from '@/lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: UpdateUserData): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updateUserStatus = async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> => {
  const response = await api.put(`/users/${id}/status`, { status });
  return response.data;
}; 