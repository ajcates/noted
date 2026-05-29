#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import net from 'net';
import fs from 'fs-extra';
import { loadConfig } from './config.js';
import { createApp } from './app.js';
import open from 'open';

interface NotedOptions {
  port: string;
  config: string;
  readonly: boolean;
  incrementPort: boolean;
}

const program = new Command();

program
  .name('noted')
  .description('A Node.js based note editor with PWA support')
  .version('1.0.0')
  .argument('[path]', 'path to the notes directory', '.')
  .option('-p, --port <number>', 'port to use', '6767')
  .option('-c, --config <path>', 'path to config file', 'config.env')
  .option('-r, --readonly', 'run in read-only mode')
  .option('--no-increment-port', 'do not automatically increment port if in use')
  .action(async (dirPath: string, options: NotedOptions) => {
    const config = await loadConfig(options, dirPath);
    
    if (!(await fs.pathExists(config.rootPath))) {
      console.error(`Error: Path "${config.rootPath}" does not exist.`);
      process.exit(1);
    }

    const stats = await fs.stat(config.rootPath);
    if (!stats.isDirectory()) {
      console.error(`Error: Path "${config.rootPath}" is not a directory.`);
      process.exit(1);
    }

    let port = config.port;
    const maxPort = 65535;

    const isPortAvailable = (p: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(p);
      });
    };

    while (!(await isPortAvailable(port))) {
      if (!config.incrementPort) {
        console.error(`Error: Port ${port} is already in use.`);
        process.exit(1);
      }
      
      console.warn(`Warning: Port ${port} is in use, trying ${port + 1}...`);
      port++;
      
      if (port > maxPort) {
        console.error('Error: No available ports found.');
        process.exit(1);
      }
    }

    // Update config with final port
    config.port = port;

    const { httpServer } = createApp(config);
    
    // Try to read build number from version.json
    let buildNumber = 'unknown';
    try {
      // Look for version.json in parent directories up to 2 levels
      const possiblePaths = [
        path.join(process.cwd(), 'version.json'),
        path.join(path.dirname(new URL(import.meta.url).pathname), '../../version.json'),
        path.join(path.dirname(new URL(import.meta.url).pathname), '../../../version.json')
      ];
      
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const versionData = fs.readJsonSync(p);
          buildNumber = versionData.version || versionData.build || 'unknown';
          break;
        }
      }
    } catch (e) {
      // Ignore
    }

    httpServer.listen(config.port, async () => {
      const localUrl = `http://localhost:${config.port}`;
      console.log(`\n🚀 noted is running! (Build: ${buildNumber})`);
      console.log(`----------------------------------`);
      console.log(`URL:        ${localUrl}`);
      console.log(`Directory:  ${config.rootPath}`);
      console.log(`Port:       ${config.port}`);
      console.log(`Read-only:  ${config.readonly}`);
      console.log(`Config:     ${config.configPath}`);
      console.log(`----------------------------------\n`);
      
      try {
        await open(localUrl);
      } catch (err) {
        console.warn(`Failed to automatically open browser: ${err}`);
      }
    });
  });

program.parse(process.argv);
