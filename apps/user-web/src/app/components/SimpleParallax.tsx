"use client";

import { useEffect } from 'react';

export default function SimpleParallax() {
  useEffect(() => {
    // Comprehensive mobile detection that's safe for desktop
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    const hasLimitedHover = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    
    // Combine multiple signals for accurate mobile detection
    const isMobileDevice = isMobileUserAgent || (isTouchDevice && isSmallScreen) || (hasLimitedHover && isSmallScreen);
    
    console.log('🔍 Mobile Detection Analysis:');
    console.log('  User Agent Mobile:', isMobileUserAgent);
    console.log('  Touch Device:', isTouchDevice);
    console.log('  Small Screen (≤1024px):', isSmallScreen);
    console.log('  Limited Hover:', hasLimitedHover);
    console.log('  📱 FINAL: Is Mobile Device:', isMobileDevice);
    console.log('  User Agent:', navigator.userAgent);
    
    if (!isMobileDevice) {
      console.log('✅ Desktop detected - using CSS parallax (background-attachment: fixed)');
      return;
    }

    console.log('📱 Mobile device detected - applying JavaScript parallax with transform3d');

    // Mobile parallax implementation with transform3d
    let ticking = false;
    let scrollCount = 0;
    
    const applyParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxSections = document.querySelectorAll('[data-parallax]') as NodeListOf<HTMLElement>;
      
      console.log(`🎯 PARALLAX APPLY #${++scrollCount}:`);
      console.log(`  Scroll Y: ${scrolled}px`);
      console.log(`  Found ${parallaxSections.length} parallax sections`);
      
      parallaxSections.forEach((section, index) => {
        try {
          const rate = parseFloat(section.dataset.parallax || '0.5');
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrolled;
          const sectionHeight = rect.height;
          const windowHeight = window.innerHeight;
          
          console.log(`  📍 Section ${index + 1}:`);
          console.log(`    Rate: ${rate}`);
          console.log(`    Rect: top=${rect.top}, bottom=${rect.bottom}, height=${sectionHeight}`);
          console.log(`    In viewport: ${rect.bottom > 0 && rect.top < windowHeight}`);
          
          // Only apply parallax when section is in viewport
          if (rect.bottom > 0 && rect.top < windowHeight) {
            // Calculate parallax offset
            const yPos = -(scrolled - sectionTop) * rate;
            
            console.log(`    📊 Calculated Y offset: ${yPos}px`);
            
            // Create or get background element
            let bgElement = section.querySelector('.parallax-bg') as HTMLElement;
            if (!bgElement) {
              console.log(`    🆕 Creating new parallax background element`);
              
              // Create background element if it doesn't exist
              bgElement = document.createElement('div');
              bgElement.className = 'parallax-bg';
              
              // Get computed background styles from the section
              const computedStyle = window.getComputedStyle(section);
              const backgroundImage = computedStyle.backgroundImage;
              const backgroundSize = computedStyle.backgroundSize;
              const backgroundPosition = computedStyle.backgroundPosition;
              const backgroundRepeat = computedStyle.backgroundRepeat;
              
              console.log(`    🖼️ Background image: ${backgroundImage}`);
              console.log(`    📏 Background size: ${backgroundSize}`);
              
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
              `;
              section.appendChild(bgElement);
              
              // Clear original background from section
              section.style.backgroundImage = 'none';
              section.style.backgroundAttachment = 'scroll';
              
              console.log(`    ✅ Created parallax background for section with image: ${backgroundImage}`);
            } else {
              console.log(`    🔄 Using existing parallax background element`);
            }
            
            // Apply transform3d for hardware acceleration
            const transformValue = `translate3d(0, ${yPos}px, 0)`;
            bgElement.style.transform = transformValue;
            
            console.log(`    🎨 Applied transform: ${transformValue}`);
            console.log(`    🔍 Element style.transform: ${bgElement.style.transform}`);
            
            // Verify the transform was applied
            const appliedTransform = window.getComputedStyle(bgElement).transform;
            console.log(`    ✅ Computed transform: ${appliedTransform}`);
            
          } else {
            console.log(`    ⏭️ Section not in viewport - skipping`);
          }
        } catch (error) {
          console.log(`    ❌ Error applying parallax to section ${index + 1}:`, error);
        }
      });
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        console.log(`📜 SCROLL EVENT FIRED - requesting animation frame`);
        requestAnimationFrame(applyParallax);
        ticking = true;
      } else {
        console.log(`⏱️ Scroll event throttled (ticking: ${ticking})`);
      }
    };

    const handleResize = () => {
      // Re-apply parallax after resize to ensure proper positioning
      console.log(`📐 RESIZE EVENT - reapplying parallax`);
      setTimeout(() => {
        applyParallax();
        console.log('✅ Parallax reapplied after resize/orientation change');
      }, 150);
    };

    // Initial parallax setup
    try {
      const parallaxSections = document.querySelectorAll('[data-parallax]') as NodeListOf<HTMLElement>;
      console.log(`🎯 INITIAL SETUP:`);
      console.log(`  Found ${parallaxSections.length} parallax sections for mobile`);
      
      // Log all parallax sections found
      parallaxSections.forEach((section, index) => {
        const computedStyle = window.getComputedStyle(section);
        const backgroundImage = computedStyle.backgroundImage;
        const backgroundSize = computedStyle.backgroundSize;
        const backgroundPosition = computedStyle.backgroundPosition;
        const backgroundAttachment = computedStyle.backgroundAttachment;
        
        console.log(`  📍 Section ${index + 1}:`);
        console.log(`    Element:`, section);
        console.log(`    Classes: ${section.className}`);
        console.log(`    Data attributes:`, section.dataset);
        console.log(`    🖼️ Background Image: ${backgroundImage}`);
        console.log(`    📏 Background Size: ${backgroundSize}`);
        console.log(`    📍 Background Position: ${backgroundPosition}`);
        console.log(`    🔗 Background Attachment: ${backgroundAttachment}`);
        
        // Check if background image is actually visible
        if (backgroundImage && backgroundImage !== 'none') {
          console.log(`    ✅ Background image detected: ${backgroundImage}`);
        } else {
          console.log(`    ❌ No background image detected!`);
        }
      });
      
      // Ensure mobile sections are properly set up
      parallaxSections.forEach((section, index) => {
        // Set up section for mobile parallax
        section.style.position = 'relative';
        section.style.overflow = 'hidden';
        section.style.backgroundAttachment = 'scroll';
        section.style.backgroundSize = 'cover';
        console.log(`✅ Mobile parallax setup applied to section ${index + 1}`);
      });
      
      // Add scroll listener for mobile parallax
      window.addEventListener('scroll', handleScroll, { passive: true });
      console.log(`✅ Scroll listener added`);
      
      // Add resize listener for orientation changes
      window.addEventListener('resize', handleResize, { passive: true });
      console.log(`✅ Resize listener added`);
      
      // Initial parallax application with a small delay to ensure proper setup
      setTimeout(() => {
        console.log(`⏰ Initial parallax application starting...`);
        applyParallax();
        console.log('✅ Initial mobile parallax applied after delay');
      }, 100);
      
    } catch (error) {
      console.log('❌ Error in mobile parallax setup:', error);
    }

    console.log('✅ Mobile parallax implementation complete with transform3d');

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      console.log('🧹 Cleanup: removed event listeners');
    };

  }, []);

  return null;
} 