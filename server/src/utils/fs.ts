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
