"use client";

import React, { useState, useEffect } from 'react';
import styles from './register.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  name: string;
  email: string;
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'regular' | 'parent'>('regular');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (userType === 'parent' && (!childName || !childAge)) {
      alert('Child name and age are required for parent registration');
      return;
    }

    try {
      const endpoint = userType === 'parent' ? '/auth/register-parent' : '/auth/register';
      const response = await api.post(endpoint, {
        email,
        password,
        name: `${firstName} ${lastName}`,
        ...(userType === 'parent' && {
          childName,
          childAge: parseInt(childAge),
        }),
      });
      
      const data = response.data;
      if (data) {
        setOtpSent(true);
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'REGISTRATION' }),
      });
      const data = response.data;
      if (data) {
        alert(data.message);
        localStorage.setItem('user', JSON.stringify({ name: `${firstName} ${lastName}`, email }));
        setUser({ name: `${firstName} ${lastName}`, email });
        router.push('/login');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('OTP verification failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h1 className={styles.title}>Create Account</h1>
        {!otpSent ? (
          <form className={styles.registerForm} onSubmit={handleRegister}>
            <div className={styles.inputGroup}>
              <label>Account Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'regular' | 'parent')}
                className={styles.select}
              >
                <option value="regular">Regular Member</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {userType === 'parent' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="childName">Child's Name</label>
                  <input
                    type="text"
                    id="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="childAge">Child's Age</label>
                  <input
                    type="number"
                    id="childAge"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    min="1"
                    max="18"
                    required
                  />
                </div>
              </>
            )}
            <button type="submit" className={styles.registerButton}>Register</button>
          </form>
        ) : (
          <form className={styles.registerForm} onSubmit={handleVerifyOtp}>
            <div className={styles.inputGroup}>
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.registerButton}>Verify OTP</button>
          </form>
        )}
        {user ? (
          <div>
            <p>Welcome, {user.name}!</p>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        ) : (
          <p className={styles.loginText}>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        )}
        <p className={styles.homeLink}>
          <Link href="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
} 