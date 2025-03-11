/**
 * Modern Jump to Top Button Component
 * A beautiful, animated button that appears when scrolling down
 * and smoothly returns the user to the top of the page.
 */

/**
 * Creates and initializes the modern jump-to-top button
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} The created button element
 */
function createModernJumpToTop(options = {}) {
  // Default configuration
  const defaults = {
    theme: 'gradient',         // 'gradient', 'solid', 'outline', 'minimal'
    color: 'primary',          // 'primary', 'secondary', 'accent', or hex color
    position: 'right',         // 'right', 'left', 'center'
    size: 'medium',            // 'small', 'medium', 'large'
    shape: 'circle',           // 'circle', 'rounded', 'square'
    icon: 'arrow-up',          // 'arrow-up', 'chevron-up', 'angle-up', 'custom'
    customIcon: null,          // Custom SVG/HTML content if icon is 'custom'
    showAfter: 300,            // Show after scrolling these many pixels
    animation: 'bounce',       // 'bounce', 'fade', 'slide', 'zoom', 'pulse'
    margin: 20,                // Margin from edge in pixels
    zIndex: 1000,              // z-index value
    mobileOnly: false,         // Show only on mobile devices
    desktopOnly: false,        // Show only on desktop devices
    showLabel: false,          // Show text label
    labelText: 'Back to top',  // Text to show if showLabel is true
    accessibility: true,       // Enable accessibility features
    scrollDuration: 800,       // Scroll animation duration in ms
    scrollBehavior: 'smooth',  // 'smooth', 'auto' or custom easing function
    scrollOffset: 0,           // Offset from the top in pixels
    debug: false               // Enable debug mode
  };

  // Merge options with defaults
  const settings = { ...defaults, ...options };
  
  // Create button element
  const button = document.createElement('button');
  button.className = `modern-jump-top modern-jump-top--${settings.theme} modern-jump-top--${settings.shape} modern-jump-top--${settings.size}`;
  button.id = 'modernJumpTop';
  
  // Position class
  button.classList.add(`modern-jump-top--${settings.position}`);
  
  // Set hiding class (initially hidden)
  button.classList.add('modern-jump-top--hidden');
  
  // Animation class
  button.classList.add(`modern-jump-top--animate-${settings.animation}`);
  
  // Add accessibility attributes
  if (settings.accessibility) {
    button.setAttribute('aria-label', 'Scroll to top of page');
    button.setAttribute('title', 'Back to top');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
  }
  
  // Create icon based on selection
  let iconElement;
  
  switch (settings.icon) {
    case 'chevron-up':
      iconElement = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      break;
    case 'angle-up':
      iconElement = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.929 15.314l-4.314-4.314-4.314 4.314c-0.391 0.391-1.024 0.391-1.414 0s-0.391-1.024 0-1.414l5.021-5.021c0.391-0.391 1.024-0.391 1.414 0l5.021 5.021c0.391 0.391 0.391 1.024 0 1.414s-1.023 0.391-1.414 0z"></path></svg>';
      break;
    case 'custom':
      iconElement = settings.customIcon || '<span>↑</span>';
      break;
    default: // arrow-up
      iconElement = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
  }
  
  // Create icon container
  const iconContainer = document.createElement('span');
  iconContainer.className = 'modern-jump-top__icon';
  iconContainer.innerHTML = iconElement;
  button.appendChild(iconContainer);
  
  // Add label if needed
  if (settings.showLabel) {
    const label = document.createElement('span');
    label.className = 'modern-jump-top__label';
    label.textContent = settings.labelText;
    button.appendChild(label);
  }
  
  // Add glow effect element for certain themes
  if (settings.theme === 'gradient' || settings.theme === 'solid') {
    const glow = document.createElement('span');
    glow.className = 'modern-jump-top__glow';
    button.appendChild(glow);
  }
  
  // Custom styles based on options
  button.style.setProperty('--mjt-color', getComputedColor(settings.color));
  button.style.zIndex = settings.zIndex;
  button.style.margin = `${settings.margin}px`;
  
  // Add button to the DOM
  document.body.appendChild(button);
  
  // Handle visibility on scroll
  let prevScrollPos = window.pageYOffset;
  let ticking = false;
  let isVisible = false;
  
  const updateButtonVisibility = () => {
    const currentScrollPos = window.pageYOffset;
    
    // Check if we should show/hide based on scroll position
    if (currentScrollPos > settings.showAfter) {
      if (!isVisible) {
        button.classList.remove('modern-jump-top--hidden');
        button.classList.add('modern-jump-top--visible');
        isVisible = true;
      }
    } else {
      if (isVisible) {
        button.classList.remove('modern-jump-top--visible');
        button.classList.add('modern-jump-top--hidden');
        isVisible = false;
      }
    }
    
    // Show/hide based on device type if specified
    if ((settings.mobileOnly && !isMobileDevice()) || 
        (settings.desktopOnly && isMobileDevice())) {
      button.classList.add('modern-jump-top--hidden');
      button.classList.remove('modern-jump-top--visible');
    }
    
    prevScrollPos = currentScrollPos;
    ticking = false;
  };
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateButtonVisibility();
        ticking = false;
      });
      
      ticking = true;
    }
  });
  
  // Handle click event
  button.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTop(settings.scrollDuration, settings.scrollBehavior, settings.scrollOffset);
    
    if (settings.debug) {
      console.log('Modern Jump to Top clicked, scrolling to top');
    }
  });
  
  // Handle keyboard events for accessibility
  if (settings.accessibility) {
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop(settings.scrollDuration, settings.scrollBehavior, settings.scrollOffset);
      }
    });
  }
  
  // Function to scroll to top
  function scrollToTop(duration, behavior, offset) {
    if (behavior === 'smooth') {
      // Use native smooth scrolling if available
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
        return;
      }
      
      // Custom smooth scrolling for older browsers
      const startPosition = window.pageYOffset;
      const startTime = performance.now();
      
      const animateScroll = currentTime => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = easeOutCubic(progress);
        const scrollY = easeProgress * (offset - startPosition) + startPosition;
        
        window.scrollTo(0, scrollY);
        
        if (elapsedTime < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    } else {
      // Instant scroll
      window.scrollTo(0, offset);
    }
  }
  
  // Easing function
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  // Helper to detect mobile device
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Helper to get computed color
  function getComputedColor(color) {
    switch (color) {
      case 'primary':
        return '#3498db'; // Blue
      case 'secondary':
        return '#2ecc71'; // Green
      case 'accent':
        return '#e74c3c'; // Red
      default:
        return color; // Custom hex or CSS color
    }
  }
  
  // Debug info
  if (settings.debug) {
    console.log('Modern Jump to Top initialized with settings:', settings);
  }
  
  // Return the button for custom handling
  return button;
}

// Export for CommonJS or AMD if used
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createModernJumpToTop };
}
