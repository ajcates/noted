import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { AppConfig } from './config.js';
import path from 'path';

describe('Auth API', () => {
  let app: any;
  let server: any;
  let config: AppConfig;

  beforeEach(() => {
    config = {
      rootPath: path.resolve('.'),
      port: 0,
      configPath: '',
      readonly: false,
      incrementPort: false,
      password: 'secret-password', // Enable auth
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

  it('POST /api/auth/login returns token with correct password', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({ password: 'secret-password' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('POST /api/auth/login returns 401 with incorrect password', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({ password: 'wrong-password' });
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid password');
  });

  it('Protected routes return 401 without token', async () => {
    // /api/files/list is protected
    const response = await request(server).get('/api/files/list');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication required');
  });

  it('Protected routes return 200 with valid token', async () => {
    // 1. Login to get token
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({ password: 'secret-password' });
    
    const token = loginResponse.body.token;

    // 2. Use token to access protected route
    const response = await request(server)
      .get('/api/files/list')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });
});
