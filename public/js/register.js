console.log("Elysian Register JS geladen");

// Globale States
let selectedUserType = null;
let selectedTeam = null;
let selectedEventType = null;
let roleAnswers = {};
let finalArchetype = null;

// Konstanten für Debugging
const DEBUG = true;
const logDebug = (msg, data) => { 
  if (DEBUG) {
    console.log(`[DEBUG] ${msg}`);
    if (data) console.log(data);
  }
};

// DOMContentLoaded Event
document.addEventListener('DOMContentLoaded', () => {
  logDebug('DOM geladen, initialisiere Elysian Register-App...');
  
  // Prüfen, ob bereits angemeldet
  const token = localStorage.getItem('token');
  if (token) {
    logDebug("Token gefunden, leite zu dashboard.html um");
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Initialisiere Particles.js für den Hintergrund
  initParticles();
  
  // Initialisiere Runensymbole
  initRuneSymbols();
  
  // Initialisiere Hintergrundsterne
  addBackgroundStars();
  
  // Setze Event-Listener für alle Buttons
  setupEventListeners();
  
  // Setup Password Strength Meter
  setupPasswordStrengthMeter();
  
  // Debug-Check für Event-Listeners
  logAllEventListeners();
});

// Initialize particles.js background
function initParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 40, density: { enable: true, value_area: 1000 } },
        color: { value: "#c13afc" },
        shape: { type: "circle" },
        opacity: { value: 0.3, random: true },
        size: { value: 2, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#c13afc",
          opacity: 0.15,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.8,
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
          grab: { distance: 140, line_linked: { opacity: 0.4 } },
          push: { particles_nb: 2 }
        }
      }
    });
    logDebug("Particles.js initialisiert");
  } else {
    console.warn("particles.js nicht geladen");
  }
}

// Runensymbole um das Logo herum initialisieren
function initRuneSymbols() {
  const runeCircle = document.querySelector('.rune-circle');
  if (!runeCircle) return;
  
  // Runen-Symbole (einfache Unicode-Symbole als Platzhalter)
  const runeSymbols = ['◈', '◇', '◆', '⚝', '✧', '✦', '✵', '❈', '✺', '✹', '✸', '✶', '✴'];
  
  // Runen platzieren
  for (let i = 0; i < 12; i++) {
    const rune = document.createElement('div');
    rune.classList.add('rune');
    
    // Runen im Kreis verteilen (Winkel berechnen)
    const angle = (i / 12) * 360;
    const radius = 80; // Abstand zum Mittelpunkt
    
    // Position im Kreis berechnen
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    
    // Rune positionieren
    rune.style.left = `calc(50% + ${x}px)`;
    rune.style.top = `calc(50% + ${y}px)`;
    rune.style.transform = `rotate(${angle}deg)`;
    rune.textContent = runeSymbols[i % runeSymbols.length];
    
    runeCircle.appendChild(rune);
  }
  
  logDebug("Runen-Symbole initialisiert");
}

// Zufällige Sterne zum Hintergrund hinzufügen
function addBackgroundStars() {
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) return;
  
  // Verschiedene Sterngrößen und Opazitäten für mehr Tiefe
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // Zufällige Attribute für Natureffekt
    const size = Math.random() * 3 + 1;
    
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    
    // Einige Sterne mit leicht anderen Farben für Atmosphäre
    if (Math.random() > 0.7) {
      star.style.backgroundColor = 'rgba(176, 128, 255, 0.9)';
    }
    
    starsContainer.appendChild(star);
  }
  
  logDebug("Sterne-Animation hinzugefügt");
}

