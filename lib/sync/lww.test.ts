import { describe, it, expect } from 'vitest';
import { serverWins } from './lww';

describe('serverWins', () => {
  it('server wins when there is no local pending edit', () => {
    expect(serverWins(undefined, '2026-01-02T00:00:00Z')).toBe(true);
  });
  it('server wins when remote is newer than the pending local edit', () => {
    expect(serverWins('2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z')).toBe(true);
  });
  it('local pending edit wins when newer than remote', () => {
    expect(serverWins('2026-01-03T00:00:00Z', '2026-01-02T00:00:00Z')).toBe(false);
  });
});
