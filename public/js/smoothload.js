/**
 * Smooth Page Loading and Layout Management
 * Ensures the page loads without gaps or layout issues
 */

document.addEventListener('DOMContentLoaded', () => {
  // Handle intro animation
  const introAnimation = document.querySelector('.intro-animation');
  if (introAnimation) {
    // Make sure it's visible on load
    introAnimation.style.opacity = '1';
    
    // Hide after a delay
    setTimeout(() => {
      introAnimation.style.opacity = '0';
      setTimeout(() => {
        introAnimation.style.display = 'none';
      }, 800);
    }, 2500);
  }

  // Fix layout issues
  function fixLayout() {
    const hero = document.querySelector('.hero');
    const header = document.querySelector('.main-header');
    
    if (hero && header) {
      // Get exact header height for precise positioning
      const headerHeight = header.offsetHeight;
      
      // Apply exact padding to the hero section
      hero.style.paddingTop = `${headerHeight}px`;
      
      // Make sure all background elements cover the entire viewport
      const bgElements = document.querySelectorAll('.neural-bg, .bg-animation, #particles-js, .glitch-overlay, .glow-dots');
      bgElements.forEach(el => {
        el.style.height = `${window.innerHeight}px`;
      });
      
      // Fix hero content positioning based on viewport height
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        const minPadding = Math.max(headerHeight + 20, window.innerHeight * 0.1);
        heroContent.style.paddingTop = `${minPadding}px`;
      }
    }
  }
  
  // Initialize stat counters with example data
  function initStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(el => {
      // Get the target count from data attribute
      const targetCount = parseInt(el.getAttribute('data-count'));
      
      // Start from 0
      el.textContent = '0';
      
      // Animate to target value
      animateCounter(el, targetCount);
    });
  }
  
  // Counter animation function
  function animateCounter(element, finalValue) {
    let startTime;
    const duration = 2000; // 2 seconds
    
    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth counting
      const currentValue = Math.floor(easeOutCubic(progress) * finalValue);
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  }
  
  // Easing function for smooth animation
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // Check if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }
  
  // Initialize scroll-based animations
  function initScrollAnimations() {
    const statsSection = document.querySelector('.stats-section');
    let statsInitialized = false;
    
    window.addEventListener('scroll', () => {
      // Initialize stats when stats section comes into view
      if (statsSection && !statsInitialized && isInViewport(statsSection)) {
        initStats();
        statsInitialized = true;
      }
      
      // Update header on scroll
      const header = document.querySelector('.main-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  // Run initial layout fixes
  fixLayout();
  
  // Set up event listeners
  window.addEventListener('resize', fixLayout);
  window.addEventListener('orientationchange', fixLayout);
  
  // Initialize animations after everything is loaded
  window.addEventListener('load', () => {
    fixLayout();
    initScrollAnimations();
    
    // Final check after short delay to ensure everything is rendered
    setTimeout(fixLayout, 1000);
  });
}); 