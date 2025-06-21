"use client";

import { useEffect } from 'react';

export default function IOSOptimizer() {
  useEffect(() => {
    // iOS-specific optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      const preventZoom = (e: TouchEvent) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };

      // Prevent pull-to-refresh on iOS
      const preventPullToRefresh = (e: TouchEvent) => {
        if (window.scrollY === 0) {
          e.preventDefault();
        }
      };

      // Add event listeners for iOS
      document.addEventListener('touchend', preventZoom, { passive: false });
      document.addEventListener('touchmove', preventPullToRefresh, { passive: false });

      // Optimize scroll performance
      (document.body.style as any).webkitOverflowScrolling = 'touch';

      // Cleanup
      return () => {
        document.removeEventListener('touchend', preventZoom);
        document.removeEventListener('touchmove', preventPullToRefresh);
      };
    }
  }, []);

  return null; // This component doesn't render anything
} 