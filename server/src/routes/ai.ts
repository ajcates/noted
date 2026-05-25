import Router from '@koa/router';
import { AppConfig } from '../config.js';

export function createAiRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api/ai' });

  /**
   * Process text with AI.
   * Body: { promptId: string, text: string }
   */
  router.post('/process', async (ctx) => {
    const { promptId, text } = ctx.request.body as any;

    if (!text) {
      ctx.throw(400, 'Text is required');
    }

    // This is a placeholder for actual LLM integration.
    // In a real scenario, you'd call OpenAI, Anthropic, or a local model here.
    
    let result = '';
    switch (promptId) {
      case 'summarize':
        result = `[Summary]: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n\n(AI Summarization placeholder)`;
        break;
      case 'fix_grammar':
        result = text.replace(/ {2,}/g, ' ') + '\n\n(AI Grammar Fix placeholder)';
        break;
      case 'professional':
        result = `To whom it may concern,\n\n${text}\n\nSincerely,\nAI Assistant`;
        break;
      case 'creative':
        result = `Once upon a time, in a world where notes edited themselves...\n\n${text}\n\nAnd they all lived happily ever after.`;
        break;
      default:
        result = `[Processed by AI]: ${text}`;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    ctx.body = { result };
  });

  return router;
}
