"use client";

import Link from 'next/link';
import styles from './page.module.css';
import Announcements from './components/Announcements';
import React, { useEffect, useState, useRef } from 'react';
import { env } from '@/config/env';
import { fetchGames } from './api';
import Navbar from './Navbar';
import ImageCarousel from './ImageCarousel';
import Info from './Info';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import Footer from './footer';
import About from './About';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaDumbbell, FaUsers, FaMedal } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

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
  const heroRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);



  useEffect(() => {
    const token = localStorage.getItem(env.auth.tokenKey);
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
    gsap.registerPlugin(SplitText);

    // iPhone Safari optimization: Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.fonts.ready.then(() => {
      // Skip animations if user prefers reduced motion
      if (prefersReducedMotion) {
        // Just show elements without animations
        if (heroRef.current) heroRef.current.style.opacity = '1';
        if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
        return;
      }

      // Animate Hero Title
    if (heroRef.current) {
    gsap.set(heroRef.current, { opacity: 1 });

    SplitText.create(heroRef.current, {
      type: 'lines',
      linesClass: 'line',
      autoSplit: true,
      mask: 'lines',
      onSplit: (self) => {
      gsap.fromTo(
      self.lines,
      { opacity: 0, filter: 'blur(10px)', y: 40 },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.15,
      }
      );
   },
  });

  }

  // Animate Hero Subtitle
  if (subtitleRef.current) {
    gsap.set(subtitleRef.current, { opacity: 1 });

    SplitText.create(subtitleRef.current, {
    type: 'lines',
    linesClass: 'line',
    autoSplit: true,
    mask: 'lines',
    onSplit: (self) => {
    gsap.fromTo(
      self.lines,
      { opacity: 0, filter: 'blur(10px)', y: 40 },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.15,
        delay: 0.4, // delayed to follow hero title
      }
    );
    },
  });
  }

  // Animate feature cards with staggered slide-ins
  const features = gsap.utils.toArray('[data-card-type="feature"]') as HTMLElement[];

  features.forEach((card, i) => {
    const direction = i === 0 ? -100 : i === 1 ? 0 : 100;

    gsap.from(card, {
      x: direction,
      y: i === 1 ? 50 : 0,
      opacity: 0,
      duration: 1.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
    });
  });

  // Animate event cards
  const events = gsap.utils.toArray('[data-card-type="event"]') as HTMLElement[];
  events.forEach((card, index) => {
      let fromX = 0;
      if (index % 3 === 0) fromX = -100;
      else if (index % 3 === 1) fromX = 5;
      else fromX = 100;

      gsap.from(card, {
        x: fromX,
        opacity: 0,
      duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
      });
    });

  // Animate coach cards with staggered fade-in and upward slide
  const coaches = gsap.utils.toArray('[data-card-type="coach"]') as HTMLElement[];
  gsap.from(coaches, {
    opacity: 0,
    y: 40,
    duration: 2.2,
    stagger: 0.4,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#meet',
      start: 'top 85%',
    },
  });

  });


  
}, []);
    

  const handleRegister = (gameId: number) => {
    // TODO: Implement registration logic (API call)
    alert(`Registering for game with ID: ${gameId}`);
  };

  return (
    <>
    <Navbar />
    <div className={styles.parallaxContainer}>
      {/* Hero Section */}
      <section id="/" className={styles.heroSection}>
        <div className={styles.heroZoomBackground}></div>
        <div className={`${styles.heroContent} ${styles.fadeIn}`}>
          <h1 ref={heroRef} className={`${styles.heroTitle} ${styles.fadeIn} split`}>
            RENEGADES FC
</h1>
          <div className={`${styles.heroContentWrapper} ${styles.fadeIn}`}>
            <p ref={subtitleRef} className={`${styles.heroSubtitle} ${styles.fadeIn} split`}>
              Kick start your football journey
            </p>
            <div className={styles.buttonGroup}>
              <Link href="/register" className={`${styles.button} ${styles.primaryButton} ${styles.fadeIn}`}>
              Join Now
            </Link>
              <Link href="/login" className={`${styles.button} ${styles.secondaryButton} ${styles.fadeIn}`}>
              Sign In
            </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <About />
      </section>

      <section id="info" className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.aboutTitle}>Why Choose Us?</h2>
          <div className={styles.whyUsFlex}>
            <div className={styles.whyUsCard} data-card-type="feature" data-card-index="0">
              <div className={styles.accentBar}></div>
              <FaDumbbell className={styles.whyUsIcon} />
              <h3 className={styles.featureTitle}>Professional Training</h3>
              <p className={styles.featureDescription}>
                Sharpen your game with expert football coaching designed to elevate every aspect of your performance. Train with former players and certified coaches who bring tactical depth and on-field experience to every drill. Our state-of-the-art facilities feature top-tier pitches, advanced fitness gear, and performance tracking tools to ensure you grow faster, stronger, and smarter. Whether you're aiming to make the team or play professionally, this is where your next level begins.
              </p>
            </div>
            <div className={styles.whyUsCard} data-card-type="feature" data-card-index="1">
              <div className={styles.accentBar}></div>
              <FaUsers className={styles.whyUsIcon} />
              <h3 className={styles.featureTitle}>Community Focus</h3>
              <p className={styles.featureDescription}>
                Join a vibrant and supportive community where every player, coach, and fan shares a deep passion for football. Beyond the pitch, we foster strong bonds through team spirit, mutual respect, and shared victories. Whether you're scoring goals or cheering from the sidelines, you'll always have a place in this growing football family.
              </p>
            </div>
            <div className={styles.whyUsCard} data-card-type="feature" data-card-index="2">
              <div className={styles.accentBar}></div>
              <FaMedal className={styles.whyUsIcon} />
              <h3 className={styles.featureTitle}>Excellence</h3>
              <p className={styles.featureDescription}>
                Strive for greatness on and off the pitch. Our players compete in top-tier leagues and tournaments, constantly challenging themselves against the best. We believe true excellence isn't just about winning — it's about playing with integrity, respecting the game, and upholding the highest standards of sportsmanship in every match and moment.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="meet">
      <Info /> 
      </section>

      {/*<section id="events" className={styles.eventsSection}>
        <div className={styles.eventsContent}>
          <h2 className={styles.eventsTitle}>Upcoming Events</h2>
          <div className={styles.eventsGrid}>
            <div className={styles.eventCard} data-card-type="event">
              <h3 className={styles.eventTitle}>Weekend Tournament</h3>
              <p className={styles.eventDate}>June 15-16, 2024</p>
              <p className={styles.eventDescription}>
                Join us for an exciting weekend of competitive matches and team building
              </p>
              <Link href="/login" className={`${styles.button} ${styles.primaryButton}`}>
                Login Now
              </Link>
            </div>
            <div className={styles.eventCard} data-card-type="event">
              <h3 className={styles.eventTitle}>Summer Training Camp</h3>
              <p className={styles.eventDate}>July 1-14, 2024</p>
              <p className={styles.eventDescription}>
                Intensive training program for players looking to take their game to the next level
              </p>
              <Link href="/login" className={`${styles.button} ${styles.primaryButton}`}>
                Login Now
              </Link>
            </div>
            <div className={styles.eventCard} data-card-type="event">
              <h3 className={styles.eventTitle}>Community Match Day</h3>
              <p className={styles.eventDate}>Every Saturday</p>
              <p className={styles.eventDescription}>
                Regular friendly matches open to all members of our community.
              </p>
              <Link href="/login" className={`${styles.button} ${styles.primaryButton}`}>
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </section>*/}

      <section id="gallery" className={styles.gallerySection}>
      <ImageCarousel />
      </section>

      <section id="join" className={styles.joinSection}>
        <h2 className={styles.joinTitle}>Ready to Join our team?</h2>
          <p className={styles.joinDescription}>
            Take the first step toward developing your skills and becoming part of our winning tradition.
          </p>
          <Link href="/register" className={`${styles.button} ${styles.primaryButton}`}>
            Join Now
          </Link>
      </section>

      <section id="contact">
        <Footer />
      </section>
    </div>
    </>
  );
}