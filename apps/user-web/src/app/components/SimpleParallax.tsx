"use client";

import { useEffect } from 'react';

export default function SimpleParallax() {
  useEffect(() => {
    console.log('🎯 Initializing W3Schools-style transform3d parallax for universal compatibility');

    // W3Schools-style transform3d parallax implementation
    let ticking = false;
    
    const applyParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxSections = document.querySelectorAll('[data-parallax]') as NodeListOf<HTMLElement>;
      
      parallaxSections.forEach((section, index) => {
        try {
          const rate = parseFloat(section.dataset.parallax || '0.5');
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrolled;
          
          // Calculate parallax offset using W3Schools formula
          const yPos = -(scrolled - sectionTop) * rate;
          
          // Create or get background element
          let bgElement = section.querySelector('.parallax-bg') as HTMLElement;
          if (!bgElement) {
            console.log(`🆕 Creating parallax background for section ${index + 1}`);
            
            // Create background element
            bgElement = document.createElement('div');
            bgElement.className = 'parallax-bg';
            
            // Get computed background styles from the section
            const computedStyle = window.getComputedStyle(section);
            const backgroundImage = computedStyle.backgroundImage;
            const backgroundSize = computedStyle.backgroundSize;
            const backgroundPosition = computedStyle.backgroundPosition;
            const backgroundRepeat = computedStyle.backgroundRepeat;
            
            // Apply W3Schools-style styling
            bgElement.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 120%;
              background-image: ${backgroundImage};
              background-size: ${backgroundSize};
              background-position: ${backgroundPosition};
              background-repeat: ${backgroundRepeat};
              z-index: -1;
              transform: translate3d(0, 0, 0);
              will-change: transform;
              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;
              pointer-events: none;
            `;
            
            section.appendChild(bgElement);
            
            // Clear original background to avoid conflicts
            section.style.backgroundImage = 'none';
            section.style.position = 'relative';
            section.style.overflow = 'hidden';
            
            console.log(`✅ Created parallax background with image: ${backgroundImage}`);
          }
          
          // Apply transform3d for hardware acceleration (W3Schools approach)
          bgElement.style.transform = `translate3d(0, ${yPos}px, 0)`;
          bgElement.style.webkitTransform = `translate3d(0, ${yPos}px, 0)`;
          
        } catch (error) {
          console.log(`❌ Error applying parallax to section ${index + 1}:`, error);
        }
      });
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    };

    const handleResize = () => {
      // Re-apply parallax after resize
      setTimeout(() => {
        applyParallax();
      }, 150);
    };

    // Initial setup
    try {
      const parallaxSections = document.querySelectorAll('[data-parallax]') as NodeListOf<HTMLElement>;
      console.log(`🎯 Found ${parallaxSections.length} parallax sections`);
      
      // Set up sections for transform3d parallax
      parallaxSections.forEach((section, index) => {
        section.style.position = 'relative';
        section.style.overflow = 'hidden';
        section.style.backgroundAttachment = 'scroll';
        console.log(`✅ Setup section ${index + 1} for transform3d parallax`);
      });
      
      // Add event listeners
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      
      // Initial parallax application
      setTimeout(() => {
        applyParallax();
        console.log('✅ Initial transform3d parallax applied');
      }, 100);
      
    } catch (error) {
      console.log('❌ Error in transform3d parallax setup:', error);
    }

    console.log('✅ W3Schools-style transform3d parallax implementation complete');

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      console.log('🧹 Cleanup: removed event listeners');
    };

  }, []);

  return null;
} 