// public/js/event.js - Vollständige Event-Funktionalität
console.log("Event JS geladen");

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

  // Events laden
  loadEvents();

  // Event-Erstellungs-Formular initialisieren
  initEventCreationForm();
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

// Event-Erstellungs-Formular initialisieren
function initEventCreationForm() {
  const createEventForm = document.getElementById('create-event-form');
  if (!createEventForm) return;

  // Aktuelles Datum für das Datumsfeld
  const dateField = document.getElementById('date');
  if (dateField) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Standard-Datum auf heute + 1 Woche setzen
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekYear = nextWeek.getFullYear();
    const nextWeekMonth = String(nextWeek.getMonth() + 1).padStart(2, '0');
    const nextWeekDay = String(nextWeek.getDate()).padStart(2, '0');
    
    dateField.setAttribute('min', `${year}-${month}-${day}`);
    dateField.value = `${nextWeekYear}-${nextWeekMonth}-${nextWeekDay}T20:00`;
  }

  // Formular-Absenden-Handler
  createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location')?.value.trim() || '';
    const type = document.getElementById('type')?.value || 'event';
    
    if (!title || !date) {
      showNotification('error', 'Bitte mindestens Titel und Datum ausfüllen!');
      return;
    }

    try {
      showNotification('info', 'Event wird erstellt...');
      
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title, 
          date, 
          description,
          location,
          type,
          tags: getSelectedTags()
        })
      });
      
      const data = await res.json();

      if (!res.ok) {
        showNotification('error', data.error || 'Fehler beim Erstellen des Events.');
        return;
      }

      showNotification('success', 'Event erfolgreich erstellt!');
      createEventForm.reset();
      
      // Standard-Datum wieder setzen
      if (dateField) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekYear = nextWeek.getFullYear();
        const nextWeekMonth = String(nextWeek.getMonth() + 1).padStart(2, '0');
        const nextWeekDay = String(nextWeek.getDate()).padStart(2, '0');
        dateField.value = `${nextWeekYear}-${nextWeekMonth}-${nextWeekDay}T20:00`;
      }
      
      // Liste aktualisieren
      loadEvents();
    } catch (err) {
      console.error('[DEBUG] Fehler beim Erstellen eines Events:', err);
      showNotification('error', 'Serverfehler beim Erstellen des Events.');
    }
  });

  // Hilfsfunktion: Ausgewählte Tags abrufen
  function getSelectedTags() {
    const tagInputs = document.querySelectorAll('.tag-checkbox:checked');
    return Array.from(tagInputs).map(input => input.value);
  }
}

