'use strict';

/**
 * 404 handler — registered after all routes in app.js.
 * Produces the consistent error envelope.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
    },
  });
};

module.exports = notFound;
