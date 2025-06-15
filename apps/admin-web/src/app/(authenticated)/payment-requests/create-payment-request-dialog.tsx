'use client';

import { useState, useEffect } from 'react';
import { paymentRequestsApi, CreatePaymentRequestData } from '@/services/paymentRequests';
import { toast } from 'sonner';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members: {
    user: {
      id: number;
      name: string;
      email: string;
    };
    role: string;
  }[];
  createdBy: {
    id: number;
    name: string;
  };
}

interface CreatePaymentRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePaymentRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePaymentRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [requestType, setRequestType] = useState<'user' | 'team'>('user');
  const [formData, setFormData] = useState<CreatePaymentRequestData>({
    description: '',
    amount: 0,
    dueDate: '',
  });

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const [usersResponse, teamsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/teams')
        ]);
        setUsers(usersResponse.data);
        setTeams(teamsResponse.data);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await paymentRequestsApi.create(formData);
      toast.success('Payment request created successfully');
      onSuccess();
      setFormData({
        description: '',
        amount: 0,
        dueDate: '',
      });
      setRequestType('user');
    } catch (error) {
      toast.error('Failed to create payment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create Payment Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Request Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={requestType === 'user'}
                    onChange={() => {
                      setRequestType('user');
                      setFormData({ ...formData, teamId: undefined, targetUserId: undefined });
                    }}
                    className="form-radio"
                  />
                  <span className="ml-2">Individual</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="team"
                    checked={requestType === 'team'}
                    onChange={() => {
                      setRequestType('team');
                      setFormData({ ...formData, targetUserId: undefined, teamId: undefined });
                    }}
                    className="form-radio"
                  />
                  <span className="ml-2">Team</span>
                </label>
              </div>
            </div>

            {requestType === 'user' ? (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetUser">
                  Target User
                </label>
                <select
                  id="targetUser"
                  value={formData.targetUserId || ''}
                  onChange={(e) => setFormData({ ...formData, targetUserId: parseInt(e.target.value) })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="team">
                  Team
                </label>
                <select
                  id="team"
                  value={formData.teamId || ''}
                  onChange={(e) => setFormData({ ...formData, teamId: parseInt(e.target.value) })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.members.length} members)
                    </option>
                  ))}
                </select>
                {formData.teamId && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Team members:</p>
                    <ul className="list-disc list-inside">
                      {teams.find(t => t.id === formData.teamId)?.members.map(member => (
                        <li key={member.user.id}>
                          {member.user.name} ({member.role})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                Due Date (Optional)
              </label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 