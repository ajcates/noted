import Router from '@koa/router';
import { AppConfig } from '../config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export function createAiRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api/ai' });
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  /**
   * Process text with AI.
   * Body: { promptId: string, text: string }
   */
  router.post('/process', async (ctx) => {
    const { promptId, text } = ctx.request.body as any;

    if (!text) {
      ctx.throw(400, 'Text is required');
    }

    let promptPrefix = '';
    switch (promptId) {
      case 'summarize':
        promptPrefix = 'Summarize the following text:\n\n';
        break;
      case 'fix_grammar':
        promptPrefix = 'Fix the grammar in the following text:\n\n';
        break;
      case 'professional':
        promptPrefix = 'Rewrite the following text to make it sound professional:\n\n';
        break;
      case 'creative':
        promptPrefix = 'Rewrite the following text to make it sound more creative and engaging:\n\n';
        break;
      default:
        promptPrefix = 'Process the following text:\n\n';
    }

    try {
      const result = await model.generateContent(promptPrefix + text);
      const generatedText = result.response.text();
      ctx.body = { result: generatedText };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to process AI request' };
    }
  });

  return router;
}
