console.log("Forum JS geladen");

document.addEventListener('DOMContentLoaded', () => {
  // Token-Check
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bitte zuerst einloggen!');
    window.location.href = 'login.html';
    return;
  }

  // Add demo mode notification
  const forumContent = document.querySelector('.forum-content');
  if (forumContent) {
    const demoBanner = document.createElement('div');
    demoBanner.className = 'demo-notice';
    demoBanner.innerHTML = `
      <i class="fas fa-info-circle"></i> 
      <span>Das Forum läuft aktuell im Demo-Modus. Daten werden im lokalen Speicher deines Browsers gespeichert.</span>
    `;
    forumContent.insertBefore(demoBanner, forumContent.firstChild);
    
    // Add style for the banner
    const style = document.createElement('style');
    style.textContent = `
      .demo-notice {
        background-color: rgba(var(--accent-color-rgb), 0.15);
        border: 1px solid var(--accent-color);
        color: var(--text-color);
        padding: 10px 15px;
        margin-bottom: 15px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
      }
      .demo-notice i {
        margin-right: 10px;
        color: var(--accent-color);
        font-size: 1.2rem;
      }
    `;
    document.head.appendChild(style);
  }

  // DOM-Elemente
  const threadsContainer = document.getElementById('threads-container');
  const newThreadBtn = document.getElementById('new-thread-btn');
  const newThreadModal = document.getElementById('new-thread-modal');
  const closeThreadModal = document.getElementById('close-thread-modal');
  const newThreadForm = document.getElementById('new-thread-form');
  const forumNavLinks = document.querySelectorAll('.forum-nav li a');
  const threadSearchInput = document.getElementById('thread-search');
  const sortOptions = document.getElementById('sort-options');
  const threadDetailTemplate = document.getElementById('thread-detail-template');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const forumSidebar = document.querySelector('.forum-sidebar');
  const previewThreadBtn = document.getElementById('preview-thread');
  
  // Aktuelle Ansicht und Daten
  let currentView = 'all-threads';
  let currentThreadId = null;
  let threads = [];
  let filteredThreads = [];
  let isLoading = false;

  // Local Storage functions for persistence
  function saveThreadsToLocalStorage() {
    try {
      localStorage.setItem('forum_threads', JSON.stringify(threads));
      console.log('Threads saved to local storage');
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  function loadThreadsFromLocalStorage() {
    try {
      const savedThreads = localStorage.getItem('forum_threads');
      if (savedThreads) {
        // Parse dates properly from JSON
        const parsedThreads = JSON.parse(savedThreads, (key, value) => {
          // Convert date strings back to Date objects
          if (key === 'createdAt' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
        
        console.log('Threads loaded from local storage');
        return parsedThreads;
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
    }
    return null;
  }

  // Header Buttons
  document.getElementById('profile-btn').addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
  
  document.getElementById('dashboard-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // Oder dashboard.html je nach Konfiguration
  });
  
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Mobile Navigation Toggle
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      forumSidebar.classList.toggle('expanded');
      mobileNavToggle.innerHTML = forumSidebar.classList.contains('expanded') 
        ? '<i class="fas fa-times"></i> Schließen' 
        : '<i class="fas fa-bars"></i> Navigation';
    });
  }

  // Dark Mode Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Set initial state based on localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateThemeToggleText();
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const newDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', newDarkMode);
      updateThemeToggleText();
    });
  }
  
  function updateThemeToggleText() {
    if (themeToggle) {
      const isDarkMode = document.body.classList.contains('dark-mode');
      themeToggle.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i> Light Mode' : 
        '<i class="fas fa-moon"></i> Dark Mode';
    }
  }

  // Thread-Modal öffnen/schließen
  newThreadBtn.addEventListener('click', () => {
    newThreadModal.classList.remove('hidden');
    // Animation effect - fade in
    setTimeout(() => newThreadModal.classList.add('active'), 10);
  });
  
  closeThreadModal.addEventListener('click', () => {
    // Animation effect - fade out
    newThreadModal.classList.remove('active');
    setTimeout(() => newThreadModal.classList.add('hidden'), 300);
  });
  
  // Klick außerhalb des Modals schließt das Modal
  newThreadModal.addEventListener('click', (e) => {
    if (e.target === newThreadModal) {
      // Animation effect - fade out
      newThreadModal.classList.remove('active');
      setTimeout(() => newThreadModal.classList.add('hidden'), 300);
    }
  });

  // Thread Preview Button
  if (previewThreadBtn) {
    previewThreadBtn.addEventListener('click', () => {
      const title = document.getElementById('thread-title').value.trim();
      const content = document.getElementById('thread-content').value.trim();
      const tagsInput = document.getElementById('thread-tags').value.trim();
      
      if (!title || !content) {
        showError('Bitte fülle Titel und Inhalt aus, um eine Vorschau zu sehen.');
        return;
      }
      
      // Create a preview modal
      const previewModal = document.createElement('div');
      previewModal.className = 'modal';
      
      const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
      const tagsHtml = tags.length ? tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
      
      previewModal.innerHTML = `
        <div class="modal-content neon-card">
          <div class="modal-header">
            <h2><i class="fas fa-eye"></i> Thread-Vorschau</h2>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="thread-detail">
              <h2 class="thread-title">${title}</h2>
              <div class="thread-meta">
                <div class="author-info">
                  <img src="./images/elysian_logo.png" alt="Avatar" class="avatar">
                  <div>
                    <span class="author-name">Du</span>
                    <span class="author-team pulse">PULSE</span>
                  </div>
                </div>
                <span class="thread-date">Vorschau</span>
              </div>
              <div class="thread-content">${content.replace(/\n/g, '<br>')}</div>
              <div class="thread-tags">${tagsHtml}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="neon-btn primary close-preview">Schließen</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(previewModal);
      
      // Animation effect - fade in
      setTimeout(() => previewModal.classList.add('active'), 10);
      
      // Close preview modal
      const closePreviewBtns = previewModal.querySelectorAll('.close-modal, .close-preview');
      closePreviewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          previewModal.classList.remove('active');
          setTimeout(() => previewModal.remove(), 300);
        });
      });
      
      // Click outside closes modal
      previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
          previewModal.classList.remove('active');
          setTimeout(() => previewModal.remove(), 300);
        }
      });
    });
  }

  // Navigation zwischen Forum-Ansichten
  forumNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      
      // Aktiven Link aktualisieren
      forumNavLinks.forEach(link => link.parentElement.classList.remove('active'));
      link.parentElement.classList.add('active');
      
      // Suchfeld zurücksetzen
      if (threadSearchInput) {
        threadSearchInput.value = '';
      }
      
      // Sidebar auf Mobile schließen
      if (window.innerWidth < 900 && forumSidebar) {
        forumSidebar.classList.remove('expanded');
        if (mobileNavToggle) {
          mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i> Navigation';
        }
      }
      
      // Ansicht wechseln
      changeView(view);
    });
  });

  // Thread-Suche mit Debounce
  let searchTimeout;
  threadSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
      const searchTerm = threadSearchInput.value.toLowerCase().trim();
      filterThreads(searchTerm);
    }, 300); // 300ms delay for debounce
  });

  // Sortierung ändern
  sortOptions.addEventListener('change', () => {
    showLoadingIndicator();
    
    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      sortThreads(sortOptions.value);
      hideLoadingIndicator();
    }, 200);
  });

  // Threads laden
  loadThreads();

  // Neuen Thread erstellen
  newThreadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('thread-title').value.trim();
    const content = document.getElementById('thread-content').value.trim();
    const category = document.getElementById('thread-category').value;
    let tags = document.getElementById('thread-tags').value.trim();
    
    tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Validate the category is one of the allowed values
    const validCategories = ['general', 'events', 'support', 'offtopic', 'announcements'];
    
    if (!title || !content || !category) {
      showError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }
    
    if (!validCategories.includes(category)) {
      showError(`Kategorie "${category}" ist nicht gültig. Bitte wähle eine der folgenden Kategorien: ${validCategories.join(', ')}`);
      return;
    }
    
    // Submit button state
    const submitBtn = newThreadForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
      // TEMPORARILY DISABLED REAL API CALLS - Using demo data only until backend issues are fixed
      console.log('Creating demo thread: Backend API calls temporarily disabled');
      
      // Create a new thread object locally
      const newThread = {
        id: 'local-' + Date.now(),
        title,
        content,
        category,
        tags,
        authorName: 'Du',
        authorTeam: 'PULSE',
        authorAvatar: './images/elysian_logo.png',
        createdAt: new Date(),
        likes: [],
        commentCount: 0,
        viewCount: 0,
        replies: [],
        isOwn: true
      };
      
      // Add the thread to our local array
      threads.unshift(newThread);
      filteredThreads = [...threads];
      
      // Save to local storage
      saveThreadsToLocalStorage();
      
      showSuccess('Thread erfolgreich erstellt!');
      
      // Animation effect - fade out
      newThreadModal.classList.remove('active');
      setTimeout(() => {
        newThreadModal.classList.add('hidden');
        newThreadForm.reset();
        
        // Threads neu laden oder neuen Thread zur Liste hinzufügen
        renderThreads(filteredThreads);
      }, 300);
      
    } catch (error) {
      console.error('Fehler beim Erstellen des Threads:', error);
      showError(`Fehler: ${error.message}`);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Thread-Detailansicht - Event-Delegation für Thread-Karten
  threadsContainer.addEventListener('click', (e) => {
    // Nur weiterlesen-Button und Titel behandeln
    const readMoreBtn = e.target.closest('.read-more-btn');
    const threadTitle = e.target.closest('.thread-title');
    
    if (!readMoreBtn && !threadTitle) return;
    
    // Thread-ID aus dem nächsten Thread-Card-Element holen
    const threadCard = (readMoreBtn || threadTitle).closest('.thread-card');
    if (!threadCard) return;
    
    const threadId = threadCard.getAttribute('data-thread-id');
    if (threadId) {
      showThreadDetail(threadId);
    } else {
      // Demo-Ansicht ohne echte Thread-ID
      showDemoThreadDetail();
    }
  });

  // Loading indicator functions
  function showLoadingIndicator() {
    isLoading = true;
    
    // Remove existing loading indicator if any
    const existingLoader = document.querySelector('.loading-container');
    if (existingLoader) {
      existingLoader.remove();
    }
    
    const loader = document.createElement('div');
    loader.className = 'loading-container';
    loader.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Lade Inhalte...</div>
    `;
    
    // Only show if the threads container is empty
    if (!threadsContainer.hasChildNodes()) {
      threadsContainer.innerHTML = '';
      threadsContainer.appendChild(loader);
    }
  }
  
  function hideLoadingIndicator() {
    isLoading = false;
    const loader = document.querySelector('.loading-container');
    if (loader) {
      loader.remove();
    }
  }
  
  // Feedback messages
  function showError(message) {
    // Remove any existing messages
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Insert at beginning of the form or another appropriate location
    const insertLocation = newThreadForm || document.querySelector('.forum-controls');
    if (insertLocation) {
      insertLocation.prepend(errorDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }
  
  function showSuccess(message) {
    // Remove any existing messages
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    // Insert at beginning of the form or another appropriate location
    const insertLocation = newThreadForm || document.querySelector('.forum-controls');
    if (insertLocation) {
      insertLocation.prepend(successDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        successDiv.remove();
      }, 5000);
    }
  }
  
  function removeMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
  }

  // Funktionen
  async function loadThreads() {
    if (isLoading) return;
    
    showLoadingIndicator();
    
    try {
      // Try to load threads from local storage first
      const localStorageThreads = loadThreadsFromLocalStorage();
      
      if (localStorageThreads && localStorageThreads.length > 0) {
        threads = localStorageThreads;
        console.log('Using threads from local storage');
      } else {
        // If no threads in local storage, use demo data
        console.log('No threads in local storage, using demo data');
        threads = getDemoThreads();
        // Save demo threads to local storage
        saveThreadsToLocalStorage();
      }
      
      filteredThreads = [...threads];
      
      // Apply current view filter
      if (currentView !== 'all-threads') {
        changeView(currentView, false); // Don't re-fetch, just filter
      } else {
        renderThreads(filteredThreads);
      }
      
    } catch (error) {
      console.error('Fehler beim Laden der Threads:', error);
      // Im Fehlerfall Demo-Daten anzeigen
      threads = getDemoThreads();
      filteredThreads = [...threads];
      renderThreads(filteredThreads);
    } finally {
      hideLoadingIndicator();
    }
  }

  function renderThreads(threadsToRender) {
    threadsContainer.innerHTML = '';
    
    if (threadsToRender.length === 0) {
      threadsContainer.innerHTML = `
        <div class="no-results neon-card">
          <h3>Keine Threads gefunden</h3>
          <p>Erstelle einen neuen Thread oder ändere deine Suchkriterien.</p>
        </div>
      `;
      return;
    }
    
    threadsToRender.forEach((thread, index) => {
      const card = document.createElement('div');
      card.classList.add('thread-card', 'neon-card', 'animate-slideUp');
      card.style.animationDelay = `${index * 0.05}s`;
      
      if (thread.id) {
        card.setAttribute('data-thread-id', thread.id);
      }
      
      const date = new Date(thread.createdAt || new Date());
      const timeAgo = getTimeAgo(date);
      
      const authorName = thread.authorName || 
                         (thread.author ? (thread.author.username || 'Anonymous') : 'Anonymous');
      
      const authorTeam = thread.authorTeam || 
                         (thread.author ? (thread.author.team || 'PULSE') : 'PULSE');
                         
      const commentCount = thread.commentCount || thread.replyCount || 
                         (thread.replies ? thread.replies.length : 0);
      
      // Get first tag if exists
      const firstTag = thread.tags && thread.tags.length > 0 ? 
                      `<span class="tag">${thread.tags[0]}</span>` : '';
      
      // Get category badge
      const categoryBadge = getCategoryBadge(thread.category);
      
      card.innerHTML = `
        <div class="thread-header">
          <div class="thread-author">
            <img src="${thread.authorAvatar || './images/elysian_logo.png'}" alt="Avatar" class="avatar-small">
            <span class="author-name">${authorName}</span>
            <span class="author-team ${authorTeam?.toLowerCase() || 'pulse'}">${authorTeam || 'PULSE'}</span>
          </div>
          <span class="thread-date">${timeAgo}</span>
        </div>
        <h3 class="thread-title">${thread.title}</h3>
        <p class="thread-excerpt">${getExcerpt(thread.content, 150)}</p>
        <div class="thread-footer">
          <div class="thread-stats">
            <span><i class="fas fa-comment"></i> ${commentCount} Antworten</span>
            <span><i class="fas fa-eye"></i> ${thread.viewCount || 0} Aufrufe</span>
            <div class="thread-tags-preview">
              ${categoryBadge}
              ${firstTag}
              ${thread.tags && thread.tags.length > 1 ? `<span class="tag">+${thread.tags.length - 1}</span>` : ''}
            </div>
          </div>
          <button class="read-more-btn">Weiterlesen <i class="fas fa-arrow-right"></i></button>
        </div>
      `;
      
      threadsContainer.appendChild(card);
    });
  }

  function getCategoryBadge(category) {
    let icon, label;
    
    switch (category) {
      case 'general':
        icon = 'comments';
        label = 'Allgemein';
        break;
      case 'events':
        icon = 'calendar-alt';
        label = 'Events';
        break;
      case 'support':
        icon = 'life-ring';
        label = 'Support';
        break;
      case 'offtopic':
        icon = 'random';
        label = 'Off-Topic';
        break;
      case 'announcements':
        icon = 'bullhorn';
        label = 'Ankündigungen';
        break;
      default:
        icon = 'tag';
        label = category;
    }
    
    return `<span class="tag category-${category}"><i class="fas fa-${icon}"></i> ${label}</span>`;
  }

  function changeView(view, resetData = true) {
    currentView = view;
    
    // Show loading indicator
    if (resetData) {
      showLoadingIndicator();
    }
    
    // Navigation-Styling aktualisieren - Fix for null reference error
    document.querySelectorAll('.forum-nav li').forEach(item => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('data-view') === view) {
        item.classList.add('active');
      } else if (link) {
        item.classList.remove('active');
      }
    });
    
    // Threads nach Ansicht filtern
    let viewThreads = [...threads];
    
    switch (view) {
      case 'my-threads':
        // In einer echten App: Threads filtern, die dem aktuellen Benutzer gehören
        viewThreads = threads.filter(thread => thread.isOwn === true);
        break;
      case 'trending':
        // Threads nach Beliebtheit sortieren
        viewThreads = [...threads].sort((a, b) => 
          (b.viewCount + (b.commentCount || b.replyCount || 0) * 2) - 
          (a.viewCount + (a.commentCount || a.replyCount || 0) * 2)
        );
        break;
      case 'general':
        // Filter threads in "general" category
        viewThreads = threads.filter(thread => thread.category === 'general');
        break;
      case 'events':
        // Filter threads in "events" category
        viewThreads = threads.filter(thread => thread.category === 'events');
        break;
      case 'support':
        // Filter threads in "support" category
        viewThreads = threads.filter(thread => thread.category === 'support');
        break;
      case 'offtopic':
        // Filter threads in "offtopic" category
        viewThreads = threads.filter(thread => thread.category === 'offtopic');
        break;
      case 'announcements':
        // Filter threads in "announcements" category
        viewThreads = threads.filter(thread => thread.category === 'announcements');
        break;
    }
    
    filteredThreads = viewThreads;
    
    // Apply current sort
    const currentSort = sortOptions.value;
    if (currentSort !== 'newest') {
      sortThreads(currentSort, false);
    } else {
      renderThreads(filteredThreads);
    }
    
    if (resetData) {
      // Update page title with category
      updatePageTitle(view);
      
      // Hide loading indicator with a small delay for smoother UX
      setTimeout(hideLoadingIndicator, 300);
    }
  }
  
  function updatePageTitle(view) {
    let title = 'Elysium Forum';
    
    switch (view) {
      case 'my-threads':
        title = 'Meine Threads - Elysium Forum';
        break;
      case 'trending':
        title = 'Trending Threads - Elysium Forum';
        break;
      case 'general':
        title = 'Allgemein - Elysium Forum';
        break;
      case 'events':
        title = 'Events - Elysium Forum';
        break;
      case 'support':
        title = 'Support - Elysium Forum';
        break;
      case 'offtopic':
        title = 'Off-Topic - Elysium Forum';
        break;
      case 'announcements':
        title = 'Ankündigungen - Elysium Forum';
        break;
    }
    
    document.title = title;
  }

  function filterThreads(searchTerm) {
    showLoadingIndicator();
    
    setTimeout(() => {
      if (!searchTerm) {
        filteredThreads = [...threads];
        
        // Apply current view filter
        if (currentView !== 'all-threads') {
          changeView(currentView, false); // Don't re-fetch, just filter
          return;
        }
      } else {
        filteredThreads = threads.filter(thread => 
          (thread.title && thread.title.toLowerCase().includes(searchTerm)) ||
          (thread.content && thread.content.toLowerCase().includes(searchTerm)) ||
          (thread.authorName && thread.authorName.toLowerCase().includes(searchTerm)) ||
          (thread.tags && Array.isArray(thread.tags) && thread.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      }
      
      // Apply current sort
      const currentSort = sortOptions.value;
      if (currentSort !== 'newest') {
        sortThreads(currentSort, false);
      } else {
        renderThreads(filteredThreads);
      }
      
      hideLoadingIndicator();
    }, 300);
  }

  function sortThreads(sortOption, showLoading = true) {
    if (showLoading) {
      showLoadingIndicator();
    }
    
    switch (sortOption) {
      case 'newest':
        filteredThreads.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filteredThreads.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'most-comments':
        filteredThreads.sort((a, b) => {
          const aCount = a.commentCount || a.replyCount || (a.replies ? a.replies.length : 0) || 0;
          const bCount = b.commentCount || b.replyCount || (b.replies ? b.replies.length : 0) || 0;
          return bCount - aCount;
        });
        break;
      case 'most-views':
        filteredThreads.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
    }
    
    renderThreads(filteredThreads);
    
    if (showLoading) {
      setTimeout(hideLoadingIndicator, 200);
    }
  }

  async function showThreadDetail(threadId) {
    showLoadingIndicator();
    
    try {
      // TEMPORARILY DISABLED REAL API CALLS - Using demo data only until backend issues are fixed
      console.log('Using demo thread: Backend API calls temporarily disabled');
      
      // If we have a thread with this ID in our local threads array, use that
      const localThread = threads.find(t => t.id === threadId);
      
      if (localThread) {
        // Use the thread from our local data
        renderThreadDetail(localThread);
      } else {
        // Otherwise show demo thread
        showDemoThreadDetail();
      }
      
    } catch (error) {
      console.error('Error loading the thread:', error);
      // Show demo thread instead of real thread when there's an error
      showDemoThreadDetail();
    } finally {
      hideLoadingIndicator();
    }
  }

  function showDemoThreadDetail() {
    // First, clean up any existing thread detail
    const existingDetail = document.querySelector('#thread-detail-container');
    if (existingDetail) {
      existingDetail.remove();
    }

    // Demo-Thread für Vorschau
    const demoThread = {
      id: 'demo-1',
      title: 'Suche Mitfahrgelegenheit zum Warehouse-Rave am 15. März',
      content: `Hey Leute,

ich suche eine Mitfahrgelegenheit zum Warehouse-Rave am 15. März. Komme aus dem Norden der Stadt und würde mich an den Spritkosten beteiligen. Wäre super, wenn jemand noch einen Platz frei hat!

Die Party geht von 23 Uhr bis 10 Uhr morgens, also wäre es ideal, wenn ich sowohl hin als auch zurück mitfahren könnte.

Freue mich auf eure Antworten!
Bass-Lisa`,
      authorName: 'Bass-Lisa',
      authorTeam: 'PULSE',
      authorAvatar: './images/elysian_logo.png',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 Stunden her
      category: 'events',
      tags: ['transport', 'event', 'warehouse'],
      likes: [],
      commentCount: 3,
      viewCount: 45,
      replies: [
        {
          id: 'comment-1',
          authorName: 'TechnoTim',
          authorTeam: 'FLUX',
          authorAvatar: './images/elysian_logo.png',
          content: 'Ich fahre hin und habe noch 2 Plätze frei! Komme auch aus dem Norden. Schreib mir eine DM für Details.',
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 Minuten her
          likes: []
        },
        {
          id: 'comment-2',
          authorName: 'RaveQueen',
          authorTeam: 'PULSE',
          authorAvatar: './images/elysian_logo.png',
          content: 'Falls niemand direkt aus deiner Gegend fährt, können wir uns auch an einer U-Bahn-Station treffen und gemeinsam mit dem Taxi fahren?',
          createdAt: new Date(Date.now() - 1000 * 60 * 50), // 50 Minuten her
          likes: []
        },
        {
          id: 'comment-3',
          authorName: 'NeonNinja',
          authorTeam: 'FLUX',
          authorAvatar: './images/elysian_logo.png',
          content: 'Weiß jemand, ob es Parkplätze in der Nähe gibt? Dann könnte ich eventuell auch fahren und dich mitnehmen @Bass-Lisa.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 Stunde her
          likes: []
        }
      ]
    };
    
    renderThreadDetail(demoThread);
  }

  function renderThreadDetail(thread) {
    try {
      // Ensure the thread object is valid
      if (!thread || typeof thread !== 'object') {
        console.error('Invalid thread object provided to renderThreadDetail');
        return;
      }
      
      // Clean up any existing thread detail first
      const existingDetail = document.querySelector('#thread-detail-container');
      if (existingDetail) {
        existingDetail.remove();
      }
      
      // Threads-Container ausblenden
      threadsContainer.classList.add('hidden');
      
      // Detailansicht erstellen und anzeigen
      const detailContent = threadDetailTemplate.cloneNode(true).content;
      const detailContainer = document.createElement('div');
      detailContainer.appendChild(detailContent);
      
      // Save current thread ID
      currentThreadId = thread.id;
      
      // Inhalte füllen
      detailContainer.querySelector('#detail-title').textContent = thread.title || 'Untitled Thread';
      
      const authorName = thread.authorName || 
                       (thread.author ? (thread.author.username || 'Anonymous') : 'Anonymous');
      
      const authorTeam = thread.authorTeam || 
                       (thread.author ? (thread.author.team || 'PULSE') : 'PULSE');
      
      detailContainer.querySelector('#detail-author').textContent = authorName;
      detailContainer.querySelector('#detail-team').textContent = authorTeam || 'TEAM';
      detailContainer.querySelector('#detail-team').classList.add(authorTeam?.toLowerCase() || 'pulse');
      detailContainer.querySelector('#detail-date').textContent = getTimeAgo(new Date(thread.createdAt || Date.now()));
      
      // Format and set content with line breaks preserved
      const contentEl = detailContainer.querySelector('#detail-content');
      contentEl.textContent = thread.content || '';
      // Replace newlines with <br> for proper display
      contentEl.innerHTML = contentEl.innerHTML.replace(/\n/g, '<br>');
      
      // View count anzeigen
      detailContainer.querySelector('#view-count').textContent = thread.viewCount || 0;
      
      // Avatar setzen
      if (thread.authorAvatar || (thread.author && thread.author.avatar)) {
        detailContainer.querySelector('#detail-avatar').src = thread.authorAvatar || thread.author.avatar;
      } else {
        detailContainer.querySelector('#detail-avatar').src = './images/elysian_logo.png';
      }
      
      // Tags anzeigen
      const tagsContainer = detailContainer.querySelector('#detail-tags');
      tagsContainer.innerHTML = '';
      
      // Add category badge first if exists
      if (thread.category) {
        const categoryBadge = getCategoryBadge(thread.category);
        tagsContainer.innerHTML += categoryBadge;
      }
      
      if (thread.tags && thread.tags.length > 0) {
        thread.tags.forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.classList.add('tag');
          tagEl.textContent = tag;
          tagsContainer.appendChild(tagEl);
        });
      } else if (!thread.category) {
        tagsContainer.classList.add('hidden');
      }
      
      // Likes anzeigen
      const likeCount = thread.likes ? (Array.isArray(thread.likes) ? thread.likes.length : thread.likes) : 0;
      detailContainer.querySelector('#like-count').textContent = likeCount;
      
      // Change page title
      document.title = thread.title + ' - Elysium Forum';
      
      // Like button status (highlighted if user has liked)
      const likeBtn = detailContainer.querySelector('.reaction-btn');
      if (thread.likes && Array.isArray(thread.likes) && thread.likes.includes(getUserId())) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').classList.add('liked');
      }
      
      // Add event listener to the like button
      likeBtn.addEventListener('click', () => {
        likeThread(thread.id, likeBtn);
      });
      
      // Kommentare anzeigen
      const commentsContainer = detailContainer.querySelector('#comments-container');
      commentsContainer.innerHTML = '';
      
      // Get comments/replies based on different API response structures
      const comments = thread.replies || thread.comments || [];
      
      if (comments && comments.length > 0) {
        comments.forEach(comment => {
          // Skip deleted comments
          if (comment.deleted) return;
          
          const commentEl = document.createElement('div');
          commentEl.classList.add('comment');
          
          const authorName = comment.authorName || 
                            (comment.author ? (comment.author.username || 'Anonymous') : 'Anonymous');
          
          const authorTeam = comment.authorTeam || 
                            (comment.author ? (comment.author.team || 'PULSE') : 'PULSE');
          
          const commentDate = new Date(comment.createdAt);
          
          // Fix for comment.likes.includes is not a function error
          const hasLiked = comment.likes && 
                          Array.isArray(comment.likes) && 
                          getUserId() && 
                          comment.likes.includes(getUserId());
          
          const likeCount = comment.likes ? 
                          (Array.isArray(comment.likes) ? comment.likes.length : 
                           (typeof comment.likes === 'number' ? comment.likes : 0)) : 0;
          
          commentEl.innerHTML = `
            <div class="comment-header">
              <div class="comment-author">
                <img src="${comment.authorAvatar || './images/elysian_logo.png'}" alt="Avatar" class="avatar-small">
                <span class="author-name">${authorName}</span>
                <span class="author-team ${authorTeam?.toLowerCase() || 'pulse'}">${authorTeam || 'TEAM'}</span>
              </div>
              <span class="comment-date" title="${commentDate.toLocaleString('de-DE')}">${getTimeAgo(commentDate)}</span>
            </div>
            <div class="comment-body">
              ${comment.content}
            </div>
            <div class="comment-footer">
              <button class="like-btn" data-id="${comment.id}">
                <i class="fas fa-heart ${hasLiked ? 'liked' : ''}"></i> 
                ${likeCount}
              </button>
              <button class="reply-btn"><i class="fas fa-reply"></i> Antworten</button>
            </div>
          `;
          
          // Add like comment listener
          const likeCommentBtn = commentEl.querySelector('.like-btn');
          likeCommentBtn.addEventListener('click', () => {
            likeComment(thread.id, comment.id, likeCommentBtn);
          });
          
          commentsContainer.appendChild(commentEl);
        });
      }
      
      // Kommentar-Anzahl aktualisieren
      detailContainer.querySelector('#comment-count').textContent = comments.length || 0;
      
      // Ereignisbehandlung für Zurück-Button
      const backButton = detailContainer.querySelector('#back-to-threads');
      backButton.addEventListener('click', () => {
        // Save reference to detail container before trying to remove it
        const detailContainerElement = document.querySelector('#thread-detail-container');
        
        // Detail-Container entfernen - Fix for null reference error
        if (detailContainerElement) {
          detailContainerElement.remove();
        }
        
        // Threads wieder anzeigen
        threadsContainer.classList.remove('hidden');
        // Reset current thread ID
        currentThreadId = null;
        // Reset page title
        updatePageTitle(currentView);
      });
      
      // Kommentar-Formular-Ereignisbehandlung
      const commentForm = detailContainer.querySelector('.comment-form');
      const commentInput = detailContainer.querySelector('#comment-input');
      const submitCommentBtn = detailContainer.querySelector('#submit-comment');
      
      submitCommentBtn.addEventListener('click', async () => {
        const content = commentInput.value.trim();
        if (!content) return;
        
        // Change button state 
        const originalText = submitCommentBtn.innerHTML;
        submitCommentBtn.disabled = true;
        submitCommentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
        
        try {
          // DEMO MODE - Create a local comment without sending to the server
          console.log('Adding demo comment: Backend API calls disabled');
          
          // Create new comment object
          const newComment = {
            id: 'comment-' + Date.now(),
            authorName: 'Du',
            authorTeam: 'PULSE',
            authorAvatar: './images/elysian_logo.png',
            content: content,
            createdAt: new Date(),
            likes: []
          };
          
          // Add comment to thread object if it's a local thread
          const threadIndex = threads.findIndex(t => t.id === thread.id);
          if (threadIndex !== -1) {
            if (!threads[threadIndex].replies) {
              threads[threadIndex].replies = [];
            }
            threads[threadIndex].replies.push(newComment);
            threads[threadIndex].commentCount = (threads[threadIndex].commentCount || 0) + 1;
            
            // Save updated threads to local storage
            saveThreadsToLocalStorage();
          }
          
          // Kommentar zur UI hinzufügen
          const commentEl = document.createElement('div');
          commentEl.classList.add('comment', 'new-comment');
          commentEl.innerHTML = `
            <div class="comment-header">
              <div class="comment-author">
                <img src="${newComment.authorAvatar}" alt="Avatar" class="avatar-small">
                <span class="author-name">${newComment.authorName}</span>
                <span class="author-team ${newComment.authorTeam.toLowerCase()}">${newComment.authorTeam}</span>
              </div>
              <span class="comment-date">Gerade eben</span>
            </div>
            <div class="comment-body">
              ${newComment.content}
            </div>
            <div class="comment-footer">
              <button class="like-btn" data-id="${newComment.id}">
                <i class="fas fa-heart"></i> 0
              </button>
              <button class="reply-btn"><i class="fas fa-reply"></i> Antworten</button>
            </div>
          `;
          
          // Add like comment listener
          const likeCommentBtn = commentEl.querySelector('.like-btn');
          likeCommentBtn.addEventListener('click', () => {
            likeComment(thread.id, newComment.id, likeCommentBtn);
          });
          
          // Apply fade-in animation
          commentEl.style.opacity = '0';
          commentsContainer.appendChild(commentEl);
          
          // Animate comment appearance
          setTimeout(() => {
            commentEl.style.transition = 'opacity 0.5s';
            commentEl.style.opacity = '1';
          }, 10);
          
          // Kommentar-Zähler aktualisieren
          const commentCount = detailContainer.querySelector('#comment-count');
          if (commentCount) {
            const newCount = parseInt(commentCount.textContent || '0') + 1;
            commentCount.textContent = newCount;
          }
          
          // Show success message
          const commentSuccess = document.createElement('div');
          commentSuccess.className = 'success-message';
          commentSuccess.innerHTML = '<i class="fas fa-check-circle"></i> Kommentar erfolgreich hinzugefügt!';
          commentForm.prepend(commentSuccess);
          
          setTimeout(() => {
            commentSuccess.remove();
          }, 3000);
          
          // Formular zurücksetzen
          commentInput.value = '';
          
        } catch (error) {
          console.error('Fehler beim Kommentieren:', error);
          showError('Kommentar konnte nicht gespeichert werden.');
        } finally {
          // Reset button state
          submitCommentBtn.disabled = false;
          submitCommentBtn.innerHTML = originalText;
        }
      });
      
      // Textfeld-Ereignisbehandlung
      commentInput.addEventListener('input', function() {
        if (this.value.trim()) {
          submitCommentBtn.classList.add('active');
        } else {
          submitCommentBtn.classList.remove('active');
        }
      });
      
      // Detail-Container an DOM anhängen
      threadsContainer.parentNode.insertBefore(detailContainer.querySelector('#thread-detail-container'), threadsContainer);
      
      // Apply fade-in animation to the detail view
      setTimeout(() => {
        const detailElement = document.querySelector('#thread-detail-container');
        if (detailElement) {
          detailElement.classList.add('show');
        }
      }, 10);
    } catch (error) {
      console.error('Error rendering thread detail:', error);
      showError('Es ist ein Fehler beim Anzeigen des Threads aufgetreten.');
      
      // Clean up any partial thread detail
      const existingDetail = document.querySelector('#thread-detail-container');
      if (existingDetail) {
        existingDetail.remove();
      }
      
      // Show threads again
      threadsContainer.classList.remove('hidden');
    }
  }
  
  // Like a thread
  async function likeThread(threadId, likeBtn) {
    if (!threadId) return;
    
    // Optimistic UI update
    const likeCountElement = likeBtn.querySelector('span');
    const likeIcon = likeBtn.querySelector('i');
    const isLiked = likeIcon.classList.contains('liked');
    const userId = getUserId();
    
    try {
      // DEMO MODE - Update like without sending to server
      console.log('Toggling like in demo mode: Backend API calls disabled');
      
      // Find thread in local data
      const threadIndex = threads.findIndex(t => t.id === threadId);
      if (threadIndex !== -1) {
        const thread = threads[threadIndex];
        
        // Ensure likes is always an array
        if (!Array.isArray(thread.likes)) {
          thread.likes = [];
        }
        
        // Toggle like
        const userLikeIndex = thread.likes.indexOf(userId);
        if (userLikeIndex === -1) {
          // Add like
          thread.likes.push(userId);
        } else {
          // Remove like
          thread.likes.splice(userLikeIndex, 1);
        }
        
        // Update UI based on new state
        const newIsLiked = thread.likes.includes(userId);
        const newLikeCount = thread.likes.length;
        
        likeIcon.classList.toggle('liked', newIsLiked);
        likeCountElement.textContent = newLikeCount;
        
        // Save updated threads to local storage
        saveThreadsToLocalStorage();
      } else {
        // Toggle like state in UI only for demo thread
        if (isLiked) {
          likeIcon.classList.remove('liked');
          likeCountElement.textContent = Math.max(0, parseInt(likeCountElement.textContent) - 1);
        } else {
          likeIcon.classList.add('liked');
          likeCountElement.textContent = parseInt(likeCountElement.textContent) + 1;
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI change on error
      likeIcon.classList.toggle('liked', isLiked);
      likeCountElement.textContent = parseInt(likeCountElement.textContent) + (isLiked ? 1 : -1);
    }
  }
  
  // Like a comment
  async function likeComment(threadId, commentId, likeBtn) {
    if (!threadId || !commentId) return;
    
    // Optimistic UI update
    const isLiked = likeBtn.querySelector('i').classList.contains('liked');
    const likeCount = parseInt(likeBtn.textContent.trim().split(' ').pop()) || 0;
    const userId = getUserId();
    
    try {
      // DEMO MODE - Update like without sending to server
      console.log('Toggling comment like in demo mode: Backend API calls disabled');
      
      // Find thread in local data
      const threadIndex = threads.findIndex(t => t.id === threadId);
      if (threadIndex !== -1) {
        const thread = threads[threadIndex];
        const comments = thread.replies || thread.comments || [];
        const commentIndex = comments.findIndex(c => c.id === commentId);
        
        if (commentIndex !== -1) {
          const comment = comments[commentIndex];
          
          // Ensure likes is always an array
          if (!Array.isArray(comment.likes)) {
            comment.likes = [];
          }
          
          // Toggle like
          const userLikeIndex = comment.likes.indexOf(userId);
          if (userLikeIndex === -1) {
            // Add like
            comment.likes.push(userId);
          } else {
            // Remove like
            comment.likes.splice(userLikeIndex, 1);
          }
          
          // Update UI based on new state
          const newIsLiked = comment.likes.includes(userId);
          const newLikeCount = comment.likes.length;
          
          likeBtn.querySelector('i').classList.toggle('liked', newIsLiked);
          likeBtn.innerHTML = `<i class="fas fa-heart ${newIsLiked ? 'liked' : ''}"></i> ${newLikeCount}`;
          
          // Save updated threads to local storage
          saveThreadsToLocalStorage();
        } else {
          // Comment not found, just update UI
          updateCommentLikeUI(likeBtn, isLiked, likeCount);
        }
      } else {
        // Thread not found, just update UI
        updateCommentLikeUI(likeBtn, isLiked, likeCount);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Revert UI change on error
      updateCommentLikeUI(likeBtn, isLiked, likeCount);
    }
  }
  
  // Helper function to update comment like UI
  function updateCommentLikeUI(likeBtn, isLiked, likeCount) {
    if (isLiked) {
      likeBtn.querySelector('i').classList.remove('liked');
      likeBtn.innerHTML = `<i class="fas fa-heart"></i> ${Math.max(0, likeCount - 1)}`;
    } else {
      likeBtn.querySelector('i').classList.add('liked');
      likeBtn.innerHTML = `<i class="fas fa-heart liked"></i> ${likeCount + 1}`;
    }
  }
  
  // Get current user ID (in a real app, this would come from the auth token)
  function getUserId() {
    // Mock user ID for demo
    return 'current-user-id';
  }

  // Detect window resize for responsive behavior
  window.addEventListener('resize', function() {
    if (window.innerWidth > 900 && forumSidebar) {
      // Make sure sidebar content is always visible on desktop
      forumSidebar.classList.remove('expanded');
      document.querySelector('.sidebar-content').style.display = '';
    }
  });

  // Allow escape key to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close thread creation modal if open
      if (!newThreadModal.classList.contains('hidden')) {
        newThreadModal.classList.remove('active');
        setTimeout(() => newThreadModal.classList.add('hidden'), 300);
      }
      
      // Close any other modals with class "modal" and "active"
      document.querySelectorAll('.modal.active').forEach(modal => {
        if (modal !== newThreadModal) {
          modal.classList.remove('active');
          setTimeout(() => modal.remove(), 300);
        }
      });
    }
  });

  // Hilfsfunktionen
  function getExcerpt(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    // Try to cut at a space to avoid cutting words
    const cutoff = text.lastIndexOf(' ', maxLength);
    if (cutoff > maxLength * 0.8) {
      return text.substring(0, cutoff) + '...';
    }
    
    return text.substring(0, maxLength) + '...';
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return 'Gerade eben';
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Vor ${diffMin} ${diffMin === 1 ? 'Minute' : 'Minuten'}`;
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `Vor ${diffHour} ${diffHour === 1 ? 'Stunde' : 'Stunden'}`;
    
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `Vor ${diffDay} ${diffDay === 1 ? 'Tag' : 'Tagen'}`;
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
  }

  function getDemoThreads() {
    // Demo-Threads für Vorschau mit erweiterten Daten
    return [
      {
        id: 'demo-1',
        title: 'Suche Mitfahrgelegenheit zum Warehouse-Rave am 15. März',
        content: 'Hey Leute, ich suche eine Mitfahrgelegenheit zum Warehouse-Rave am 15. März. Komme aus dem Norden der Stadt und würde mich an den Spritkosten beteiligen. Wäre super, wenn jemand noch einen Platz frei hat!',
        authorName: 'Bass-Lisa',
        authorTeam: 'PULSE',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 Stunden her
        category: 'events',
        tags: ['transport', 'event', 'warehouse'],
        commentCount: 12,
        viewCount: 45
      },
      {
        id: 'demo-2',
        title: 'Playlist-Empfehlungen für melodischen Techno',
        content: 'Ich bin auf der Suche nach neuen Tracks im Bereich melodischer Techno. Hat jemand gute Playlist-Empfehlungen auf Spotify oder SoundCloud? Ich stehe besonders auf tiefe Bässe und hypnotische Melodien, die eine Reise erzeugen.',
        authorName: 'TechnoQueen',
        authorTeam: 'FLUX',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 Tag her
        category: 'music',
        tags: ['music', 'melodic-techno', 'playlist'],
        commentCount: 8,
        viewCount: 32
      },
      {
        id: 'demo-3',
        title: 'Gehörschutz-Empfehlungen für Raves?',
        content: 'Nach dem letzten Rave hatte ich drei Tage lang Tinnitus. Ich will meine Ohren schützen, aber trotzdem den vollen Sound genießen. Welche Ohrstöpsel benutzt ihr und könnt ihr welche empfehlen, die den Klang nicht zu stark verfälschen?',
        authorName: 'BassJunkie',
        authorTeam: 'PULSE',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 Tage her
        category: 'questions',
        tags: ['health', 'protection', 'sound'],
        commentCount: 24,
        viewCount: 87,
        isOwn: true // Für "Meine Threads" Filter
      },
      {
        id: 'demo-4',
        title: 'Newcomer DJ sucht Booking-Möglichkeiten in Berlin',
        content: 'Hey Community, ich bin seit 3 Jahren DJ und suche nach ersten Booking-Möglichkeiten in Berlin. Kennt jemand Clubs oder Bars, die regelmäßig Newcomer-Slots anbieten oder Open Decks Nights? Genre ist Dark Techno und Industrial.',
        authorName: 'MixMaster',
        authorTeam: 'FLUX',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 Tage her
        category: 'community',
        tags: ['dj', 'booking', 'berlin'],
        commentCount: 15,
        viewCount: 63
      },
      {
        id: 'demo-5',
        title: 'Suche Raver-Freunde aus Hamburg',
        content: 'Moin! Bin neu in Hamburg und suche Gleichgesinnte, die Lust auf Techno-Events haben. Ich (28) höre am liebsten Dark Techno und Industrial. Würde mich über Kontakte zu netten Menschen freuen, die mir auch die lokale Szene zeigen können!',
        authorName: 'NordRaver',
        authorTeam: 'PULSE',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 Tage her
        category: 'community',
        tags: ['hamburg', 'friends', 'dark-techno'],
        commentCount: 7,
        viewCount: 38
      },
      {
        id: 'demo-6',
        title: 'Feedback zu meinem ersten Techno-Track',
        content: 'Habe gerade meinen ersten Techno-Track fertiggestellt und würde mich über ehrliches Feedback freuen! Link zum Track: [soundcloud-link]. Genre ist Acid Techno mit experimentellen Elementen. Inspiriert von Fjaak und Inhalt der Nacht.',
        authorName: 'AcidDreamer',
        authorTeam: 'FLUX',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 Tage her
        category: 'music',
        tags: ['production', 'feedback', 'acid'],
        commentCount: 19,
        viewCount: 72,
        isOwn: true // Für "Meine Threads" Filter
      },
      {
        id: 'demo-7',
        title: 'Festival-Camping: Eure besten Tipps und Tricks?',
        content: 'Bin bald auf meinem ersten mehrtägigen Festival und brauche Tipps zum Camping. Was packt ihr ein? Wie überlebt man die Nächte bei Lärm? Und wie bekommt man ohne Dusche den Glitzer wieder ab? 😅 Tipps sehr willkommen!',
        authorName: 'FestivalNewbie',
        authorTeam: 'PULSE',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9), // 9 Tage her
        category: 'events',
        tags: ['festival', 'camping', 'tips'],
        commentCount: 31,
        viewCount: 128
      },
      {
        id: 'demo-8',
        title: 'Welches Gaming-Headset für Rave-Musik?',
        content: 'Suche ein neues Gaming-Headset, das auch für elektronische Musik gut ist. Budget um die 150€. Hat jemand Erfahrung mit Headsets, die sowohl fürs Gaming als auch für die fetten Bässe von Techno und Drum&Bass gut sind?',
        authorName: 'GamerBeat',
        authorTeam: 'FLUX',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 Tage her
        category: 'gaming',
        tags: ['gaming', 'headset', 'audio'],
        commentCount: 14,
        viewCount: 67
      }
    ];
  }

  // Create or find the news sections container
  let newsContainer = document.querySelector('.news-sections-container');
  if (!newsContainer) {
    newsContainer = document.createElement('div');
    newsContainer.className = 'news-sections-container';
    document.querySelector('.forum-content').appendChild(newsContainer);
  }
  
  // Define the news content for the anchors
  const newsContent = {
    'rescue-feature': {
      title: 'Neues Feature: Rescue-Button',
      date: '15. März 2025',
      content: `
        <p>Wir freuen uns, den Launch unseres neuen Rescue-Button-Features ankündigen zu können!</p>
        <p>Ab sofort können alle Elysian-Nutzer den Rescue-Button in der App verwenden, um in Notfallsituationen schnell Hilfe zu rufen oder Freunde zu alarmieren.</p>
        <p><strong>So funktioniert's:</strong></p>
        <ul>
          <li>Der Rescue-Button ist jederzeit in der App verfügbar</li>
          <li>Ein Klick öffnet das Notfall-Menü mit verschiedenen Optionen</li>
          <li>Wähle zwischen "Freunde benachrichtigen", "Security rufen" oder "Notfallkontakt anrufen"</li>
          <li>Dein Standort wird automatisch mit der Hilfeaufforderung geteilt</li>
        </ul>
        <p>Wir haben dieses Feature nach umfangreichem Feedback aus der Community entwickelt, um die Sicherheit auf Events weiter zu verbessern.</p>
      `
    },
    'dj-pulse': {
      title: 'DJ Pulse - Neues Team',
      date: '08. März 2025',
      content: `
        <p>Wir sind stolz, DJ Pulse als neuen offiziellen Partner im Pulse-Team begrüßen zu dürfen!</p>
        <p>DJ Pulse ist bekannt für seine einzigartigen Sets, die verschiedene Genres wie Techno, House und Trance verschmelzen. Ab nächster Woche wird er exklusive Sets für die Elysian-Community bereitstellen.</p>
        <p><strong>Was euch erwartet:</strong></p>
        <ul>
          <li>Wöchentliche exklusive Sets in der Elysian-App</li>
          <li>Monatliche Live-Sessions mit DJ-Voting</li>
          <li>Community-Events mit DJ Pulse als Host</li>
        </ul>
        <p>Folgt DJ Pulse auf Instagram @djpulse_official, um keine Updates zu verpassen!</p>
      `
    },
    'live-voting': {
      title: 'Live-Voting System Release',
      date: '02. März 2025',
      content: `
        <p>Unser neues Live-Voting System ist jetzt offiziell für alle Elysian-Nutzer verfügbar!</p>
        <p>Mit diesem Feature könnt ihr die Musik auf Events direkt beeinflussen und Künstlern Echtzeit-Feedback geben.</p>
        <p><strong>Features des Live-Voting Systems:</strong></p>
        <ul>
          <li>Track-Wünsche einreichen und für Favoriten stimmen</li>
          <li>Stimmung und Energie bewerten, um DJs direktes Feedback zu geben</li>
          <li>An Umfragen teilnehmen, z.B. "Mehr House oder mehr Techno?"</li>
          <li>Spezielle Wunsch-Sessions bei teilnehmenden Events</li>
        </ul>
        <p>Das System ist bereits auf über 50 Events in 12 Städten im Einsatz und hat durchweg positives Feedback erhalten.</p>
      `
    },
    'friends-finder': {
      title: 'Community-Feature: Freundesfinder',
      date: '28. Februar 2025',
      content: `
        <p>Der neue Freundesfinder ist jetzt verfügbar - nie mehr Freunde auf Events verlieren!</p>
        <p>Mit diesem Feature könnt ihr eure Freunde auf Events in Echtzeit lokalisieren und gemeinsame Treffpunkte setzen.</p>
        <p><strong>So funktioniert der Freundesfinder:</strong></p>
        <ul>
          <li>Standortfreigabe für ausgewählte Freunde während des Events</li>
          <li>Treffpunkte auf der Karte markieren und teilen</li>
          <li>Notifications, wenn Freunde ankommen oder den Standort wechseln</li>
          <li>Gruppenchats für bessere Koordination</li>
        </ul>
        <p>Der Freundesfinder wurde mit Fokus auf Datenschutz entwickelt - alle Standortdaten werden nur temporär gespeichert und nach dem Event automatisch gelöscht.</p>
      `
    },
    'new-locations': {
      title: 'Neue Partner-Locations',
      date: '14. Februar 2025',
      content: `
        <p>Wir freuen uns, 12 neue Partner-Locations in Berlin, Hamburg und München begrüßen zu dürfen!</p>
        <p>Diese Erweiterung unseres Netzwerks bedeutet noch mehr exklusive Events und Vorteile für alle Elysian-Mitglieder.</p>
        <p><strong>Neue Locations nach Stadt:</strong></p>
        <ul>
          <li><strong>Berlin:</strong> Pulse Club, Echonest, Vibration Factory, Quantum Lounge, District 8</li>
          <li><strong>Hamburg:</strong> Harbor Beats, Elbe Vibes, Northern Lights</li>
          <li><strong>München:</strong> Isar Dreams, Alpine Beats, Southern Pulse, Quantum München</li>
        </ul>
        <p>Ab März werden in diesen Locations regelmäßig exklusive Events für Elysian-Mitglieder stattfinden. Haltet die Event-Sektion für Updates im Auge!</p>
      `
    },
    'app-update': {
      title: 'App-Update: Version 2.5',
      date: '05. Februar 2025',
      content: `
        <p>Version 2.5 der Elysian-App ist jetzt verfügbar mit zahlreichen Verbesserungen!</p>
        <p>Dieses Update bringt ein verbessertes UI-Design, bessere Performance und mehrere neue Features.</p>
        <p><strong>Highlights des Updates:</strong></p>
        <ul>
          <li>Komplett überarbeitetes UI für bessere Benutzerfreundlichkeit</li>
          <li>Dark Mode für alle Bereiche der App</li>
          <li>30% schnellere Ladezeiten und reduzierter Akkuverbrauch</li>
          <li>Neue Personalisierungsoptionen für euer Profil</li>
          <li>Erweiterte Event-Filter und Suchfunktionen</li>
          <li>Zahlreiche Bugfixes und Stabilisierungen</li>
        </ul>
        <p>Das Update wird automatisch über den App Store oder Google Play Store verteilt. Falls ihr es noch nicht erhalten habt, überprüft eure Updates.</p>
      `
    }
  };
  
  // Create news sections for all known anchors
  for (const [anchor, data] of Object.entries(newsContent)) {
    let section = document.getElementById(anchor);
    if (!section) {
      section = document.createElement('section');
      section.id = anchor;
      section.className = 'forum-section news-detail-section';
      section.innerHTML = `
        <div class="section-container">
          <h2 class="section-title">${data.title}</h2>
          <div class="news-detail-meta">
            <span class="news-date">${data.date}</span>
          </div>
          <div class="news-detail-content">
            ${data.content}
          </div>
          <div class="news-detail-comments">
            <h3>Diskussion</h3>
            <div class="comments-container">
              <div class="comment-form">
                <textarea placeholder="Teile deine Gedanken zu diesem Update..."></textarea>
                <button class="neon-btn primary"><i class="fas fa-paper-plane"></i> Kommentar senden</button>
              </div>
              <p class="no-comments">Sei der Erste, der zu diesem Thema kommentiert.</p>
            </div>
          </div>
        </div>
      `;
      newsContainer.appendChild(section);
    }
  }
  
  // Check for stored anchor from index page
  const storedAnchor = localStorage.getItem('elysian-forum-anchor');
  if (storedAnchor) {
    // Clear the storage so it doesn't trigger on future page loads
    localStorage.removeItem('elysian-forum-anchor');
    
    // Find the element with the matching ID
    const targetElement = document.getElementById(storedAnchor);
    
    // Scroll to the element if found
    if (targetElement) {
      setTimeout(() => {
        const headerHeight = document.querySelector('.forum-header')?.offsetHeight || 80;
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight - 20,
          behavior: 'smooth'
        });
        
        // Highlight the element
        targetElement.classList.add('highlight-section');
        setTimeout(() => {
          targetElement.classList.remove('highlight-section');
        }, 3000);
      }, 300); // Small delay to ensure DOM is ready
    }
  }
});