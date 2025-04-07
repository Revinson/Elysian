// public/js/survey.js - Vollständige Umfrage-Funktionalität
console.log("Survey JS geladen");

document.addEventListener('DOMContentLoaded', () => {
  // Authentifizierungsprüfung
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bitte zuerst einloggen!');
    window.location.href = 'login.html';
    return;
  }

  // Particles.js Hintergrund initialisieren
  initParticles();

  // Zurück zum Dashboard
  document.getElementById('back-dashboard-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  // Lade Events für die Event-Dropdown
  loadEventsForDropdown();

  // Lade aktive Umfragen
  loadSurveys();

  // Setup für Optionen-Vorschau
  setupOptionsPreview();

  // Setup für "Umfrage erstellen"-Formular
  setupCreateSurveyForm();

  // Ergebnis-Modal schließen
  const closeResultModalBtn = document.getElementById('close-result-modal');
  if (closeResultModalBtn) {
    closeResultModalBtn.addEventListener('click', () => {
      document.getElementById('result-modal').classList.remove('show');
    });
  }
});

// Particles.js Hintergrund initialisieren
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
  }
}

// Echtzeit-Vorschau für Umfrage-Optionen
function setupOptionsPreview() {
  const optionsInput = document.getElementById('options');
  const optionsPreview = document.getElementById('options-preview');
  
  if (!optionsInput || !optionsPreview) return;
  
  optionsInput.addEventListener('input', () => {
    const optionsText = optionsInput.value.trim();
    if (!optionsText) {
      optionsPreview.innerHTML = '';
      return;
    }
    
    // Optionen nach Komma trennen
    const options = optionsText.split(',').map(opt => opt.trim()).filter(Boolean);
    
    if (options.length < 2) {
      optionsPreview.innerHTML = '<p class="warning-text">Bitte mindestens 2 Optionen eingeben</p>';
      return;
    }
    
    // Vorschau generieren
    let previewHTML = '<div class="preview-title">Vorschau:</div>';
    options.forEach((opt, idx) => {
      const randomVotes = Math.floor(Math.random() * 50);
      previewHTML += `
        <div class="preview-option">
          <div class="option-bar-container">
            <div class="option-bar" style="width: ${randomVotes}%"></div>
            <span class="option-text">${opt}</span>
          </div>
          <span class="option-votes">${randomVotes} Votes</span>
        </div>
      `;
    });
    
    optionsPreview.innerHTML = previewHTML;
  });
}

// Setup für "Umfrage erstellen"-Formular
function setupCreateSurveyForm() {
  const createSurveyForm = document.getElementById('create-survey-form');
  if (!createSurveyForm) return;
  
  createSurveyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const eventId = document.getElementById('eventId').value.trim();
    const title = document.getElementById('title')?.value.trim() || '';
    const question = document.getElementById('question').value.trim();
    const optionsStr = document.getElementById('options').value.trim();
    const options = optionsStr.split(',').map(opt => opt.trim()).filter(Boolean);
    const multipleChoice = document.getElementById('multipleChoice')?.checked || false;
    
    // Validierung
    if (!question || options.length < 2) {
      showNotification('error', 'Bitte Frage eingeben und mindestens 2 Optionen angeben.');
      return;
    }

    try {
      showNotification('info', 'Umfrage wird erstellt...');
      
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          eventId: eventId || null, 
          title: title || question.substring(0, 50) + (question.length > 50 ? '...' : ''),
          question, 
          options,
          multipleChoice
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showNotification('error', data.error || 'Fehler beim Erstellen der Umfrage.');
        return;
      }
      
      showNotification('success', 'Umfrage erfolgreich erstellt!');
      createSurveyForm.reset();
      document.getElementById('options-preview').innerHTML = '';
      loadSurveys(); // Liste neu laden
    } catch (error) {
      console.error('Fehler beim Erstellen der Umfrage:', error);
      showNotification('error', 'Serverfehler beim Erstellen der Umfrage.');
    }
  });
}

