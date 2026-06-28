const cors = require('cors');

/**
 * Allowed origins are read from the CORS_ORIGINS environment variable
 * (comma-separated list) so the same binary works in dev, staging and prod
 * without code changes.
 *
 * Example .env:
 *   CORS_ORIGINS=http://localhost:4200,https://myapp.com
 *
 * Falls back to localhost:4200 (Angular dev server) when the variable is absent.
 */
const buildAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGINS || 'http://localhost:4200';
  return raw
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
};

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    // Allow requests with no Origin header (curl, Postman, server-to-server)
    if (!incomingOrigin) return callback(null, true);

    const allowed = buildAllowedOrigins();
    if (allowed.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(
        Object.assign(new Error(`CORS: origin '${incomingOrigin}' not allowed`), {
          status: 403,
        })
      );
    }
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  // Allow the browser to send cookies / Authorization headers cross-origin
  credentials: true,

  // Cache the preflight response for 10 minutes — reduces OPTIONS round-trips
  maxAge: 600,
};

module.exports = cors(corsOptions);
