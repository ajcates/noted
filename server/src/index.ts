import { Command } from 'commander';
import path from 'path';
import net from 'net';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  .option('-r, --readonly', 'run in read-only mode', false)
  .option('--increment-port', 'automatically increment port if in use', false)
  .action(async (dirPath: string, options: NotedOptions) => {
    const absolutePath = path.resolve(process.cwd(), dirPath);
    
    if (!(await fs.pathExists(absolutePath))) {
      console.error(`Error: Path "${absolutePath}" does not exist.`);
      process.exit(1);
    }

    const stats = await fs.stat(absolutePath);
    if (!stats.isDirectory()) {
      console.error(`Error: Path "${absolutePath}" is not a directory.`);
      process.exit(1);
    }

    let port = parseInt(options.port, 10);
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
      if (!options.incrementPort) {
        console.error(`Error: Port ${port} is already in use. Use --increment-port to find an available port.`);
        process.exit(1);
      }
      
      console.warn(`Warning: Port ${port} is in use, trying ${port + 1}...`);
      port++;
      
      if (port > maxPort) {
        console.error('Error: No available ports found.');
        process.exit(1);
      }
    }

    console.log(`Starting noted in: ${absolutePath}`);
    console.log(`Port: ${port}`);
    console.log(`Read-only: ${options.readonly}`);
    console.log(`Config: ${options.config}`);
    
    // TODO: Launch Koa server (Stage 3)
  });

program.parse(process.argv);
