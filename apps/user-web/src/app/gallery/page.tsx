'use client'

import React, { useState, useRef } from 'react';
import styles from './gallery.module.css';
import Navbar2 from '../Navbar2';

const slides: Slide[] = [
  {
    type: 'grid',
    items: ['./1.png', './2.png', './3.png', './4.png']
  },
  {
    type: 'grid',
    items: ['./5.png', './6.jpg', './7.jpg', './8.jpg']
  },
  {
    type: 'video',
    src: './1.mp4'
  },
  {
    type: 'video',
    src: './2.mp4'
  }
];

const slides2: Slide[] = [
  {
    type: 'grid',
    items: ['./1.png', './2.png', './3.png', './4.png']
  },
  {
    type: 'grid',
    items: ['./5.png', './6.jpg', './7.jpg', './8.jpg']
  },
  {
    type: 'video',
    src: './3.mp4'
  },
  {
    type: 'video',
    src: './4.mp4'
  },
  {
    type: 'video',
    src: './5.mp4'
  },
  {
    type: 'video',
    src: './6.mp4'
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
    slides: slides // Using the original slides for this section
  }
};

// Carousel component that can be reused
const CarouselComponent = ({ slides, sectionKey }: { slides: Slide[]; sectionKey: SectionKey }) => {
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
        {slides.map((_, idx: number) => (
          <span
            key={idx}
            className={`${styles.dot} ${
              currentIndex === idx ? styles.active : ''
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

const ImageCarousel = () => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

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
      <Navbar2 />
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
    </>
  );
};

export default ImageCarousel;