'use strict';

require('dotenv').config();

const app = require('./app');
const { verifyConnection } = require('./database');
const config = require('./config');

let server;

const checkGeminiConnectivity = async () => {
  const { GoogleGenAI } = require('@google/genai');
  const apiKey = config.ai?.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[Gemini] ✗ GEMINI_API_KEY is not set — AI features will be unavailable.'); 
    return; 
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
    console.log(`[Gemini] ✓ Connected  (${latencyMs} ms) — response: "${preview}"`); 
  } catch (err) {
    const latencyMs = Date.now() - started;
    const isNetworkError =
      err.message?.includes('fetch failed') ||
      err.cause?.code === 'ENOTFOUND' ||
      err.cause?.code === 'ECONNREFUSED';

    if (isNetworkError) {
      console.warn(

        `[Gemini] ✗ Network unreachable (${latencyMs} ms) — cannot reach generativelanguage.googleapis.com.\n` +
          '         Check your internet connection, firewall, or proxy settings.\n' +
          '         AI-powered features (resume parsing, field mapping) will fail until connectivity is restored.'
      );
    } else {
      const status = err.status ?? err.statusCode ?? 'unknown';
      console.warn(

        `[Gemini] ✗ API error  status=${status}  (${latencyMs} ms): ${err.message?.slice(0, 200)}\n` +
          '         Verify your GEMINI_API_KEY is correct and has access to gemini-2.5-flash.\n' +
          '         Get a key at: https://aistudio.google.com/apikey'
      );
    }

  }
};

const start = async () => {
  try {
    await verifyConnection();
    console.log('[DB] Connection established.'); 

    await checkGeminiConnectivity();

    server = app.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`); 
      console.log(`[Server] Environment: ${config.env}`); 
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message); 
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully…`); 
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.'); 
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10_000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();