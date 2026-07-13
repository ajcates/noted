/**
 * A lightweight, zero-dependency YAML stringifier and parser.
 */

export function stringifyYaml(obj: Record<string, any>): string {
  let yaml = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (typeof value === 'string') {
      // If it contains newlines, write it as a block scalar
      if (value.includes('\n')) {
        const lines = value.split('\n').map(line => '    ' + line).join('\n');
        yaml += `${key}: |\n${lines}\n`;
      } else {
        // Double quote strings with special characters
        if (value.includes('"') || value.includes(':') || value.includes('#') || value.includes('@')) {
          yaml += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
        } else {
          yaml += `${key}: ${value}\n`;
        }
      }
    } else {
      yaml += `${key}: ${value}\n`;
    }
  }
  return yaml;
}

export function parseYaml(yaml: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yaml.split('\n');
  let currentKey: string | null = null;
  let blockContent: string[] = [];
  let isBlock = false;

  for (let line of lines) {
    // If we are in a block scalar
    if (isBlock) {
      if (line.startsWith('    ') || line.trim() === '') {
        blockContent.push(line.startsWith('    ') ? line.substring(4) : line);
        continue;
      } else {
        // End of block scalar
        if (currentKey) {
          result[currentKey] = blockContent.join('\n').trimEnd();
        }
        isBlock = false;
        currentKey = null;
        blockContent = [];
      }
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    if (value === '|') {
      isBlock = true;
      currentKey = key;
    } else {
      let parsedValue: any = value;
      // Strip quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        parsedValue = value.substring(1, value.length - 1).replace(/\\"/g, '"');
      } else if (value.startsWith("'") && value.endsWith("'")) {
        parsedValue = value.substring(1, value.length - 1);
      } else if (value === 'true') {
        parsedValue = true;
      } else if (value === 'false') {
        parsedValue = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        parsedValue = Number(value);
      }
      result[key] = parsedValue;
    }
  }

  // Handle EOF block scalar
  if (isBlock && currentKey) {
    result[currentKey] = blockContent.join('\n').trimEnd();
  }

  return result;
}
