const { GoogleGenAI, ApiError } = require('@google/genai');
const config = require('../../../config');

// Simple structured logger (no external dependency)
const logger = {
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', msg, ...meta })), // eslint-disable-line no-console
  error: (msg, meta = {}) => console.error(JSON.stringify({ level: 'error', msg, ...meta })), // eslint-disable-line no-console
};

const AI_TIMEOUT_MS = 30_000;
const DEFAULT_MODEL = 'gemini-2.5-flash';

/** Maximum number of automatic retries for transient server-side failures. */
const MAX_RETRIES = 2;
/** Base back-off delay in ms (doubles each retry, capped at 8 s). */
const RETRY_BASE_MS = 1_000;

/** Error codes that are safe to retry (transient, not client faults). */
const RETRYABLE_STATUSES = new Set([429, 503, 500]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createGeminiProvider = () => {
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });

  /**
   * Wraps generateContent with a hard timeout.
   */
  const withTimeout = (promise, ms) => {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  };

  /**
   * @param {string} prompt
   * @param {object} [options]
   * @param {string} [options.responseMimeType]
   * @param {object} [options.responseSchema]
   * @returns {Promise<string>}
   */
  const generateContent = async (prompt, options = {}) => {
    const requestConfig = {};
    if (options.responseMimeType) {
      requestConfig.responseMimeType = options.responseMimeType;
    }
    if (options.responseSchema) {
      requestConfig.responseSchema = options.responseSchema;
    }

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // Exponential back-off before each retry (not before the first attempt).
      if (attempt > 0) {
        const backoffMs = Math.min(RETRY_BASE_MS * 2 ** (attempt - 1), 8_000);
        logger.warn('Retrying Gemini request', { attempt, backoffMs });
        await sleep(backoffMs);
      }

      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            ...(Object.keys(requestConfig).length > 0 ? { config: requestConfig } : {}),
          }),
          AI_TIMEOUT_MS
        );
        return response.text;
      } catch (err) {
        lastError = err;

        if (err instanceof ApiError) {
          // Rate-limit: back off but retry (API may clear within seconds)
          if (err.status === 429) {
            logger.warn('Gemini rate limit reached', { status: err.status, attempt });
            if (attempt < MAX_RETRIES) continue;
            const rateError = new Error('AI rate limit reached. Please try again later.');
            rateError.code = 'AI_RATE_LIMIT';
            rateError.statusCode = 429;
            throw rateError;
          }
          // Service unavailable or internal error — retryable
          if (RETRYABLE_STATUSES.has(err.status) && attempt < MAX_RETRIES) {
            logger.warn('Gemini transient error, will retry', { status: err.status, attempt });
            continue;
          }
          if (err.status === 503) {
            logger.warn('Gemini service unavailable after retries', { status: err.status });
            const unavailError = new Error('AI service temporarily unavailable. Please try again.');
            unavailError.code = 'AI_UNAVAILABLE';
            unavailError.statusCode = 503;
            throw unavailError;
          }
          logger.error('Gemini API error', { status: err.status, name: err.name });
          const apiErr = new Error('AI request failed.');
          apiErr.code = 'AI_API_ERROR';
          apiErr.statusCode = 502;
          throw apiErr;
        }

        // Timeout — retryable
        if (err.message && err.message.includes('timed out')) {
          logger.warn('Gemini request timed out', { attempt });
          if (attempt < MAX_RETRIES) continue;
          const timeoutErr = new Error('AI request timed out. Please try again.');
          timeoutErr.code = 'AI_TIMEOUT';
          timeoutErr.statusCode = 504;
          throw timeoutErr;
        }

        // Unknown / network error — not safe to retry
        throw err;
      }
    }

    // Should not reach here, but guard against it
    throw lastError ?? new Error('AI request failed after retries');
  };

  return { generateContent };
};

module.exports = createGeminiProvider;
