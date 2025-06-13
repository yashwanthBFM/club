'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  members: {
    user: User;
    role: string;
  }[];
}

interface AddMemberDialogProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMemberDialog({
  team,
  open,
  onOpenChange,
  onSuccess,
}: AddMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        // Filter out users who are already team members
        const existingMemberIds = team.members.map(m => m.user.id);
        const availableUsers = response.data.filter(
          (user: User) => !existingMemberIds.includes(user.id)
        );
        setUsers(availableUsers);
      } catch (error) {
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, [open, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsSubmitting(true);
    try {
      await api.post(`/teams/${team.id}/members`, {
        userId: parseInt(selectedUserId),
      });
      toast.success('Member added successfully');
      onSuccess();
      setSelectedUserId('');
    } catch (error) {
      toast.error('Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Member to {team.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedUserId}>
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 