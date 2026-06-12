import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig } from './config.js';
import path from 'path';

describe('AppConfig loadConfig with Magic Ports', () => {
  const originalEnv = { ...process.env };
  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.stubGlobal('process', {
      ...process,
      cwd: originalCwd,
      env: { ...originalEnv }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it('generates a consistent magic port between 1024 and 49151 if no port is specified', async () => {
    const config1 = await loadConfig({}, 'notes');
    const config2 = await loadConfig({}, 'notes');

    // Consistent output
    expect(config1.port).toBe(config2.port);
    
    // Within range
    expect(config1.port).toBeGreaterThanOrEqual(1024);
    expect(config1.port).toBeLessThanOrEqual(49151);
  });

  it('generates different magic ports for different directories', async () => {
    const configA = await loadConfig({}, 'notes');
    const configB = await loadConfig({}, 'notes/prompts');

    expect(configA.port).not.toBe(configB.port);
  });

  it('allows overriding magic port with custom CLI port option', async () => {
    const config = await loadConfig({ port: '9999' }, 'notes');
    expect(config.port).toBe(9999);
  });

  it('allows overriding magic port with PORT environment variable', async () => {
    process.env.PORT = '8888';
    const config = await loadConfig({}, 'notes');
    expect(config.port).toBe(8888);
  });

  it('prioritizes CLI port option over PORT env variable', async () => {
    process.env.PORT = '8888';
    const config = await loadConfig({ port: '7777' }, 'notes');
    expect(config.port).toBe(7777);
  });
});
