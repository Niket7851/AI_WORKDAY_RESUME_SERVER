'use strict';

/**
 * Automation service — coordinates filling and navigating multi-step Workday applications.
 * Workday DOM automation is handled by the Chrome content script;
 * this service manages the server-side orchestration.
 */

async function startSession(_applicationId) {
  // Placeholder
}

async function confirmSubmission(_applicationId) {
  // Placeholder — explicit user confirmation required before any submission
}

module.exports = { startSession, confirmSubmission };