// Setup aller Event-Listener
function setupEventListeners() {
  // STEP 0: User Type Selection
  addClickWithRipple('user-type-creator', () => selectUserType('creator'));
  addClickWithRipple('user-type-guest', () => selectUserType('guest'));
  addClickWithRipple('user-type-hq', () => selectUserType('hq'));

  // STEP 1: Team Selection
  addClickWithRipple('team-pulse', () => selectTeam('pulse'));
  addClickWithRipple('team-flux', () => selectTeam('flux'));
  addClickWithRipple('btn-back-step0', goBackToStep0);
  
  // STEP 2: Event Preferences
  addClickWithRipple('btn-back-step1', goBackToStep1);
  addClickWithRipple('btn-to-step-optional-role', goToStepOptionalRole);
  
  // STEP 3: Role Discovery
  addClickWithRipple('btn-yes-goToRoleQuiz', goToRoleQuiz);
  addClickWithRipple('btn-skip-roleQuiz', skipRoleQuiz);
  addClickWithRipple('btn-back-roleIntro', goBackFromRoleIntro);
  
  // STEP 3A: Role Quiz
  addClickWithRipple('btn-back-roleQuiz', goBackFromRoleQuiz);
  addClickWithRipple('btn-finish-roleQuiz', finishRoleQuiz);
  
  // STEP 4: Account Creation
  addClickWithRipple('btn-back-step3-or-3A', goBackFromStep4);
  addClickWithRipple('btn-to-step5', goToStep5);
  addClickWithRipple('toggle-password', togglePasswordVisibility);
  
  // STEP 5: Personal Data & Submit
  addClickWithRipple('btn-back-step4', goBackFromStep5);
  addClickWithRipple('btn-submit-registration', submitRegistration);
  
  // Event-Type Radio Buttons
  const eventRadios = document.getElementsByName('eventType');
  for (let radio of eventRadios) {
    radio.addEventListener('change', (e) => {
      selectedEventType = e.target.value;
      logDebug(`Event-Typ ausgewählt: ${selectedEventType}`);
      
      // Aktualisiere den Zustand aller Radio-Buttons
      updateRadioLabels();
    });
  }
  
  // Password input event for strength meter
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
  }
  
  // Privacy checkbox styling
  const privacyCheckbox = document.getElementById('privacy-checkbox');
  if (privacyCheckbox) {
    privacyCheckbox.addEventListener('change', () => {
      const submitBtn = document.getElementById('btn-submit-registration');
      if (submitBtn) {
        submitBtn.disabled = !privacyCheckbox.checked;
        if (privacyCheckbox.checked) {
          submitBtn.classList.add('btn-animated');
        } else {
          submitBtn.classList.remove('btn-animated');
        }
      }
    });
    
    // Initial check
    const submitBtn = document.getElementById('btn-submit-registration');
    if (submitBtn) {
      submitBtn.disabled = !privacyCheckbox.checked;
    }
  }
}

// Helfer-Funktion zum Hinzufügen von Click mit Ripple-Effekt
function addClickWithRipple(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('click', function(e) {
      // Ripple-Effekt
      if (this.classList.contains('btn') || this.classList.contains('team-card') || 
          this.classList.contains('user-type-card') || this.classList.contains('role-choice-card')) {
        // Entferne vorhandene Ripples
        const existingRipples = this.querySelectorAll('.ripple');
        existingRipples.forEach(ripple => ripple.remove());
        
        // Neuen Ripple erstellen
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        // Ripple-Size und Position berechnen
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        
        // Ripple-Position relativ zum Klick
        const x = e.clientX - rect.left - size/2;
        const y = e.clientY - rect.top - size/2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Ripple nach Animation entfernen
        setTimeout(() => ripple.remove(), 600);
      }
      
      // Callback ausführen
      callback(e);
    });
    logDebug(`Event-Listener für "${elementId}" hinzugefügt`);
  } else {
    console.warn(`Element mit ID "${elementId}" nicht gefunden!`);
  }
}

// Toggle Password Visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggle-password');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
}

// Password Strength Meter Setup
function setupPasswordStrengthMeter() {
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
    
    // Initial update
    updatePasswordStrength();
  }
}

