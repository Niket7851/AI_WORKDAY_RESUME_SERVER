/**
 * Provider interface contract.
 * Every concrete provider must implement this shape.
 * Using arrow function factory so it follows the project arrow-function convention.
 */

const createAiProviderInterface = () => {
  /**
   * @param {string} prompt - Full prompt text
   * @param {object} [options]
   * @param {string} [options.responseMimeType]
   * @param {object} [options.responseSchema]
   * @returns {Promise<string>} Raw response text from the model
   */
  const generateContent = async (_prompt, _options = {}) => {
    throw new Error('generateContent() must be implemented by a concrete provider');
  };

  return { generateContent };
};

module.exports = createAiProviderInterface;
