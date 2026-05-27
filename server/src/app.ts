import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import serve from 'koa-static';
import cors from '@koa/cors';
import { koaBody, HttpMethodEnum } from 'koa-body';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import chokidar from 'chokidar';
import { AppConfig } from './config.js';
import { createFilesRouter } from './routes/files.js';
import { createAiRouter } from './routes/ai.js';
import { authMiddleware, createAuthRouter } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(config: AppConfig) {
  const app = new Koa();
  const httpServer = createServer(app.callback());
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });

  // File Watcher
  const watcher = chokidar.watch(config.rootPath, {
    ignored: (path) => {
      return path.includes('node_modules') || 
             path.includes('.git') || 
             path.includes('dist') ||
             path.includes('.DS_Store');
    },
    persistent: true,
    ignoreInitial: true,
    usePolling: false,
    followSymlinks: false,
  });

  let broadcastTimeout: NodeJS.Timeout | null = null;
  const pendingChanges = new Set<{ event: string, path: string }>();

  watcher.on('all', (event, filePath) => {
    const relativePath = path.relative(config.rootPath, filePath);
    pendingChanges.add({ event, path: relativePath });
    
    if (broadcastTimeout) clearTimeout(broadcastTimeout);
    broadcastTimeout = setTimeout(() => {
      pendingChanges.forEach(change => {
        io.emit('file-change', change);
      });
      pendingChanges.clear();
    }, 100);
  });

  const router = new Router();

  // Middleware
  app.use(logger());
  app.use(cors());
  app.use(koaBody({
    parsedMethods: [HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.PATCH, HttpMethodEnum.DELETE]
  }));

  // Auth Middleware
  app.use(authMiddleware(config));

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
        authEnabled: !!config.password,
      },
    };
  });

  app.use(router.routes()).use(router.allowedMethods());

  // Mount Auth Routes
  const authRouter = createAuthRouter(config);
  app.use(authRouter.routes()).use(authRouter.allowedMethods());

  // Mount File System Routes
  const filesRouter = createFilesRouter(config);
  app.use(filesRouter.routes()).use(filesRouter.allowedMethods());

  // Mount AI Routes
  const aiRouter = createAiRouter(config);
  app.use(aiRouter.routes()).use(aiRouter.allowedMethods());

  // Static files
  // In development: ../../frontend/dist
  // In production (compiled): ./public
  const staticPath = path.resolve(__dirname, process.env.NODE_ENV === 'production' || !__dirname.includes('server/src') 
    ? './public' 
    : '../../frontend/dist');
  app.use(serve(staticPath));

  return { app, httpServer, io };
}
