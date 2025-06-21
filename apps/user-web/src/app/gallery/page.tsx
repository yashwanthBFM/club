'use client'

import React, { useState, useRef } from 'react';
import styles from './gallery.module.css';

const slides: Slide[] = [
  {
    type: 'grid',
    items: ['./matches_1.jpg', './matches_2.jpg', './matches_3.jpg', './matches_4.jpg']
  },
  {
    type: 'grid',
    items: ['./matches_5.jpg', './6.jpg', './7.jpg', './8.jpg']
  },
  {
    type: 'video',
    src: './matches_1.mp4'
  },
  {
    type: 'video',
    src: './matches_2.mp4'
  }
];

const slides2: Slide[] = [
  {
    type: 'grid',
    items: ['./train_1.jpg', './train_2.jpg', './train_3.jpg', './train_4.jpg']
  },
  {
    type: 'grid',
    items: ['./train_5.jpg', './train_6.jpg', './train_7.jpg', './train_8.jpg']
  },
 
  {
    type: 'video',
    src: './train_1.mp4'
  },
  {
    type: 'video',
    src: './train_2.mp4'
  },
  {
    type: 'video',
    src: './train_3.mp4'
  },
  {
    type: 'video',
    src: './train_4.mp4'
  }
];

const slides3: Slide[] = [
  {
    type: 'grid',
    items: ['./snaps_1.jpg', './snaps_2.jpg', './snaps_3.jpg', './snaps_4.jpg']
  },
  {
    type: 'grid',
    items: ['./snaps_5.jpg', './home6.jpg', './home4.jpg', './home5.jpg']
  },
 
  {
    type: 'video',
    src: './snaps_1.mp4'
  },
  {
    type: 'video',
    src: './snaps_2.mp4'
  }
];


type Slide =
  | { type: 'grid'; items: string[] }
  | { type: 'video'; src: string };

type SectionKey = 'matches' | 'training' | 'snaps';

// Content for each section
const sectionContent: Record<SectionKey, {
  title?: string;
  description: string;
  slides: Slide[];
}> = {
  matches: {
    title: "Live matches",
    description: "Witness our team's incredible performances and memorable victories. From last-minute goals to championship celebrations, these moments define our competitive spirit.",
    slides: slides
  },
  training: {
    title: "Training Excellence",
    description: "Behind every great performance lies hours of dedicated training. Experience our rigorous preparation, skill development, and team building sessions.",
    slides: slides2
  },
  snaps: {
    title: "Club Memories",
    description: "Capturing the essence of our club culture - from team bonding moments to celebration snapshots that showcase our unity and passion.",
    slides: slides3
  }
};

// Carousel component that can be reused
const CarouselComponent = ({ slides, sectionKey, onImageClick }: { slides: Slide[]; sectionKey: SectionKey; onImageClick: (src: string) => void; }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNext = () => {
    setCurrentIndex((prev: number) =>
      prev + 1 < slides.length ? prev + 1 : 0
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev: number) =>
      prev - 1 >= 0 ? prev - 1 : slides.length - 1
    );
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className={styles.carouselWrapper}>
      {currentSlide.type === 'grid' ? (
        <div className={styles.gridWrapper}>
          {currentSlide.items.map((src: string, idx: number) => (
            <img
              key={idx}
              src={src}
              alt={`${sectionKey} Image ${idx}`}
              className={styles.gridImage}
              onClick={() => onImageClick(src)}
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
      {/* Navigation arrows */}
      <button className={styles.leftArrow} onClick={handlePrev}>
        ↤
      </button>
      <button className={styles.rightArrow} onClick={handleNext}>
        ↦
      </button>
      <div className={styles.dots}>
        {slides.map((_, dotIndex: number) => (
          <span
            key={dotIndex}
            className={`${styles.dot} ${
              currentIndex === dotIndex ? styles.active : ''
            }`}
            onClick={() => setCurrentIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
};

const ImageCarousel = () => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const openLightbox = (src: string) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const scrollToSection = (sectionIndex: number) => {
    setActiveSection(sectionIndex);
    if (sliderRef.current) {
      const sectionWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: sectionIndex * sectionWidth,
        behavior: 'smooth'
      });
    }
  };

  const sections: SectionKey[] = ['matches', 'training', 'snaps'];
  const sectionLabels = ['Matches', 'Training', 'Snaps'];
  return (
    <>
      <section className={styles.carouselSection}>
        {/* Navigation buttons */}
        <div className={styles.carouselButtons}>
          {sectionLabels.map((label, index) => (
            <button
              key={label}
              className={`${styles.hoverButton} ${
                activeSection === index ? styles.activeButton : ''
              }`}
              onClick={() => scrollToSection(index)}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Horizontal Sliding Container */}
        <div className={styles.carouselSliderWrapper} ref={sliderRef}>
          {sections.map((sectionKey, index) => (
            <section
              key={sectionKey}
              id={sectionKey}
              className={styles.carouselPanel}
            >
              <div className={styles.carouselContent}>
                <div className={styles.textBox}>
                  <h3>{sectionContent[sectionKey].title}</h3>
                  <p>{sectionContent[sectionKey].description}</p>
                </div>
                <CarouselComponent
                  slides={sectionContent[sectionKey].slides}
                  sectionKey={sectionKey}
                  onImageClick={openLightbox}
                />
              </div>
            </section>
          ))}
        </div>
        {/* Section Indicators */}
        <div className={styles.sectionIndicators}>
          {sections.map((_, index) => (
            <span
              key={index}
              className={`${styles.sectionDot} ${
                activeSection === index ? styles.activeSectionDot : ''
              }`}
              onClick={() => scrollToSection(index)}
            />
          ))}
        </div>
      </section>

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <span className={styles.closeButton}>&times;</span>
          <img src={lightboxImage} alt="Lightbox" className={styles.lightboxImage} />
        </div>
      )}
    </>
  );
};

export default ImageCarousel;