import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

it('applies the tone-specific background', () => {
  render(<StatusBadge tone="sage" />);
  expect(screen.getByRole('status')).toHaveClass('bg-sage');
});
