const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateTranscriptSummary(transcriptText) {
  if (!transcriptText || transcriptText.trim() === '') {
    return 'No conversation to summarize.';
  }

  try {
    const prompt = `Please summarize the following video call transcript. Provide a concise summary followed by key takeaways or action items if applicable. Do NOT use any markdown formatting like asterisks (*) or bold text. Use plain text only:\n\n${transcriptText}`;
    
    const interaction = await client.interactions.create({
        model: 'gemini-3.5-flash-lite',
        input: prompt,
    });
    
    return interaction.output_text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to generate summary');
  }
}

async function chatWithTranscript(transcriptText, userQuestion) {
  if (!transcriptText || transcriptText.trim() === '') {
    return 'No transcript context available.';
  }

  try {
    const prompt = `You are an AI assistant helping a user understand a video call transcript. 
Here is the transcript:
"""
${transcriptText}
"""

User's question: ${userQuestion}

Please provide a helpful and concise answer based ONLY on the transcript provided above.`;
    
    const interaction = await client.interactions.create({
        model: 'gemini-3.5-flash-lite',
        input: prompt,
    });
    
    return interaction.output_text;
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    throw new Error('Failed to generate answer');
  }
}

module.exports = { generateTranscriptSummary, chatWithTranscript };
