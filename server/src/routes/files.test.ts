import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { AppConfig } from '../config.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Files API', () => {
  let tempDir: string;
  let app: any;
  let server: any;
  let config: AppConfig;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'noted-test-'));
    await fs.writeFile(path.join(tempDir, 'test.md'), 'test content');
    await fs.ensureDir(path.join(tempDir, 'subdir'));
    await fs.writeFile(path.join(tempDir, 'subdir/subtest.md'), 'subtest content');

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
    await fs.remove(tempDir);
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('GET /api/files/list returns file metadata', async () => {
    const response = await request(server).get('/api/files/list');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    const testFile = response.body.find((f: any) => f.name === 'test.md');
    expect(testFile).toBeDefined();
    expect(testFile.type).toBe('file');
    
    const subdir = response.body.find((f: any) => f.name === 'subdir');
    expect(subdir).toBeDefined();
    expect(subdir.type).toBe('directory');
  });

  it('GET /api/files/read returns file content', async () => {
    const response = await request(server).get('/api/files/read?path=test.md');
    expect(response.status).toBe(200);
    expect(response.text).toBe('test content');
  });

  it('rejects traversal and sibling-prefix paths', async () => {
    const traversal = await request(server).get('/api/files/read?path=../outside.md');
    const siblingPrefix = await request(server).get('/api/files/read?path=../noted-test-escape/outside.md');

    expect(traversal.status).toBe(403);
    expect(siblingPrefix.status).toBe(403);
  });

  it('PUT /api/files/write updates file content', async () => {
    const response = await request(server)
      .put('/api/files/write')
      .send({ path: 'test.md', content: 'updated content' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const content = await fs.readFile(path.join(tempDir, 'test.md'), 'utf-8');
    expect(content).toBe('updated content');
  });

  it('POST /api/files/create creates a new file', async () => {
    const response = await request(server)
      .post('/api/files/create')
      .send({ path: 'new.md', type: 'file' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'new.md'))).toBe(true);
  });

  it('POST /api/files/create refuses to reuse an existing file', async () => {
    const response = await request(server)
      .post('/api/files/create')
      .send({ path: 'test.md', type: 'file' });

    expect(response.status).toBe(409);
    expect(await fs.readFile(path.join(tempDir, 'test.md'), 'utf-8')).toBe('test content');
  });

  it('PATCH /api/files/rename moves a file to another directory', async () => {
    const response = await request(server)
      .patch('/api/files/rename')
      .send({ oldPath: 'test.md', newPath: 'subdir/test.md' });

    expect(response.status).toBe(200);
    expect(await fs.pathExists(path.join(tempDir, 'test.md'))).toBe(false);
    expect(await fs.readFile(path.join(tempDir, 'subdir/test.md'), 'utf-8')).toBe('test content');
  });

  it('PATCH /api/files/rename refuses to overwrite at the destination', async () => {
    const response = await request(server)
      .patch('/api/files/rename')
      .send({ oldPath: 'test.md', newPath: 'subdir/subtest.md' });

    expect(response.status).toBe(409);
    expect(await fs.readFile(path.join(tempDir, 'test.md'), 'utf-8')).toBe('test content');
    expect(await fs.readFile(path.join(tempDir, 'subdir/subtest.md'), 'utf-8')).toBe('subtest content');
  });

  it('DELETE /api/files/delete removes a file', async () => {
    const response = await request(server)
      .delete('/api/files/delete')
      .send({ path: 'test.md' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'test.md'))).toBe(false);
  });
});