// Lade Events für Event-Dropdown
async function loadEventsForDropdown() {
  const eventDropdown = document.getElementById('eventId');
  if (!eventDropdown) return;
  
  try {
    const response = await fetch('/api/events');
    
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data.events) || data.data.events.length === 0) {
      eventDropdown.innerHTML = '<option value="" disabled selected>Keine Events verfügbar</option>';
      return;
    }
    
    let options = '<option value="" disabled selected>Event auswählen...</option>';
    
    // Nach Datum sortieren (neuestes Event zuerst)
    const events = data.data.events;
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    events.forEach(event => {
      const eventDate = new Date(event.date).toLocaleDateString('de-DE');
      options += `<option value="${event._id}">${event.title} (${eventDate})</option>`;
    });
    
    eventDropdown.innerHTML = options;
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error);
    eventDropdown.innerHTML = '<option value="" disabled selected>Fehler beim Laden der Events</option>';
    
    // Fallback: Demo-Events
    eventDropdown.innerHTML = `
      <option value="" disabled selected>Event auswählen...</option>
      <option value="demo1">Techno Friday (15.03.2023)</option>
      <option value="demo2">Warehouse Rave (22.03.2023)</option>
      <option value="demo3">Club Night (28.03.2023)</option>
    `;
  }
}

// Umfragen laden
async function loadSurveys() {
  const token = localStorage.getItem('token');
  const surveyList = document.getElementById('survey-list');
  
  if (!surveyList) return;
  
  // Ladeanimation anzeigen
  surveyList.innerHTML = `
    <div class="loading-animation">
      <span></span><span></span><span></span><span></span>
    </div>
  `;
  
  try {
    const response = await fetch('/api/surveys', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data.surveys)) {
      // Keine Daten - Demo anzeigen
      setTimeout(() => {
        renderDemoSurveys();
      }, 600);
      return;
    }
    
    // Verzögerung für Ladeanimation (nur für Demo)
    setTimeout(() => {
      renderSurveys(data.data.surveys);
    }, 600);
  } catch (error) {
    console.error('Fehler beim Umfragen-Laden:', error);
    showNotification('error', 'Serverfehler beim Laden der Umfragen.');
    
    // Demo-Umfragen anzeigen
    setTimeout(() => {
      renderDemoSurveys();
    }, 600);
  }
}

// Demo-Umfragen anzeigen (Fallback)
function renderDemoSurveys() {
  const demoSurveys = [
    {
      _id: 'demo1',
      question: 'Welchen DJ wünscht ihr euch für das nächste Event?',
      options: [
        { text: 'DJ X-Treme', votes: 42 },
        { text: 'Neon Dreams', votes: 37 },
        { text: 'Pulse Collective', votes: 28 }
      ],
      voters: [],
      createdAt: new Date(Date.now() - 86400000 * 2) // 2 Tage her
    },
    {
      _id: 'demo2',
      question: 'Welche Art von Techno bevorzugt ihr?',
      options: [
        { text: 'Hard Techno', votes: 65 },
        { text: 'Minimal Techno', votes: 45 },
        { text: 'Melodic Techno', votes: 58 },
        { text: 'Tech House', votes: 32 }
      ],
      voters: [],
      createdAt: new Date(Date.now() - 86400000 * 5) // 5 Tage her
    },
    {
      _id: 'demo3',
      question: 'Was ist eure bevorzugte Eventzeit?',
      options: [
        { text: '22:00 - 06:00', votes: 78 },
        { text: '23:00 - 08:00', votes: 54 },
        { text: '00:00 - 10:00', votes: 43 }
      ],
      voters: [],
      createdAt: new Date(Date.now() - 86400000) // 1 Tag her
    }
  ];
  
  renderSurveys(demoSurveys);
}

