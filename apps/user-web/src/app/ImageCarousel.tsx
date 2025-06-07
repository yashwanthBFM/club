// components/ImageCarousel.tsx

import React, { useState, useEffect, useRef } from 'react';
import styles from './carousel.module.css';

const slides = [
  { type: 'image', src: './6.jpg' },
  { type: 'video', src: './1.mp4' },
  { type: 'image', src: './7.jpg' },
  { type: 'video', src: './2.mp4' },
  { type: 'image', src: './8.jpg' }
];

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  return (
    <section className={styles.carouselSection}>

       <div className={styles.carouselTitle}>
      Have a glance at our Club !
    </div>

      <div
        className={styles.carouselWrapper}
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <div
          className={styles.carouselSlide}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
  <div key={index} style={{ flex: '0 0 100%', overflowX:'hidden', }}>
    {slide.type === 'image' ? (
      <img src={slide.src} alt={`Slide ${index}`} className={styles.carouselImage} />
    ) : (
      <video
        src={slide.src}
        className={styles.carouselImage}
        controls
        onPlay={stopAutoplay}
        onPause={startAutoplay}
        onEnded={startAutoplay}
        onMouseEnter={stopAutoplay}
        onMouseLeave={(e) => {
          if (e.currentTarget.paused) startAutoplay();
        }}
      />
    )}
  </div>
))}

        </div>

        <div className={styles.dots}>
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`${styles.dot} ${
                currentIndex === idx ? styles.active : ''
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        {/* Glowing Floor */}
        <div className={styles.floorGlow}></div>
      </div>
    </section>
  );
};

export default ImageCarousel;