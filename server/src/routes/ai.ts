import Router from '@koa/router';
import { AppConfig } from '../config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PassThrough } from 'stream';
import { prompts, defaultPrompt } from '../utils/prompts.js';

export function createAiRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api/ai' });
  const apiKey = config.geminiApiKey || '';
  
  if (!apiKey) {
    console.warn('WARNING: Gemini API Key is missing. AI features will fail with 403 Forbidden.');
  } else {
    console.log('Gemini API Key loaded (starts with:', apiKey.substring(0, 4) + '...)');
  }

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

  function preparePrompt(promptId: string, fullContent: string, selection: string, history: any[], fileList: string[], customInstructions: string) {
    const contextInfo = fileList.length > 0 
      ? `\n\nAvailable files in workspace: ${fileList.join(', ')}`
      : '';

    const instructionPrefix = customInstructions 
      ? `USER CUSTOM INSTRUCTIONS (PRIORITIZE THESE):\n${customInstructions}\n\n`
      : '';

    const builder = prompts[promptId] || defaultPrompt;
    const userPrompt = builder(instructionPrefix, contextInfo, selection || '', fullContent);

    const cleanHistory = history.length > 0 ? history.slice(0, -1).map((h: any) => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(h.parts?.[0]?.text || h.content || '') }]
    })) : [];

    return { userPrompt, cleanHistory };
  }

  /**
   * Process text with AI (Streaming).
   */
  router.post('/process-stream', async (ctx) => {
    const { promptId, fullContent, selection, history = [], fileList = [], customInstructions = '' } = ctx.request.body as any;

    const { userPrompt, cleanHistory } = preparePrompt(promptId, fullContent, selection, history, fileList, customInstructions);

    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = new PassThrough();
    ctx.body = stream;

    try {
      const chat = model.startChat({
        history: cleanHistory,
        generationConfig: {
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });

      const result = await chat.sendMessageStream(userPrompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        stream.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      stream.end();
    } catch (error: any) {
      console.error('Error in AI stream:', error);
      let errorMessage = error.message || 'An unknown error occurred';
      if (error.status === 503) {
        errorMessage = 'The AI service is currently overloaded or unavailable (503). Please try again in a few moments.';
      } else if (error.status === 429) {
        errorMessage = 'You have exceeded the rate limit for the AI service (429). Please wait a bit before trying again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied (403). Please check if your Gemini API key is valid.';
      }
      stream.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      stream.end();
    }
  });

  /**
   * Process text with AI.
   */
  router.post('/process', async (ctx) => {
    const { promptId, fullContent, selection, history = [], fileList = [], customInstructions = '' } = ctx.request.body as any;

    if (!fullContent && history.length === 0) {
      ctx.throw(400, 'Full content or history is required');
    }

    const { userPrompt, cleanHistory } = preparePrompt(promptId, fullContent, selection, history, fileList, customInstructions);

    try {
      const chat = model.startChat({
        history: cleanHistory,
        generationConfig: {
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });

      const result = await chat.sendMessage(userPrompt);
      const responseText = result.response.text();
      
      try {
        let sanitized = responseText;
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
          sanitized = responseText.substring(firstBrace, lastBrace + 1);
        }
        const jsonResponse = JSON.parse(sanitized);
        ctx.body = jsonResponse;
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', responseText);
        ctx.body = { 
          comment: responseText, 
          content: null, 
          questions: [] 
        };
      }
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      ctx.status = error.status || 500;
      
      let errorMessage = error.message || 'An unknown error occurred';
      if (error.status === 503) {
        errorMessage = 'The AI service is currently overloaded or unavailable (503). Please try again in a few moments.';
      } else if (error.status === 429) {
        errorMessage = 'You have exceeded the rate limit for the AI service (429). Please wait a bit before trying again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied (403). Please check if your Gemini API key is valid.';
      }

      ctx.body = { 
        error: errorMessage,
        details: error.message,
        suggestion: error.message?.includes('unregistered callers') 
          ? 'Check if GEMINI_API_KEY is valid and correctly loaded in the server environment.' 
          : undefined
      };
    }
  });

  return router;
}
