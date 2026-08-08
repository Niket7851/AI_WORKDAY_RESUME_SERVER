const { Type } = require('@google/genai');

// ---------------------------------------------------------------------------
// JSON response schema — used with responseMimeType: 'application/json'
// ---------------------------------------------------------------------------
const RESUME_PARSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    contactInfo: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedinUrl: { type: Type.STRING },
        githubUrl: { type: Type.STRING },
        portfolioUrl: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ['fullName'],
    },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          isCurrent: { type: Type.STRING }, // 'true' | 'false' — avoids BOOLEAN nullable issues
          description: { type: Type.STRING },
        },
        required: ['jobTitle', 'company'],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          gpa: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['institution'],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          category: { type: Type.STRING },
          level: { type: Type.STRING },
        },
        required: ['skillName'],
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          issueDate: { type: Type.STRING },
          expiryDate: { type: Type.STRING },
          credentialId: { type: Type.STRING },
          url: { type: Type.STRING },
        },
        required: ['name'],
      },
    },
  },
  required: ['contactInfo', 'workExperience', 'education', 'skills', 'certifications'],
};

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
const buildResumeParserPrompt = (rawText) => {
  // Safety: truncate to avoid exceeding token limits (~50k chars ≈ ~12k tokens)
  const truncated = rawText.length > 50_000 ? rawText.slice(0, 50_000) : rawText;

  return `You are a professional resume parser. Extract ALL structured data from the resume text below.

RULES:
- Extract ONLY information explicitly present in the resume text. Do not invent or infer data.
- You MUST return ALL five top-level fields: contactInfo, workExperience, education, skills, certifications.
- If a section has no data (e.g. no certifications found), return an empty array [] for that field — never omit it.
- For missing optional fields within an object, omit the field (do not use null or empty strings).
- For dates, use ISO 8601 format (YYYY-MM-DD) when possible. If only month/year available use YYYY-MM-01. If only year, use YYYY-01-01.
- For isCurrent: set to "true" if the position is marked as current/present, "false" otherwise.
- For skills.category: infer from context (e.g., "Programming Language", "Framework", "Tool", "Soft Skill"). Use "Other" if unclear.
- For skills.level: use one of "Beginner", "Intermediate", "Advanced", "Expert" if inferable, otherwise omit.
- Extract EVERY skill listed anywhere in the resume (skills section, job descriptions, etc.).
- URLs must include the protocol (https://).
- Return ONLY valid JSON matching the schema. No markdown fences, no extra text.

RESUME TEXT:
---
${truncated}
---`;
};

module.exports = { buildResumeParserPrompt, RESUME_PARSE_SCHEMA };