// Update Password Strength Indicator
function updatePasswordStrength() {
  const password = document.getElementById('password')?.value || '';
  const strengthBar = document.getElementById('password-strength');
  const strengthText = document.getElementById('password-strength-text');
  
  if (!strengthBar) return;
  
  // Strength criteria
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  // Calculate strength score (0-5)
  let score = 0;
  if (hasLowerCase) score++;
  if (hasUpperCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;
  if (isLongEnough) score++;
  
  // Update UI
  let percentage = (score / 5) * 100;
  let color = '';
  let text = '';
  
  if (percentage === 0) {
    color = '#666';
    text = 'Passwort-Stärke';
  } else if (percentage <= 20) {
    color = '#ff4747'; // Red
    text = 'Sehr schwach';
  } else if (percentage <= 40) {
    color = '#ffa534'; // Orange
    text = 'Schwach';
  } else if (percentage <= 60) {
    color = '#ffdd34'; // Yellow
    text = 'Mittel';
  } else if (percentage <= 80) {
    color = '#b7dd29'; // Light Green
    text = 'Stark';
  } else {
    color = '#47cf73'; // Green
    text = 'Sehr stark';
  }
  
  strengthBar.style.width = `${percentage}%`;
  strengthBar.style.backgroundColor = color;
  
  if (strengthText) {
    strengthText.textContent = text;
    strengthText.style.color = color;
  }
}

// Update Radio Labels Status (für Event-Typen)
function updateRadioLabels() {
  const radioLabels = document.querySelectorAll('.radio-label');
  radioLabels.forEach(label => {
    const radioInput = label.querySelector('input[type="radio"]');
    if (radioInput && radioInput.checked) {
      label.classList.add('selected');
    } else {
      label.classList.remove('selected');
    }
  });
}

// Debug-Funktion: Alle Event-Listener prüfen
function logAllEventListeners() {
  const buttons = document.querySelectorAll('button, .team-card, .role-choice-card, .user-type-card');
  buttons.forEach(btn => {
    const id = btn.id || 'unbenannt';
    const hasListeners = btn.onclick !== null || typeof btn._events !== 'undefined';
    logDebug(`Element "${id}": ${hasListeners ? 'Hat Event-Listener' : 'KEINE LISTENER!'}`);
  });
}

// STEP 0: User Type Selection
function selectUserType(type) {
  selectedUserType = type;
  logDebug(`Nutzertyp ausgewählt: ${type}`);
  
  // Alle Karten zurücksetzen
  document.querySelectorAll('.user-type-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Ausgewählte Karte markieren
  const typeCard = document.getElementById(`user-type-${type}`);
  if (typeCard) {
    typeCard.classList.add('selected');
    
    // Highlight-Animation hinzufügen wenn Animation API verfügbar
    if (typeof typeCard.animate === 'function') {
      typeCard.animate([
        { transform: 'scale(1)', boxShadow: '0 5px 15px rgba(87, 6, 124, 0.3)' },
        { transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(114, 9, 183, 0.4)' },
        { transform: 'scale(1)', boxShadow: '0 5px 15px rgba(87, 6, 124, 0.3)' }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      });
    }
  }
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '20%';
  
  // Animation zum nächsten Schritt
  animateTransition('step-0', 'step-1');
}

// STEP 1: Team Selection
function selectTeam(team) {
  selectedTeam = team;
  logDebug(`Team ausgewählt: ${team}`);
  
  // Alle Team-Karten zurücksetzen
  document.querySelectorAll('.team-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Ausgewählte Team-Karte markieren
  const teamCard = document.getElementById(`team-${team}`);
  if (teamCard) {
    teamCard.classList.add('selected');
    
    // Highlight-Animation hinzufügen wenn Animation API verfügbar
    if (typeof teamCard.animate === 'function') {
      teamCard.animate([
        { transform: 'translateY(0)', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' },
        { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(114, 9, 183, 0.4)' },
        { transform: 'translateY(0)', boxShadow: '0 5px 15px rgba(87, 6, 124, 0.3)' }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      });
    }
  }
  
  // Animation zum nächsten Schritt
  animateTransition('step-1', 'step-2', () => {
    // Team-spezifische Fragen einblenden
    document.querySelectorAll('.team-questions').forEach(el => el.classList.add('hidden'));
    
    const teamQuestions = document.getElementById(`${team}-questions`);
    if (teamQuestions) {
      teamQuestions.classList.remove('hidden');
      
      // Animation für Fragen einblenden, wenn möglich
      teamQuestions.style.opacity = '0';
      teamQuestions.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        teamQuestions.style.opacity = '1';
        teamQuestions.style.transform = 'translateY(0)';
        teamQuestions.style.transition = 'all 0.5s ease';
      }, 100);
    }
    
    // Progress-Bar aktualisieren
    document.getElementById('progress-fill').style.width = '40%';
  });
}

// Input-Reset
function resetAllInputs() {
  logDebug('Alle Eingaben zurücksetzen');
  
  // User Type
  document.querySelectorAll('.user-type-card').forEach(card => card.classList.remove('selected'));
  selectedUserType = null;
  
  // Team-Fragen
  resetInputValue('pulse-q1');
  resetInputValue('pulse-q2');
  resetInputValue('flux-q1');
  resetInputValue('flux-q2');

  // EventType
  const eventRadios = document.getElementsByName('eventType');
  for (let r of eventRadios) {
    r.checked = false;
  }
  document.querySelectorAll('.radio-label').forEach(label => label.classList.remove('selected'));
  selectedEventType = null;

  // Role Quiz
  resetInputValue('quiz-q1');
  resetInputValue('quiz-q2');
  resetInputValue('quiz-q3');
  resetInputValue('quiz-q4');
  resetInputValue('quiz-q5');
  roleAnswers = {};
  finalArchetype = null;

  // Account
  resetInputValue('username');
  resetInputValue('email');
  resetInputValue('password');
  
  // Password strength reset
  const strengthBar = document.getElementById('password-strength');
  if (strengthBar) strengthBar.style.width = '0%';
  
  const strengthText = document.getElementById('password-strength-text');
  if (strengthText) strengthText.textContent = 'Passwort-Stärke';

  // Pers. Daten
  resetInputValue('age');
  resetInputValue('gender');
  resetInputValue('location');
  
  // Privacy checkbox
  const privacyCheckbox = document.getElementById('privacy-checkbox');
  if (privacyCheckbox) privacyCheckbox.checked = false;
  
  // Entferne alle Team-Selektionen
  document.querySelectorAll('.team-card').forEach(card => card.classList.remove('selected'));
}

// Helper: Input-Value zurücksetzen
function resetInputValue(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = '';
    element.style.borderColor = '';
    element.style.boxShadow = '';
  }
}

// STEP 0 zurück (komplettes Reset)
function resetToStart() {
  logDebug('Zurück zum Start');
  
  hideAllSteps();
  
  // Fortschrittsleiste zurücksetzen
  document.getElementById('progress-fill').style.width = '10%';
  
  // Fehlermeldung ausblenden
  hideError();
  
  // Step 0 einblenden
  document.getElementById('step-0').classList.remove('hidden');
  
  // Alle Eingaben zurücksetzen
  resetAllInputs();
  
  // Status zurücksetzen
  selectedUserType = null;
  selectedTeam = null;
  selectedEventType = null;
}

// STEP 0 zurück von STEP 1
function goBackToStep0() {
  logDebug('Zurück zu Step 0');
  
  // Fortschrittsleiste zurücksetzen
  document.getElementById('progress-fill').style.width = '10%';
  
  // Fehlermeldung ausblenden
  hideError();
  
  // Animation
  animateTransition('step-1', 'step-0');
  
  // Team-Status zurücksetzen
  selectedTeam = null;
  document.querySelectorAll('.team-card').forEach(card => card.classList.remove('selected'));
}

// STEP 1 zurück von STEP 2
function goBackToStep1() {
  logDebug('Zurück zu Step 1');
  
  // Fortschrittsleiste anpassen
  document.getElementById('progress-fill').style.width = '20%';
  
  // Fehlermeldung ausblenden
  hideError();
  
  // Animation
  animateTransition('step-2', 'step-1');
  
  // Event-Type zurücksetzen
  selectedEventType = null;
  const eventRadios = document.getElementsByName('eventType');
  for (let r of eventRadios) {
    r.checked = false;
  }
  document.querySelectorAll('.radio-label').forEach(label => label.classList.remove('selected'));
}

// STEP 2: Event Preferences → STEP 3: Role Discovery
function goToStepOptionalRole() {
  logDebug('Weiter zu Step 3: Rollen-Entdeckung');
  
  // Event-Type aus Radio-Buttons lesen
  const eventRadios = document.getElementsByName('eventType');
  for (let r of eventRadios) {
    if (r.checked) {
      selectedEventType = r.value;
      break;
    }
  }
  
  if (!selectedEventType) {
    showError('Bitte wähle einen Event-Typ aus.');
    
    // Visuelles Feedback für die Radio-Labels wenn möglich
    const radioLabels = document.querySelectorAll('.radio-label');
    radioLabels.forEach(label => {
      if (typeof label.animate === 'function') {
        label.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)' }
        ], {
          duration: 300,
          iterations: 1
        });
      }
    });
    
    return;
  }
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '60%';
  
  // Animation
  animateTransition('step-2', 'step-3');
}

