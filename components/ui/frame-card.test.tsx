import { render, screen } from '@testing-library/react';
import { FrameCard } from './frame-card';

it('renders children inside a rounded frame', () => {
  render(<FrameCard>hello</FrameCard>);
  expect(screen.getByText('hello')).toBeInTheDocument();
});
