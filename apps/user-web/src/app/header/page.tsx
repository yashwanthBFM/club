"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { env } from '@/config/env';
import styles from './header.module.css';
import api from '@/lib/api';

interface User {
  name: string;
  email: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem(env.auth.tokenKey);
      if (token) {
        try {
          const response = await api.get<User>('/auth/user-details', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.data) {
            const userData = response.data;
            setUser(userData);
          } else {
            console.error('Failed to fetch user details');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(env.auth.tokenKey);
    setUser(null);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">Football Club</Link>
      </div>
      <nav className={styles.nav}>
        {user ? (
          <div className={styles.userInfo}>
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        ) : (
          <div className={styles.authButtons}>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
} 