// STEP 3: Role Discovery → STEP 3A: Role Quiz
function goToRoleQuiz() {
  logDebug('Weiter zu Step 3A: Rollen-Quiz');
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '70%';
  
  // Animation
  animateTransition('step-3', 'step-3A');
}

// STEP 3: Role Discovery → STEP 4: Account Creation (Skip Quiz)
function skipRoleQuiz() {
  logDebug('Quiz überspringen, weiter zu Step 4: Account-Erstellung');
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '80%';
  
  // Animation
  animateTransition('step-3', 'step-4');
}

// STEP 3: Role Discovery → STEP 2: Event Preferences (Zurück)
function goBackFromRoleIntro() {
  logDebug('Zurück zu Step 2: Event-Präferenzen');
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '40%';
  
  // Animation
  animateTransition('step-3', 'step-2');
}

// STEP 3A: Role Quiz → STEP 4: Account Creation
function finishRoleQuiz() {
  logDebug('Quiz abgeschlossen, weiter zu Step 4: Account-Erstellung');
  
  // Quiz-Antworten sammeln und validieren
  roleAnswers.q1 = document.getElementById('quiz-q1').value.trim();
  roleAnswers.q2 = document.getElementById('quiz-q2').value.trim();
  roleAnswers.q3 = document.getElementById('quiz-q3').value.trim();
  roleAnswers.q4 = document.getElementById('quiz-q4').value.trim();
  roleAnswers.q5 = document.getElementById('quiz-q5').value.trim();
  
  // Validierung (mindestens 3 Antworten sollten ausgefüllt sein)
  const answeredCount = Object.values(roleAnswers).filter(answer => answer.length > 0).length;
  if (answeredCount < 3) {
    showError('Bitte beantworte mindestens 3 Fragen im Quiz.');
    
    // Visuelles Feedback für nicht beantwortete Fragen
    const quizQuestions = document.querySelectorAll('.quiz-question textarea');
    quizQuestions.forEach(textarea => {
      if (!textarea.value.trim()) {
        textarea.style.borderColor = 'rgba(255, 71, 71, 0.5)';
        textarea.style.boxShadow = '0 0 5px rgba(255, 71, 71, 0.2)';
        
        // Event-Listener zum Zurücksetzen nach Eingabe
        textarea.addEventListener('input', function onInput() {
          textarea.style.borderColor = '';
          textarea.style.boxShadow = '';
          textarea.removeEventListener('input', onInput);
        });
      }
    });
    
    return;
  }

  // Archetyp berechnen
  calculateArchetype();
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '80%';
  
  // Animation
  animateTransition('step-3A', 'step-4');
}

