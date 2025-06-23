# iOS Safari Compatible Parallax System

## Overview
This parallax system uses JavaScript transforms instead of `background-attachment: fixed` to ensure compatibility with iOS Safari devices. It provides smooth 60fps parallax scrolling on all devices.

## How It Works

### 1. ScrollParallax Component
- Uses `requestAnimationFrame` for smooth 60fps animation
- Throttles scroll events to prevent performance issues
- Uses Intersection Observer to only animate visible elements
- Automatically creates parallax child elements for backgrounds
- Cleans up properly when components unmount

### 2. CSS Optimizations
- Desktop: Falls back to `background-attachment: fixed` where supported
- Mobile/iOS: Uses JavaScript-controlled parallax with `transform3d`
- Hardware acceleration with `will-change` and `translateZ(0)`
- 120% height backgrounds to allow for parallax movement

### 3. Dual Approach Strategy
- **Desktop (with hover support)**: CSS `background-attachment: fixed`
- **Mobile/iOS**: JavaScript `transform3d` parallax
- Automatic detection and switching between methods

## Usage

### Basic Parallax Section
```jsx
<section 
  className="your-section-class" 
  data-parallax="0.5" 
  data-parallax-offset="0"
>
  <div className="your-content">
    {/* Your content here */}
  </div>
</section>
```

### Attributes
- `data-parallax="0.5"`: Parallax speed (0.5 = half scroll speed)
  - `0.2` = Very slow parallax
  - `0.5` = Medium parallax (recommended)
  - `0.8` = Fast parallax
- `data-parallax-offset="0"`: Initial offset in pixels (optional)

### CSS Requirements
Your CSS should include:

```css
.your-section-class {
  background-image: url('/your-image.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Desktop fallback */
  position: relative;
  overflow: hidden; /* Required for iOS parallax */
}

/* Mobile optimization */
@media (max-width: 1023px), (hover: none) {
  .your-section-class {
    background-attachment: scroll !important;
  }
}
```

## Performance Features

### iOS Safari Optimizations
- Uses `translate3d()` for hardware acceleration
- `will-change: transform` for optimization hints
- `backface-visibility: hidden` to prevent flicker
- Passive event listeners for better scroll performance

### Memory Management
- Automatic cleanup of event listeners
- Intersection Observer to pause off-screen animations
- Mutation Observer to handle dynamic content
- Proper component unmounting

### Battery Life Friendly
- Only animates elements in viewport
- Uses efficient transform calculations
- Throttled scroll events
- Automatic pausing when not visible

## Integration

### 1. Add to Layout
```jsx
import ScrollParallax from './components/ScrollParallax';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ScrollParallax />
        {children}
      </body>
    </html>
  );
}
```

### 2. Add Data Attributes
Add `data-parallax` attributes to any section you want to have parallax:

```jsx
<section 
  className={styles.aboutSection} 
  data-parallax="0.5"
>
  {/* Content */}
</section>
```

### 3. Update CSS
Ensure your parallax sections have `overflow: hidden` and the mobile fallbacks.

## Browser Support

✅ **Fully Supported:**
- iOS Safari (iPhone/iPad)
- Chrome Mobile
- Firefox Mobile
- Desktop Chrome/Firefox/Safari
- Edge

✅ **Features:**
- 60fps smooth scrolling
- Hardware acceleration
- Battery efficient
- Memory leak free
- Responsive design compatible

## Troubleshooting

### Parallax Not Working on iOS?
1. Check that `data-parallax` attribute is present
2. Ensure CSS has `overflow: hidden`
3. Verify mobile fallback CSS is included
4. Check browser console for JavaScript errors

### Performance Issues?
1. Reduce `data-parallax` speed values
2. Limit number of parallax sections per page
3. Check for conflicting scroll listeners
4. Ensure images are optimized

### Memory Leaks?
The system automatically cleans up all listeners and observers when components unmount. No manual cleanup required.

## Examples

### Hero Section
```jsx
<section 
  className={styles.heroSection} 
  data-parallax="0.3"
>
  <h1>Hero Title</h1>
</section>
```

### About Section
```jsx
<section 
  className={styles.aboutSection} 
  data-parallax="0.5" 
  data-parallax-offset="100"
>
  <div className={styles.aboutContent}>
    {/* Content */}
  </div>
</section>
```

### Multiple Speeds
```jsx
{/* Slow background */}
<section data-parallax="0.2">
  {/* Fast overlay */}
  <div data-parallax="0.8">
    <h2>Title</h2>
  </div>
</section>
```

This system ensures your parallax effects work beautifully on iOS Safari while maintaining excellent performance across all devices. 