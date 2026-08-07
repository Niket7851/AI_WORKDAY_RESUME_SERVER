'use strict';

const { Router } = require('express');
const { asyncHandler, sendSuccess } = require('../../shared/utils');
const { aiService } = require('./ai.service');

const router = Router();

/**
 * POST /api/v1/ai/parse-resume-text
 *
 * Test endpoint: accepts raw resume text and returns the structured AI output.
 * Useful for verifying the Gemini integration without uploading a file.
 *
 * Body: { text: string }
 *
 * NOTE: This endpoint is intended for development/testing only.
 * In production, resume parsing is triggered automatically on upload.
 */
router.post(
  '/parse-resume-text',
  asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Request body must contain a non-empty "text" field',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    if (text.length > 200_000) {
      return res.status(422).json({
        success: false,
        error: {
          message: '"text" exceeds maximum allowed length of 200,000 characters',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const structured = await aiService.parseResume(text);
    return sendSuccess(res, structured);
  })
);

module.exports = router;