// Helfer: Archetyp-Berechnung (basierend auf Antworten)
function calculateArchetype() {
  // Archetypen mit Beschreibungen
  const archetypeData = [
    {
      name: 'Harmonizer',
      description: 'Du bist die verbindende Kraft der Community, erschaffst Harmonie und bringst Menschen zusammen.',
      keywords: ['verbinden', 'harmonie', 'gemeinschaft', 'zusammen', 'freundschaft', 'team', 'gruppe', 'einheit', 'verbundenheit', 'kollektiv']
    },
    {
      name: 'Explorer',
      description: 'Du bist ein Entdecker der Nacht, immer auf der Suche nach neuen Klängen und Erfahrungen.',
      keywords: ['entdecken', 'suche', 'neues', 'reise', 'abenteuer', 'horizont', 'erfahrung', 'neugierde', 'unbekannt', 'erkunden']
    },
    {
      name: 'Guardian',
      description: 'Du bist der Beschützer der Szene, sorgst für Sicherheit und achtest auf das Wohlbefinden aller.',
      keywords: ['schutz', 'sicherheit', 'sorge', 'verantwortung', 'aufpassen', 'bewahren', 'helfen', 'unterstützen', 'fürsorge', 'achtgeben']
    },
    {
      name: 'Creator',
      description: 'Du bist ein kreativer Geist, erschaffst Kunst und inspirierst andere mit deinen Ideen.',
      keywords: ['kreativ', 'erschaffen', 'kunst', 'inspiration', 'ideen', 'gestalten', 'produzieren', 'machen', 'vision', 'künstlerisch']
    },
    {
      name: 'Seeker',
      description: 'Du suchst nach tieferen Bedeutungen, spirituellen Verbindungen und Transzendenz im Moment.',
      keywords: ['bedeutung', 'spirituell', 'tief', 'seele', 'transzendenz', 'bewusstsein', 'meditation', 'universum', 'verstehen', 'sinn']
    },
    {
      name: 'Catalyst',
      description: 'Du bist der Funke, der die Party zum Leben erweckt, voller Energie und ansteckender Begeisterung.',
      keywords: ['energie', 'feuer', 'leben', 'begeisterung', 'dynamik', 'antreiben', 'bewegen', 'motivation', 'enthusiasmus', 'lebhaft']
    }
  ];
  
  // Einfacher Algorithmus: Zähle Keyword-Übereinstimmungen in den Antworten
  const allAnswers = Object.values(roleAnswers).join(' ').toLowerCase();
  let matchCounts = {};
  
  archetypeData.forEach(archetype => {
    matchCounts[archetype.name] = 0;
    archetype.keywords.forEach(keyword => {
      if (allAnswers.includes(keyword)) {
        matchCounts[archetype.name]++;
      }
    });
  });
  
  // Finde den Archetyp mit den meisten Übereinstimmungen
  let bestMatch = {name: '', count: -1};
  Object.entries(matchCounts).forEach(([name, count]) => {
    if (count > bestMatch.count) {
      bestMatch = {name, count};
    }
  });
  
  // Falls keine Übereinstimmungen, wähle einen zufälligen Archetyp
  if (bestMatch.count <= 0) {
    const randomIndex = Math.floor(Math.random() * archetypeData.length);
    finalArchetype = archetypeData[randomIndex];
  } else {
    finalArchetype = archetypeData.find(a => a.name === bestMatch.name);
  }
  
  logDebug(`Archetyp berechnet: ${finalArchetype.name}`);
}

