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
  function createLinkRipple(e) {
    try {
      if (!this) return;
      
      const ripple = document.createElement('span');
      ripple.classList.add('nav-ripple');
      this.appendChild(ripple);
      
      const rect = this.getBoundingClientRect();
      if (!rect) return;
      
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = `${size}px`;
      
      // Berechnung mit Absicherung
      const left = e.clientX - rect.left - size/2;
      const top = e.clientY - rect.top - size/2;
      
      ripple.style.left = `${left}px`;
      ripple.style.top = `${top}px`;
      
      ripple.classList.add('active');
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove();
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
    try {
      const statItems = document.querySelectorAll('.stat-value');
      if (!statItems.length) return;
      
      const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      };
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target;
              if (!target) return;
              
              const finalValue = parseInt(target.getAttribute('data-count') || '0');
              animateCounter(target, finalValue);
              observer.unobserve(target);
            }
          });
        }, observerOptions);
        
        statItems.forEach(item => {
          if (item) {
            observer.observe(item);
          }
        });
      } else {
        // Fallback für Browser ohne IntersectionObserver
        // Einfache Sichtbarkeitsprüfung
        const checkVisibility = () => {
          statItems.forEach(item => {
            if (!item) return;
            
            const rect = item.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
              const finalValue = parseInt(item.getAttribute('data-count') || '0');
              if (item.textContent === '0') { // Nur animieren, wenn noch nicht animiert
                animateCounter(item, finalValue);
              }
            }
          });
        };
        
        // Einmal prüfen und dann bei Scroll
        checkVisibility();
        window.addEventListener('scroll', checkVisibility);
      }
    } catch (error) {
      console.warn('Animate stats error:', error);
    }
  }
  
  // Zähler animieren
  function animateCounter(element, finalValue) {
    try {
      if (!element) return;
      
      let startTime;
      const duration = 2000;
      const startValue = 0;
      
      function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.floor(startValue + (finalValue - startValue) * easedProgress);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }
      
      requestAnimationFrame(updateCounter);
    } catch (error) {
      console.warn('Counter animation error:', error);
      // Fallback: Direkt den Endwert anzeigen
      if (element) {
        element.textContent = finalValue.toLocaleString();
      }
    }
  }
  
  // Easing-Funktion
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // Event-Filter
  if (filterButtons.length) {
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

  // Cookie-Banner nach kurzer Verzögerung anzeigen
  setTimeout(() => {
    const privacyBanner = document.getElementById('privacy-banner');
    if (privacyBanner && !localStorage.getItem('cookies-accepted')) {
      privacyBanner.classList.add('visible');
    }
  }, 3000);
  
  // Cookie-Banner Buttons
  const acceptButton = document.getElementById('privacy-accept');
  if (acceptButton) {
    acceptButton.addEventListener('click', () => {
      const banner = document.getElementById('privacy-banner');
      if (banner) {
        banner.classList.remove('visible');
      }
      localStorage.setItem('cookies-accepted', 'true');
    });
  }
  
  const settingsButton = document.getElementById('privacy-settings');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      showNotification('Cookie-Einstellungen werden geladen...', 'info');
      setTimeout(() => {
        alert('Cookie-Einstellungen werden geladen...');
      }, 500);
    });
  }

  // Header-Scrolleffekt
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    // Parallax-Effekt für Sektionen
    parallaxSections();
    
    // Elemente animieren, wenn sie ins Sichtfeld kommen
    animateOnScroll();
  });
  
  // Hover-Effekte für Navigationslinks
  navLinks.forEach(link => {
    if (link) {
      link.addEventListener('mouseenter', createLinkRipple);
    }
  });
  
  // Mobile-Links mit Ripple-Effekt
  mobileNavLinks.forEach(link => {
    if (link) {
      link.addEventListener('click', function() {
        if (mobileMenu) {
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });
  
  // 3D-Tilt-Effekt für Feature-Karten
  featureCards.forEach(card => {
    if (card) {
      card.addEventListener('mousemove', handleTilt);
      card.addEventListener('mouseleave', resetTilt);
      
      // Keyboard-Navigation für Barrierefreiheit
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          // Tilt-Effekt temporär aktivieren
          this.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(5deg) scale3d(1.05, 1.05, 1.05)';
          setTimeout(() => {
            this.style.transform = '';
          }, 1000);
        }
      });
    }
  });

  // 3D-Tilt-Effekt für About-Karten
  aboutCards.forEach(card => {
    if (card) {
      card.addEventListener('mousemove', handleTilt);
      card.addEventListener('mouseleave', resetTilt);
    }
  });

  // Hover-Effekt für Safety-Features
  safetyFeatures.forEach(feature => {
    if (feature) {
      feature.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
      });
      
      feature.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    }
  });
  
  // Glitch-Effekt für Hero-Titel verstärken
  if (heroTitle) {
    heroTitle.addEventListener('mouseover', () => {
      heroTitle.classList.add('glitch-intense');
    });
    
    heroTitle.addEventListener('mouseout', () => {
      heroTitle.classList.remove('glitch-intense');
    });
  }
  
  // Mobile Menü Toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  
  // Statistiken animieren - mit Verzögerung für bessere Performance
  setTimeout(animateStats, 500);
  
  // Events laden - mit Verzögerung für bessere Performance
  setTimeout(loadEvents, 500);
  
  // Smooth Scroll für Anker-Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      });
    }
  });
  
  // Easter Egg - Konami Code
  let konamiCodePosition = 0;
  const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  
  document.addEventListener('keydown', function(e) {
    if (e.key === konamiCode[konamiCodePosition]) {
      konamiCodePosition++;
      
      if (konamiCodePosition === konamiCode.length) {
        activateEasterEgg();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });
  
  function activateEasterEgg() {
    try {
      // Matrix-Regen-Effekt aktivieren
      const existingCanvas = document.getElementById('matrix-rain');
      if (existingCanvas) {
        existingCanvas.remove();
      }
      
      const matrixRain = document.createElement('canvas');
      matrixRain.id = 'matrix-rain';
      matrixRain.style.position = 'fixed';
      matrixRain.style.top = '0';
      matrixRain.style.left = '0';
      matrixRain.style.width = '100%';
      matrixRain.style.height = '100%';
      matrixRain.style.zIndex = '9999';
      matrixRain.style.pointerEvents = 'none';
      document.body.appendChild(matrixRain);
      
      initMatrixRain();
      
      showNotification('Easter Egg aktiviert!', 'success', 5000);
      
      // Nach einiger Zeit entfernen
      setTimeout(() => {
        if (matrixRain.parentNode) {
          matrixRain.remove();
        }
      }, 10000);
    } catch (error) {
      console.warn('Easter egg error:', error);
    }
  }
  
  function initMatrixRain() {
    try {
      const canvas = document.getElementById('matrix-rain');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
      const columns = Math.floor(canvas.width / 20);
      const drops = [];
      
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
      
      function draw() {
        if (!ctx) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f0';
        ctx.font = '15px monospace';
        
        for (let i = 0; i < drops.length; i++) {
          const text = characters[Math.floor(Math.random() * characters.length)];
          ctx.fillText(text, i * 20, drops[i] * 20);
          
          if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          
          drops[i]++;
        }
        
        // Canvas könnte in der Zwischenzeit entfernt worden sein
        if (document.getElementById('matrix-rain')) {
          requestAnimationFrame(draw);
        }
      }
      
      draw();
    } catch (error) {
      console.warn('Matrix rain error:', error);
    }
  }


// Schnelleres Laden der Features (ändere die Zeit von 500ms auf 100ms)
setTimeout(function() {
  const featuresSection = document.querySelector('.features-section');
  if (featuresSection) {
    featuresSection.style.opacity = '1';
    
    // Alle Feature-Karten sofort anzeigen
    document.querySelectorAll('.feature-card').forEach(card => {
      card.classList.add('animate-in');
    });
  }
}, 100);

});