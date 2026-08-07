'use strict';

const fs = require('fs');
// pdf-parse may export either a callable function or { default: fn } depending
// on the installed version.  Normalise to a plain callable.
const _pdfParseImport = require('pdf-parse');
const pdfParse =
  typeof _pdfParseImport === 'function'
    ? _pdfParseImport
    : (_pdfParseImport.default ?? _pdfParseImport);
const mammoth = require('mammoth');

/**
 * Resume Parser Service
 *
 * Provides a clean abstraction over PDF and DOCX parsing so that the
 * underlying libraries can be swapped without touching any other module.
 *
 * Security rules enforced here:
 *  - Never log extracted text (contains sensitive personal information).
 *  - Return structured result objects; let the caller decide on error handling.
 *  - Read files synchronously into a buffer before parsing to avoid keeping
 *    file handles open if the parser errors mid-stream.
 */

/**
 * @typedef {Object} ParseResult
 * @property {boolean} success      - Whether text extraction succeeded.
 * @property {string|null} text     - Extracted plain text (null on failure).
 * @property {number} charCount     - Character count of the extracted text.
 * @property {string|null} error    - Error message if parsing failed (never the raw text).
 */

/**
 * Extracts plain text from a PDF file.
 * @param {string} filePath
 * @returns {Promise<ParseResult>}
 */
const parsePdf = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);
    const text = (result.text || '').trim();
    return { success: true, text, charCount: text.length, error: null };
  } catch (err) {
    // Log only that parsing failed — never log the file content
    console.warn('[ResumeParser] PDF parsing failed:', err.message); // eslint-disable-line no-console
    return {
      success: false,
      text: null,
      charCount: 0,
      error: `PDF parsing failed: ${err.message}`,
    };
  }
};

/**
 * Extracts plain text from a DOCX file.
 * @param {string} filePath
 * @returns {Promise<ParseResult>}
 */
const parseDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = (result.value || '').trim();
    if (result.messages && result.messages.length > 0) {
      // Log warning count only — not message content which may include filenames
      console.warn(`[ResumeParser] DOCX parsed with ${result.messages.length} warning(s).`); // eslint-disable-line no-console
    }
    return { success: true, text, charCount: text.length, error: null };
  } catch (err) {
    console.warn('[ResumeParser] DOCX parsing failed:', err.message); // eslint-disable-line no-console
    return {
      success: false,
      text: null,
      charCount: 0,
      error: `DOCX parsing failed: ${err.message}`,
    };
  }
};

/**
 * Parses a resume file based on its MIME type.
 *
 * @param {string} filePath  - Absolute path to the uploaded file on disk.
 * @param {string} mimeType  - MIME type reported at upload time.
 * @returns {Promise<ParseResult>}
 */
const parseFile = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    return parsePdf(filePath);
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDocx(filePath);
  }

  return {
    success: false,
    text: null,
    charCount: 0,
    error: `No parser available for MIME type: ${mimeType}`,
  };
};

module.exports = { parseFile };
