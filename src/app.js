'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

app.use(helmet());

const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin) {
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        return callback(new Error('CORS: missing origin'));
      }

      if (origin.startsWith('chrome-extension://')) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

app.use(requestLogger);

app.use(express.json({ limit: '1mb', strict: true }));

app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/api/v1', routes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;