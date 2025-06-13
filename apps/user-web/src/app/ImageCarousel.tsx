// components/ImageCarousel.tsx
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './carousel.module.css';

type Slide = 
  | { type: 'grid'; items: string[] }
  | { type: 'video'; src: string };

export const slides: Slide[] = [
  {
    type: 'grid',
    items: ['/1.png', '/2.png', '/3.png', '/4.png']
  },
  {
    type: 'grid',
    items: ['/5.png', '/6.jpg', '/7.jpg', '/8.jpg']
  },
  {
    type: 'video',
    src: '/1.mp4'
  },
  {
    type: 'video',
    src: '/2.mp4'
  }
];

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + 1 < slides.length ? prev + 1 : 0
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : slides.length - 1
    );
  };

  const currentSlide = slides[currentIndex] as Slide;

  return (
    <section className={styles.carouselSection}>
      <div className={styles.galleryTitleBlock}>
        <h2 className={styles.galleryHeading}>OUR CLUB IN MOTION</h2>
        <p className={styles.gallerySubheading}>
          Discover the spirit, sweat, and soul behind the Renegades journey.
        </p>
      </div>
      <div className={styles.carouselContent}>
        {/* Text Box on the Left */}
        <div className={styles.galleryInfoText}>
          <h3>Inside Our Club</h3>
          <p>
            From intense training sessions to unforgettable match days, our club nurtures talent, passion, and teamwork. Dive into our journey and witness the spirit that defines us.
          </p>
        </div>

        {/* Carousel on the Right */}
        <div className={styles.carouselWrapper}>
          {currentSlide.type === 'grid' ? (
            <div className={styles.gridWrapper}>
              {currentSlide.items.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Grid Image ${idx}`}
                  className={styles.gridImage}
                />
              ))}
            </div>
          ) : (
            <video
              src={currentSlide.src}
              controls
              className={styles.video}
            />
          )}

          {/* Left Arrow 
          <button className={styles.leftArrow} onClick={handlePrev}>
            ↤
          </button>

          {/* Right Arrow 
          <button className={styles.rightArrow} onClick={handleNext}>
            ↦
          </button>*/}

        </div>
        
      </div>
      <Link href="/gallery" className={styles.galleryButton}>
  Show full Gallery ➚
</Link>
    </section>
    
  );
};

export default ImageCarousel;
