document.addEventListener('DOMContentLoaded', () => {
  // Hauptvariablen
  const header = document.querySelector('.main-header');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const mobileMenu = document.querySelector('.mobile-menu');
  const heroTitle = document.querySelector('.hero h1');
  const featureCards = document.querySelectorAll('.feature-card');
  const themeToggle = document.getElementById('theme-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const targetTabs = document.querySelectorAll('.target-tab');
  const aboutCards = document.querySelectorAll('.about-card');
  const safetyFeatures = document.querySelectorAll('.safety-feature');
  const mehrErfahrenBtn = document.getElementById('mehr-erfahren-btn');

  // Extrem einfache Lösung für den "Mehr erfahren" Button
  if (mehrErfahrenBtn) {
    mehrErfahrenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetElement = document.getElementById('was-ist-elysian');
      if (targetElement) {
        targetElement.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    });
  }

  // Benachrichtigungssystem
  const notificationContainer = document.getElementById('notification-container');

  // Dark/Light Modus
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  function toggleTheme() {
    document.body.classList.toggle('light-mode');
    updateThemeIcon();
    
    // Speichern der Präferenz
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('elysian-theme', currentTheme);
    
    // Benachrichtigung anzeigen
    showNotification(`${currentTheme === 'light' ? 'Light' : 'Dark'} Mode aktiviert`, 'info');
  }

  function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      if (document.body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }
  }

  // Gespeicherten Theme-Modus anwenden
  function applyStoredTheme() {
    const storedTheme = localStorage.getItem('elysian-theme');
    if (storedTheme === 'light') {
      document.body.classList.add('light-mode');
      updateThemeIcon();
    }
  }
  
  applyStoredTheme();

  // Benachrichtigungsfunktion
  function showNotification(message, type = 'info', duration = 3000) {
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="notification-icon fas ${getIconForType(type)}"></i>
        <p>${message}</p>
      </div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Animation starten
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Automatisches Ausblenden
    const timeout = setTimeout(() => {
      closeNotification(notification);
    }, duration);
    
    // Schließen-Button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        closeNotification(notification);
      });
    }
  }

  function closeNotification(notification) {
    if (!notification) return;
    
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }

  function getIconForType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }

  // Intro-Animation ausblenden nach Timeout
  const introAnimation = document.querySelector('.intro-animation');
  if (introAnimation) {
    introAnimation.style.position = 'fixed';
    introAnimation.style.pointerEvents = 'none';
    setTimeout(() => {
      introAnimation.style.opacity = '0';
      setTimeout(() => {
        introAnimation.style.display = 'none';
      }, 500); // Erst nach Fade-Out entfernen
    }, 2500);
  }

  // Neuronales Netzwerk Hintergrund
  function initNeuralBackground() {
    try {
      const neuralBg = document.querySelector('.neural-bg');
      if (!neuralBg || !neuralBg.getContext) return;
      
      const ctx = neuralBg.getContext('2d');
      let width = window.innerWidth;
      let height = window.innerHeight;
      
      neuralBg.width = width;
      neuralBg.height = height;
      
      // Netzknoten
      const nodes = [];
      const nodeCount = Math.min(Math.floor(width * height / 25000), 150); // Begrenzte Anzahl für bessere Performance
      
      // Knoten erstellen
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1
        });
      }
      
      function animate() {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, width, height);
        
        // Verbindungen zeichnen
        ctx.beginPath();
        ctx.strokeStyle = document.body.classList.contains('light-mode') 
          ? 'rgba(100, 100, 200, 0.05)' 
          : 'rgba(193, 58, 252, 0.05)';
        
        for (let i = 0; i < nodes.length; i++) {
          const nodeA = nodes[i];
          
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeB = nodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              ctx.moveTo(nodeA.x, nodeA.y);
              ctx.lineTo(nodeB.x, nodeB.y);
            }
          }
        }
        
        ctx.stroke();
        
        // Knoten zeichnen und bewegen
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          
          // Position aktualisieren
          node.x += node.vx;
          node.y += node.vy;
          
          // Kollisionen mit Rändern prüfen
          if (node.x < 0 || node.x > width) node.vx = -node.vx;
          if (node.y < 0 || node.y > height) node.vy = -node.vy;
          
          // Knoten zeichnen
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = document.body.classList.contains('light-mode') 
            ? 'rgba(100, 100, 200, 0.3)' 
            : 'rgba(193, 58, 252, 0.3)';
          ctx.fill();
        }
        
        requestAnimationFrame(animate);
      }
      
      animate();
      
      // Größe anpassen wenn Fenster skaliert wird
      window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        neuralBg.width = width;
        neuralBg.height = height;
      });
    } catch (error) {
      console.warn('Neural background could not be initialized:', error);
    }
  }
  
  // Verzögerter Start für bessere Performance
  setTimeout(initNeuralBackground, 300);

  // Partikelsystem initialisieren
  function initParticles() {
    if (typeof particlesJS === 'undefined') {
      console.warn('particlesJS is not defined');
      return;
    }
    
    try {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: "#c13afc"
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000"
            },
            polygon: {
              nb_sides: 5
            }
          },
          opacity: {
            value: 0.5,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#c13afc",
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab"
            },
            onclick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1
              }
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3
            },
            repulse: {
              distance: 200,
              duration: 0.4
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true
      });
    } catch (error) {
      console.warn('Particles initialization error:', error);
    }
  }
  
  // Verzögerter Start für bessere Performance
  if (typeof particlesJS !== 'undefined') {
    setTimeout(initParticles, 500);
  }

  // Ripple-Effekt für Links
  function createLinkRipple(e, element) {
    if (!e || !element || !element.appendChild) {
      console.warn('Invalid parameters for createLinkRipple');
      return;
    }
    
    try {
      // Create the ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('nav-ripple');
      
      // Get element position and dimensions
      const rect = element.getBoundingClientRect();
      if (!rect) {
        console.warn('Could not get element bounding rect');
        return;
      }
      
      // Calculate ripple size based on element
      const size = Math.max(rect.width, rect.height) * 1.2; // Slightly larger
      
      // Set ripple size
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      
      // Calculate position - handle possible null or undefined clientX/Y
      const clientX = e.clientX || e.pageX || (rect.left + rect.width/2);
      const clientY = e.clientY || e.pageY || (rect.top + rect.height/2);
      
      const left = clientX - rect.left - size/2;
      const top = clientY - rect.top - size/2;
      
      // Set position
      ripple.style.left = `${left}px`;
      ripple.style.top = `${top}px`;
      
      // Append to element
      element.appendChild(ripple);
      
      // Activate the animation
      setTimeout(() => {
        ripple.classList.add('active');
      }, 10);
      
      // Clean up after animation
      setTimeout(() => {
        if (ripple && ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 1000);
    } catch (error) {
      console.warn('Ripple effect error:', error);
    }
  }

  // 3D-Tilt-Effekt für Cards
  function handleTilt(e) {
    try {
      const card = this;
      if (!card) return;
      
      const rect = card.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = (y - centerY) / 10;
      const tiltY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
      
      // Highlight-Effekt
      const glare = card.querySelector('.card-glare');
      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%)`;
      }
    } catch (error) {
      console.warn('Tilt effect error:', error);
    }
  }
  
  // Tilt zurücksetzen
  function resetTilt() {
    try {
      if (!this) return;
      
      this.style.transform = '';
      const glare = this.querySelector('.card-glare');
      if (glare) {
        glare.style.background = 'none';
      }
    } catch (error) {
      console.warn('Reset tilt error:', error);
    }
  }

  // Parallax-Effekt für Sektionen
  function parallaxSections() {
    try {
      const sections = document.querySelectorAll('section');
      if (!sections.length) return;
      
      const scrollPosition = window.scrollY;
      
      sections.forEach(section => {
        if (!section) return;
        
        const offset = section.offsetTop;
        const height = section.offsetHeight;
        
        if (scrollPosition >= offset - window.innerHeight && scrollPosition <= offset + height) {
          const shapes = section.querySelectorAll('.parallax-shape');
          
          shapes.forEach(shape => {
            if (!shape) return;
            
            const speed = shape.getAttribute('data-speed') || 0.2;
            const yPos = (scrollPosition - offset) * speed;
            shape.style.transform = `translateY(${yPos}px)`;
          });
        }
      });
    } catch (error) {
      console.warn('Parallax effect error:', error);
    }
  }
  
  // Elemente animieren, wenn sie ins Sichtfeld kommen
  function animateOnScroll() {
    try {
      const elements = document.querySelectorAll('.feature-card, .event-card, .news-card, .stat-item, .section-title, .about-card, .safety-feature');
      if (!elements.length) return;
      
      elements.forEach(el => {
        if (!el) return;
        
        const rect = el.getBoundingClientRect();
        if (!rect) return;
        
        const isVisible = (rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0);
        
        if (isVisible && !el.classList.contains('animate-in')) {
          el.classList.add('animate-in');
        }
      });
    } catch (error) {
      console.warn('Animate on scroll error:', error);
    }
  }
  
  // Statistiken animieren
  function animateStats() {
    const statItems = document.querySelectorAll('.stat-item');
    const statValues = document.querySelectorAll('.stat-value');
    
    if (!statValues.length) return;
    
    let animated = false;
    
    const checkVisibility = () => {
      if (animated) return;
      
      const statsSection = document.querySelector('.stats-section');
      if (!statsSection) return;
      
      const rect = statsSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      
      if (isVisible) {
        animated = true;
        statItems.forEach(item => item.classList.add('animate-in'));
        
        statValues.forEach(element => {
          const finalValue = parseInt(element.getAttribute('data-count'), 10);
          if (!isNaN(finalValue)) {
            animateCounter(element, finalValue);
          }
        });
        
        document.removeEventListener('scroll', checkVisibility);
      }
    };
    
    // Initial check
    checkVisibility();
    
    // Add scroll listener
    document.addEventListener('scroll', checkVisibility);
  }
  
  function animateCounter(element, finalValue) {
    const duration = 2000; // 2 seconds animation
    const startValue = 0;
    const startTime = performance.now();
    
    function updateCounter(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easedProgress);
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = finalValue.toLocaleString();
      }
    }
    
    requestAnimationFrame(updateCounter);
  }
  
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // Zuweisen der Event-Filter-Handler
  if (filterButtons) {
    filterButtons.forEach(btn => {
      if (!btn) return;
      
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        // Button-Stil aktualisieren
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Events filtern
        filterEvents(filter);
      });
    });
  }

  // Funktion zum Filtern von Events
  function filterEvents(filter) {
    const eventCards = document.querySelectorAll('.event-card');
    
    if (!eventCards.length) return;
    
    eventCards.forEach(card => {
      if (!card) return;
      
      if (filter === 'all') {
        card.style.display = '';
        setTimeout(() => {
          card.classList.add('animate-in');
        }, 100);
      } else {
        const eventType = card.getAttribute('data-type');
        if (eventType === filter) {
          card.style.display = '';
          setTimeout(() => {
            card.classList.add('animate-in');
          }, 100);
        } else {
          card.classList.remove('animate-in');
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      }
    });
  }

  // Spezieller Handler für Neuigkeiten-Links
  document.querySelectorAll('.news-link').forEach(link => {
    link.addEventListener('click', function(e) {
      try {
        // Ripple-Effekt für besseres visuelles Feedback
        createLinkRipple(e, this);
        
        // Wenn es ein interner Link ist, den wir selbst verarbeiten wollen
        const href = this.getAttribute('href') || '';
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            const headerHeight = document.querySelector('.main-header').offsetHeight || 80;
            window.scrollTo({
              top: targetElement.offsetTop - headerHeight - 20,
              behavior: 'smooth'
            });
            
            // Notification
            showNotification('Navigiere zum Abschnitt...', 'info', 1500);
          } else {
            console.warn(`Target news element not found: ${href}`);
          }
          return;
        }
        
        // Wenn es ein Link zu forum.html mit einem Anker ist
        if (href.includes('forum.html#')) {
          // Wir speichern den Anker im localStorage
          const anchor = href.split('#')[1];
          if (anchor) {
            localStorage.setItem('elysian-forum-anchor', anchor);
            
            // Notification
            showNotification('Navigiere zu den News-Details...', 'info', 1500);
            
            // Add a slight delay to ensure the notification is visible
            setTimeout(() => {
              // Continue with normal link click
              return true;
            }, 300);
          }
        }
      } catch (error) {
        console.warn('News link click error:', error);
        // Let the normal click event continue
        return true;
      }
    });
  });

  // VERBESSERTE FEATURE-TABS FUNKTIONALITÄT
  if (targetTabs.length) {
    targetTabs.forEach(tab => {
      if (!tab) return;
      
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        
        // Keine Aktion, wenn Tab bereits aktiv
        if (tab.classList.contains('active')) return;
        
        // Tab-Stil aktualisieren
        targetTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Elegante Benachrichtigung
        const tabLabels = {
          'eventgoers': 'Eventbesucher (Elysianer)', 
          'artists': 'Creator & DJs', 
          'organizers': 'Veranstalter & Clubs'
        };
        
        showNotification(`Features für ${tabLabels[target]} werden angezeigt`, 'info', 1500);
        
        // Inhalte mit Animation wechseln
        const contents = document.querySelectorAll('.target-content');
        
        contents.forEach(content => {
          if (content.classList.contains('active')) {
            // Erst ausblenden
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
              content.classList.remove('active');
              
              // Dann neuen Inhalt aktivieren
              const activeContent = document.getElementById(`${target}-content`);
              if (activeContent) {
                activeContent.classList.add('active');
                
                // Kurze Verzögerung für visuellen Effekt
                setTimeout(() => {
                  activeContent.style.opacity = '1';
                  activeContent.style.transform = 'translateY(0)';
                  
                  // Animation der Feature-Karten
                  animateFeatureCards(activeContent);
                  
                  // Bessere Sichtbarkeit auf mobilen Geräten
                  if (window.innerWidth < 768) {
                    const featuresSection = document.querySelector('.features-section');
                    if (featuresSection) {
                      const offsetTop = featuresSection.offsetTop + 
                                      document.querySelector('.target-group-tabs').offsetHeight + 50;
                      
                      window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                      });
                    }
                  }
                }, 50);
              }
            }, 300);
          } else {
            content.classList.remove('active');
          }
        });
      });
    });
    
    // Funktion zum Animieren der Feature-Karten
    function animateFeatureCards(container) {
      const cards = container.querySelectorAll('.feature-card');
      cards.forEach((card, index) => {
        // Verzögertes Einblenden für Kaskaden-Effekt
        setTimeout(() => {
          card.classList.add('animate-in');
          
          // 3D-Effekt kurz aktivieren für Aufmerksamkeit
          card.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(3deg) scale3d(1.03, 1.03, 1.03)';
          setTimeout(() => {
            card.style.transform = '';
          }, 500);
        }, index * 100); // Verzögerung basierend auf Index
      });
    }
    
    // Initialen Tab korrekt anzeigen
    const initialTab = document.querySelector('.target-tab.active');
    if (initialTab) {
      const target = initialTab.getAttribute('data-target');
      const activeContent = document.getElementById(`${target}-content`);
      if (activeContent) {
        activeContent.style.opacity = '1';
        activeContent.style.transform = 'translateY(0)';
        animateFeatureCards(activeContent);
      }
    }
  }

  // Events dynamisch laden
  function loadEvents() {
    try {
      const eventList = document.getElementById('event-list');
      if (!eventList) return;
      
      // Loader entfernen
      const loader = eventList.querySelector('.events-loading');
      if (!loader) return;
      
      // Verzögerung nur für Demonstrationszwecke
      setTimeout(() => {
        loader.remove();
      
        // Beispiel-Events mit generierten Hintergründen
        const events = [
          {
            title: "Quantum Flux",
            description: "Die Fusion aus Techno und visueller Kunst - mit Top DJs und VR-Experiences.",
            date: { day: "24", month: "MRZ" },
            location: "Tresor Berlin",
            type: "party",
            colorA: "#c13afc",
            colorB: "#4a00e0"
          },
          {
            title: "Sicherheit im Nachtleben",
            description: "Workshop für mehr Sicherheit und Awareness bei Veranstaltungen - präsentiert vom Elysian Team.",
            date: { day: "02", month: "APR" },
            location: "Kulturhaus Berlin",
            type: "community",
            colorA: "#00c853",
            colorB: "#009624"
          },
          {
            title: "Neon Dreams",
            description: "Ein Abend voller Neon-Ästhetik und den besten Beats der Underground-Szene.",
            date: { day: "03", month: "APR" },
            location: "Matrix Club",
            type: "party",
            colorA: "#00f2fe",
            colorB: "#4facfe"
          },
          {
            title: "Pulse Session",
            description: "Die Pulse-Teams treffen sich zum gemeinsamen Networking und gemeinsamer Session.",
            date: { day: "17", month: "APR" },
            location: "Watergate",
            type: "community",
            colorA: "#f857a6",
            colorB: "#ff5858"
          },
          {
            title: "Cosmic Gaming Night",
            description: "Multiplayer-Turniere in einer immersiven Gaming-Atmosphäre mit Preisen und Überraschungen.",
            date: { day: "22", month: "APR" },
            location: "Cyberia Lounge",
            type: "gaming",
            colorA: "#11998e",
            colorB: "#38ef7d"
          },
          {
            title: "VR World Exploration",
            description: "Entdecke neue virtuelle Welten und teste die neuesten VR-Technologien in sozialer Atmosphäre.",
            date: { day: "28", month: "APR" },
            location: "Digital Space",
            type: "gaming",
            colorA: "#8e2de2",
            colorB: "#4a00e0"
          }
        ];
      
        // Events einfügen
        events.forEach(event => {
          const card = createEventCard(event);
          if (card) {
            eventList.appendChild(card);
          }
        });
      
        // Animation auslösen
        setTimeout(() => {
          document.querySelectorAll('.event-card').forEach((card, index) => {
            if (card) {
              setTimeout(() => {
                card.classList.add('animate-in');
              }, index * 150);
            }
          });
        }, 100);
      
      }, 1500);
    } catch (error) {
      console.warn('Load events error:', error);
    }
  }
  
  // Event-Karte erstellen
  function createEventCard(event) {
    try {
      if (!event) return null;
      
      const card = document.createElement('div');
      card.classList.add('event-card');
      card.setAttribute('data-type', event.type);
      
      // Gradient-Hintergrund statt Bild
      const gradientStyle = `background: linear-gradient(135deg, ${event.colorA}, ${event.colorB});`;
      
      card.innerHTML = `
        <div class="event-image" style="${gradientStyle}">
          <div class="event-date">
            <span class="day">${event.date.day}</span>
            <span class="month">${event.date.month}</span>
          </div>
          <div class="event-type-badge">${getEventTypeLabel(event.type)}</div>
        </div>
        <div class="event-content">
          <h3>${event.title}</h3>
          <p>${event.description}</p>
          <div class="event-footer">
            <div class="event-location">
              <i class="fas fa-map-marker-alt"></i> ${event.location}
            </div>
            <button class="event-action">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
        <div class="card-glare"></div>
      `;
      
      // 3D-Tilt-Effekt hinzufügen
      card.addEventListener('mousemove', handleTilt);
      card.addEventListener('mouseleave', resetTilt);
      
      // Event-Details-Ansicht
      const actionButton = card.querySelector('.event-action');
      if (actionButton) {
        actionButton.addEventListener('click', () => {
          window.location.href = `event.html?id=${encodeURIComponent(event.title)}`;
        });
      }
      
      return card;
    } catch (error) {
      console.warn('Create event card error:', error);
      return null; // Null zurückgeben bei Fehler
    }
  }
  
  function getEventTypeLabel(type) {
    switch (type) {
      case 'party': return 'Party';
      case 'gaming': return 'Gaming';
      case 'community': return 'Community';
      default: return 'Event';
    }
  }

  // Initialisierung
  // Header-Events
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('active');
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('active');
    });
  }
  
  // Tab Functionality
  targetTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      targetTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Get target content from data attribute
      const targetId = tab.getAttribute('data-target');
      
      // Hide all content
      document.querySelectorAll('.target-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Show target content
      const targetContent = document.getElementById(`${targetId}-content`);
      if (targetContent) {
        targetContent.classList.add('active');
        
        // Animate cards with a small delay
        setTimeout(() => {
          animateFeatureCards(targetContent);
        }, 100);
      }
    });
  });
  
  // Card tilt effect
  document.querySelectorAll('.feature-card, .news-card, .about-card').forEach(card => {
    card.addEventListener('mousemove', handleTilt);
    card.addEventListener('mouseleave', resetTilt);
  });
  
  // Ripple effect
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      createLinkRipple(e, this);
    });
  });
  
  // Events filtern
  if (filterButtons.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get filter value
        const filter = this.getAttribute('data-filter');
        
        // Filter events
        filterEvents(filter);
      });
    });
  }
  
  // Mobile Navigation
  if (mobileNavLinks.length) {
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu) mobileMenu.classList.remove('active');
      });
    });
  }
  
  // Events laden
  loadEvents();
  
  // Parallax-Effekte
  parallaxSections();
  
  // Scroll-Animationen
  animateOnScroll();
  
  // Stats animieren - direkt initialisieren
  initializeStatsAnimation();
  
  // DSGVO Banner anzeigen (nach kurzem Delay)
  setTimeout(() => {
    const privacyBanner = document.getElementById('privacy-banner');
    if (privacyBanner && !localStorage.getItem('privacy-accepted')) {
      privacyBanner.classList.add('visible');
      
      // Accept button
      const acceptBtn = document.getElementById('privacy-accept');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          localStorage.setItem('privacy-accepted', 'true');
          privacyBanner.classList.remove('visible');
          showNotification('Datenschutzeinstellungen gespeichert', 'success');
        });
      }
      
      // Settings button
      const settingsBtn = document.getElementById('privacy-settings');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          // Redirect to privacy settings page or show modal
          showNotification('Datenschutzeinstellungen werden geladen...', 'info');
          // Here you would typically open a modal or redirect
        });
      }
    }
  }, 2000);
  
  // Initialisiere direkt die Statszähler Animation
  function initializeStatsAnimation() {
    // Stelle sicher, dass Statistikzähler sofort animiert werden
    const statItems = document.querySelectorAll('.stat-item');
    const statValues = document.querySelectorAll('.stat-value');
    
    if (statValues.length > 0) {
      // Elemente sichtbar machen
      statItems.forEach(item => {
        item.classList.add('animate-in');
      });
      
      // Zähler starten
      statValues.forEach(element => {
        const finalValue = parseInt(element.getAttribute('data-count'), 10);
        if (!isNaN(finalValue)) {
          animateCounter(element, finalValue);
        }
      });
    }
    
    // Überprüfe den Scroll und animiere bei Bedarf
    window.addEventListener('scroll', function() {
      animateOnScroll();
      
      // Zusätzlich auf news-trial und stat-trial Elemente achten
      const trialElements = document.querySelectorAll('.stat-trial, .news-trial');
      trialElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight && rect.bottom >= 0);
        if (isVisible) {
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        }
      });
    });
  }
  
  // Eine einmalige Überprüfung und Animation beim Seitenstart
  setTimeout(() => {
    animateOnScroll();
    window.dispatchEvent(new Event('scroll'));
  }, 500);
});