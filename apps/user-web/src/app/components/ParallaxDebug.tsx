"use client";

import { useEffect, useState } from 'react';

export default function ParallaxDebug() {
  const [debug, setDebug] = useState({
    isIOSSafari: false,
    userAgent: '',
    parallaxElements: 0,
    scrollY: 0,
    bgElements: 0,
    lastTransform: '',
    mobileDetected: false,
    backgroundImages: [] as string[]
  });

  useEffect(() => {
    const updateDebug = () => {
      // Simple iOS Safari detection matching SimpleParallax
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const userAgent = navigator.userAgent;
      const parallaxElements = document.querySelectorAll('[data-parallax]').length;
      const bgElements = document.querySelectorAll('.parallax-bg').length;
      const scrollY = window.pageYOffset;
      
      // Check if mobile parallax is active
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024;
      const hasLimitedHover = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const mobileDetected = isMobileUserAgent || (isTouchDevice && isSmallScreen) || (hasLimitedHover && isSmallScreen);
      
      // Get last transform value
      let lastTransform = '';
      if (bgElements > 0) {
        const lastBg = document.querySelector('.parallax-bg') as HTMLElement;
        if (lastBg) {
          lastTransform = window.getComputedStyle(lastBg).transform;
        }
      }
      
      // Check background images on parallax sections
      const backgroundImages: string[] = [];
      const parallaxSections = document.querySelectorAll('[data-parallax]');
      parallaxSections.forEach((section) => {
        const bgImage = window.getComputedStyle(section).backgroundImage;
        if (bgImage && bgImage !== 'none') {
          backgroundImages.push(bgImage);
        }
      });

      setDebug({
        isIOSSafari,
        userAgent,
        parallaxElements,
        scrollY,
        bgElements,
        lastTransform,
        mobileDetected,
        backgroundImages
      });
    };

    updateDebug();
    window.addEventListener('scroll', updateDebug);
    window.addEventListener('resize', updateDebug);

    return () => {
      window.removeEventListener('scroll', updateDebug);
      window.removeEventListener('resize', updateDebug);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '11px',
      fontFamily: 'monospace',
      lineHeight: '1.3',
      minWidth: '250px',
      maxWidth: '300px'
    }}>
      <div style={{fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #444', paddingBottom: '4px'}}>
        📱 Mobile Parallax Debug
      </div>
      <div>Mobile Detected: {debug.mobileDetected ? '✅ YES' : '❌ NO'}</div>
      <div>iOS Safari: {debug.isIOSSafari ? '✅ YES' : '❌ NO'}</div>
      <div style={{borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px'}}>
        <div>Parallax Sections: {debug.parallaxElements}</div>
        <div>BG Elements: {debug.bgElements}</div>
        <div>Scroll Y: {debug.scrollY}px</div>
        <div>BG Images: {debug.backgroundImages.length}</div>
      </div>
      {debug.backgroundImages.length > 0 && (
        <div style={{borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px'}}>
          <div style={{fontSize: '10px', color: '#ccc'}}>Background Images:</div>
          {debug.backgroundImages.map((bg, index) => (
            <div key={index} style={{fontSize: '9px', color: '#00ff99', wordBreak: 'break-all'}}>
              {bg.length > 30 ? bg.substring(0, 30) + '...' : bg}
            </div>
          ))}
        </div>
      )}
      {debug.lastTransform && (
        <div style={{borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px'}}>
          <div style={{fontSize: '10px', color: '#ccc'}}>Last Transform:</div>
          <div style={{fontSize: '9px', color: '#00ff99', wordBreak: 'break-all'}}>
            {debug.lastTransform}
          </div>
        </div>
      )}
      <div style={{fontSize: '10px', color: '#ccc', marginTop: '8px', borderTop: '1px solid #444', paddingTop: '8px'}}>
        UA: {debug.userAgent.length > 25 ? debug.userAgent.substring(0, 25) + '...' : debug.userAgent}
      </div>
    </div>
  );
} 