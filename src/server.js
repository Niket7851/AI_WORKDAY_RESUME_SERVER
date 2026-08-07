'use strict';

require('dotenv').config();

const app = require('./app');
const { verifyConnection } = require('./database');
const config = require('./config');

let server;

const start = async () => {
  try {
    await verifyConnection();
    console.log('[DB] Connection established.'); // eslint-disable-line no-console

    server = app.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`); // eslint-disable-line no-console
      console.log(`[Server] Environment: ${config.env}`); // eslint-disable-line no-console
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message); // eslint-disable-line no-console
    process.exit(1);
  }
};

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully…`); // eslint-disable-line no-console
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.'); // eslint-disable-line no-console
      process.exit(0);
    });
    // Force exit if connections don't drain within 10 s
    setTimeout(() => process.exit(1), 10_000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
