// dashboard.js - Main functionality for Elysian Dashboard
console.log("Elysian Dashboard JS geladen");

document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bitte zuerst einloggen!');
    window.location.href = 'login.html';
    return;
  }

  // Initialize particles.js for background effects
  initParticles();

  // Setup user information
  setupUserInfo();

  // Setup dynamic event handlers
  setupEventHandlers();

  // Initialize dashboard components
  initializeDashboard();

  // Simulate audio visualizer animation
  startAudioVisualizer();

  // Activate map radar
  activateMapRadar();

  // WICHTIG: Prüfen, ob die Datei überhaupt geladen wird
  console.log("DOM fully loaded and dashboard.js is running");
});

// NEU: Aktiviert den Radar-Effekt auf der Karte
function activateMapRadar() {
  const radarOverlay = document.querySelector('.radar-overlay');
  if (!radarOverlay) return;
  
  // Radar-Kreise hinzufügen
  const radarCircles = document.querySelector('.radar-circles');
  if (radarCircles) {
    for (let i = 1; i <= 3; i++) {
      const circle = document.createElement('div');
      circle.classList.add('radar-circle');
      circle.style.animationDelay = `${i * 0.5}s`;
      radarCircles.appendChild(circle);
    }
  }
  
  console.log("Map radar activated");
}

// Initialize particles.js background
function initParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#c13afc" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#c13afc",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out"
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" }
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 0.5 } },
          push: { particles_nb: 3 }
        }
      }
    });
    console.log("Particles.js initialized");
  } else {
    console.warn("particles.js nicht geladen");
    // Fallback für particles.js
    createFallbackParticles();
  }
}

// Fallback für particles.js wenn nicht geladen
function createFallbackParticles() {
  const particlesContainer = document.getElementById('particles-js');
  if (!particlesContainer) return;
  
  // Einfache DIV-basierte Partikel erstellen
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('fallback-particle');
    
    // Zufällige Positionierung
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    
    // Zufällige Größe
    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Animation
    const duration = 10 + Math.random() * 20;
    particle.style.animation = `float ${duration}s infinite`;
    
    particlesContainer.appendChild(particle);
  }
  console.log("Fallback-Partikel erstellt");
}

// User information and XP bar setup
function setupUserInfo() {
  // User welcome message
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    const userData = JSON.parse(localStorage.getItem('userData')) || { username: 'Neon Raver' };
    welcomeMsg.textContent = `Willkommen zurück, ${userData.username}!`;
    
    // Füge Typing-Effekt hinzu
    applyTypingEffect(welcomeMsg);
  }

  // Level and XP bar
  const currentLevel = 4;
  const currentXP = 70;
  const xpMax = 100;

  const levelNum = document.getElementById('level-num');
  if (levelNum) levelNum.textContent = currentLevel;

  const xpElement = document.getElementById('xp');
  if (xpElement) xpElement.textContent = currentXP;

  const xpNextElement = document.getElementById('xp-next');
  if (xpNextElement) xpNextElement.textContent = xpMax;
  
  const xpBarFill = document.getElementById('xp-bar-fill');
  if (xpBarFill) {
    // Animieren statt direktes Setzen
    xpBarFill.style.width = '0%';
    setTimeout(() => {
      xpBarFill.style.transition = 'width 1s ease-in-out';
      xpBarFill.style.width = (currentXP / xpMax) * 100 + '%';
    }, 500);
  }

  console.log("User info set up");
}

// Typing-Effekt für Text
function applyTypingEffect(element) {
  if (!element) return;
  
  const originalText = element.textContent;
  element.textContent = '';
  
  let charIndex = 0;
  const typeInterval = setInterval(() => {
    if (charIndex < originalText.length) {
      element.textContent += originalText.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(typeInterval);
    }
  }, 50);
}

// Setup all event handlers for dashboard
function setupEventHandlers() {
  console.log("Setting up event handlers");
  
  // Navigation handlers
  setupNavigationHandlers();
  
  // Button event handlers
  setupButtonHandlers();
  
  // Modal handlers
  setupModalHandlers();
  
  // Map interaction
  setupMapInteraction();
  
  // Music player controls
  setupMusicPlayerControls();
  
  // Touch events für mobile Nutzung
  setupTouchEvents();
}

// Touch events für bessere mobile Nutzung
function setupTouchEvents() {
  const cards = document.querySelectorAll('.grid-card');
  
  cards.forEach(card => {
    let touchStartTime = 0;
    let touchTimeout;
    
    // Touch-Start-Handler
    card.addEventListener('touchstart', () => {
      touchStartTime = Date.now();
      
      // Highlight-Effekt nach kurzem Halten
      touchTimeout = setTimeout(() => {
        card.classList.add('touch-highlight');
      }, 300);
    });
    
    // Touch-Ende-Handler
    card.addEventListener('touchend', () => {
      // Timeout löschen
      clearTimeout(touchTimeout);
      
      // Highlight entfernen
      card.classList.remove('touch-highlight');
      
      // Tap-Dauer prüfen
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 300) {
        // Kurzer Tap - normales Klick-Verhalten
        const mainButton = card.querySelector('.card-btn');
        if (mainButton) mainButton.click();
      }
    });
    
    // Touch-Abbruch-Handler
    card.addEventListener('touchcancel', () => {
      clearTimeout(touchTimeout);
      card.classList.remove('touch-highlight');
    });
  });
  
  console.log("Touch events für mobile Nutzung eingerichtet");
}

// Setup navigation links
function setupNavigationHandlers() {
  // Side navigation items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.getAttribute('id') === 'logout-btn') {
        return; // Logout has special handling
      }
      
      e.preventDefault();
      const section = item.getAttribute('data-section');
      
      // Transition-Effekt vor Navigation
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('page-transition');
        
        // Nach kurzer Verzögerung navigieren
        setTimeout(() => {
          // Remove active class from all items
          navItems.forEach(navItem => navItem.classList.remove('active'));
          
          // Add active class to clicked item
          item.classList.add('active');
          
          // Handle navigation based on section
          handleNavigation(section);
        }, 300);
      } else {
        // Fallback ohne Animation
        navItems.forEach(navItem => navItem.classList.remove('active'));
        item.classList.add('active');
        handleNavigation(section);
      }

      console.log(`Navigation item clicked: ${section}`);
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Animation für Logout
      document.body.classList.add('logout-transition');
      
      // Nach Animation ausloggen
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      }, 500);
      
      console.log("Logout button clicked");
    });
  } else {
    console.warn("Logout button not found");
  }
}

// Handle navigation to different sections
function handleNavigation(section) {
  console.log(`Navigating to section: ${section}`);
  
  // Speichern des aktiven Abschnitts im localStorage
  localStorage.setItem('activeSection', section);
  
  // Handle different sections
  switch(section) {
    case 'dashboard':
      // Already on dashboard, do nothing
      break;
    case 'events':
      window.location.href = 'event.html'; // Geändert von 'events.html' zu 'event.html'
      break;
    case 'map':
      window.location.href = 'map.html';
      break;
    case 'forum':
      window.location.href = 'forum.html';
      break;
    case 'music':
      window.location.href = 'music.html';
      break;
    case 'profile':
      window.location.href = 'profile.html';
      break;
    default:
      console.warn(`Unknown section: ${section}`);
      // Fallback zur Dashboard-Ansicht
      window.location.href = 'index.html';
  }
}

