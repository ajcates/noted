import { describe, expect, it } from 'vitest';
import os from 'os';
import path from 'path';
import { resolveSafePath } from './fs.js';

describe('resolveSafePath', () => {
  const root = path.join(os.tmpdir(), 'noted-root');

  it('allows paths contained by the root', () => {
    expect(resolveSafePath(root, 'notes/today.md')).toBe(path.join(root, 'notes/today.md'));
    expect(resolveSafePath(root, '.')).toBe(root);
  });

  it('rejects parent traversal and sibling-prefix paths', () => {
    expect(() => resolveSafePath(root, '../secret.md')).toThrow(/outside of root/i);
    expect(() => resolveSafePath(root, '../noted-root-escape/secret.md')).toThrow(/outside of root/i);
  });

  it('rejects absolute input even when it points inside the root', () => {
    expect(() => resolveSafePath(root, path.join(root, 'notes/today.md'))).toThrow(/must be relative/i);
  });
});
