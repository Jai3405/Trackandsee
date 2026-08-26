import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PinnedCard, pinRotation } from './pinned-card';

describe('pinRotation', () => {
  it('is deterministic for the same id', () => {
    expect(pinRotation('goal-1')).toBe(pinRotation('goal-1'));
  });

  it('stays within a small, board-plausible range', () => {
    for (const id of ['a', 'goal-1', 'expense-42', 'x'.repeat(20), '']) {
      const r = pinRotation(id);
      expect(r).toBeGreaterThanOrEqual(-4);
      expect(r).toBeLessThanOrEqual(4);
    }
  });

  it('varies across different ids (not a constant)', () => {
    const values = new Set(['a', 'b', 'c', 'd', 'e'].map(pinRotation));
    expect(values.size).toBeGreaterThan(1);
  });
});

describe('PinnedCard', () => {
  it('renders children and an optional kind label', () => {
    render(<PinnedCard id="x" kindLabel="Investment">Vintage lamp</PinnedCard>);
    expect(screen.getByText('Vintage lamp')).toBeInTheDocument();
    expect(screen.getByText('Investment')).toBeInTheDocument();
  });

  it('renders without a kind label when none is given', () => {
    render(<PinnedCard id="y">Plain card</PinnedCard>);
    expect(screen.getByText('Plain card')).toBeInTheDocument();
  });
});
