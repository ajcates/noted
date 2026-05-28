import { describe, it, expect } from 'vitest';
import { countWords, estimateReadingTime } from './metrics';

describe('metrics utility', () => {
  it('counts words correctly', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('hello')).toBe(1);
    expect(countWords('hello world')).toBe(2);
    expect(countWords('  multiple   spaces  ')).toBe(2);
    expect(countWords('markdown **bold** text')).toBe(3);
  });

  it('estimates reading time correctly', () => {
    expect(estimateReadingTime('')).toBe(0);
    expect(estimateReadingTime('word '.repeat(100))).toBe(1);
    expect(estimateReadingTime('word '.repeat(201))).toBe(2);
  });
});
