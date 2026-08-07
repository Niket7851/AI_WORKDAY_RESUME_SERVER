'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allowed origins: comma-separated list from env.
// Supports http://localhost (dev tools), chrome-extension:// origins.
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests with no origin header (curl, Postman) — only allow in development.
      if (!origin) {
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        return callback(new Error('CORS: missing origin'));
      }

      // Chrome extension popups send origin: chrome-extension://<id>
      // Allow all extension origins — the API key / auth layer provides security.
      if (origin.startsWith('chrome-extension://')) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// ── PII-safe request logging ──────────────────────────────────────────────────
app.use(requestLogger);

// ── Body parsers — enforce strict size limits ─────────────────────────────────
// JSON bodies are limited to 1 MB (resume structured data only — raw text never sent here).
app.use(express.json({ limit: '1mb', strict: true }));
// URL-encoded forms are limited to 100 KB.
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// ── API v1 routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use(notFound);

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
