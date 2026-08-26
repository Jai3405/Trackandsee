import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  it('fires onClick when Enter or Space is pressed on the card itself', () => {
    const onClick = vi.fn();
    render(<PinnedCard id="z" onClick={onClick}>Clickable card</PinnedCard>);
    const card = screen.getByRole('button', { name: /clickable card/i });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not fire the card onClick when a keydown bubbles up from a nested interactive child (Expenses Delete-button pattern)', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <PinnedCard id="w" onClick={onClick}>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button>
      </PinnedCard>,
    );
    // Both the card (role="button") and the nested <button> compute an
    // accessible name of "Delete" here, so getByRole can't disambiguate —
    // query the real <button> element directly instead.
    const deleteButton = container.querySelector('button') as HTMLButtonElement;
    expect(deleteButton).not.toBeNull();
    fireEvent.keyDown(deleteButton, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });
});
