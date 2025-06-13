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
import { paymentRequestsApi, PaymentRequest } from '@/services/paymentRequests';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreatePaymentRequestDialog } from './create-payment-request-dialog';
import { RecordPaymentDialog } from './record-payment-dialog';

export default function PaymentRequestsPage() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);

  const fetchPaymentRequests = async () => {
    try {
      const data = await paymentRequestsApi.getAll();
      setPaymentRequests(data);
    } catch (error) {
      toast.error('Failed to fetch payment requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const handleStatusChange = async (id: number, currentStatus: PaymentRequest['status']) => {
    const newStatus = currentStatus === 'PENDING' ? 'PAID' : 'PENDING';
    try {
      await paymentRequestsApi.updateStatus(id, newStatus);
      toast.success(`Payment request ${newStatus.toLowerCase()} successfully`);
      fetchPaymentRequests();
    } catch (error) {
      toast.error('Failed to update payment request status');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6 text-white">
        <h1 className="text-2xl font-bold text-white">Payment Requests</h1>
        <Button className="bg-gray-800 text-white hover:bg-gray-700" onClick={() => setIsCreateDialogOpen(true)}>Create Payment Request</Button>
      </div>

      <Table>
        <TableHeader className="text-white bg-transparent">
          <TableRow>
            <TableHead>Target</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {request.team ? (
                  <span className="text-blue-500">Team: {request.team.name}</span>
                ) : (
                  request.targetUser.name
                )}
              </TableCell>
              <TableCell>{request.description}</TableCell>
              <TableCell>${request.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </span>
              </TableCell>
              <TableCell>
                {request.dueDate ? format(new Date(request.dueDate), 'MMM d, yyyy') : 'No due date'}
              </TableCell>
              <TableCell>{request.createdBy.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Record Payment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(request.id, request.status)}
                  >
                    {request.status === 'PENDING' ? 'Mark as Paid' : 'Mark as Pending'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreatePaymentRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchPaymentRequests();
        }}
      />

      {selectedRequest && (
        <RecordPaymentDialog
          paymentRequest={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
            fetchPaymentRequests();
          }}
        />
      )}
    </div>
  );
} 