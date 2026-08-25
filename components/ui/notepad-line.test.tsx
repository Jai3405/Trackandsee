import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotepadLine } from './notepad-line';
import type { Task } from '@/lib/db/types';

const task: Task = {
  id: 't1', user_id: 'u1', goal_id: null, title: 'Source fabric samples', kind: 'task',
  done: false, due_date: null, created_at: '', updated_at: '', deleted_at: null,
};

describe('NotepadLine', () => {
  it('shows the checkbox instantly checked on click, before the parent re-renders', () => {
    const onToggle = vi.fn();
    render(<NotepadLine task={task} onToggle={onToggle} />);
    const checkbox = screen.getByLabelText('Source fabric samples') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(onToggle).toHaveBeenCalledWith(task);
  });

  it('shows the linked goal label when provided', () => {
    render(<NotepadLine task={task} onToggle={() => {}} goalLabel="Spring collection" />);
    expect(screen.getByText('Spring collection')).toBeInTheDocument();
  });

  it('renders without a goal label when none is given', () => {
    render(<NotepadLine task={task} onToggle={() => {}} />);
    expect(screen.queryByText('Spring collection')).not.toBeInTheDocument();
  });
});
