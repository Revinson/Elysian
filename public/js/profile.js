// public/js/profile.js
console.log("Profile JS loaded");

document.addEventListener('DOMContentLoaded', async () => {
  // Authentifizierungsprüfung
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  try {
    // API-Anfrage für Profildaten
    const res = await fetch('/api/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    
    if (!res.ok) {
      alert('Could not load profile (Error status ' + res.status + ').');
      return window.location.href = 'login.html';
    }

    const data = await res.json();
    
    // Initialisiere UI-Elemente mit den Benutzerdaten
    initializeProfile(data.data.user);

  } catch (err) {
    console.error('Error fetching profile:', err);
    alert('Server error while fetching profile.');
    window.location.href = 'login.html';
  }

  // Role Quiz Modal
  setupRoleQuiz();

  // Button Event Listener
  setupButtons();
});

// Profildaten in die UI einfügen
function initializeProfile(userData) {
  // Standard-Profildaten
  document.getElementById('profile-username').textContent = 'Username: ' + (userData.username || '???');
  document.getElementById('profile-role').textContent = 'Role: ' + (userData.userRole || 'User');
  document.getElementById('profile-age').textContent = 'Age: ' + (userData.age || 'Not specified');
  document.getElementById('profile-team').textContent = 'Team ' + (userData.team || '???').toUpperCase();

  // Level und XP
  const level = userData.level || 1;
  const xp = userData.xp || 0;
  const xpNext = userData.xpNext || 100;

  document.getElementById('profile-level-num').textContent = level;
  document.getElementById('profile-xp').textContent = xp;
  document.getElementById('profile-xpnext').textContent = xpNext;

  // XP-Bar füllen
  const xpPercent = Math.min((xp / xpNext) * 100, 100);
  document.getElementById('xp-bar-fill').style.width = xpPercent + '%';

  // Bio
  document.getElementById('profile-bio').innerHTML = 'Bio: <span>' + (userData.bio || 'No bio yet.') + '</span>';

  // Archetype-Bereich - nur anzeigen, wenn ein Archetyp vorhanden ist
  if (userData.finalArchetype) {
    const archetypeSection = document.getElementById('archetype-section');
    if (archetypeSection) {
      archetypeSection.classList.remove('hidden');
      document.getElementById('archetype-name').textContent = userData.finalArchetype;
      
      // Archetyp-Beschreibung basierend auf Typ
      const description = getArchetypeDescription(userData.finalArchetype);
      document.getElementById('archetype-description').textContent = description;
    }
  } else {
    // "Quiz machen"-Option anzeigen, wenn kein Archetyp vorhanden ist
    const takeQuizSection = document.getElementById('take-quiz-section');
    if (takeQuizSection) {
      takeQuizSection.classList.remove('hidden');
    }
  }

  // Achievements
  renderList('achievements-list', userData.achievements, 'No achievements yet.');

  // Friends
  renderList('friends-list', userData.friends, 'No friends added yet.');

  // Recent Events
  if (userData.recentEvents && userData.recentEvents.length > 0) {
    renderEvents('events-list', userData.recentEvents);
  }
}

// Hilfsfunktion: Listen rendern
function renderList(elementId, items, emptyMessage) {
  const listElement = document.getElementById(elementId);
  if (!listElement) return;

  if (!Array.isArray(items) || items.length === 0) {
    listElement.innerHTML = `<p>${emptyMessage}</p>`;
    return;
  }

  listElement.innerHTML = items.map(item => `<p>• ${item}</p>`).join('');
}

// Hilfsfunktion: Events rendern
function renderEvents(elementId, events) {
  const eventsElement = document.getElementById(elementId);
  if (!eventsElement) return;

  if (!Array.isArray(events) || events.length === 0) {
    eventsElement.innerHTML = '<p>No recent events.</p>';
    return;
  }

  eventsElement.innerHTML = events.map(event => `
    <div class="mini-event">
      <div class="mini-event-date">
        <span class="day">${formatDay(event.date)}</span>
        <span class="month">${formatMonth(event.date)}</span>
      </div>
      <div class="mini-event-details">
        <h4>${event.title}</h4>
        <p>${event.location || 'Unknown location'} • ${event.status || 'Attended'}</p>
      </div>
    </div>
  `).join('');
}

// Hilfsfunktion: Datum formatieren (Tag)
function formatDay(dateStr) {
  const date = new Date(dateStr);
  return date.getDate();
}

// Hilfsfunktion: Datum formatieren (Monat)
function formatMonth(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
}

// Hilfsfunktion: Archetyp-Beschreibung
function getArchetypeDescription(archetype) {
  switch(archetype) {
    case 'Rhythm Hunter':
      return 'You seek the perfect beat, always hunting for the next rhythm that will set your soul on fire.';
    case 'Connector':
      return 'You bring people together through music, creating bonds that transcend language and culture.';
    case 'Twilight Dreamer':
      return 'Between darkness and light, you find inspiration in the liminal spaces of sound.';
    case 'Neon Explorer':
      return 'You venture boldly into new soundscapes, letting the neon glow guide your musical journey.';
    case 'Harmonizer':
      return 'You find balance in chaos, harmonizing contrasting elements into a cohesive experience.';
    case 'Explorer':
      return 'Always seeking new experiences, you push boundaries and discover uncharted territories.';
    case 'Guardian':
      return 'You protect the essence of the scene, preserving its authenticity and core values.';
    case 'Creator':
      return 'With innovative spirit, you bring new ideas and expressions to the community.';
    case 'Seeker':
      return 'On a perpetual journey of self-discovery through music and connection.';
    default:
      return 'A unique soul in the Elysian world, your journey is yours to define.';
  }
}

// Setup für das Rollen-Quiz
function setupRoleQuiz() {
  const quizModal = document.getElementById('role-quiz-modal');
  const openQuizBtn = document.getElementById('take-quiz-btn');
  const closeQuizBtn = document.getElementById('close-quiz-modal');
  const quizForm = document.getElementById('role-quiz-form');
  
  if (openQuizBtn) {
    openQuizBtn.addEventListener('click', () => {
      if (quizModal) quizModal.classList.remove('hidden');
    });
  }
  
  if (closeQuizBtn) {
    closeQuizBtn.addEventListener('click', () => {
      if (quizModal) quizModal.classList.add('hidden');
    });
  }
  
  if (quizForm) {
    quizForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Quiz-Antworten sammeln
      const roleAnswers = {
        q1: document.getElementById('quiz-q1').value.trim(),
        q2: document.getElementById('quiz-q2').value.trim(),
        q3: document.getElementById('quiz-q3').value.trim(),
        q4: document.getElementById('quiz-q4').value.trim(),
        q5: document.getElementById('quiz-q5').value.trim()
      };
      
      // Einfache Validierung
      if (!roleAnswers.q1 || !roleAnswers.q2 || !roleAnswers.q3 || !roleAnswers.q4 || !roleAnswers.q5) {
        alert('Please answer all questions.');
        return;
      }
      
      // Archetyp basierend auf Antworten bestimmen
      const finalArchetype = determineArchetype(roleAnswers);
      
      try {
        const token = localStorage.getItem('token');
        // API-Anfrage zum Aktualisieren des Archetyps
        const response = await fetch('/api/users/update-archetype', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ roleAnswers, finalArchetype })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update archetype');
        }
        
        alert('Your archetype has been discovered: ' + finalArchetype);
        // Seite neu laden, um neuen Archetyp anzuzeigen
        window.location.reload();
        
      } catch (error) {
        console.error('Error updating archetype:', error);
        alert('Error saving your archetype: ' + error.message);
      }
    });
  }
}

