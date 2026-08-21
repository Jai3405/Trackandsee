import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';

it('renders title, description, and optional action', () => {
  render(<EmptyState title="Nothing here yet" description="Add your first goal." action={<button>Add</button>} />);
  expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
});
