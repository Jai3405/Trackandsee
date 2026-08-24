export interface CalendarDay {
  date: string; // YYYY-MM-DD
  inCurrentMonth: boolean;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// month is 0-indexed (JS Date convention: January = 0). Always returns a
// multiple-of-7-length grid starting on a Sunday, trimmed to 5 weeks when the
// 6th row would be entirely the next month.
export function monthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const firstWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(year, month, 1 - firstWeekday + i));
    days.push({ date: toISODate(d), inCurrentMonth: d.getUTCMonth() === month });
  }

  while (days.length > 35 && !days.slice(-7).some((day) => day.inCurrentMonth)) {
    days.splice(-7, 7);
  }

  return days;
}
