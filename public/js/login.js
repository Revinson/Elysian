// public/js/login.js mit Debug-Ausgaben
console.log("Login JS geladen");

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');

  // DEBUG: Formular-Elemente überprüfen
  console.log("Login Form gefunden:", !!loginForm);
  console.log("Error Div gefunden:", !!errorDiv);

  // Verhindern, dass bereits angemeldete Benutzer auf die Login-Seite zugreifen
  const token = localStorage.getItem('token');
  if (token) {
    console.log("Token gefunden, leite um zu dashboard.html");
    window.location.href = 'dashboard.html';
    return;
  }

  // Initialisiere Particles.js falls vorhanden
  if (typeof initParticles === 'function') {
    initParticles();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login Form abgeschickt");

    // WICHTIG: Wir versuchen beide Varianten, sowohl mit 'username' als auch mit 'email'
    const inputValue = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Zeige die Werte für Debugging an (NIEMALS in Produktion!)
    console.log("Eingegebener Benutzername/Email:", inputValue);
    console.log("Eingegebenes Passwort (Länge):", password.length);

    // Einfache Formularvalidierung
    if (!inputValue || !password) {
      showError("Bitte Benutzername/E-Mail und Passwort eingeben!");
      return;
    }

    // Ändere den Button-Status
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
    }

    try {
      // Wir erstellen einen Request-Body, der sowohl username als auch email enthält
      const requestBody = {
        username: inputValue,
        email: inputValue,
        password: password
      };
      
      console.log("Sende API-Anfrage mit:", JSON.stringify(requestBody));

      // API-Anfrage zum Login
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log("API-Antwort Status:", response.status);
      const data = await response.json();
      console.log("API-Antwort Daten:", data);

      // Verbesserte Fehlerbehandlung
      if (!response.ok) {
        console.error("Login fehlgeschlagen:", data);
        showError(data.error || data.message || 'Login fehlgeschlagen.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        return;
      }

      // Login erfolgreich
      if (data.token) {
        console.log("Token erhalten, Login erfolgreich");
        // Token richtig speichern mit Ablaufzeit
        localStorage.setItem('token', data.token);
        
        // Ablaufzeit speichern (1 Stunde)
        const expiryTime = Date.now() + (3600 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime);
        
        // Zusätzlich User-Daten speichern für schnelleren Zugriff
        if (data.data && data.data.user) {
          localStorage.setItem('userData', JSON.stringify(data.data.user));
          console.log("User-Daten gespeichert:", data.data.user);
        }
        
        console.log("Login erfolgreich! Token gespeichert.");
        
        // Erfolgsmeldung anzeigen
        if (errorDiv) errorDiv.classList.add('hidden');
        
        // Weiterleitung zum Dashboard
        console.log("Leite weiter zu dashboard.html");
        window.location.href = 'dashboard.html';
      } else {
        console.error("Kein Token erhalten");
        showError("Kein Token vom Server erhalten.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }

    } catch (err) {
      console.error('Fehler beim Login:', err);
      showError("Serverfehler beim Login. Bitte versuche es später erneut.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  // Passwort-vergessen-Link
  const forgotPasswordLink = document.querySelector('a[href="#forgot-password"]');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Passwort-Reset-Funktion wird bald verfügbar sein.');
    });
  }

  // Registrierungs-Link
  const registerLink = document.querySelector('a[href*="registrieren"]');
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'register.html';
    });
  }

  function showError(msg) {
    if (!errorDiv) return;
    
    console.log("Zeige Fehler an:", msg);
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
    
    // Animation für mehr Aufmerksamkeit
    errorDiv.style.animation = 'none';
    setTimeout(() => {
      errorDiv.style.animation = 'shake 0.5s';
    }, 10);
  }
});