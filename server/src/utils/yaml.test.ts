import { describe, it, expect } from 'vitest';
import { stringifyYaml, parseYaml } from './yaml.js';

describe('YAML Utility', () => {
  it('should stringify and parse back correctly', () => {
    const original = {
      theme: 'dark',
      aiInstructions: 'Be direct.\nWrite clean code.\nNever explain.',
      readonly: false,
      port: 8080
    };

    const yamlString = stringifyYaml(original);
    const parsed = parseYaml(yamlString);

    expect(parsed.theme).toBe('dark');
    expect(parsed.aiInstructions).toBe('Be direct.\nWrite clean code.\nNever explain.');
    expect(parsed.readonly).toBe(false);
    expect(parsed.port).toBe(8080);
  });

  it('should handle special character strings with quotes', () => {
    const original = {
      description: 'A config with a colon: inside',
      tag: '#hashTag',
      custom: 'link: @somepath'
    };

    const yamlString = stringifyYaml(original);
    const parsed = parseYaml(yamlString);

    expect(parsed.description).toBe('A config with a colon: inside');
    expect(parsed.tag).toBe('#hashTag');
    expect(parsed.custom).toBe('link: @somepath');
  });
});
