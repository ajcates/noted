import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { AppConfig } from '../config.js';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel = vi.fn().mockImplementation(() => {
        return {
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Mocked AI response',
            },
          }),
        };
      })
    }
  };
});

describe('AI API', () => {
  let app: any;
  let server: any;
  let config: AppConfig;

  beforeEach(() => {
    config = {
      rootPath: '.',
      port: 0,
      configPath: '',
      readonly: false,
      incrementPort: false,
    };

    const created = createApp(config);
    app = created.app;
    server = created.httpServer;
  });

  afterEach(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('POST /api/ai/process returns mocked AI response', async () => {
    const response = await request(server)
      .post('/api/ai/process')
      .send({ promptId: 'summarize', text: 'Some text to summarize' });
    
    expect(response.status).toBe(200);
    expect(response.body.result).toBe('Mocked AI response');
  });

  it('POST /api/ai/process returns 400 if text is missing', async () => {
    const response = await request(server)
      .post('/api/ai/process')
      .send({ promptId: 'summarize' });
    
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Text is required');
  });
});
