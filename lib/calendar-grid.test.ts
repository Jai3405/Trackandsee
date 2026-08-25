import { describe, it, expect } from 'vitest';
import { monthGrid } from './calendar-grid';

describe('monthGrid', () => {
  it('returns a grid that is a multiple of 7 and covers every day of the target month', () => {
    const grid = monthGrid(2026, 7); // August 2026 — month is 0-indexed (January = 0)
    expect(grid.length % 7).toBe(0);
    const augustDays = grid.filter((d) => d.date >= '2026-08-01' && d.date <= '2026-08-31');
    expect(augustDays).toHaveLength(31);
    expect(augustDays.every((d) => d.inCurrentMonth)).toBe(true);
  });

  it('marks days outside the target month as inCurrentMonth: false', () => {
    const grid = monthGrid(2026, 7);
    const outside = grid.filter((d) => d.date < '2026-08-01' || d.date > '2026-08-31');
    expect(outside.every((d) => !d.inCurrentMonth)).toBe(true);
  });

  it('produces dates in strict chronological order with no gaps', () => {
    const grid = monthGrid(2026, 7);
    for (let i = 1; i < grid.length; i++) {
      const prev = new Date(grid[i - 1].date);
      const curr = new Date(grid[i].date);
      expect((curr.getTime() - prev.getTime()) / 86_400_000).toBe(1);
    }
  });

  it('always starts the grid on Sunday', () => {
    for (const [year, month] of [[2026, 0], [2026, 1], [2026, 7], [2027, 11], [2024, 1], [2026, 11]]) {
      const grid = monthGrid(year, month);
      expect(new Date(grid[0].date + 'T00:00:00Z').getUTCDay()).toBe(0);
    }
  });
});
