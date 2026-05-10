import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';

export interface AppConfig {
  rootPath: string;
  port: number;
  configPath: string;
  readonly: boolean;
  incrementPort: boolean;
  password?: string;
}

export const DEFAULT_CONFIG: Partial<AppConfig> = {
  port: 6767,
  readonly: false,
  incrementPort: false,
};

export async function loadConfig(cliOptions: any, rootDir: string): Promise<AppConfig> {
  const configPath = path.resolve(process.cwd(), cliOptions.config || 'config.env');
  
  let envConfig = {};
  if (await fs.pathExists(configPath)) {
    const result = dotenv.config({ path: configPath });
    if (!result.error) {
      envConfig = result.parsed || {};
    }
  }

  // Priority: CLI > ENV > DEFAULTS
  const config: AppConfig = {
    rootPath: path.resolve(process.cwd(), rootDir),
    port: parseInt(cliOptions.port || process.env.PORT || DEFAULT_CONFIG.port!.toString(), 10),
    configPath: configPath,
    readonly: cliOptions.readonly ?? (process.env.READ_ONLY === 'true') ?? DEFAULT_CONFIG.readonly!,
    incrementPort: cliOptions.incrementPort ?? (process.env.INCREMENT_PORT === 'true') ?? DEFAULT_CONFIG.incrementPort!,
    password: process.env.PASSWORD,
  };

  return config;
}
