import api from '@/lib/api';
import { Announcement } from '@prisma/client';

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  startDate: string;
  endDate: string;
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}

export const announcementsApi = {
  // Get all announcements
  getAll: async (): Promise<Announcement[]> => {
    const response = await api.get('/announcements');
    return response.data.announcements;
  },

  // Create new announcement
  create: async (data: CreateAnnouncementData): Promise<Announcement> => {
    const response = await api.post('/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update announcement
  update: async (id: number, data: UpdateAnnouncementData): Promise<Announcement> => {
    const response = await api.put(`/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete announcement
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/announcements/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Update announcement status
  updateStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Announcement> => {
    const response = await api.patch(`/announcements/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return response.data;
  },
}; 