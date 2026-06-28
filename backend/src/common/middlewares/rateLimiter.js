/**
 * Custom rate limiter middleware (no external dependencies).
 *
 * Tracks request counts per IP using an in-memory Map.
 * Resets the counter for each IP after `windowMs` milliseconds.
 *
 * Usage:
 *   const { apiLimiter, authLimiter } = require('./rateLimiter');
 *   app.use('/api', apiLimiter);
 */

/**
 * Factory that creates a rate-limiter middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs   - Time window in milliseconds (default: 60 000 = 1 min)
 * @param {number} options.max        - Max requests per window per IP (default: 100)
 * @param {string} options.message    - Error message when limit is exceeded
 */
const createRateLimiter = ({
  windowMs = 60_000,
  max = 100,
  message = 'Demasiadas solicitudes, intenta de nuevo más tarde.',
} = {}) => {
  // ip -> { count, resetAt }
  const hits = new Map();

  // Clean up stale entries every windowMs to avoid unbounded memory growth
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits) {
      if (now >= record.resetAt) hits.delete(ip);
    }
  }, windowMs).unref(); // .unref() so this timer doesn't keep the process alive

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const record = hits.get(ip);

    if (!record || now >= record.resetAt) {
      // First request in this window — or window has expired
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message,
        retryAfter,
      });
    }

    next();
  };
};

/** General API limiter: 100 requests per minute per IP */
const apiLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 100,
  message: 'Demasiadas solicitudes a la API, intenta de nuevo en un minuto.',
});

/** Stricter limiter for write operations: 30 requests per minute per IP */
const writeLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: 'Demasiadas operaciones de escritura, intenta de nuevo en un minuto.',
});

module.exports = { createRateLimiter, apiLimiter, writeLimiter };