// Umfragen anzeigen
function renderSurveys(surveys) {
  const surveyList = document.getElementById('survey-list');
  if (!surveyList) return;
  
  if (!Array.isArray(surveys) || surveys.length === 0) {
    surveyList.innerHTML = `<p class="info-message">Keine aktiven Umfragen gefunden. Erstelle eine neue Umfrage!</p>`;
    return;
  }
  
  surveyList.innerHTML = '';
  
  // Nach Erstellungsdatum sortieren (neueste zuerst)
  surveys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  surveys.forEach((sv) => {
    // Gesamtstimmen berechnen
    const totalVotes = sv.options.reduce((sum, opt) => sum + opt.votes, 0);
    
    // Option mit den meisten Stimmen finden
    let leadingOption = { text: 'Keine Stimmen', votes: 0 };
    if (totalVotes > 0) {
      leadingOption = sv.options.reduce((max, opt) => opt.votes > max.votes ? opt : max, { votes: -1 });
    }
    
    // Zeitangabe formatieren
    const createdDate = new Date(sv.createdAt);
    const timeAgo = getTimeAgo(createdDate);
    
    // Zufällige Ablaufzeit (nur für Demo)
    const hoursLeft = Math.floor(Math.random() * 72) + 1;
    
    // Umfragekarte erstellen
    const card = document.createElement('div');
    card.classList.add('survey-card');
    card.setAttribute('data-survey-id', sv._id);
    
    // Prüfen, ob Benutzer bereits abgestimmt hat
    const userId = getUserIdFromToken();
    const hasVoted = Array.isArray(sv.voters) && sv.voters.includes(userId);
    if (hasVoted) {
      card.classList.add('voted');
    }
    
    // Event-Info, falls vorhanden
    const eventInfo = sv.eventId && sv.eventId.title ? 
      `<span class="event-badge"><i class="fas fa-calendar-alt"></i> ${sv.eventId.title}</span>` : '';
    
    card.innerHTML = `
      <div class="survey-header">
        <h3>${sv.question}</h3>
        <div class="survey-meta">
          ${eventInfo}
          <span class="votes-count"><i class="fas fa-poll"></i> ${totalVotes} Stimmen</span>
          <span class="time-ago"><i class="far fa-clock"></i> ${timeAgo}</span>
        </div>
      </div>
      <div class="survey-progress">
        <div class="progress-label">
          <span>Führend: ${leadingOption.text}</span>
          <span>${leadingOption.votes} Stimmen</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${totalVotes > 0 ? (leadingOption.votes / totalVotes * 100) : 0}%"></div>
        </div>
      </div>
      <div class="survey-footer">
        <button class="vote-btn ${hasVoted ? 'disabled' : ''}" data-id="${sv._id}">
          <i class="fas fa-vote-yea"></i> ${hasVoted ? 'Abgestimmt' : 'Abstimmen'}
        </button>
        <button class="results-btn" data-id="${sv._id}">
          <i class="fas fa-chart-bar"></i> Ergebnisse
        </button>
        <div class="survey-timer">
          <i class="fas fa-clock"></i> ${hoursLeft}h verbleibend
        </div>
      </div>
    `;
    
    // Event-Listener für Abstimmen-Button
    const voteBtn = card.querySelector('.vote-btn');
    if (!hasVoted) {
      voteBtn.addEventListener('click', () => {
        showVoteOptions(sv);
      });
    }
    
    // Event-Listener für Ergebnisse-Button
    const resultsBtn = card.querySelector('.results-btn');
    resultsBtn.addEventListener('click', () => {
      showSurveyResults(sv);
    });
    
    surveyList.appendChild(card);
  });
}

// Abstimmungsoptionen anzeigen
function showVoteOptions(survey) {
  // Modal für Optionen erstellen
  const voteModal = document.createElement('div');
  voteModal.classList.add('vote-modal');
  
  let optionsHTML = `
    <div class="vote-modal-content">
      <div class="vote-modal-header">
        <h3>${survey.question}</h3>
        <button class="close-modal" id="close-vote-modal"><i class="fas fa-times"></i></button>
      </div>
      <div class="vote-options">
  `;
  
  survey.options.forEach((opt, idx) => {
    optionsHTML += `
      <button class="vote-option" data-survey="${survey._id}" data-idx="${idx}">
        ${opt.text}
      </button>
    `;
  });
  
  optionsHTML += `
      </div>
    </div>
  `;
  
  voteModal.innerHTML = optionsHTML;
  document.body.appendChild(voteModal);
  
  // Animation zum Einblenden
  setTimeout(() => {
    voteModal.classList.add('show');
  }, 10);
  
  // Event-Listener für Schließen-Button
  const closeBtn = voteModal.querySelector('#close-vote-modal');
  closeBtn.addEventListener('click', () => {
    voteModal.classList.remove('show');
    setTimeout(() => {
      voteModal.remove();
    }, 300);
  });
  
  // Event-Listener für Optionen-Buttons
  const voteOptions = voteModal.querySelectorAll('.vote-option');
  voteOptions.forEach(btn => {
    btn.addEventListener('click', async () => {
      const surveyId = btn.getAttribute('data-survey');
      const optionIndex = btn.getAttribute('data-idx');
      
      await voteSurvey(surveyId, optionIndex);
      
      voteModal.classList.remove('show');
      setTimeout(() => {
        voteModal.remove();
      }, 300);
    });
  });
}

