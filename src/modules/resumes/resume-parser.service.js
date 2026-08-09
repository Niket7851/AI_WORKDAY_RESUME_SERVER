'use strict';

const fs = require('fs');

const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const parsePdf = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result.text || '').trim();
    return { success: true, text, charCount: text.length, error: null };
  } catch (err) {

    console.warn('[ResumeParser] PDF parsing failed:', err.message); 
    return {
      success: false,
      text: null,
      charCount: 0,
      error: `PDF parsing failed: ${err.message}`,
    };
  }
};

const parseDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = (result.value || '').trim();
    if (result.messages && result.messages.length > 0) {

      console.warn(`[ResumeParser] DOCX parsed with ${result.messages.length} warning(s).`); 
    }
    return { success: true, text, charCount: text.length, error: null };
  } catch (err) {
    console.warn('[ResumeParser] DOCX parsing failed:', err.message); 
    return {
      success: false,
      text: null,
      charCount: 0,
      error: `DOCX parsing failed: ${err.message}`,
    };
  }
};

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