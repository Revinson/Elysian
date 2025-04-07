// index.js - Angepasste Version mit Map-Funktionalität
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Eigene Module importieren
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const threadRoutes = require('./routes/threadRoutes');
const mapRoutes = require('./routes/mapRoutes'); // Map-Routen importieren
const awarenessRoutes = require('./routes/awarenessRoutes'); // Neue Awareness-Routen importieren

// Error Handling
const AppError = require('./utils/appError');
const logger = require('./utils/loader');

// Umgebungsvariablen laden
require('dotenv').config();

// Express-App erstellen
const app = express();

// CORS aktivieren
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
}));

// Body-Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Debug-Logging für alle Anfragen
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// STATISCHE DATEIEN
app.use(express.static(path.join(__dirname, 'public')));

// API ROUTES
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/threads', threadRoutes);
app.use('/api/map', mapRoutes); // Map-Routen registrieren
app.use('/api/awareness', awarenessRoutes); // Neue Awareness-Routen registrieren

// WICHTIG: SPEZIFISCHE HTML-SEITEN-ROUTES - VOR DEM CATCH-ALL
// Diese direkt am Anfang der Routing-Definitionen platzieren

// Root redirect zu Login
app.get('/', (req, res) => {
  console.log("Root-Route erreicht - Umleitung zu /login.html");
  res.redirect('/login.html');
});

// Explizite Routen für HTML-Seiten
app.get('/login.html', (req, res) => {
  console.log("Login-Route erreicht");
  const filePath = path.join(__dirname, 'public', 'login.html');
  if (fs.existsSync(filePath)) {
    console.log(`Datei gefunden: ${filePath}`);
    res.sendFile(filePath);
  } else {
    console.log(`Datei NICHT gefunden: ${filePath}`);
    res.status(404).send("Login file not found");
  }
});

app.get('/register.html', (req, res) => {
  console.log("Register-Route erreicht");
  const filePath = path.join(__dirname, 'public', 'register.html');
  if (fs.existsSync(filePath)) {
    console.log(`Datei gefunden: ${filePath}`);
    res.sendFile(filePath);
  } else {
    console.log(`Datei NICHT gefunden: ${filePath}`);
    res.status(404).send("Register file not found");
  }
});

// Neue Route für die Kartenansicht
app.get('/map.html', (req, res) => {
  console.log("Map-Route erreicht");
  const filePath = path.join(__dirname, 'public', 'map.html');
  if (fs.existsSync(filePath)) {
    console.log(`Datei gefunden: ${filePath}`);
    res.sendFile(filePath);
  } else {
    console.log(`Datei NICHT gefunden: ${filePath}`);
    res.status(404).send("Map file not found");
  }
});

// Check HTML files
const checkFiles = () => {
  const publicPath = path.join(__dirname, 'public');
  console.log('Public directory path:', publicPath);
  
  try {
    const files = fs.readdirSync(publicPath);
    console.log('Files in public directory:', files);
    
    ['login.html', 'register.html', 'dashboard.html', 'map.html'].forEach(file => {
      const filePath = path.join(publicPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists at ${filePath}`);
      } else {
        console.log(`❌ ${file} does NOT exist at ${filePath}`);
      }
    });
  } catch (err) {
    console.error('Error checking files:', err);
  }
};

// 404 Not Found handler - am Ende
app.use((req, res, next) => {
  console.log(`404 für URL: ${req.originalUrl}`);
  res.status(404).json({
    status: 'fail',
    message: `Kann ${req.originalUrl} auf diesem Server nicht finden!`
  });
});

// DATABASE CONNECTION
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// SERVER STARTEN
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Dateien überprüfen
  checkFiles();
  
  // DB verbinden
  await connectDB();
  
  // Server starten
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access login at: http://localhost:${PORT}/login.html`);
    console.log(`Access register at: http://localhost:${PORT}/register.html`);
    console.log(`Access map at: http://localhost:${PORT}/map.html`);
  });
};

// Server starten
startServer();