// STEP 3A: Role Quiz → STEP 3: Role Discovery (Zurück)
function goBackFromRoleQuiz() {
  logDebug('Zurück zu Step 3: Rollen-Entdeckung');
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '60%';
  
  // Animation
  animateTransition('step-3A', 'step-3');
}

// STEP 4: Account Creation → STEP 3/3A (Zurück)
function goBackFromStep4() {
  logDebug('Zurück von Step 4');
  
  // Prüfen, ob Quiz übersprungen wurde
  if (document.getElementById('step-3A').classList.contains('visited')) {
    // Zurück zu Step 3A: Role Quiz
    document.getElementById('progress-fill').style.width = '70%';
    animateTransition('step-4', 'step-3A');
  } else {
    // Zurück zu Step 3: Role Discovery
    document.getElementById('progress-fill').style.width = '60%';
    animateTransition('step-4', 'step-3');
  }
}

// STEP 4: Account Creation → STEP 5: Personal Data
function goToStep5() {
  logDebug('Weiter zu Step 5: Persönliche Daten');
  
  // Accountdaten validieren
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username) {
    showError('Bitte gib einen Benutzernamen ein.');
    highlightField('username');
    return;
  }
  
  if (!email) {
    showError('Bitte gib eine E-Mail-Adresse ein.');
    highlightField('email');
    return;
  }
  
  // E-Mail-Format validieren
  if (!validateEmail(email)) {
    showError('Bitte gib eine gültige E-Mail-Adresse ein.');
    highlightField('email');
    return;
  }
  
  if (!password) {
    showError('Bitte gib ein Passwort ein.');
    highlightField('password');
    return;
  }
  
  // Passwort-Länge prüfen
  if (password.length < 8) {
    showError('Das Passwort sollte mindestens 8 Zeichen lang sein.');
    highlightField('password');
    return;
  }
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '90%';
  
  // Fehlermeldung ausblenden
  hideError();
  
  // Animation
  animateTransition('step-4', 'step-5');
}

// Helfer: Fehlerhafte Felder hervorheben
function highlightField(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.style.borderColor = '#ff4747';
    field.style.boxShadow = '0 0 0 2px rgba(255, 71, 71, 0.25)';
    
    // Wieder zurücksetzen nach einer Weile
    field.addEventListener('input', function onInput() {
      field.style.borderColor = '';
      field.style.boxShadow = '';
      field.removeEventListener('input', onInput);
    });
  }
}

