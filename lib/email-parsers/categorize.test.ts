import { describe, it, expect } from 'vitest';
import { categorize } from './categorize';

describe('categorize', () => {
  it('matches a known merchant case-insensitively', () => {
    expect(categorize('SWIGGY')).toBe('Food');
    expect(categorize('swiggy')).toBe('Food');
  });

  it('matches a merchant name embedded in a longer string', () => {
    expect(categorize('ZOMATO ONLINE ORDER')).toBe('Food');
  });

  it('returns null for an unrecognized merchant', () => {
    expect(categorize('SOME RANDOM SHOP')).toBeNull();
  });
});