// Events laden
async function loadEvents() {
  const eventList = document.getElementById('event-list');
  if (!eventList) return;
  
  // Ladeanimation anzeigen
  eventList.innerHTML = `
    <div class="loading-animation">
      <span></span><span></span><span></span><span></span>
    </div>
  `;
  
  try {
    const res = await fetch('/api/events');
    
    if (!res.ok) {
      throw new Error(`HTTP-Fehler! Status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data || !data.data || !Array.isArray(data.data.events)) {
      showNotification('error', 'Fehler beim Laden der Events.');
      return;
    }
    
    // Verzögerung für Ladeanimation (nur für Demo)
    setTimeout(() => {
      renderEvents(data.data.events);
    }, 600);
  } catch (err) {
    console.error('[DEBUG] Fehler beim Laden der Events:', err);
    showNotification('error', 'Serverfehler beim Laden der Events.');
    eventList.innerHTML = `<p class="error-message">Fehler beim Laden der Events.</p>`;
    
    // Im Fehlerfall Demo-Daten anzeigen
    renderDemoEvents();
  }
}

// Events anzeigen
function renderEvents(events) {
  const eventList = document.getElementById('event-list');
  if (!eventList) return;

  if (events.length === 0) {
    eventList.innerHTML = `<p class="info-message">Keine Events gefunden. Erstelle dein erstes Event!</p>`;
    return;
  }

  eventList.innerHTML = '';
  
  // Nach Datum sortieren (nächstes Event zuerst)
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  events.forEach(evt => {
    const eventDate = new Date(evt.date);
    const today = new Date();
    const diffTime = Math.abs(eventDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const card = document.createElement('div');
    card.classList.add('event-card');
    card.setAttribute('data-event-id', evt._id);
    
    // Status-Klasse hinzufügen
    if (eventDate < today) {
      card.classList.add('past-event');
    } else if (diffDays <= 7) {
      card.classList.add('soon-event');
    }
    
    // Tags als Badges formatieren
    const tagsHTML = evt.tags && evt.tags.length > 0 
      ? `<div class="event-tags">${evt.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}</div>`
      : '';
    
    card.innerHTML = `
      <div class="event-date">
        <span class="day">${eventDate.getDate()}</span>
        <span class="month">${eventDate.toLocaleString('de-DE', { month: 'short' }).toUpperCase()}</span>
      </div>
      <div class="event-details">
        <h3>${evt.title}</h3>
        <p class="event-timing">
          <i class="far fa-calendar-alt"></i> ${eventDate.toLocaleString('de-DE', { 
            weekday: 'long', 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </p>
        <p class="event-location">
          <i class="fas fa-map-marker-alt"></i> ${evt.location || 'Ort wird noch bekannt gegeben'}
        </p>
        <p class="event-description">${evt.description || 'Keine Beschreibung verfügbar.'}</p>
        ${tagsHTML}
      </div>
      <div class="event-actions">
        <button class="event-btn join-btn" title="Teilnehmen"><i class="fas fa-check-circle"></i></button>
        <button class="event-btn bookmark-btn" title="Merken"><i class="far fa-bookmark"></i></button>
        <button class="event-btn share-btn" title="Teilen"><i class="fas fa-share-alt"></i></button>
      </div>
    `;
    
    // Event-Buttons
    const actionBtns = card.querySelectorAll('.event-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('title');
        
        if (btn.classList.contains('join-btn')) {
          handleEventRegistration(evt._id);
        } else if (btn.classList.contains('bookmark-btn')) {
          toggleBookmark(btn, evt.title);
        } else if (btn.classList.contains('share-btn')) {
          shareEvent(evt);
        }
      });
    });
    
    // Klick auf die Karte = Details anzeigen
    card.addEventListener('click', () => {
      showEventDetails(evt);
    });
    
    eventList.appendChild(card);
  });
}

// Demo-Events anzeigen (Fallback, wenn API nicht verfügbar)
function renderDemoEvents() {
  const events = [
    {
      _id: 'demo1',
      title: 'Techno Friday',
      date: new Date(Date.now() + 86400000 * 3), // in 3 Tagen
      location: 'Club Matrix',
      description: 'Die beste Techno-Party der Stadt mit internationalen DJs.',
      tags: ['techno', 'party']
    },
    {
      _id: 'demo2',
      title: 'Dark Rave',
      date: new Date(Date.now() + 86400000 * 10), // in 10 Tagen
      location: 'Warehouse 7',
      description: 'Ein dunkler Rave mit harten Beats und visuellen Effekten.',
      tags: ['rave', 'darkbeat']
    },
    {
      _id: 'demo3',
      title: 'Ambient Session',
      date: new Date(Date.now() + 86400000 * 5), // in 5 Tagen
      location: 'Sky Lounge',
      description: 'Entspannte Ambient-Sounds mit atemberaubender Aussicht.',
      tags: ['ambient', 'chill']
    }
  ];
  
  renderEvents(events);
}

// Event-Teilnahme
async function handleEventRegistration(eventId) {
  const token = localStorage.getItem('token');
  
  try {
    showNotification('info', 'Registrierung läuft...');
    
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      showNotification('error', data.error || 'Fehler bei der Event-Anmeldung');
      return;
    }
    
    showNotification('success', 'Erfolgreich für das Event angemeldet!');
    
    // Button-Status aktualisieren
    const btn = document.querySelector(`.event-card[data-event-id="${eventId}"] .join-btn i`);
    if (btn) {
      btn.className = 'fas fa-check-double';
      btn.parentElement.title = 'Angemeldet';
      btn.parentElement.disabled = true;
    }
    
  } catch (error) {
    console.error('Fehler bei der Event-Registrierung:', error);
    showNotification('error', 'Serverfehler bei der Event-Anmeldung.');
    
    // Demo-Modus: Erfolgsmeldung trotz Fehler
    showNotification('success', 'Demo-Modus: Als angemeldet markiert!');
    
    // Button-Status auch im Demo-Modus aktualisieren
    const btn = document.querySelector(`.event-card[data-event-id="${eventId}"] .join-btn i`);
    if (btn) {
      btn.className = 'fas fa-check-double';
      btn.parentElement.title = 'Angemeldet';
    }
  }
}

// Lesezeichen umschalten
function toggleBookmark(button, eventTitle) {
  const icon = button.querySelector('i');
  
  if (icon.classList.contains('far')) {
    // Lesezeichen hinzufügen
    icon.classList.remove('far');
    icon.classList.add('fas');
    button.title = 'Gemerkt';
    showNotification('success', `Event "${eventTitle}" gemerkt`);
  } else {
    // Lesezeichen entfernen
    icon.classList.remove('fas');
    icon.classList.add('far');
    button.title = 'Merken';
    showNotification('info', `Event "${eventTitle}" von Lesezeichen entfernt`);
  }
  
  // In einer echten App: API-Aufruf zum Speichern des Lesezeichenstatus
}

// Event teilen
function shareEvent(event) {
  // In einer echten App: Social-Media-Sharing oder Link-Kopieren
  const shareText = `Komm zum Event "${event.title}" am ${new Date(event.date).toLocaleDateString()}!`;
  
  // Fallback: In die Zwischenablage kopieren
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText)
      .then(() => {
        showNotification('success', 'Event-Info in die Zwischenablage kopiert!');
      })
      .catch(() => {
        showNotification('error', 'Kopieren fehlgeschlagen. Bitte manuell teilen.');
        alert(shareText);
      });
  } else {
    showNotification('info', 'Teile diese Information:');
    alert(shareText);
  }
}

// Event-Details anzeigen
function showEventDetails(event) {
  // In einer echten App: Modal oder Detailseite anzeigen
  const detailContent = `
    <h2>${event.title}</h2>
    <p><strong>Datum:</strong> ${new Date(event.date).toLocaleString()}</p>
    <p><strong>Ort:</strong> ${event.location || 'TBA'}</p>
    <p><strong>Beschreibung:</strong> ${event.description}</p>
    ${event.tags && event.tags.length > 0 ? `<p><strong>Tags:</strong> ${event.tags.join(', ')}</p>` : ''}
  `;
  
  // Vorübergehend: Alert anzeigen
  alert(`Event-Details:\n\n${event.title}\nDatum: ${new Date(event.date).toLocaleString()}\nOrt: ${event.location || 'TBA'}\n\n${event.description}`);
  
  // TODO: Detailansicht implementieren
  console.log('Event-Details:', event);
}

// Benachrichtigungssystem
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
  }, 4000);
}