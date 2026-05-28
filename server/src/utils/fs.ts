import path from 'path';
import fs from 'fs-extra';

export const IGNORE_LIST = ['.git', 'node_modules', '.DS_Store', 'dist'];

export interface FileMetadata {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  mtime: Date;
}

/**
 * Validates and resolves a relative path against a root directory.
 * Throws an error if the path escapes the root.
 */
export function resolveSafePath(root: string, relativePath: string = '.'): string {
  const resolvedPath = path.resolve(root, relativePath);
  if (!resolvedPath.startsWith(root)) {
    const error = new Error('Access denied: Path outside of root directory');
    (error as any).status = 403;
    throw error;
  }
  return resolvedPath;
}

/**
 * Returns metadata for a file or directory.
 */
export async function getMetadata(root: string, fullPath: string): Promise<FileMetadata> {
  const stats = await fs.stat(fullPath);
  return {
    name: path.basename(fullPath),
    path: path.relative(root, fullPath) || '.',
    type: stats.isDirectory() ? 'directory' : 'file',
    size: stats.size,
    mtime: stats.mtime,
  };
}

export interface SearchResult {
  path: string;
  name: string;
  snippet: string;
}

export async function searchFiles(root: string, query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  async function walk(currentPath: string) {
    const entries = await fs.readdir(currentPath);
    for (const entry of entries) {
      if (IGNORE_LIST.includes(entry)) continue;

      const fullPath = path.join(currentPath, entry);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        await walk(fullPath);
      } else if (stats.isFile()) {
        // Simple search for now (only text files)
        if (entry.endsWith('.md') || entry.endsWith('.txt') || entry.endsWith('.json')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const index = content.toLowerCase().indexOf(lowerQuery);
          if (index !== -1) {
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + query.length + 40);
            let snippet = content.substring(start, end).replace(/\n/g, ' ');
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';

            results.push({
              path: path.relative(root, fullPath),
              name: entry,
              snippet
            });
          }
        }
      }
    }
  }

  await walk(root);
  return results;
}