// Setup button handlers
function setupButtonHandlers() {
  // Header buttons
  const notificationsBtn = document.getElementById('notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', toggleNotificationsPanel);
    
    // Animation für Benachrichtigungssymbol
    animateNotificationIcon(notificationsBtn);
    
    console.log("Notifications button handler set");
  } else {
    console.warn("Notifications button not found");
  }
  
  const emergencyBtn = document.getElementById('emergency-btn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', openEmergencyModal);
    
    // Pulsierende Animation für Notfall-Button
    emergencyBtn.classList.add('emergency-pulse');
    
    console.log("Emergency button handler set");
  } else {
    console.warn("Emergency button not found");
  }
  
  // Card action buttons
  setupCardButtons();
}

// Animiert das Benachrichtigungssymbol
function animateNotificationIcon(button) {
  if (!button) return;
  
  // Anzahl ungelesener Benachrichtigungen simulieren
  const unreadCount = Math.floor(Math.random() * (5 - 1 + 1) + 1); // 1-5 Benachrichtigungen
  
  // Badge mit Anzahl erstellen, falls noch nicht vorhanden
  let badge = button.querySelector('.notification-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.classList.add('notification-badge');
    button.appendChild(badge);
  }
  
  // Badge-Wert setzen und Animation starten
  badge.textContent = unreadCount;
  badge.classList.add('badge-animation');
  
  // Notification-Bell leicht schwingen lassen
  const icon = button.querySelector('i');
  if (icon) {
    icon.classList.add('bell-animation');
    
    // Regelmäßiges Aufleuchten des Icons
    setInterval(() => {
      icon.classList.add('bell-glow');
      setTimeout(() => {
        icon.classList.remove('bell-glow');
      }, 500);
    }, 5000);
  }
}

// Setup buttons in dashboard cards
function setupCardButtons() {
  // Events card
  const viewEventsBtn = document.getElementById('view-events-btn');
  if (viewEventsBtn) {
    viewEventsBtn.addEventListener('click', () => {
      console.log("View events button clicked");
      
      // Übergangseffekt
      applyButtonClickEffect(viewEventsBtn);
      
      // Nach Animation zur Seite navigieren
      setTimeout(() => {
        window.location.href = 'event.html'; // Stelle sicher, dass es event.html ist
      }, 300);
    });
    console.log("View events button handler set");
  } else {
    console.warn("View events button not found");
  }
  
  // Map card
  const viewMapBtn = document.getElementById('view-map-btn');
  if (viewMapBtn) {
    viewMapBtn.addEventListener('click', () => {
      console.log("View map button clicked");
      
      applyButtonClickEffect(viewMapBtn);
      
      setTimeout(() => {
        window.location.href = 'map.html';
      }, 300);
    });
    console.log("View map button handler set");
  } else {
    console.warn("View map button not found");
  }
  
  // Surveys button
  const viewSurveysBtn = document.getElementById('view-surveys-btn');
  if (viewSurveysBtn) {
    viewSurveysBtn.addEventListener('click', () => {
      console.log("View surveys button clicked");
      
      applyButtonClickEffect(viewSurveysBtn);
      
      setTimeout(() => {
        window.location.href = 'survey.html'; // GEÄNDERT: von 'surveys.html' zu 'survey.html'
      }, 300);
    });
    console.log("View surveys button handler set");
  } else {
    console.warn("View surveys button not found");
  }
  
  // Invite friends button
  const inviteFriendsBtn = document.getElementById('invite-friends-btn');
  if (inviteFriendsBtn) {
    inviteFriendsBtn.addEventListener('click', () => {
      console.log("Invite friends button clicked");
      
      applyButtonClickEffect(inviteFriendsBtn);
      
      // Modales Sharing-Fenster statt einfachem Alert
      setTimeout(() => {
        showSharingModal();
      }, 300);
    });
    console.log("Invite friends button handler set");
  } else {
    console.warn("Invite friends button not found");
  }
  
  // Setup other card buttons
  document.querySelectorAll('.card-btn').forEach(btn => {
    if (!btn.id) { // Only handle buttons that don't already have specific handlers
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.textContent.trim();
        console.log(`Generic card button clicked: ${action}`);
        
        applyButtonClickEffect(btn);
        
        setTimeout(() => {
          // Toast-Nachricht statt Alert
          showToast(`Aktion: ${action} - Funktion wird bald verfügbar sein!`);
        }, 300);
      });
    }
  });
  console.log("Generic card buttons handlers set");
  
  // Event bookmarks
  document.querySelectorAll('.event-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = btn.querySelector('i');
      
      // Animation für Bookmark-Toggle
      btn.classList.add('bookmark-animation');
      
      setTimeout(() => {
        // Toggle bookmark icon
        if (icon.classList.contains('fas')) {
          icon.classList.remove('fas');
          icon.classList.add('far');
        } else {
          icon.classList.remove('far');
          icon.classList.add('fas');
        }
        
        btn.classList.remove('bookmark-animation');
        
        const eventName = btn.closest('.event-item').querySelector('h4').textContent;
        console.log(`Event bookmark toggled: ${eventName}`);
        
        // Toast statt Alert
        showToast(`Event "${eventName}" ${icon.classList.contains('fas') ? 'gemerkt' : 'entfernt'}`);
      }, 300);
    });
  });
  console.log("Event bookmark handlers set");
}

// Button-Klick-Effekt
function applyButtonClickEffect(button) {
  if (!button) return;
  
  // Ripple-Effekt hinzufügen
  const ripple = document.createElement('span');
  ripple.classList.add('button-ripple');
  button.appendChild(ripple);
  
  // Nach Animation entfernen
  setTimeout(() => {
    ripple.remove();
  }, 500);
}

// Toast-Nachricht anzeigen
function showToast(message, duration = 3000) {
  // Bestehenden Toast entfernen
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Neuen Toast erstellen
  const toast = document.createElement('div');
  toast.classList.add('toast-message');
  toast.textContent = message;
  
  // Zum Body hinzufügen
  document.body.appendChild(toast);
  
  // Animation starten
  setTimeout(() => {
    toast.classList.add('show-toast');
  }, 10);
  
  // Nach Dauer wieder ausblenden
  setTimeout(() => {
    toast.classList.remove('show-toast');
    
    // Nach Ausblenden entfernen
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, duration);
}

// Sharing-Modal anzeigen
function showSharingModal() {
  // Prüfen, ob bereits ein Modal existiert
  if (document.querySelector('.sharing-modal')) return;
  
  // Modal erstellen
  const modal = document.createElement('div');
  modal.classList.add('sharing-modal');
  
  // Modal-Inhalt
  modal.innerHTML = `
    <div class="sharing-content">
      <div class="sharing-header">
        <h3>Teile Elysian mit Freunden</h3>
        <button class="close-sharing">&times;</button>
      </div>
      <div class="sharing-body">
        <p>Lade deine Freunde zu Elysian ein:</p>
        <div class="share-code">
          <span>ELYSIAN2024</span>
          <button class="copy-code">Kopieren</button>
        </div>
        <div class="share-options">
          <button class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></button>
          <button class="share-btn telegram"><i class="fab fa-telegram"></i></button>
          <button class="share-btn email"><i class="fas fa-envelope"></i></button>
          <button class="share-btn messenger"><i class="fab fa-facebook-messenger"></i></button>
        </div>
      </div>
    </div>
  `;
  
  // Zum Body hinzufügen
  document.body.appendChild(modal);
  
  // Animation starten
  setTimeout(() => {
    modal.classList.add('show-modal');
  }, 10);
  
  // Schließen-Button
  const closeBtn = modal.querySelector('.close-sharing');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show-modal');
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
  
  // Kopieren-Button
  const copyBtn = modal.querySelector('.copy-code');
  copyBtn.addEventListener('click', () => {
    const code = modal.querySelector('.share-code span').textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.textContent = 'Kopiert!';
      setTimeout(() => {
        copyBtn.textContent = 'Kopieren';
      }, 2000);
    });
  });
  
  // Share-Buttons
  modal.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Hier würde normalerweise die richtige Sharing-Funktion kommen
      showToast('Sharing-Funktion wird bald verfügbar sein!');
    });
  });
}