// Archetyp basierend auf Antworten bestimmen
function determineArchetype(answers) {
  // Einfache Variante: Schlüsselwörter in den Antworten überprüfen
  const text = Object.values(answers).join(' ').toLowerCase();
  
  if (text.includes('rhythm') || text.includes('beat') || text.includes('pulse')) {
    return "Rhythm Hunter";
  } else if (text.includes('connect') || text.includes('together') || text.includes('community')) {
    return "Connector";
  } else if (text.includes('dream') || text.includes('night') || text.includes('dark')) {
    return "Twilight Dreamer";
  } else if (text.includes('explore') || text.includes('discover') || text.includes('new')) {
    return "Neon Explorer";
  } else if (text.includes('balance') || text.includes('harmony')) {
    return "Harmonizer";
  } else if (text.includes('protect') || text.includes('safe') || text.includes('security')) {
    return "Guardian";
  } else if (text.includes('create') || text.includes('make') || text.includes('build')) {
    return "Creator";
  } else if (text.includes('seek') || text.includes('search') || text.includes('find')) {
    return "Seeker";
  }
  
  // Fallback-Optionen als Array
  const fallbackTypes = ["Rhythm Hunter", "Connector", "Twilight Dreamer", "Neon Explorer"];
  return fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];
}

// Button Event Listener
function setupButtons() {
  // Zurück zum Dashboard
  document.getElementById('back-dashboard-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  // Profilbild ändern
  document.getElementById('change-pic-btn').addEventListener('click', () => {
    alert('Change profile picture – Coming soon!');
  });
  
  // Freund hinzufügen
  document.getElementById('add-friend-btn').addEventListener('click', () => {
    alert('Add friend – Coming soon!');
  });
}