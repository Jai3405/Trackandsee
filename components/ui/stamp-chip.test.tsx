import { render, screen } from '@testing-library/react';
import { StampChip } from './stamp-chip';

it('renders the label', () => {
  render(<StampChip label="Renovation" />);
  expect(screen.getByText('Renovation')).toBeInTheDocument();
});
