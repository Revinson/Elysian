const validator = require('validator');

// Sanitize user object for safe return to client
exports.safeUserObject = (user) => {
  // Wenn ein Mongoose-Dokument, erst zu regulärem Objekt konvertieren
  const userObj = user.toObject ? user.toObject() : {...user};

  // Sichere Felder kopieren und sensible ausschließen
  const safeUser = {};
  const allowedFields = [
    '_id', 'id', 'username', 'email', 'team', 'eventType', 
    'finalArchetype', 'age', 'gender', 'userRole', 
    'createdAt', 'updatedAt', 'roleQuizCompleted', 'lastLogin'
  ];

  Object.keys(userObj).forEach(key => {
    if (allowedFields.includes(key)) {
      safeUser[key] = userObj[key];
    }
  });

  return safeUser;
};

// Sanitize request body 
exports.requestBody = (body) => {
  const sanitized = {};

  Object.keys(body).forEach(key => {
    sanitized[key] = exports.sanitizeField(key, body[key]);
  });

  return sanitized;
};

// Sanitize a specific field based on its type/name
exports.sanitizeField = (fieldName, value) => {
  if (value === null || value === undefined) return value;

  // Behandle verschiedene Feldtypen
  if (typeof value === 'string') {
    // Allgemeines String-Escaping
    let sanitized = validator.escape(value.trim());

    // Spezifische Behandlung für bestimmte Felder
    if (fieldName === 'email') {
      sanitized = validator.normalizeEmail(sanitized);
    }

    return sanitized;
  }

  // Arrays sanitieren
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        return validator.escape(item.trim());
      }
      return item;
    });
  }

  // Objekte rekursiv sanitieren
  if (typeof value === 'object') {
    const sanitizedObj = {};
    Object.keys(value).forEach(key => {
      sanitizedObj[key] = exports.sanitizeField(key, value[key]);
    });
    return sanitizedObj;
  }

  // Andere Typen (Zahlen, Boolean) unverändert zurückgeben
  return value;
};