// E-Mail-Validierung
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// STEP 5: Personal Data → STEP 4: Account Creation (Zurück)
function goBackFromStep5() {
  logDebug('Zurück zu Step 4: Account-Erstellung');
  
  // Fortschrittsleiste aktualisieren
  document.getElementById('progress-fill').style.width = '80%';
  
  // Animation
  animateTransition('step-5', 'step-4');
}

// Registrierung abschicken
async function submitRegistration() {
  logDebug('Registrierung wird abgeschickt...');
  
  // Alle Pflichtfelder zusammentragen
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const age = document.getElementById('age').value.trim();
  const gender = document.getElementById('gender').value;
  const location = document.getElementById('location').value.trim();
  const privacyAccepted = document.getElementById('privacy-checkbox').checked;
  
  const pulseQ1 = document.getElementById('pulse-q1') ? document.getElementById('pulse-q1').value.trim() : '';
  const pulseQ2 = document.getElementById('pulse-q2') ? document.getElementById('pulse-q2').value.trim() : '';
  const fluxQ1 = document.getElementById('flux-q1') ? document.getElementById('flux-q1').value.trim() : '';
  const fluxQ2 = document.getElementById('flux-q2') ? document.getElementById('flux-q2').value.trim() : '';

  // Validierung Pflichtfelder mit präzisen Fehlermeldungen
  if (!username) {
    showError('Bitte gib einen Benutzernamen ein.');
    highlightField('username');
    return;
  }
  
  if (!email) {
    showError('Bitte gib eine E-Mail-Adresse ein.');
    highlightField('email');
    return;
  }
  
  if (!validateEmail(email)) {
    showError('Bitte gib eine gültige E-Mail-Adresse ein.');
    highlightField('email');
    return;
  }
  
  if (!password) {
    showError('Bitte gib ein Passwort ein.');
    highlightField('password');
    return;
  }
  
  // Passwort-Stärke prüfen
  const passwordScore = checkPasswordStrength(password);
  if (passwordScore < 3) {
    showError('Dein Passwort ist zu schwach. Bitte verwende Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen.');
    highlightField('password');
    return;
  }
  
  if (!selectedUserType || !selectedTeam || !selectedEventType) {
    showError('Bitte wähle Nutzertyp, Team und Event-Typ aus.');
    return;
  }
  
  // Datenschutz akzeptiert?
  if (!privacyAccepted) {
    showError('Bitte akzeptiere die Datenschutzbestimmungen und Nutzungsbedingungen.');
    const privacyCheckboxLabel = document.querySelector('.checkbox-label');
    if (privacyCheckboxLabel) {
      privacyCheckboxLabel.style.color = '#ff4747';
      setTimeout(() => {
        privacyCheckboxLabel.style.color = '';
      }, 2000);
    }
    return;
  }

  try {
    // Fortschrittsleiste auf 100%
    document.getElementById('progress-fill').style.width = '100%';
    
    // Button deaktivieren während des Absendens
    const submitBtn = document.getElementById('btn-submit-registration');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
    }
    
    // Daten für den Server vorbereiten
    const bodyData = {
      userType: selectedUserType,
      username,
      email,
      password,
      team: selectedTeam,
      eventType: selectedEventType,
      roleAnswers,
      finalArchetype,
      age,
      gender,
      location,
      teamAnswers: {
        pulseQ1,
        pulseQ2,
        fluxQ1,
        fluxQ2
      }
    };

    logDebug('Registrierungsdaten:', bodyData);

    // API-Aufruf mit simuliertem Delay im Debug-Modus
    let response, data;
    
    if (DEBUG) {
      // Für Testzwecke: Simuliere API-Aufruf mit Mockdaten
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay
      
      // Mockdaten für erfolgreiche Registrierung
      response = { ok: true };
      data = { 
        token: 'mock_token_12345',
        message: 'Registrierung erfolgreich!',
        user: {
          username,
          userType: selectedUserType,
          team: selectedTeam
        }
      };
      
      logDebug('Simulierter API-Aufruf mit Mockdaten', data);
    } else {
      // Realer API-Aufruf
      response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      data = await response.json();
    }

    if (!response.ok) {
      // Fehlerfall
      showError(data.error || 'Registrierung fehlgeschlagen.');
      
      // Button wieder aktivieren
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Abschicken';
      }
      return;
    }

    // Erfolgsfall: Token speichern
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', selectedUserType);
      localStorage.setItem('team', selectedTeam);
      localStorage.setItem('username', username);
      logDebug('Token und Nutzerinfos gespeichert');
    }
    
    // Erfolgsmeldung anzeigen
    hideAllSteps();
    const successMessage = document.getElementById('success-message');
    successMessage.classList.remove('hidden');
    
    // Archetyp anzeigen, falls vorhanden
    if (finalArchetype) {
      const archetypeDiv = document.getElementById('user-archetype');
      const archetypeName = document.getElementById('archetype-name');
      const archetypeDescription = document.getElementById('archetype-description');
      
      if (archetypeDiv && archetypeName && archetypeDescription) {
        // Show archetype
        archetypeDiv.classList.remove('hidden');
        archetypeName.textContent = finalArchetype.name;
        archetypeDescription.textContent = finalArchetype.description;
      }
    }
    
    // Nach Verzögerung weiterleiten
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 3000);

  } catch (error) {
    // Fehlerfall (z.B. Netzwerkfehler)
    console.error('Fehler bei der Registrierung:', error);
    showError('Serverfehler bei der Registrierung. Bitte versuche es später erneut.');
    
    // Button wieder aktivieren
    const submitBtn = document.getElementById('btn-submit-registration');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Abschicken';
    }
  }
}

