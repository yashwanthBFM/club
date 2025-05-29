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
import { announcementsApi } from '@/services/announcements';
import { Announcement } from '@prisma/client';
import { toast } from 'sonner';
import { CreateAnnouncementDialog } from './create-announcement-dialog';
import { EditAnnouncementDialog } from './edit-announcement-dialog';
import { format } from 'date-fns';

type AnnouncementType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

interface ExtendedAnnouncement extends Announcement {
  type?: AnnouncementType;
  startDate?: Date;
  endDate?: Date;
  createdBy?: { name: string };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<ExtendedAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ExtendedAnnouncement | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementsApi.getAll();
      console.log(data);
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await announcementsApi.delete(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await announcementsApi.updateStatus(id, newStatus as 'ACTIVE' | 'INACTIVE');
      toast.success(`Announcement ${newStatus.toLowerCase()} successfully`);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update announcement status');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Announcement</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell>{announcement.title}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  announcement.type === 'INFO' ? 'bg-blue-100 text-blue-800' :
                  announcement.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                  announcement.type === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {announcement.type || 'INFO'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {announcement.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </TableCell>
              <TableCell>{format(new Date(announcement.startDate || announcement.createdAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>{format(new Date(announcement.endDate || announcement.updatedAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>{announcement.createdBy?.name || 'Unknown'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAnnouncement(announcement)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(announcement.id, announcement.isActive ? 'ACTIVE' : 'INACTIVE')}
                  >
                    {announcement.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateAnnouncementDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchAnnouncements();
        }}
      />

      {editingAnnouncement && (
        <EditAnnouncementDialog
          announcement={editingAnnouncement}
          open={!!editingAnnouncement}
          onOpenChange={(open) => !open && setEditingAnnouncement(null)}
          onSuccess={() => {
            setEditingAnnouncement(null);
            fetchAnnouncements();
          }}
        />
      )}
    </div>
  );
} 