// Setup modal handlers
function setupModalHandlers() {
  // Notifications panel
  const closeNotificationsBtn = document.querySelector('.notifications-panel .close-panel');
  if (closeNotificationsBtn) {
    closeNotificationsBtn.addEventListener('click', toggleNotificationsPanel);
    console.log("Close notifications button handler set");
  } else {
    console.warn("Close notifications button not found");
  }
  
  // Emergency modal
  const closeEmergencyBtn = document.querySelector('.emergency-modal .close-modal');
  if (closeEmergencyBtn) {
    closeEmergencyBtn.addEventListener('click', closeEmergencyModal);
    console.log("Close emergency button handler set");
  } else {
    console.warn("Close emergency button not found");
  }
  
  // Emergency options
  const emergencyOptions = document.querySelectorAll('.emergency-option');
  emergencyOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Klick-Feedback hinzufügen
      option.classList.add('option-pulse');
      
      setTimeout(() => {
        // Remove selected class from all options
        emergencyOptions.forEach(opt => {
          opt.classList.remove('selected');
          opt.classList.remove('option-pulse');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        console.log(`Emergency option selected: ${option.getAttribute('data-type')}`);
      }, 300);
    });
  });
  console.log("Emergency options handlers set");
  
  // Send emergency button
  const sendEmergencyBtn = document.getElementById('send-emergency');
  if (sendEmergencyBtn) {
    sendEmergencyBtn.addEventListener('click', handleEmergencyRequest);
    console.log("Send emergency button handler set");
  } else {
    console.warn("Send emergency button not found");
  }
}

// Toggle notifications panel - FIXED
function toggleNotificationsPanel() {
  const panel = document.querySelector('.notifications-panel');
  if (panel) {
    // Simply toggle the show class - FIXED
    panel.classList.toggle('show');
    console.log("Notifications panel toggled");
    
    // Reset badges when opening
    if (panel.classList.contains('show')) {
      const badge = document.querySelector('.notification-badge');
      if (badge) {
        badge.classList.add('badge-reset');
        
        setTimeout(() => {
          badge.textContent = "0";
          setTimeout(() => {
            badge.classList.remove('badge-reset');
          }, 300);
        }, 500);
      }
    }
  } else {
    console.warn("Notifications panel not found");
  }
}

// Open emergency modal
function openEmergencyModal() {
  const modal = document.querySelector('.emergency-modal');
  if (modal) {
    // Verbesserte Animation
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('show');
      
      // Dramatischer Effekt für Notfall
      document.body.classList.add('emergency-active');
      
      // Nach kurzer Zeit den Effekt reduzieren
      setTimeout(() => {
        document.body.classList.remove('emergency-active');
      }, 1000);
    }, 10);
    
    console.log("Emergency modal opened");
  } else {
    console.warn("Emergency modal not found");
  }
}

// Close emergency modal
function closeEmergencyModal() {
  const modal = document.querySelector('.emergency-modal');
  if (modal) {
    // Verbesserte Animation
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
    
    console.log("Emergency modal closed");
  } else {
    console.warn("Emergency modal not found");
  }
}

// Handle emergency request submission
function handleEmergencyRequest() {
  const selectedOption = document.querySelector('.emergency-option.selected');
  const messageElement = document.getElementById('emergency-message');
  const message = messageElement ? messageElement.value : '';
  
  if (!selectedOption) {
    // Visuelles Feedback für fehlende Auswahl
    const options = document.querySelectorAll('.emergency-option');
    options.forEach(option => {
      option.classList.add('option-required');
      setTimeout(() => {
        option.classList.remove('option-required');
      }, 800);
    });
    
    // Toast statt Alert
    showToast('Bitte wähle eine Notfall-Option aus.', 3000);
    return;
  }
  
  const emergencyType = selectedOption.getAttribute('data-type');
  const emergencyTypeText = selectedOption.querySelector('span').textContent;
  
  // Verarbeitung anzeigen
  const sendButton = document.getElementById('send-emergency');
  if (sendButton) {
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
    sendButton.disabled = true;
  }
  
  console.log(`Notfalltyp: ${emergencyType}, Nachricht: ${message}`);
  
  // Simuliere Server-Antwort mit Verzögerung
  setTimeout(() => {
    // Erfolgsmeldung mit Toast
    showToast(`Notfall gemeldet: ${emergencyTypeText}\nDas Security-Team wurde benachrichtigt.`, 5000);
    
    // Modal schließen
    closeEmergencyModal();
    
    // Button zurücksetzen
    if (sendButton) {
      sendButton.innerHTML = 'Notfall melden';
      sendButton.disabled = false;
    }
    
    // Tracking für Notfälle im lokalen Speicher
    const timestamp = new Date().toISOString();
    const emergencyData = {
      type: emergencyType, 
      text: emergencyTypeText,
      message,
      timestamp
    };
    
    // Speichere im localStorage
    const pastEmergencies = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    pastEmergencies.push(emergencyData);
    localStorage.setItem('emergencyHistory', JSON.stringify(pastEmergencies));
    
  }, 2000);
}

// Setup map interaction
function setupMapInteraction() {
  const mapDots = document.querySelectorAll('.map-dot');
  mapDots.forEach(dot => {
    // Pulsieren für Map-Dots
    dot.classList.add('map-dot-pulse');
    
    dot.addEventListener('click', () => {
      // Highlight-Effekt beim Klick
      dot.classList.add('dot-selected');
      
      const locationTooltip = dot.querySelector('.dot-tooltip');
      const locationName = locationTooltip ? locationTooltip.textContent : 'Unknown Location';
      
      // Save the selected location to use on the map page
      localStorage.setItem('selectedLocation', locationName);
      
      console.log(`Map location clicked: ${locationName}`);
      
      // Verzögerung für visuelle Rückmeldung
      setTimeout(() => {
        // Navigate to map page
        window.location.href = 'map.html';
      }, 400);
    });
    
    // Hover-Effekt verbessern
    dot.addEventListener('mouseenter', () => {
      const tooltip = dot.querySelector('.dot-tooltip');
      if (tooltip) {
        tooltip.classList.add('tooltip-visible');
      }
    });
    
    dot.addEventListener('mouseleave', () => {
      const tooltip = dot.querySelector('.dot-tooltip');
      if (tooltip) {
        tooltip.classList.remove('tooltip-visible');
      }
    });
  });
  console.log("Map interaction handlers set");
}

// Setup music player controls
function setupMusicPlayerControls() {
  const playBtn = document.querySelector('.play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', togglePlayState);
    console.log("Play button handler set");
  } else {
    console.warn("Play button not found");
  }
  
  const prevBtn = document.querySelector('.control-btn:first-of-type');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log("Previous track button clicked");
      
      // Animation für Button
      prevBtn.classList.add('btn-clicked');
      setTimeout(() => {
        prevBtn.classList.remove('btn-clicked');
      }, 300);
      
      // Musik-Player-Effekt
      simulateTrackChange('prev');
    });
    console.log("Previous track button handler set");
  } else {
    console.warn("Previous track button not found");
  }
  
  const nextBtn = document.querySelector('.control-btn:last-of-type');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log("Next track button clicked");
      
      // Animation für Button
      nextBtn.classList.add('btn-clicked');
      setTimeout(() => {
        nextBtn.classList.remove('btn-clicked');
      }, 300);
      
      // Musik-Player-Effekt
      simulateTrackChange('next');
    });
    console.log("Next track button handler set");
  } else {
    console.warn("Next track button not found");
  }
  
  // Track-Fortschritt initialisieren
  initializeTrackProgress();
}