// Umfrageergebnisse anzeigen
function showSurveyResults(survey) {
  const resultModal = document.getElementById('result-modal');
  const resultContent = document.getElementById('result-content');
  
  if (!resultModal || !resultContent) {
    alert('Ergebnis-Modal nicht gefunden! Bitte aktualisieren Sie die Seite.');
    return;
  }
  
  // Gesamtstimmen berechnen
  const totalVotes = survey.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  let resultsHTML = `
    <div class="results-header">
      <h4>${survey.question}</h4>
      <div class="results-meta">
        <span>${totalVotes} Stimmen gesamt</span>
      </div>
    </div>
    <div class="results-options">
  `;
  
  // Optionen nach Anzahl der Stimmen sortieren (absteigend)
  const sortedOptions = [...survey.options].sort((a, b) => b.votes - a.votes);
  
  sortedOptions.forEach(opt => {
    const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
    resultsHTML += `
      <div class="result-item">
        <div class="result-bar-container">
          <div class="result-bar" style="width: ${percentage}%"></div>
          <span class="result-text">${opt.text}</span>
        </div>
        <div class="result-stats">
          <span class="result-percentage">${percentage}%</span>
          <span class="result-votes">${opt.votes} Stimmen</span>
        </div>
      </div>
    `;
  });
  
  resultsHTML += `
    </div>
  `;
  
  resultContent.innerHTML = resultsHTML;
  resultModal.classList.add('show');
}

// Abstimmen
async function voteSurvey(surveyId, optionIndex) {
  const token = localStorage.getItem('token');
  
  try {
    showNotification('info', 'Stimme wird abgegeben...');
    
    const response = await fetch('/api/surveys/vote', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ surveyId, optionIndex })
    });
    
    if (!response.ok) {
      const data = await response.json();
      showNotification('error', data.error || 'Fehler beim Abstimmen');
      return;
    }
    
    const data = await response.json();
    
    showNotification('success', 'Abstimmung erfolgreich!');
    
    // Umfrage-UI aktualisieren
    updateSurveyUI(surveyId, optionIndex);
    
    // Ergebnisse anzeigen
    if (data.data && data.data.results) {
      // Optional: Ergebnisse sofort anzeigen
    }
    
  } catch (error) {
    console.error('Fehler beim Voten:', error);
    showNotification('error', 'Serverfehler beim Abstimmen.');
    
    // Im Demo-Modus: UI trotzdem aktualisieren
    updateSurveyUI(surveyId, optionIndex);
  }
}

// Umfrage-UI nach Abstimmung aktualisieren
function updateSurveyUI(surveyId, votedOptionIndex) {
  const surveyCard = document.querySelector(`.survey-card[data-survey-id="${surveyId}"]`);
  if (!surveyCard) return;
  
  // Karte als "abgestimmt" markieren
  surveyCard.classList.add('voted');
  
  // Button-Status aktualisieren
  const voteBtn = surveyCard.querySelector('.vote-btn');
  if (voteBtn) {
    voteBtn.classList.add('disabled');
    voteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Abgestimmt';
    voteBtn.disabled = true;
  }
  
  // Umfragen neu laden
  setTimeout(() => {
    loadSurveys();
  }, 1000);
}

// Benutzer-ID aus Token extrahieren
function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Einfache Extraktion (nicht kryptografisch sicher)
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    const decoded = JSON.parse(atob(payload));
    return decoded.id;
  } catch (e) {
    console.error('Fehler beim Dekodieren des Tokens:', e);
    return null;
  }
}

// Zeitangabe formatieren (wie lange her)
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
  } else if (hours > 0) {
    return `vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
  } else if (minutes > 0) {
    return `vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
  } else {
    return 'gerade eben';
  }
}

// Benachrichtungssystem
function showNotification(type, message) {
  // Vorhandene Benachrichtigungen entfernen
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(note => {
    note.remove();
  });
  
  // Neue Benachrichtigung erstellen
  const notification = document.createElement('div');
  notification.classList.add('notification', `notification-${type}`);
  
  let icon = '';
  switch (type) {
    case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
    case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
    case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
    default: icon = '';
  }
  
  notification.innerHTML = `${icon} ${message}`;
  document.body.appendChild(notification);
  
  // Animation für Einblenden
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Automatisch ausblenden
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}