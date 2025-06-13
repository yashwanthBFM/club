import api from '@/lib/api';

export interface PaymentRequest {
  id: number;
  targetUserId: number;
  teamId?: number;
  createdById: number;
  description: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  targetUser: {
    id: number;
    name: string;
    email: string;
  };
  team?: {
    id: number;
    name: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
  payments: {
    id: number;
    amountPaid: number;
    paymentDate: string;
  }[];
}

export interface CreatePaymentRequestData {
  targetUserId?: number;
  teamId?: number;
  description: string;
  amount: number;
  dueDate?: string;
}

export const paymentRequestsApi = {
  getAll: async (): Promise<PaymentRequest[]> => {
    const response = await api.get('/payment-requests');
    return response.data;
  },

  create: async (data: CreatePaymentRequestData): Promise<PaymentRequest> => {
    const response = await api.post('/payment-requests', data);
    return response.data;
  },

  updateStatus: async (id: number, status: PaymentRequest['status']): Promise<PaymentRequest> => {
    const response = await api.put(`/payment-requests/${id}/status`, { status });
    return response.data;
  },

  recordPayment: async (id: number, data: {
    amountPaid: number;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/payment-requests/${id}/payments`, data);
    return response.data;
  },

  getPayments: async (id: number): Promise<any[]> => {
    const response = await api.get(`/payment-requests/${id}/payments`);
    return response.data;
  },
}; 