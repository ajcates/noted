import Router from '@koa/router';
import fs from 'fs-extra';
import { AppConfig } from '../config.js';
import { resolveSafePath, getMetadata, IGNORE_LIST, searchFiles } from '../utils/fs.js';

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
    console.log(`Listing directory: ${targetPath}, found entries:`, entries);
    
    const filteredEntries = entries.filter(entry => !IGNORE_LIST.includes(entry));

    const metadataPromises = filteredEntries.map(entry => 
      getMetadata(config.rootPath, resolveSafePath(targetPath, entry))
    );

    const metadata = await Promise.all(metadataPromises);
    console.log(`Returning metadata for ${metadata.length} entries`);
    ctx.body = metadata;
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

    try {
      const targetPath = resolveSafePath(config.rootPath, relativePath);
      const stats = await fs.stat(targetPath);

      if (stats.isDirectory()) {
        ctx.throw(400, 'Cannot read a directory as a file');
      }

      ctx.body = await fs.readFile(targetPath, 'utf-8');
    } catch (err: any) {
      if (err.status) throw err; // Re-throw koa errors (e.g. 400 from above)
      if (err.code === 'ENOENT') {
        ctx.throw(404, 'File not found');
      }
      ctx.throw(500, `Failed to read file: ${err.message}`);
    }
  });

  /**
   * Write file content.
   * Body: { path: string, content: string }
   */
  router.put('/write', async (ctx) => {
    if (config.readonly) ctx.throw(403, 'Server is in read-only mode');

    const { path: relativePath, content } = ctx.request.body as any;
    if (!relativePath) ctx.throw(400, 'Path is required');

    try {
      const targetPath = resolveSafePath(config.rootPath, relativePath);
      await fs.writeFile(targetPath, content, 'utf-8');
      ctx.body = { success: true };
    } catch (err: any) {
      if (err.status) throw err;
      ctx.throw(500, `Failed to write file: ${err.message}`);
    }
  });

  /**
   * Create file or directory.
   * Body: { path: string, type: 'file' | 'directory' }
   */
  router.post('/create', async (ctx) => {
    if (config.readonly) ctx.throw(403, 'Server is in read-only mode');

    const { path: relativePath, type } = ctx.request.body as any;
    if (!relativePath) ctx.throw(400, 'Path is required');

    try {
      const targetPath = resolveSafePath(config.rootPath, relativePath);

      if (type === 'directory') {
        await fs.ensureDir(targetPath);
      } else {
        await fs.ensureFile(targetPath);
      }
      ctx.body = { success: true };
    } catch (err: any) {
      if (err.status) throw err;
      if (err.code === 'EEXIST') {
        ctx.throw(409, 'File or directory already exists');
      }
      ctx.throw(500, `Failed to create: ${err.message}`);
    }
  });

  /**
   * Rename/Move file or directory.
   * Body: { oldPath: string, newPath: string }
   */
  router.patch('/rename', async (ctx) => {
    if (config.readonly) ctx.throw(403, 'Server is in read-only mode');

    const { oldPath, newPath } = ctx.request.body as any;
    if (!oldPath || !newPath) ctx.throw(400, 'Both oldPath and newPath are required');

    try {
      const oldTargetPath = resolveSafePath(config.rootPath, oldPath);
      const newTargetPath = resolveSafePath(config.rootPath, newPath);

      await fs.move(oldTargetPath, newTargetPath);
      ctx.body = { success: true };
    } catch (err: any) {
      if (err.status) throw err;
      if (err.code === 'ENOENT') {
        ctx.throw(404, 'Source file not found');
      }
      ctx.throw(500, `Failed to rename: ${err.message}`);
    }
  });

  /**
   * Delete file or directory.
   * Body: { path: string }
   */
  router.delete('/delete', async (ctx) => {
    if (config.readonly) ctx.throw(403, 'Server is in read-only mode');

    const { path: relativePath } = ctx.request.body as any;
    if (!relativePath) ctx.throw(400, 'Path is required');

    try {
      const targetPath = resolveSafePath(config.rootPath, relativePath);
      await fs.remove(targetPath);
      ctx.body = { success: true };
    } catch (err: any) {
      if (err.status) throw err;
      ctx.throw(500, `Failed to delete: ${err.message}`);
    }
  });

  /**
   * Search for text in files.
   * Query: ?q=query
   */
  router.get('/search', async (ctx) => {
    const query = ctx.query.q as string;
    if (!query) {
      ctx.throw(400, 'Query is required');
    }

    const results = await searchFiles(config.rootPath, query);
    ctx.body = results;
  });

  return router;
}
