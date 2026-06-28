/**
 * Input sanitization middleware.
 *
 * Recursively strips leading/trailing whitespace from all string values
 * in req.body, req.query, and req.params, and removes any keys whose
 * names start with '$' to block MongoDB operator injection.
 *
 * Applied globally in app.js so every route benefits automatically.
 */

/**
 * Recursively sanitize an object in-place:
 * - Trim strings
 * - Delete keys starting with '$' (NoSQL injection guard)
 *
 * @param {object} obj
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    // Block MongoDB operator injection at the key level
    if (key.startsWith('$')) {
      delete obj[key];
      continue;
    }

    const value = obj[key];

    if (typeof value === 'string') {
      obj[key] = value.trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitizeObject(value);
    }
  }
};

const sanitize = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};

module.exports = sanitize;
