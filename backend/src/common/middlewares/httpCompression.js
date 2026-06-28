const compression = require('compression');

/**
 * HTTP response compression middleware (gzip / deflate / brotli via `compression`).
 *
 * Only compresses responses that are worth it:
 *  - body size must exceed the threshold (1 KB by default)
 *  - content type must be text-based (JSON, HTML, JS, CSS, SVG…)
 *
 * Binary formats (images, already-compressed assets) are skipped automatically
 * by the `filter` function because the `compression` package checks the
 * Content-Type header.
 *
 * Configuration via environment variables (all optional):
 *   COMPRESSION_LEVEL   zlib level 0-9  (default: 6, balanced speed/ratio)
 *   COMPRESSION_THRESHOLD_BYTES         (default: 1024)
 */
const compressionMiddleware = compression({
  // zlib compression level (1 = fastest, 9 = best ratio, 6 = balanced default)
  level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10),

  // Only compress responses larger than this threshold (bytes)
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD_BYTES || '1024', 10),

  // Explicitly skip already-compressed or binary content types
  filter: (req, res) => {
    // If the client explicitly requested no compression, respect it
    if (req.headers['x-no-compression']) return false;

    // Fall back to the default compression filter for everything else
    return compression.filter(req, res);
  },
});

module.exports = compressionMiddleware;
