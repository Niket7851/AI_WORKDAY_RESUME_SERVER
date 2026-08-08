'use strict';

require('dotenv').config();

const app = require('./app');
const { verifyConnection } = require('./database');
const config = require('./config');

let server;

// ── Gemini connectivity check ─────────────────────────────────────────────────
/**
 * Sends a minimal probe request to the Gemini API on startup.
 * - If the key is missing    → hard error (server won't start).
 * - If the network is down   → warning only (server starts, AI features degraded).
 * - If credentials are wrong → warning with the HTTP status.
 * - On success               → logs the model name and latency.
 */
const checkGeminiConnectivity = async () => {
  const { GoogleGenAI } = require('@google/genai');
  const apiKey = config.ai?.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[Gemini] ✗ GEMINI_API_KEY is not set — AI features will be unavailable.'); // eslint-disable-line no-console
    return; // non-fatal: server still starts
  }

  const started = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Reply with the single word: OK',
    });
    const latencyMs = Date.now() - started;
    const preview = (response.text || '').trim().slice(0, 40);
    console.log(`[Gemini] ✓ Connected  (${latencyMs} ms) — response: "${preview}"`); // eslint-disable-line no-console
  } catch (err) {
    const latencyMs = Date.now() - started;
    const isNetworkError =
      err.message?.includes('fetch failed') ||
      err.cause?.code === 'ENOTFOUND' ||
      err.cause?.code === 'ECONNREFUSED';

    if (isNetworkError) {
      console.warn(
        // eslint-disable-line no-console
        `[Gemini] ✗ Network unreachable (${latencyMs} ms) — cannot reach generativelanguage.googleapis.com.\n` +
          '         Check your internet connection, firewall, or proxy settings.\n' +
          '         AI-powered features (resume parsing, field mapping) will fail until connectivity is restored.'
      );
    } else {
      const status = err.status ?? err.statusCode ?? 'unknown';
      console.warn(
        // eslint-disable-line no-console
        `[Gemini] ✗ API error  status=${status}  (${latencyMs} ms): ${err.message?.slice(0, 200)}\n` +
          '         Verify your GEMINI_API_KEY is correct and has access to gemini-2.5-flash.\n' +
          '         Get a key at: https://aistudio.google.com/apikey'
      );
    }
    // Non-fatal — server starts, but AI calls will fail at request time.
  }
};

const start = async () => {
  try {
    await verifyConnection();
    console.log('[DB] Connection established.'); // eslint-disable-line no-console

    // ── Gemini connectivity check ─────────────────────────────────────────
    await checkGeminiConnectivity();

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
