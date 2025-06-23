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
    items: ['./home1.jpg', './home2.jpg', './matches_3.jpg', './home4.jpg']
  },

];

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

  const openLightbox = (src: string) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const currentSlide = slides[currentIndex] as Slide;

  return (
    <section className={styles.carouselSection}>
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
                  onClick={() => openLightbox(src)}
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

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <span className={styles.closeButton}>&times;</span>
          <img src={lightboxImage} alt="Lightbox" className={styles.lightboxImage} />
        </div>
      )}
    </section>
    
  );
};

export default ImageCarousel;
