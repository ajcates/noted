import Router from '@koa/router';
import { AppConfig } from '../config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function createAiRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api/ai' });
  const apiKey = process.env.GEMINI_API_KEY || '';
  console.log('AI Router initialized. API Key present:', !!apiKey, 'Length:', apiKey.length);
  const genAI = new GoogleGenerativeAI(apiKey);

  const systemPrompt = `You are an AI assistant for a note-taking application called 'noted'.
The user is currently editing a note. You will receive the full content of the note and optionally a selected portion of it.
Your task is to process the user's request and respond ONLY with a JSON object in the following format:

{
  "comment": "A message to the user explaining what you did or answering their question. This will be shown in the chat area.",
  "content": "The updated content of the entire note if changes were made. If no changes were made to the note itself, return null.",
  "questions": [
    {
      "question": "A multiple-choice question to ask the user.",
      "options": ["Option 1", "Option 2"]
    }
  ]
}

Guidelines:
- If the user provides a selection, focus your changes on that part but still return the FULL updated note content in the 'content' field.
- If you are just chatting and not changing the note, set 'content' to null.
- Multiple-choice questions are used for follow-ups or to present creative variations (e.g., in the 'Better Suggestion' mode).
- If the 'Last Line Command' is used, treat the very last line of the provided text as the instruction and the rest as the content to be operated on.
- Respond ONLY with the JSON object. Do not include any other text before or after the JSON.`;

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.5-flash',
    systemInstruction: systemPrompt
  });

  /**
   * Process text with AI.
   * Body: { promptId: string, fullContent: string, selection?: string, history?: { role: 'user' | 'model', parts: { text: string }[] }[] }
   */
  router.post('/process', async (ctx) => {
    const { promptId, fullContent, selection, history = [], fileList = [], customInstructions = '' } = ctx.request.body as any;

    if (!fullContent && history.length === 0) {
      ctx.throw(400, 'Full content or history is required');
    }

    const contextInfo = fileList.length > 0 
      ? `\n\nAvailable files in workspace: ${fileList.join(', ')}`
      : '';

    const instructionPrefix = customInstructions 
      ? `USER CUSTOM INSTRUCTIONS (PRIORITIZE THESE):\n${customInstructions}\n\n`
      : '';

    let userPrompt = '';
    switch (promptId) {
      case 'restructure':
        userPrompt = `${instructionPrefix}Restructure the following note to improve logical flow and structural clarity. Group related ideas, use headings, and bulleted lists where appropriate. Focus on the selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'clarify':
        userPrompt = `${instructionPrefix}Clarify the following note by simplifying complex language and rephrasing jargon or convoluted sentences. Focus on the selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'elaborate':
        userPrompt = `${instructionPrefix}Elaborate on the following note by adding depth, explanations, and context. Build upon existing ideas with examples. Focus on the selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'add_info':
        userPrompt = `${instructionPrefix}Identify and fill in missing gaps in the following note. Inject relevant facts, definitions, or supplementary details. Focus on the selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'add_perspective':
        userPrompt = `${instructionPrefix}Introduce alternative viewpoints, counter-arguments, or different professional/cultural angles to the following note. Focus on the selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'fact_check':
        userPrompt = `${instructionPrefix}Fact check the following note for accuracy and logical soundness. Highlight potentially inaccurate claims and suggest corrections. Focus on the selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'better_suggestion':
        userPrompt = `${instructionPrefix}Generate 4 distinct stylistic variations (e.g., professional, casual, concise, persuasive) for the following content. Present them ONLY as options in the "questions" field of your JSON response, with the question being "Which style do you prefer?". Set "content" to null in your response.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
        break;
      case 'last_line':
        const lines = fullContent.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const precedingContent = lines.slice(0, -1).join('\n');
        userPrompt = `${instructionPrefix}Execute the following command on the preceding content. Replace or append the result as appropriate.${contextInfo}\n\nCommand: "${lastLine}"\n\nPreceding Content:\n${precedingContent}`;
        break;
      case 'chat':
        userPrompt = `${instructionPrefix}User message: ${selection || ''}\n\nNote Context:\n${fullContent}${contextInfo}`;
        break;
      default:
        userPrompt = `${instructionPrefix}Process the following note based on user request. Focus on selection if provided.${contextInfo}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${fullContent}`;
    }

    try {
      // Ensure history items are clean and correctly formatted
      const cleanHistory = history.length > 0 ? history.slice(0, -1).map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(h.parts?.[0]?.text || h.content || '') }]
      })) : [];

      const chat = model.startChat({
        history: cleanHistory,
        generationConfig: {
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      });

      const result = await chat.sendMessage(userPrompt);
      const responseText = result.response.text();
      
      try {
        const jsonResponse = JSON.parse(responseText);
        ctx.body = jsonResponse;
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', responseText);
        ctx.body = { 
          comment: responseText, 
          content: null, 
          questions: [] 
        };
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to process AI request' };
    }
  });

  return router;
}
