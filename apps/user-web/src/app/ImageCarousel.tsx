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
<<<<<<< HEAD
    items: ['./home1.jpg', './home2.jpg', './matches_3.jpg', './home4.jpg']
=======
    items: ['./home1.jpg', './home2.jpg', './home3.jpg', './home4.jpg']
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
  },

];

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
<<<<<<< HEAD
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
=======
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c

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

<<<<<<< HEAD
  const openLightbox = (src: string) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

=======
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
  const currentSlide = slides[currentIndex] as Slide;

  return (
    <section className={styles.carouselSection}>
<<<<<<< HEAD
=======
      <div className={styles.galleryTitleBlock}>
        <h2 className={styles.galleryHeading}>OUR CLUB IN MOTION</h2>
        <p className={styles.gallerySubheading}>
          Discover the spirit, sweat, and soul behind the Renegades journey.
        </p>
      </div>
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
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
<<<<<<< HEAD
                  onClick={() => openLightbox(src)}
=======
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
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
<<<<<<< HEAD
        Show full Gallery ➚
      </Link>

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <span className={styles.closeButton}>&times;</span>
          <img src={lightboxImage} alt="Lightbox" className={styles.lightboxImage} />
        </div>
      )}
=======
  Show full Gallery ➚
</Link>
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
    </section>
    
  );
};

export default ImageCarousel;
