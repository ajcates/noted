import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { AppConfig } from '../config.js';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify({
        comment: 'Mocked AI response',
        content: 'Mocked updated content',
        questions: []
      }),
    },
  });

  const mockStartChat = vi.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage
  }));

  return {
    GoogleGenerativeAI: class {
      getGenerativeModel = vi.fn().mockImplementation(() => {
        return {
          startChat: mockStartChat
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
      .send({ promptId: 'summarize', fullContent: 'Some text to summarize', fileList: ['file1.md', 'file2.md'] });
    
    expect(response.status).toBe(200);
    expect(response.body.comment).toBe('Mocked AI response');
    expect(response.body.content).toBe('Mocked updated content');
  });

  it('POST /api/ai/process returns 400 if fullContent is missing', async () => {
    const response = await request(server)
      .post('/api/ai/process')
      .send({ promptId: 'summarize' });
    
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Full content or history is required');
  });
});