// Simuliert Trackwechsel im Player
function simulateTrackChange(direction) {
  // Tracknamen für die Simulation
  const tracks = [
    "Neon Dreams - Electric Horizon",
    "Cybernetic Pulse - Digital Rain",
    "Synthwave Riders - Midnight Drive",
    "Laser Horizon - Future City",
    "Pixel Forest - Crystal Caves"
  ];
  
  // Aktuellen Track abrufen
  const trackElement = document.querySelector('.track-info h4');
  if (!trackElement) return;
  
  // Aktuellen Index finden
  let currentIndex = tracks.findIndex(track => track === trackElement.textContent);
  if (currentIndex === -1) currentIndex = 0;
  
  // Nächsten/vorherigen Track bestimmen
  if (direction === 'next') {
    currentIndex = (currentIndex + 1) % tracks.length;
  } else {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  }
  
  // Übergangseffekt
  trackElement.classList.add('track-changing');
  
  setTimeout(() => {
    // Neuen Track setzen
    trackElement.textContent = tracks[currentIndex];
    
    // Übergang entfernen
    trackElement.classList.remove('track-changing');
    
    // Track-Fortschritt zurücksetzen
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    // Zufällige Länge für neuen Track
    const minutes = Math.floor(Math.random() * 3) + 3;
    const seconds = Math.floor(Math.random() * 60);
    const durationElement = document.querySelector('.track-duration');
    if (durationElement) {
      durationElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Wenn gerade abgespielt wird, Visualizer aktualisieren
    const playBtn = document.querySelector('.play-btn i');
    if (playBtn && playBtn.classList.contains('fa-pause')) {
      startAudioVisualizer(true);
    }
    
    // Toast für Track-Änderung
    showToast(`${direction === 'next' ? 'Nächster' : 'Vorheriger'} Track: ${tracks[currentIndex]}`);
  }, 300);
}

// Initialisiert den Track-Fortschrittsbalken
function initializeTrackProgress() {
  const progressBar = document.querySelector('.progress-bar-fill');
  const trackProgress = document.querySelector('.track-progress');
  
  if (!progressBar || !trackProgress) return;
  
  // Aktueller Fortschritt
  let progress = 0;
  let isPlaying = false;
  
  // Fortschrittsupdate-Funktion
  function updateProgress() {
    if (!isPlaying) return;
    
    progress += 0.5;
    if (progress > 100) progress = 0;
    
    progressBar.style.width = `${progress}%`;
    
    // Aktuelle Zeit berechnen
    const durationElement = document.querySelector('.track-duration');
    if (durationElement) {
      const durationParts = durationElement.textContent.split(':');
      const totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
      const currentSeconds = Math.floor((progress / 100) * totalSeconds);
      const currentMinutes = Math.floor(currentSeconds / 60);
      const remainingSeconds = currentSeconds % 60;
      
      const currentTimeElement = document.querySelector('.current-time');
      if (currentTimeElement) {
        currentTimeElement.textContent = `${currentMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    }
    
    requestAnimationFrame(updateProgress);
  }
  
  // Play/Pause Status überwachen
  const playBtn = document.querySelector('.play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      
      if (isPlaying) {
        updateProgress();
      }
    });
  }
  
  // Klickbaren Fortschrittsbalken einrichten
  if (trackProgress) {
    trackProgress.addEventListener('click', (e) => {
      const rect = trackProgress.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const newProgress = (clickPosition / rect.width) * 100;
      
      // Fortschritt setzen
      progress = newProgress;
      progressBar.style.width = `${progress}%`;
      
      // Wenn nicht abgespielt wird, starten
      if (!isPlaying) {
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) playBtn.click();
      }
    });
  }
}

// Toggle play/pause button state
function togglePlayState() {
  const playBtn = document.querySelector('.play-btn');
  if (!playBtn) return;
  
  const icon = playBtn.querySelector('i');
  if (!icon) return;
  
  // Animation für Button-Klick
  playBtn.classList.add('btn-clicked');
  setTimeout(() => {
    playBtn.classList.remove('btn-clicked');
  }, 300);
  
  if (icon.classList.contains('fa-play')) {
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    console.log("Music player: Play");
    startAudioVisualizer(true);
    
    // Player-UI aktualisieren
    document.querySelector('.music-player').classList.add('is-playing');
    
    // Play-Toast anzeigen
    const trackElement = document.querySelector('.track-info h4');
    if (trackElement) {
      showToast(`Spielt jetzt: ${trackElement.textContent}`);
    }
  } else {
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
    console.log("Music player: Pause");
    startAudioVisualizer(false);
    
    // Player-UI aktualisieren
    document.querySelector('.music-player').classList.remove('is-playing');
  }
}

// Initialize dashboard components
function initializeDashboard() {
  // Check if there's a pending rescue mode from another page
  const openRescue = localStorage.getItem('openRescue');
  if (openRescue === 'true') {
    openEmergencyModal();
    localStorage.removeItem('openRescue');
    console.log("Emergency modal opened from redirect");
  }
  
  // Randomize audio visualizer bars initially
  startAudioVisualizer(false);
  
  // Randomize quest progress at start
  randomizeQuestProgress();
  
  // Aktive Bereiche hervorheben basierend auf localStorage
  highlightActiveSection();

  console.log("Dashboard initialized");
  
  // Lade-Animation ausblenden
  hideLoadingScreen();
}

// Versteckt die Ladeanimation
function hideLoadingScreen() {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
    
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// Markiert den aktiven Abschnitt
function highlightActiveSection() {
  const activeSection = localStorage.getItem('activeSection') || 'dashboard';
  
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-section') === activeSection) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Animate audio visualizer bars
function startAudioVisualizer(active = false) {
  const visualizerBars = document.querySelectorAll('.audio-visualizer span');
  if (visualizerBars.length === 0) {
    console.warn("Audio visualizer bars not found");
    return;
  }
  
  // Set initial random heights
  visualizerBars.forEach(bar => {
    // Verbesserte Animation mit Verzögerung für jede Säule
    const delay = Math.random() * 200;
    setTimeout(() => {
      const height = active ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 40);
      bar.style.height = `${height}%`;
      
      // Farbe basierend auf Höhe
      const hue = 280 + (height / 100) * 60; // Lila bis Pink-Bereich
      bar.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
    }, delay);
  });
  
  // Only continue animation if active
  if (active) {
    setTimeout(() => {
      startAudioVisualizer(active);
    }, 200);
  }
}

// Randomize quest progress
function randomizeQuestProgress() {
  const questItems = document.querySelectorAll('.quest-item');
  if (questItems.length === 0) {
    console.warn("Quest items not found");
    return;
  }

  questItems.forEach((quest, index) => {
    const progressBar = quest.querySelector('.progress-fill');
    if (progressBar) {
      // Verzögerte Animation für jede Quest
      setTimeout(() => {
        const progressPercent = Math.floor(Math.random() * 100);
        
        // Animation statt direktes Setzen
        progressBar.style.transition = 'width 1s ease-out';
        progressBar.style.width = `${progressPercent}%`;
        
        // Fortschritts-Text aktualisieren
        const progressText = quest.querySelector('.progress-text');
        if (progressText) {
          progressText.textContent = `${progressPercent}%`;
        }
        
        // Belohnungen basierend auf Fortschritt
        updateQuestRewards(quest, progressPercent);
      }, index * 300);
    }
  });
  console.log("Quest progress randomized");
}

// Aktualisiert die Quest-Belohnungen basierend auf dem Fortschritt
function updateQuestRewards(quest, progress) {
  const rewardsDiv = quest.querySelector('.quest-rewards');
  if (!rewardsDiv) return;
  
  // Belohnungen basierend auf Fortschritt anzeigen
  let rewardsHTML = '';
  
  if (progress < 30) {
    rewardsHTML = '<span class="reward locked"><i class="fas fa-lock"></i> +10 XP</span>';
  } else if (progress < 60) {
    rewardsHTML = '<span class="reward">+10 XP</span> <span class="reward locked"><i class="fas fa-lock"></i> Badge</span>';
  } else if (progress < 100) {
    rewardsHTML = '<span class="reward">+10 XP</span> <span class="reward">Badge</span> <span class="reward locked"><i class="fas fa-lock"></i> +50 Token</span>';
  } else {
    rewardsHTML = '<span class="reward">+10 XP</span> <span class="reward">Badge</span> <span class="reward">+50 Token</span>';
    
    // Quest abgeschlossen - Effekt hinzufügen
    quest.classList.add('quest-completed');
    
    // Konfetti-Effekt
    setTimeout(() => {
      showQuestCompletedEffect(quest);
    }, 500);
  }
  
  rewardsDiv.innerHTML = rewardsHTML;
}

// Quest-Abschluss-Effekt
function showQuestCompletedEffect(quest) {
  // Konfetti-Container
  const confettiContainer = document.createElement('div');
  confettiContainer.classList.add('confetti-container');
  quest.appendChild(confettiContainer);
  
  // Konfetti hinzufügen
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    
    // Zufällige Farbe
    const colors = ['#c13afc', '#fc3a8f', '#3afcb8', '#f8fc3a'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = color;
    
    // Zufällige Position und Animation
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.animationDuration = `${0.5 + Math.random() * 1}s`;
    
    confettiContainer.appendChild(confetti);
  }
  
  // Nach Animation entfernen
  setTimeout(() => {
    confettiContainer.remove();
  }, 2000);
}

// ========== MYSTISCHE EFFEKTE FÜR ELYSIAN ==========
console.log("Mystische Effekte werden initialisiert...");

// Funktion zum Hinzufügen mystischer Symbole zum Hintergrund
function addMysticalSymbols() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) {
    console.warn("Main content nicht gefunden für mystische Symbole");
    return;
  }
  
  // Bestehende Symbole entfernen falls vorhanden
  const existingSymbols = document.querySelectorAll('.mystical-symbol');
  existingSymbols.forEach(symbol => symbol.remove());
  
  // Anzahl der Symbole
  const symbolCount = 8;
  
  for (let i = 0; i < symbolCount; i++) {
    const symbol = document.createElement('div');
    symbol.classList.add('mystical-symbol');
    
    // Zufällig Symbol 1 oder 2 auswählen
    if (Math.random() > 0.5) {
      symbol.classList.add('symbol-1');
    } else {
      symbol.classList.add('symbol-2');
    }
    
    // Zufällige Position
    symbol.style.top = `${Math.random() * 100}%`;
    symbol.style.left = `${Math.random() * 100}%`;
    
    // Zufällige Drehgeschwindigkeit und Richtung
    const direction = Math.random() > 0.5 ? 1 : -1;
    const duration = 15 + Math.random() * 30;
    symbol.style.animation = `rotate ${duration}s linear infinite ${direction > 0 ? '' : 'reverse'}`;
    
    // Zufällige Größe
    const size = 30 + Math.random() * 50;
    symbol.style.width = `${size}px`;
    symbol.style.height = `${size}px`;
    
    // Zufällige Transparenz
    symbol.style.opacity = 0.1 + Math.random() * 0.3;
    
    // Zufällige Verzögerung für das Erscheinen
    const appearDelay = i * 200;
    symbol.style.animationDelay = `${appearDelay}ms`;
    
    mainContent.appendChild(symbol);
  }
  console.log(`${symbolCount} mystische Symbole hinzugefügt`);
}

// Funktion zum Erstellen eines Konstellation-Effekts im Hintergrund
function createConstellation() {
  // Bestehende Konstellation entfernen falls vorhanden
  const existingConstellation = document.querySelector('.constellation');
  if (existingConstellation) existingConstellation.remove();
  
  const constellation = document.createElement('div');
  constellation.classList.add('constellation');
  document.body.appendChild(constellation);
  
  const starCount = 20;
  
  // Stars erstellen
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // Zufällige Position
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    
    // Unterschiedliche Größen für Sterne
    const size = 1 + Math.random() * 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Pulsierende Animation für Sterne
    star.style.animation = `pulse ${3 + Math.random() * 3}s infinite alternate`;
    
    // Zufällige Richtung für die Linien
    const angle = Math.random() * 360;
    star.style.setProperty('--angle', `${angle}deg`);
    
    // Linie/Strahl von jedem Stern
    const after = document.createElement('div');
    after.classList.add('star-ray');
    after.style.position = 'absolute';
    after.style.top = '50%';
    after.style.left = '50%';
    after.style.width = `${50 + Math.random() * 100}px`;
    after.style.height = '1px';
    after.style.background = 'linear-gradient(90deg, rgba(193, 58, 252, 0.5), transparent)';
    after.style.transformOrigin = 'left';
    after.style.transform = `rotate(${angle}deg)`;
    after.style.opacity = '0.3';
    
    // Animation für Strahlen
    after.style.animation = `fade ${5 + Math.random() * 5}s infinite alternate`;
    
    star.appendChild(after);
    constellation.appendChild(star);
  }
  
  // Langsam Opazität animieren für das Erscheinen
  constellation.style.opacity = '0';
  setTimeout(() => {
    constellation.style.transition = 'opacity 2s ease-in';
    constellation.style.opacity = '0.2';
  }, 500);
  
  console.log("Konstellation-Hintergrund erstellt");
  
  // Interaktive Bewegung basierend auf Mausposition
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    // Sterne leicht bewegen basierend auf Mausposition
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      const moveX = (x - 0.5) * 10;
      const moveY = (y - 0.5) * 10;
      star.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
}

// Funktion zum Hinzufügen mystischer Hover-Effekte zu Karten
function enhanceCards() {
  const cards = document.querySelectorAll('.grid-card');
  
  cards.forEach((card, index) => {
    // Floating 3D-Effekt
    card.classList.add('floating-card');
    
    // Mystischer Nebeleffekt für den Hintergrund
    card.classList.add('misty-bg');
    
    // Sanftes Pulsieren hinzufügen
    card.style.animation = `pulse ${4 + Math.random() * 2}s infinite alternate`;
    
    // 3D-Rotationseffekt bei Hover
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    // Zurücksetzen bei Mouseout
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
    
    console.log(`Karte ${index + 1} verbessert`);
  });
}

// Funktion zum Verbessern der Buttons mit magischen Effekten
function enhanceButtons() {
  const buttons = document.querySelectorAll('.card-btn, .control-btn, .event-action');
  
  buttons.forEach(btn => {
    // Magischer Staub-Effekt
    btn.classList.add('magic-btn');
    
    // Hover-Effekt mit Partikelexplosion
    btn.addEventListener('mouseenter', () => {
      // Button Glow-Effekt
      btn.classList.add('btn-glow');
      
      // Partikel-Explosion
      createButtonParticles(btn);
    });
    
    // Glow entfernen beim Verlassen
    btn.addEventListener('mouseleave', () => {
      btn.classList.remove('btn-glow');
    });
  });
  
  // Spezieller Fokus auf bestimmte wichtige Buttons
  const importantButtons = [
    document.getElementById('emergency-btn'),
    document.querySelector('.play-btn'),
    document.getElementById('send-emergency')
  ];
  
  importantButtons.forEach(btn => {
    if (!btn) return;
    btn.classList.add('magical-aura');
    
    // Pulsierende Aura für wichtige Buttons
    btn.style.animation = 'pulse-aura 3s infinite alternate';
  });
  
  console.log("Buttons mit magischen Effekten verbessert");
}

// Erstellt Partikel für den Button-Hover-Effekt
function createButtonParticles(button) {
  // Container für Partikel
  let particleContainer = button.querySelector('.btn-particles');
  
  // Falls noch nicht vorhanden, erstellen
  if (!particleContainer) {
    particleContainer = document.createElement('div');
    particleContainer.classList.add('btn-particles');
    button.appendChild(particleContainer);
  }
  
  // Partikel löschen, falls vorhanden
  particleContainer.innerHTML = '';
  
  // Partikel erstellen
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('span');
    particle.classList.add('btn-particle');
    
    // Zufällige Position
    const angle = Math.random() * 360;
    const distance = 30 + Math.random() * 20;
    
    // Zufällige Größe
    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Zufällige Farbe
    const hue = 280 + Math.random() * 60;
    particle.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
    
    // Animation
    particle.style.animation = `particleFly 1s forwards`;
    particle.style.animationDelay = `${Math.random() * 0.2}s`;
    particle.style.setProperty('--angle', `${angle}deg`);
    particle.style.setProperty('--distance', `${distance}px`);
    
    particleContainer.appendChild(particle);
  }
}

// Funktion zum Hinzufügen von mystischen Dividern
function addMysticDividers() {
  const cardContents = document.querySelectorAll('.card-content');
  
  cardContents.forEach((content, index) => {
    // Mystischen Divider am Anfang des Inhalts hinzufügen
    const divider = document.createElement('div');
    divider.classList.add('mystic-divider');
    
    // Divider mit Runen-Symbolen
    divider.innerHTML = `
      <span class="rune-symbol">⚝</span>
      <span class="divider-line"></span>
      <span class="rune-symbol">⚝</span>
    `;
    
    // Animation für Divider
    divider.classList.add('divider-anim');
    
    content.prepend(divider.cloneNode(true));
    
    console.log(`Mystischer Divider zu Karte ${index + 1} hinzugefügt`);
  });
}

// Funktion zum Hinzufügen eines pulsierenden Energiekerns zu Status-Items
function addEnergyCores() {
  const statusIcons = document.querySelectorAll('.status-icon');
  
  statusIcons.forEach((icon, index) => {
    icon.classList.add('energy-core');
    
    // Inneren Gloweffekt hinzufügen
    const energyCore = document.createElement('span');
    energyCore.classList.add('core-glow');
    
    // Zufällige Farbe im Lila-Bereich
    const hue = 280 + Math.random() * 60;
    energyCore.style.boxShadow = `0 0 10px 2px hsla(${hue}, 80%, 60%, 0.8)`;
    energyCore.style.animation = `coreGlow ${2 + Math.random()}s infinite alternate`;
    
    icon.appendChild(energyCore);
    
    console.log(`Energie-Kern zu Status-Icon ${index + 1} hinzugefügt`);
  });
}

// Funktion zum Hinzufügen mystischer Runen als Dekoration
function addRuneDecorations() {
  // Array von nordischen Runen-Zeichen
  const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];
  
  // Vorhandene Runen entfernen
  document.querySelectorAll('.rune-decoration').forEach(rune => rune.remove());
  
  // Zu den Karten-Titeln Runen hinzufügen
  const cardTitles = document.querySelectorAll('.card-header h3');
  
  cardTitles.forEach(title => {
    // Zufällige Rune auswählen
    const runeIndex = Math.floor(Math.random() * runes.length);
    const rune = runes[runeIndex];
    
    // Span mit Rune erstellen
    const runeSpan = document.createElement('span');
    runeSpan.classList.add('rune-decoration');
    runeSpan.setAttribute('data-rune', rune);
    runeSpan.textContent = rune;
    
    // Glüheffekt für Runen
    runeSpan.style.textShadow = '0 0 5px rgba(193, 58, 252, 0.8)';
    runeSpan.style.animation = 'runeGlow 3s infinite alternate';
    
    // Am Ende des Titels einfügen
    title.appendChild(runeSpan);
  });
  
  // Zusätzliche Runen im Hintergrund verteilen
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    for (let i = 0; i < 12; i++) {
      const backdropRune = document.createElement('span');
      backdropRune.classList.add('backdrop-rune');
      
      // Zufällige Rune
      const rune = runes[Math.floor(Math.random() * runes.length)];
      backdropRune.textContent = rune;
      
      // Zufällige Position
      backdropRune.style.top = `${Math.random() * 100}%`;
      backdropRune.style.left = `${Math.random() * 100}%`;
      
      // Zufällige Größe
      const size = 16 + Math.random() * 24;
      backdropRune.style.fontSize = `${size}px`;
      
      // Zufällige Rotation
      backdropRune.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Zufällige Transparenz
      backdropRune.style.opacity = 0.1 + Math.random() * 0.2;
      
      // Glowing-Animation
      backdropRune.style.animation = `runeBackdropGlow ${5 + Math.random() * 5}s infinite alternate`;
      
      mainContent.appendChild(backdropRune);
    }
  }
  
  console.log("Runen-Dekorationen hinzugefügt");
}

// Funktion zum Verbessern des Logos mit einem mystischen Glühen
function enhanceLogo() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  
  // Mystical Heading Klasse hinzufügen
  logo.classList.add('mystical-heading');
  
  // Text-Schatten-Animation hinzufügen
  logo.style.animation = 'logoGlow 3s infinite alternate';
  
  // Logo-Glow-Effekt
  const logoContainer = document.querySelector('.logo-container');
  if (logoContainer) {
    logoContainer.classList.add('logo-glow');
    
    // Partikel um das Logo
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('span');
      particle.classList.add('logo-particle');
      
      // Zufällige Position
      const angle = i * (360 / 8);
      particle.style.transform = `rotate(${angle}deg) translateX(20px)`;
      
      // Zufällige Animation
      particle.style.animation = `orbitLogo ${8 + Math.random() * 4}s linear infinite`;
      
      logoContainer.appendChild(particle);
    }
    
    console.log("Logo mit mystischem Glühen verbessert");
  }
}

// Funktion zum Verbessern des Levelbereichs mit mystischem Flair
function enhanceLevelArea() {
  const levelInfo = document.querySelector('.level-info');
  if (!levelInfo) return;
  
  // Level-Text zusätzlich verbessern
  const levelNum = document.getElementById('level-num');
  if (levelNum) {
    levelNum.classList.add('mystical-heading');
    
    // Aura-Effekt für Level
    const levelGlow = document.createElement('div');
    levelGlow.classList.add('level-glow');
    levelNum.parentNode.insertBefore(levelGlow, levelNum);
    
    // Level-Zahl mit Glühen
    levelNum.style.animation = 'levelGlow 2s infinite alternate';
    
    console.log("Level-Anzeige verbessert");
  }
  
  // XP-Bar verbessern
  const xpBar = document.querySelector('.xp-bar');
  if (xpBar) {
    xpBar.classList.add('enhanced-xp-bar');
    
    // Glühende Partikel entlang der XP-Bar
    const xpFill = document.getElementById('xp-bar-fill');
    if (xpFill) {
      // Partikel-Container
      const particleContainer = document.createElement('div');
      particleContainer.classList.add('xp-particles');
      xpBar.appendChild(particleContainer);
      
      // XP-Füll-Breite überwachen für Partikelposition
      const observer = new MutationObserver(() => {
        updateXPParticles(xpFill, particleContainer);
      });
      
      observer.observe(xpFill, { attributes: true });
      
      // Initial erstellen
      updateXPParticles(xpFill, particleContainer);
    }
  }
}

// Aktualisiert die XP-Bar-Partikel basierend auf der Füllhöhe
function updateXPParticles(fillBar, container) {
  // Alle vorhandenen Partikel entfernen
  container.innerHTML = '';
  
  // Aktuelle Breite der Füll-Bar
  const fillWidth = parseFloat(fillBar.style.width);
  if (isNaN(fillWidth) || fillWidth <= 0) return;
  
  // Einige Partikel erstellen
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('span');
    particle.classList.add('xp-particle');
    
    // Position entlang der Füllhöhe
    const position = Math.random() * fillWidth;
    particle.style.left = `${position}%`;
    
    // Animation
    particle.style.animation = `xpParticleFloat ${1 + Math.random()}s infinite alternate`;
    
    container.appendChild(particle);
  }
}

// Funktion zum Verbessern des Elysian-Titels
function enhanceElysianTitle() {
  const elysianTitle = document.querySelector('.user-welcome h2');
  if (elysianTitle) {
    elysianTitle.classList.add('mystical-heading');
    
    // Besondere Hervorhebung für "Elysian"
    const titleText = elysianTitle.textContent;
    if (titleText.includes('Elysian')) {
      const enhancedText = titleText.replace('Elysian', '<span class="elysian-highlight">Elysian</span>');
      elysianTitle.innerHTML = enhancedText;
      
      // Animierte Umrandung für Elysian
      const highlight = elysianTitle.querySelector('.elysian-highlight');
      if (highlight) {
        highlight.style.position = 'relative';
        
        // Glühender Hintergrund
        const glow = document.createElement('span');
        glow.classList.add('elysian-glow');
        highlight.appendChild(glow);
      }
    }
    
    console.log("Elysian-Titel verbessert");
  }
}

// Funktion, die alle Verbesserungen initialisiert
function initMysticalEnhancements() {
  console.log('Initialisiere mystische UI-Verbesserungen...');
  
  // Anwenden der spezifischen Verbesserungen mit Verzögerung für bessere Performance
  setTimeout(() => addMysticalSymbols(), 200);
  setTimeout(() => createConstellation(), 400);
  setTimeout(() => enhanceCards(), 600);
  setTimeout(() => enhanceButtons(), 800);
  setTimeout(() => addMysticDividers(), 1000);
  setTimeout(() => addEnergyCores(), 1200);
  setTimeout(() => addRuneDecorations(), 1400);
  setTimeout(() => enhanceLogo(), 1600);
  setTimeout(() => enhanceLevelArea(), 1800);
  setTimeout(() => enhanceElysianTitle(), 2000);
  
  // CSS für neue Animationen dynamisch hinzufügen
  addDynamicStylesheet();
  
  console.log('Mystische UI-Verbesserungen eingeplant!');
}

// Fügt dynamisches Stylesheet für Animationen hinzu
function addDynamicStylesheet() {
  // Prüfen, ob bereits vorhanden
  if (document.getElementById('mystical-styles')) return;
  
  // Neues Stylesheet erstellen
  const styleSheet = document.createElement('style');
  styleSheet.id = 'mystical-styles';
  
  // CSS für neue Animationen
  styleSheet.innerHTML = `
    /* Basis-Animationen */
    @keyframes float {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-10px); }
    }
    
    @keyframes pulse {
      0% { opacity: 0.4; }
      100% { opacity: 1; }
    }
    
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fade {
      0% { opacity: 0.1; }
      100% { opacity: 0.5; }
    }
    
    /* Button-Effekte */
    @keyframes particleFly {
      0% { 
        transform: translate(0, 0);
        opacity: 1;
      }
      100% { 
        transform: translate(calc(cos(var(--angle)) * var(--distance)), calc(sin(var(--angle)) * var(--distance)));
        opacity: 0;
      }
    }
    
    /* Logo-Effekte */
    @keyframes logoGlow {
      0% { text-shadow: 0 0 5px rgba(193, 58, 252, 0.5); }
      100% { text-shadow: 0 0 15px rgba(193, 58, 252, 0.9), 0 0 20px rgba(252, 58, 143, 0.6); }
    }
    
    @keyframes orbitLogo {
      0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
    }
    
    /* Level-Effekte */
    @keyframes levelGlow {
      0% { text-shadow: 0 0 5px rgba(193, 58, 252, 0.5); }
      100% { text-shadow: 0 0 10px rgba(193, 58, 252, 0.9), 0 0 15px rgba(252, 58, 143, 0.6); }
    }
    
    @keyframes xpParticleFloat {
      0% { transform: translateY(0); }
      100% { transform: translateY(-5px); }
    }
    
    /* Runen-Effekte */
    @keyframes runeGlow {
      0% { text-shadow: 0 0 3px rgba(193, 58, 252, 0.5); }
      100% { text-shadow: 0 0 8px rgba(193, 58, 252, 0.9); }
    }
    
    @keyframes runeBackdropGlow {
      0% { opacity: 0.05; transform: scale(1) rotate(0deg); }
      100% { opacity: 0.2; transform: scale(1.1) rotate(10deg); }
    }
    
    /* Benachrichtigungs-Effekte */
    @keyframes bellAnimation {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(10deg); }
      50% { transform: rotate(0deg); }
      75% { transform: rotate(-10deg); }
      100% { transform: rotate(0deg); }
    }
    
    @keyframes badgeAnimation {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    /* Konfetti-Animation für Quest-Abschluss */
    @keyframes confettiFall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(40px) rotate(90deg); opacity: 0; }
    }
    
    /* Übergangs-Effekte */
    @keyframes pageTransition {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.95); }
    }
    
    @keyframes logoutTransition {
      0% { filter: hue-rotate(0deg) brightness(1); }
      100% { filter: hue-rotate(90deg) brightness(0.5); }
    }
    
    /* Toast-Nachrichten */
    @keyframes toastSlide {
      0% { transform: translateY(50px); opacity: 0; }
      10% { transform: translateY(0); opacity: 1; }
      90% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-20px); opacity: 0; }
    }

    /* Radar Animation */
    @keyframes radarSweep {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Styling-Klassen */
    .bell-animation {
      animation: bellAnimation 2s infinite;
    }
    
    .badge-animation {
      animation: badgeAnimation 0.5s;
    }
    
    .page-transition {
      animation: pageTransition 0.3s forwards;
    }
    
    .logout-transition {
      animation: logoutTransition 0.5s forwards;
    }
    
    .toast-message {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(50px);
      background: rgba(30, 30, 40, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(193, 58, 252, 0.5);
      z-index: 1000;
      opacity: 0;
      border-left: 3px solid #c13afc;
      backdrop-filter: blur(5px);
    }
    
    .show-toast {
      animation: toastSlide 3s forwards;
    }
    
    /* Fallback-Partikel */
    .fallback-particle {
      position: absolute;
      background-color: rgba(193, 58, 252, 0.5);
      border-radius: 50%;
      pointer-events: none;
    }
    
    /* Logo-Partikel */
    .logo-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: rgba(193, 58, 252, 0.8);
      border-radius: 50%;
      top: 50%;
      left: 50%;
    }
    
    /* Level-Glow */
    .level-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(193, 58, 252, 0.3) 0%, transparent 70%);
      animation: pulse 2s infinite alternate;
      z-index: -1;
    }
    
    /* XP-Partikel */
    .xp-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    
    .xp-particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background-color: rgba(193, 58, 252, 0.8);
      border-radius: 50%;
      top: 0;
    }
    
    /* Elysian-Highlight */
    .elysian-highlight {
      color: #c13afc;
      position: relative;
    }
    
    .elysian-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(ellipse at center, rgba(193, 58, 252, 0.3) 0%, transparent 70%);
      border-radius: 10px;
      filter: blur(5px);
      z-index: -1;
      animation: pulse 3s infinite alternate;
    }
    
    /* Konfetti */
    .confetti-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    
    .confetti {
      position: absolute;
      width: 8px;
      height: 8px;
      top: 0;
      animation: confettiFall 2s forwards;
    }
    
    /* Mystischer Divider */
    .mystic-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
      opacity: 0;
      transform: scale(0.9);
    }
    
    .divider-anim {
      animation: fadeIn 1s forwards;
    }
    
    @keyframes fadeIn {
      to { opacity: 1; transform: scale(1); }
    }
    
    .divider-line {
      flex-grow: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(193, 58, 252, 0.5), transparent);
      margin: 0 10px;
    }
    
    .rune-symbol {
      color: #c13afc;
      font-size: 14px;
    }
    
    /* Backdrop-Runen */
    .backdrop-rune {
      position: absolute;
      color: rgba(193, 58, 252, 0.2);
      pointer-events: none;
      z-index: -1;
    }
    
    /* Button-Ripple */
    .button-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 5px;
      height: 5px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      animation: ripple 0.5s linear forwards;
    }
    
    @keyframes ripple {
      to {
        width: 200%;
        height: 200%;
        opacity: 0;
      }
    }
    
    /* Sharing-Modal */
    .sharing-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .show-modal {
      opacity: 1;
    }
    
    .sharing-content {
      background-color: #1e1e28;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(193, 58, 252, 0.5);
      width: 90%;
      max-width: 400px;
      overflow: hidden;
    }
    
    .sharing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #2a2a36;
      border-bottom: 1px solid rgba(193, 58, 252, 0.3);
    }
    
    .sharing-header h3 {
      margin: 0;
      color: #c13afc;
    }
    
    .close-sharing {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }
    
    .sharing-body {
      padding: 20px;
    }
    
    .share-code {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #2a2a36;
      padding: 10px;
      border-radius: 5px;
      margin: 15px 0;
    }
    
    .copy-code {
      background-color: #c13afc;
      border: none;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }
    
    .share-options {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
    
    .share-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background-color: #2a2a36;
      color: white;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .share-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(193, 58, 252, 0.5);
    }
    
    .whatsapp:hover { background-color: #25D366; }
    .telegram:hover { background-color: #0088cc; }
    .email:hover { background-color: #c13afc; }
    .messenger:hover { background-color: #0084ff; }
    
    /* Quest-Completed */
    .quest-completed {
      border-color: #c13afc !important;
      box-shadow: 0 0 10px rgba(193, 58, 252, 0.5) !important;
    }
    
    /* Touch-Highlight für Mobile */
    .touch-highlight {
      background-color: rgba(193, 58, 252, 0.1);
      box-shadow: 0 0 15px rgba(193, 58, 252, 0.7);
      transform: scale(1.02);
    }

    /* Radar overlay für die Karte */
    .radar-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      opacity: 0.7;
      pointer-events: none;
      z-index: 1;
    }

    .radar-sweep {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: conic-gradient(
        rgba(193, 58, 252, 0) 0deg,
        rgba(193, 58, 252, 0) 270deg,
        rgba(193, 58, 252, 0.4) 310deg,
        rgba(193, 58, 252, 0) 360deg
      );
      animation: radarSweep 4s infinite linear;
    }

    .radar-circles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
    }

    .radar-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 1px solid rgba(193, 58, 252, 0.3);
      border-radius: 50%;
      animation: radarPulse 3s infinite;
    }

    .radar-circle:nth-child(1) {
      width: 30%;
      height: 30%;
    }

    .radar-circle:nth-child(2) {
      width: 60%;
      height: 60%;
      animation-delay: 1s;
    }

    .radar-circle:nth-child(3) {
      width: 90%;
      height: 90%;
      animation-delay: 2s;
    }

    @keyframes radarPulse {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }

    /* Tooltip verbesserte Sichtbarkeit */
    .tooltip-visible {
      opacity: 1 !important;
    }

    /* Aktives Element-Highlight */
    .dot-selected {
      transform: translate(-50%, -50%) scale(1.5) !important;
      box-shadow: 0 0 20px var(--primary-neon) !important;
      z-index: 10;
    }
  `;
  
  // Zum Head hinzufügen
  document.head.appendChild(styleSheet);
  console.log("Dynamisches Stylesheet für Animationen hinzugefügt");
}

// Diese Funktion am Ende von initializeDashboard aufrufen
document.addEventListener('DOMContentLoaded', () => {
  // Wenn dashboard.js bereits geladen ist, 
  // initialisiere mystische Effekte nach einem kurzen Delay
  setTimeout(() => {
    initMysticalEnhancements();
    
    // Ladebildschirm erstellen falls noch nicht vorhanden
    createLoadingScreen();
  }, 1000); // Nach 1 Sekunde ausführen
});

// Erstellt einen stylischen Ladebildschirm
function createLoadingScreen() {
  // Falls bereits vorhanden nicht erstellen
  if (document.querySelector('.loading-screen')) return;
  
  const loadingScreen = document.createElement('div');
  loadingScreen.classList.add('loading-screen');
  
  // Inhalt des Ladebildschirms
  loadingScreen.innerHTML = `
    <div class="loading-content">
      <div class="elysian-logo">ELYSIAN</div>
      <div class="loading-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-inner"></div>
      </div>
      <div class="loading-text">Betreten der mystischen Welt...</div>
    </div>
  `;
  
  // Zum Body hinzufügen
  document.body.appendChild(loadingScreen);
  
  // CSS für Ladebildschirm
  const loadingStyles = document.createElement('style');
  loadingStyles.innerHTML = `
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #151520;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.5s, visibility 0.5s;
    }
    
    .fade-out {
      opacity: 0;
      visibility: hidden;
    }
    
    .loading-content {
      text-align: center;
    }
    
    .elysian-logo {
      font-size: 3rem;
      font-weight: bold;
      color: #c13afc;
      margin-bottom: 2rem;
      text-shadow: 0 0 15px rgba(193, 58, 252, 0.8);
      animation: logoFade 2s infinite alternate;
    }
    
    @keyframes logoFade {
      0% { opacity: 0.7; text-shadow: 0 0 10px rgba(193, 58, 252, 0.5); }
      100% { opacity: 1; text-shadow: 0 0 20px rgba(193, 58, 252, 0.9), 0 0 30px rgba(252, 58, 143, 0.6); }
    }
    
    .loading-spinner {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
    }
    
    .spinner-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top-color: #c13afc;
      border-radius: 50%;
      animation: spin 2s linear infinite;
    }
    
    .spinner-inner {
      position: absolute;
      top: 15px;
      left: 15px;
      width: 50px;
      height: 50px;
      border: 3px solid transparent;
      border-top-color: #fc3a8f;
      border-radius: 50%;
      animation: spin 1.5s linear infinite reverse;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text {
      color: white;
      font-size: 1.2rem;
      animation: textPulse 1.5s infinite alternate;
    }
    
    @keyframes textPulse {
      0% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `;
  
  document.head.appendChild(loadingStyles);
  
  console.log("Stylischer Ladebildschirm erstellt");
}