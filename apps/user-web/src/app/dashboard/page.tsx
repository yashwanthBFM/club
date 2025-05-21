"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

interface PollOption {
  id: number;
  text: string;
  pollId: number;
}

interface Poll {
  id: number;
  title: string;
  description: string;
  createdAt: string;
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

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface PaymentRequest {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Fetch polls
        const pollsResponse = await fetch('http://localhost:3000/polls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const pollsData = await pollsResponse.json();
        setPolls(pollsData);

        // Fetch notifications
        const notificationsResponse = await fetch('http://localhost:3000/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);

        // Fetch payment requests
        const paymentsResponse = await fetch('http://localhost:3000/payment-requests/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const paymentsData = await paymentsResponse.json();
        setPaymentRequests(paymentsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ optionId })
      });

      if (response.ok) {
        // Refresh polls after voting
        const pollsResponse = await fetch('http://localhost:3000/polls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const pollsData = await pollsResponse.json();
        setPolls(pollsData);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePayment = async (paymentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/payments/${paymentId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPaymentRequests(paymentRequests.map(payment =>
          payment.id === paymentId ? { ...payment, status: 'paid' } : payment
        ));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <Link href="/" className={styles.homeLink}>Home</Link>
      </header>

      <div className={styles.grid}>
        {/* Polls Section */}
        <section className={styles.section}>
          <h2>Active Polls</h2>
          <div className={styles.cards}>
            {polls.map(poll => (
              <div key={poll.id} className={styles.card}>
                <h3>{poll.title}</h3>
                <p>{poll.description}</p>
                <p className={styles.deadline}>Created: {new Date(poll.createdAt).toLocaleDateString()}</p>
                <p className={styles.votes}>Total votes: {poll._count.votes}</p>
                <div className={styles.options}>
                  {poll.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleVote(poll.id, option.id)}
                      className={styles.optionButton}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications Section */}
        <section className={styles.section}>
          <h2>Notifications</h2>
          <div className={styles.cards}>
            {notifications.map(notification => (
              <div key={notification.id} className={`${styles.card} ${!notification.read ? styles.unread : ''}`}>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <p className={styles.date}>{notification.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Requests Section */}
        <section className={styles.section}>
          <h2>Payment Requests</h2>
          <div className={styles.cards}>
            {paymentRequests.map(payment => (
              <div key={payment.id} className={`${styles.card} ${styles[payment.status]}`}>
                <h3>{payment.title}</h3>
                <p className={styles.amount}>Amount: ${payment.amount}</p>
                <p className={styles.dueDate}>Due: {payment.dueDate}</p>
                {payment.status === 'pending' && (
                  <button
                    onClick={() => handlePayment(payment.id)}
                    className={styles.payButton}
                  >
                    Pay Now
                  </button>
                )}
                {payment.status === 'paid' && (
                  <p className={styles.status}>Paid</p>
                )}
                {payment.status === 'overdue' && (
                  <p className={styles.status}>Overdue</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 