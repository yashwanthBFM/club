"use client";

import { useState } from 'react';
import styles from './login.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { env } from '@/config/env';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem(env.auth.tokenKey, token);
        router.push('/dashboard');
      } else {
        setError('Login successful, but no token received.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className={styles.signupText}>
          Don't have an account? <Link href="/register">Sign up</Link>
        </p>
        <p className={styles.homeLink}>
          <Link href="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
} 