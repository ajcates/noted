import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import Router from '@koa/router';
import { AppConfig } from './config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'noted-default-secret-change-me';

export function authMiddleware(config: AppConfig) {
  return async (ctx: Context, next: Next) => {
    // If no password is set, skip authentication
    if (!config.password) {
      return next();
    }

    // Skip auth for login endpoint
    if (ctx.path === '/api/auth/login' || ctx.path === '/api/status') {
      return next();
    }

    // Check for token in Authorization header or cookie
    const token = ctx.headers['authorization']?.split(' ')[1] || ctx.cookies.get('noted_token');

    if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication required' };
      return;
    }

    try {
      jwt.verify(token, JWT_SECRET);
      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid or expired token' };
    }
  };
}

export function createAuthRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api/auth' });

  router.post('/login', async (ctx) => {
    const { password } = ctx.request.body as any;

    if (password === config.password) {
      const token = jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '7d' });
      ctx.body = { token };
    } else {
      ctx.status = 401;
      ctx.body = { error: 'Invalid password' };
    }
  });

  return router;
}
