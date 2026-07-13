import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { createApp } from '../app.js';
import { AppConfig } from '../config.js';

describe('Settings API', () => {
  let app: any;
  let server: any;
  let config: AppConfig;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'noted-settings-test-'));
    config = {
      rootPath: tempDir,
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
    await fs.remove(tempDir);
  });

  it('GET /api/settings returns empty object when noted.yaml does not exist', async () => {
    const response = await request(server).get('/api/settings');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });

  it('POST /api/settings creates noted.yaml and GET /api/settings reads it back', async () => {
    const payload = {
      theme: 'light',
      aiInstructions: 'Write standard English.'
    };

    const postResponse = await request(server)
      .post('/api/settings')
      .send(payload);

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual(payload);

    // Verify file exists on disk and is correct YAML format
    const filePath = path.join(tempDir, 'noted.yaml');
    expect(await fs.pathExists(filePath)).toBe(true);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    expect(fileContent).toContain('theme: light');
    expect(fileContent).toContain('aiInstructions: Write standard English.');

    // GET should return it
    const getResponse = await request(server).get('/api/settings');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual(payload);
  });

  it('POST /api/settings returns 403 in read-only mode', async () => {
    config.readonly = true;
    const response = await request(server)
      .post('/api/settings')
      .send({ theme: 'light' });

    expect(response.status).toBe(403);
  });
});
