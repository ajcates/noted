import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

export interface AppConfig {
  rootPath: string;
  port: number;
  configPath: string;
  readonly: boolean;
  incrementPort: boolean;
  password?: string;
  geminiApiKey?: string;
}

export const DEFAULT_CONFIG: Partial<AppConfig> = {
  port: 6767,
  readonly: false,
  incrementPort: true,
};

export async function loadConfig(cliOptions: any, rootDir: string): Promise<AppConfig> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // 1. Load project-root .env (relative to this script's location)
  // server/src/config.ts or server/dist/config.js -> ../../ is the workspace root
  const projectRoot = path.resolve(__dirname, '../../');
  const projectEnvPath = path.join(projectRoot, '.env');
  
  if (fs.existsSync(projectEnvPath)) {
    dotenv.config({ path: projectEnvPath });
  } else {
    // Fallback to default search if project .env is missing
    dotenv.config();
  }

  // 2. Load specified config.env from CWD if provided via CLI
  const configPath = path.resolve(process.cwd(), cliOptions.config || 'config.env');
  
  let envConfig = {};
  if (await fs.pathExists(configPath)) {
    const result = dotenv.config({ path: configPath });
    if (!result.error) {
      envConfig = result.parsed || {};
    }
  }

  const readonly = cliOptions.readonly !== undefined 
    ? cliOptions.readonly 
    : (process.env.READ_ONLY === 'true' || DEFAULT_CONFIG.readonly);

  const incrementPort = cliOptions.incrementPort !== undefined 
    ? cliOptions.incrementPort 
    : (process.env.INCREMENT_PORT === 'true' || DEFAULT_CONFIG.incrementPort);

  // Priority: CLI > ENV > DEFAULTS
  const config: AppConfig = {
    rootPath: path.resolve(process.cwd(), rootDir),
    port: parseInt(cliOptions.port || process.env.PORT || DEFAULT_CONFIG.port!.toString(), 10),
    configPath: configPath,
    readonly: !!readonly,
    incrementPort: !!incrementPort,
    password: process.env.PASSWORD,
    geminiApiKey: process.env.GEMINI_API_KEY,
  };

  return config;
}
