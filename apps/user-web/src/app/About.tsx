// components/About.tsx
import React, { useEffect, useRef, useState } from 'react';
import styles from './about.module.css';

export default function About() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [animate, setAnimate] = useState(false);

  // Intersection animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current || !sectionRef.current) return;
      const sectionTop = sectionRef.current.offsetTop;
      const scrollY = window.scrollY;
      const offset = scrollY - sectionTop;
      bgRef.current.style.transform = `translateY(${offset * 0.4}px)`;
    };

    const onScroll = () => requestAnimationFrame(handleScroll);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className={styles.aboutSection} ref={sectionRef}>
      <div className={styles.background} ref={bgRef} />
      <div className={styles.overlay} />
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <img
            src="/11.jpg"
            alt="About Renegades FC"
            className={`${styles.image} ${animate ? styles.animate : ''}`}
          />
        </div>
        <div className={styles.textContainer}>
          <h2 className={styles.heading}>About Renegades FC</h2>
          <p className={styles.description}>
            Founded in 2010, Renegades FC has established itself as a premier football club dedicated to developing skilled players and outstanding individuals. Our comprehensive training programs focus on technical skills, tactical understanding, physical development, and mental strength.
          </p>
          <p className={styles.description}>
            With state-of-the-art facilities and UEFA-licensed coaches, we provide an environment where talent thrives and character is built.
          </p>
        </div>
      </div>
    </section>
  );
}
