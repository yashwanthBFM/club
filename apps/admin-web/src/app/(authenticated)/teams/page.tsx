'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CreateTeamDialog } from './create-team-dialog';
import { AddMemberDialog } from './add-member-dialog';

interface User {
  id: number;
  name: string;
  email: string;
}

interface TeamMember {
  user: User;
  role: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members: TeamMember[];
  createdBy: {
    id: number;
    name: string;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleRemoveMember = async (teamId: number, userId: number) => {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      toast.success('Member removed successfully');
      fetchTeams();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Teams</h1>
        <Button 
          className="bg-gray-800 text-white hover:bg-gray-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Team
        </Button>
      </div>

      <Table>
        <TableHeader className="text-white bg-transparent">
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="text-white">{team.name}</TableCell>
              <TableCell className="text-white">{team.description || '-'}</TableCell>
              <TableCell className="text-white">{team.createdBy.name}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between">
                      <span className="text-white">
                        {member.user.name} ({member.role})
                      </span>
                      {member.role !== 'CAPTAIN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveMember(team.id, member.user.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeam(team)}
                >
                  Add Member
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchTeams();
        }}
      />

      {selectedTeam && (
        <AddMemberDialog
          team={selectedTeam}
          open={!!selectedTeam}
          onOpenChange={(open) => !open && setSelectedTeam(null)}
          onSuccess={() => {
            setSelectedTeam(null);
            fetchTeams();
          }}
        />
      )}
    </div>
  );
} 