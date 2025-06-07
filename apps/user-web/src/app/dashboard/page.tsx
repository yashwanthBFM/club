"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { env } from '@/config/env';
import styles from './dashboard.module.css';
import { fetchGames, registerForGame } from '../api';
import api from '@/lib/api';

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

interface Game {
  id: number;
  title: string;
  description: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location: string;
}

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [registeringGameId, setRegisteringGameId] = useState<number | null>(null);

  const loadGames = async () => {
    try {
      const gamesData = await fetchGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem(env.auth.tokenKey);
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Fetch polls
        const pollsResponse = await api.get('/polls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const pollsData = pollsResponse.data;
        setPolls(pollsData);

        // Fetch notifications
        const notificationsResponse = await api.get('/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const notificationsData = notificationsResponse.data;
        setNotifications(notificationsData);

        // Fetch payment requests
        const paymentsResponse = await api.get('/payment-requests/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const paymentsData = paymentsResponse.data;
        setPaymentRequests(paymentsData);

        // Fetch games
        await loadGames();

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
      const token = localStorage.getItem(env.auth.tokenKey);
      const response = await api.post(`/polls/${pollId}/vote`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ optionId })
      });

      if (response.data) {
        // Refresh polls after voting
        const pollsResponse = await api.get('/polls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const pollsData = pollsResponse.data;
        setPolls(pollsData);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePayment = async (paymentId: number) => {
    try {
      const token = localStorage.getItem(env.auth.tokenKey);
      const response = await api.post(`/payments/${paymentId}/pay`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setPaymentRequests(paymentRequests.map(payment =>
          payment.id === paymentId ? { ...payment, status: 'paid' } : payment
        ));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleRegister = async (gameId: number) => {
    try {
      setRegisteringGameId(gameId);
      await registerForGame(gameId);
      alert('Successfully registered for the game!');
      // Refresh the games list to show updated registration status
      await loadGames();
    } catch (error) {
      console.error('Error registering for game:', error);
      alert('Failed to register for the game. Please try again.');
    } finally {
      setRegisteringGameId(null);
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
            {notifications && notifications.map(notification => (
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
                {payment.status === 'paid' && <p className={styles.status}>Paid</p>}
                {payment.status === 'overdue' && <p className={styles.status}>Overdue</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className={styles.section}>
          <h2>Upcoming Games</h2>
          <div className={styles.cards}>
            {games.map(game => (
              <div key={game.id} className={styles.card}>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <p>Max Participants: {game.maxParticipants}</p>
                <p>Start Date: {new Date(game.startDate).toLocaleString()}</p>
                <p>End Date: {new Date(game.endDate).toLocaleString()}</p>
                <p>Location: {game.location}</p>
                <button
                  onClick={() => handleRegister(game.id)}
                  disabled={registeringGameId === game.id}
                  className={styles.registerButton}
                >
                  {registeringGameId === game.id ? 'Registering...' : 'Register'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}