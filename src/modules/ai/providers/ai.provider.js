const createAiProviderInterface = () => {

  const generateContent = async (_prompt, _options = {}) => {
    throw new Error('generateContent() must be implemented by a concrete provider');
  };

  return { generateContent };
};

module.exports = createAiProviderInterface;