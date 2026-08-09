const { Type } = require('@google/genai');

const FIELD_MAPPER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    resume_path: {
      type: Type.STRING,
      description:
        'Dot-notation path in the resume context, e.g. "contact.fullName". Omit if unmapped.',
    },
    mapped_value: {
      type: Type.STRING,
      description: 'Exact value to enter in the field. Omit if unmapped.',
    },
    mapping_method: {
      type: Type.STRING,
      description: 'Always "ai" for AI-generated mappings.',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence score 0.0-1.0.',
    },
    reason: {
      type: Type.STRING,
      description: 'Brief explanation of the mapping decision.',
    },
    status: {
      type: Type.STRING,
      description: '"mapped" | "uncertain" | "unmapped"',
    },
  },
  required: ['mapping_method', 'confidence', 'reason', 'status'],
};

const buildFieldMapperPrompt = (fieldMeta, resumeContext) => {
  const resumeJson = JSON.stringify(resumeContext, null, 2);

  return `You are a job application assistant. Map a single HTML form field to the appropriate value from a candidate's structured resume.

FIELD:
- Label: "${fieldMeta.label}"
- Type: "${fieldMeta.type}"${fieldMeta.selector ? `\n- Selector: "${fieldMeta.selector}"` : ''}

RESUME DATA:
${resumeJson}

RULES:
1. Return ONLY information that exists in the resume data. Never invent or infer facts not present.
2. If the field maps to a sub-component of a resume value (e.g., first name from "fullName"), extract only that component.
3. For date fields return in YYYY-MM-DD format when possible.
4. Confidence calibration:
   - 0.90-1.00: direct, unambiguous match (e.g., email field → contact.email)
   - 0.70-0.89: strong inference with minor ambiguity
   - 0.50-0.69: reasonable but uncertain — set status to "uncertain"
   - below 0.50: insufficient information — set status to "unmapped", omit mapped_value and resume_path
5. If no resume data could reasonably fill this field: status = "unmapped", confidence = 0.
6. Return valid JSON only matching the schema. No markdown, no extra text.`;
};

module.exports = { buildFieldMapperPrompt, FIELD_MAPPER_SCHEMA };