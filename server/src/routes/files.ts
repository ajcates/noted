import Router from '@koa/router';
import fs from 'fs-extra';
import { AppConfig } from '../config.js';
import { resolveSafePath, getMetadata, IGNORE_LIST } from '../utils/fs.js';

export function createFilesRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api/files' });

  /**
   * List directory contents.
   * Query: ?path=relative/path
   */
  router.get('/list', async (ctx) => {
    const relativePath = (ctx.query.path as string) || '.';
    const targetPath = resolveSafePath(config.rootPath, relativePath);

    const entries = await fs.readdir(targetPath);
    const filteredEntries = entries.filter(entry => !IGNORE_LIST.includes(entry));

    const metadataPromises = filteredEntries.map(entry => 
      getMetadata(config.rootPath, resolveSafePath(targetPath, entry))
    );

    ctx.body = await Promise.all(metadataPromises);
  });

  /**
   * Read file content.
   * Query: ?path=relative/file.md
   */
  router.get('/read', async (ctx) => {
    const relativePath = ctx.query.path as string;
    if (!relativePath) {
      ctx.throw(400, 'Path is required');
    }

    const targetPath = resolveSafePath(config.rootPath, relativePath);
    const stats = await fs.stat(targetPath);

    if (stats.isDirectory()) {
      ctx.throw(400, 'Cannot read a directory as a file');
    }

    // For now, we assume text content. Future: check mime type.
    ctx.body = await fs.readFile(targetPath, 'utf-8');
  });

  return router;
}
