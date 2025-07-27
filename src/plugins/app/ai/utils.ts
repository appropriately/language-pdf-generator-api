export const generatePrompt = (
  originalLanguage: string,
  targetLanguage: string,
  level: string,
  prompt: string
): string =>
  `Generate language learning material in ${originalLanguage} for the following language: ${targetLanguage} and level: ${level}. ${
    prompt ? `The prompt is: ${prompt}` : ""
  }. When creating question components, you MUST include the answer field with the correct answer. Do not create questions without answers. Each question should be self-contained with both the question text and its corresponding answer.`;
