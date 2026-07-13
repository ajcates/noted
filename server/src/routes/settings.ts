import Router from '@koa/router';
import path from 'path';
import fs from 'fs-extra';
import { AppConfig } from '../config.js';
import { parseYaml, stringifyYaml } from '../utils/yaml.js';

export function createSettingsRouter(config: AppConfig) {
  const router = new Router({ prefix: '/api' });
  const settingsFilePath = path.join(config.rootPath, 'noted.yaml');

  router.get('/settings', async (ctx) => {
    try {
      if (await fs.pathExists(settingsFilePath)) {
        const yamlContent = await fs.readFile(settingsFilePath, 'utf-8');
        ctx.body = parseYaml(yamlContent);
      } else {
        ctx.body = {};
      }
    } catch (err: any) {
      ctx.throw(500, `Failed to load settings: ${err.message}`);
    }
  });

  router.post('/settings', async (ctx) => {
    if (config.readonly) {
      ctx.throw(403, 'Cannot update settings in read-only mode');
    }

    try {
      const settings = ctx.request.body as Record<string, any>;
      if (!settings || typeof settings !== 'object') {
        ctx.throw(400, 'Invalid settings object');
      }

      // Read existing settings to merge new values, preserving other fields
      let existingSettings = {};
      if (await fs.pathExists(settingsFilePath)) {
        const yamlContent = await fs.readFile(settingsFilePath, 'utf-8');
        existingSettings = parseYaml(yamlContent);
      }

      const mergedSettings = {
        ...existingSettings,
        ...settings
      };

      const yamlContent = stringifyYaml(mergedSettings);
      await fs.writeFile(settingsFilePath, yamlContent, 'utf-8');
      
      ctx.body = mergedSettings;
    } catch (err: any) {
      if (err.status) throw err;
      ctx.throw(500, `Failed to save settings: ${err.message}`);
    }
  });

  return router;
}
