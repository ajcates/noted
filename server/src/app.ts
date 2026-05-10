import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import serve from 'koa-static';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppConfig } from './config.js';
import { createFilesRouter } from './routes/files.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(config: AppConfig) {
  const app = new Koa();
  const router = new Router();

  // Middleware
  app.use(logger());
  app.use(cors());
  app.use(koaBody());

  // Error handling
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err: any) {
      ctx.status = err.status || 500;
      ctx.body = {
        error: {
          message: err.message || 'Internal Server Error',
          status: ctx.status,
        },
      };
      app.emit('error', err, ctx);
    }
  });

  // API Routes
  router.get('/api/status', (ctx) => {
    ctx.body = {
      status: 'ok',
      config: {
        readonly: config.readonly,
        rootPath: config.rootPath,
      },
    };
  });

  app.use(router.routes()).use(router.allowedMethods());

  // Mount File System Routes
  const filesRouter = createFilesRouter(config);
  app.use(filesRouter.routes()).use(filesRouter.allowedMethods());

  // Static files
  const staticPath = path.resolve(__dirname, process.env.NODE_ENV === 'production' ? './public' : '../../frontend/dist');
  app.use(serve(staticPath));

  return app;
}