// Helfer: Passwort-Stärke prüfen
function checkPasswordStrength(password) {
  // Strength criteria
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  // Calculate strength score (0-5)
  let score = 0;
  if (hasLowerCase) score++;
  if (hasUpperCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;
  if (isLongEnough) score++;
  
  return score;
}

// Helfer: Alle Steps ausblenden
function hideAllSteps() {
  document.querySelectorAll('.step').forEach(step => {
    step.classList.add('hidden');
    step.classList.remove('visited');
  });
}

// Helfer: Fehlermeldung anzeigen
function showError(msg) {
  const errorDiv = document.getElementById('register-error');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
    
    // Zum Anfang scrollen, damit die Fehlermeldung sichtbar ist
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fehlermeldung durch Animation hervorheben
    errorDiv.style.animation = 'none';
    setTimeout(() => {
      errorDiv.style.animation = 'errorShake 0.5s';
    }, 10);
  }
}

// Helfer: Fehlermeldung ausblenden
function hideError() {
  const errorDiv = document.getElementById('register-error');
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

// Helfer: Animation zwischen Schritten
function animateTransition(fromStepId, toStepId, callback) {
  const fromStep = document.getElementById(fromStepId);
  const toStep = document.getElementById(toStepId);
  
  if (!fromStep || !toStep) {
    console.error(`Schritte ${fromStepId} oder ${toStepId} nicht gefunden!`);
    return;
  }
  
  // Aktuellen Schritt als besucht markieren
  fromStep.classList.add('visited');
  
  // Aktuelle Ansicht ausblenden
  fromStep.style.opacity = '0';
  fromStep.style.transform = 'translateY(-10px)';
  fromStep.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  
  // Scroll zum Anfang des Containers
  const registerContainer = document.querySelector('.register-container');
  if (registerContainer) {
    registerContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Nach kurzer Verzögerung die nächste Ansicht einblenden
  setTimeout(() => {
    // Fehlermeldungen zurücksetzen
    hideError();
    
    // Aktuellen Schritt ausblenden und zurücksetzen
    fromStep.classList.add('hidden');
    fromStep.style.opacity = '';
    fromStep.style.transform = '';
    fromStep.style.transition = '';
    
    // Nächsten Schritt einblenden
    toStep.classList.remove('hidden');
    toStep.style.opacity = '0';
    toStep.style.transform = 'translateY(10px)';
    toStep.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Kleine Verzögerung für die Animation
    setTimeout(() => {
      toStep.style.opacity = '1';
      toStep.style.transform = 'translateY(0)';
      
      // Callback ausführen, falls vorhanden
      if (typeof callback === 'function') {
        setTimeout(() => {
          callback();
        }, 100);
      }
    }, 50);
  }, 300);
}