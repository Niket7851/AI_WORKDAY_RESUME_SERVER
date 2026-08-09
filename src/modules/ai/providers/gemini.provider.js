const { GoogleGenAI, ApiError } = require('@google/genai');
const config = require('../../../config');

const logger = {
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', msg, ...meta })), 
  error: (msg, meta = {}) => console.error(JSON.stringify({ level: 'error', msg, ...meta })), 
};

const AI_TIMEOUT_MS = 30_000;
const DEFAULT_MODEL = 'gemini-2.5-flash';

const MAX_RETRIES = 2;

const RETRY_BASE_MS = 1_000;

const RETRYABLE_STATUSES = new Set([429, 503, 500]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createGeminiProvider = () => {
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });

  const withTimeout = (promise, ms) => {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  };

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

          if (err.status === 429) {
            logger.warn('Gemini rate limit reached', { status: err.status, attempt });
            if (attempt < MAX_RETRIES) continue;
            const rateError = new Error('AI rate limit reached. Please try again later.');
            rateError.code = 'AI_RATE_LIMIT';
            rateError.statusCode = 429;
            throw rateError;
          }

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

        if (err.message && err.message.includes('timed out')) {
          logger.warn('Gemini request timed out', { attempt });
          if (attempt < MAX_RETRIES) continue;
          const timeoutErr = new Error('AI request timed out. Please try again.');
          timeoutErr.code = 'AI_TIMEOUT';
          timeoutErr.statusCode = 504;
          throw timeoutErr;
        }

        throw err;
      }
    }

    throw lastError ?? new Error('AI request failed after retries');
  };

  return { generateContent };
};

module.exports = createGeminiProvider;