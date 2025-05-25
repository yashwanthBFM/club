"use client";

import Link from 'next/link';
import styles from './page.module.css';
import Announcements from './components/Announcements';
import React, { useEffect, useState } from 'react';
import { fetchGames } from './api';

interface Game {
  id: number;
  title: string;
  description: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location: string;
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const loadGames = async () => {
      try {
        const data = await fetchGames();
        setGames(data);
      } catch (error) {
        console.error('Error loading games:', error);
      }
    };
    loadGames();
  }, []);

  const handleRegister = (gameId: number) => {
    // TODO: Implement registration logic (API call)
    alert(`Registering for game with ID: ${gameId}`);
  };

  return (
    <div className={styles.parallaxContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to Football Club</h1>
          <p className={styles.heroSubtitle}>
            Join us for exciting matches, professional training, and a vibrant community
          </p>
          <div>
            <Link href="/register" className={`${styles.button} ${styles.primaryButton}`}>
              Join Now
            </Link>
            <Link href="/login" className={`${styles.button} ${styles.secondaryButton}`}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <Announcements />

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.aboutTitle}>Why Choose Us?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Professional Training</h3>
              <p className={styles.featureDescription}>
                Train with experienced coaches and improve your skills with our state-of-the-art facilities
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Community Focus</h3>
              <p className={styles.featureDescription}>
                Be part of a supportive community that shares your passion for football
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Excellence</h3>
              <p className={styles.featureDescription}>
                Compete in leagues and tournaments while maintaining the highest standards of sportsmanship
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className={styles.eventsSection}>
        <div className={styles.eventsContent}>
          <h2 className={styles.eventsTitle}>Upcoming Events</h2>
          <div className={styles.eventsGrid}>
            <div className={styles.eventCard}>
              <h3 className={styles.eventTitle}>Weekend Tournament</h3>
              <p className={styles.eventDate}>June 15-16, 2024</p>
              <p className={styles.eventDescription}>
                Join us for an exciting weekend of competitive matches and team building
              </p>
              <Link href="/events" className={`${styles.button} ${styles.primaryButton}`}>
                Learn More
              </Link>
            </div>
            <div className={styles.eventCard}>
              <h3 className={styles.eventTitle}>Summer Training Camp</h3>
              <p className={styles.eventDate}>July 1-14, 2024</p>
              <p className={styles.eventDescription}>
                Intensive training program for players looking to take their game to the next level
              </p>
              <Link href="/events" className={`${styles.button} ${styles.primaryButton}`}>
                Learn More
              </Link>
            </div>
            <div className={styles.eventCard}>
              <h3 className={styles.eventTitle}>Community Match Day</h3>
              <p className={styles.eventDate}>Every Saturday</p>
              <p className={styles.eventDescription}>
                Regular friendly matches open to all members of our community
              </p>
              <Link href="/events" className={`${styles.button} ${styles.primaryButton}`}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className={styles.joinSection}>
        <div className={styles.joinContent}>
          <h2 className={styles.joinTitle}>Become Part of Our Team</h2>
          <p className={styles.joinDescription}>
            Whether you're a seasoned player or just starting out, we welcome everyone to join our football family.
            Experience the thrill of the game and make lasting friendships.
          </p>
          <Link href="/register" className={`${styles.button} ${styles.primaryButton}`}>
            Join Now
          </Link>
        </div>
      </section>

      <section className={styles.gamesSection}>
        <div className={styles.gamesContent}>
          <h2 className={styles.gamesTitle}>Upcoming Games</h2>
          <ul>
            {games.map((game) => (
              <li key={game.id} style={{ marginBottom: '2rem' }}>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <p>Max Participants: {game.maxParticipants}</p>
                <p>Start Date: {new Date(game.startDate).toLocaleString()}</p>
                <p>End Date: {new Date(game.endDate).toLocaleString()}</p>
                <p>Location: {game.location}</p>
                {isLoggedIn ? (
                  <button onClick={() => handleRegister(game.id)}>Register</button>
                ) : (
                  <p>Please log in to register for this game.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
