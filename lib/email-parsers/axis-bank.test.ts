import { describe, it, expect } from 'vitest';
import { parseAxisBankEmail } from './axis-bank';

// Real sample, forwarded 2026-08-23 (see the design spec's "Real sample" section)
// — the pipe/table artifacts are exactly what Gmail's HTML-table email produces
// once run through this parser's html-to-text step, so the parser must be
// tolerant of them, not just of clean text.
const REAL_SAMPLE = `
| | Untitled |
| |
| 21-08-2026 |
| Dear Potluri Chinmayi, Here's the summary of your transaction: |
| |
| | Amount Debited: INR 347.00 |
| | Account Number: XX8423 |
| | Date & Time: 21-08-26, 14:20:55 IST |
| | Transaction Info: UPI/P2M/659988042585/SWIGGY |
| |
`;

describe('parseAxisBankEmail', () => {
  it('extracts amount and merchant from the real sample email', () => {
    const result = parseAxisBankEmail(REAL_SAMPLE);

    expect(result).not.toBeNull();
    expect(result?.amount).toBe(347.00);
    expect(result?.merchant).toBe('SWIGGY');
  });

  it('handles amounts with thousands separators', () => {
    const result = parseAxisBankEmail('Amount Debited: INR 1,234.56\nTransaction Info: UPI/P2M/123/AMAZON');

    expect(result?.amount).toBe(1234.56);
    expect(result?.merchant).toBe('AMAZON');
  });

  it('returns null when the email does not match the expected format at all', () => {
    const result = parseAxisBankEmail('This is not a transaction email.');

    expect(result).toBeNull();
  });

  it('still returns the amount when Transaction Info is missing (merchant null, not a crash)', () => {
    const result = parseAxisBankEmail('Amount Debited: INR 50.00');

    expect(result?.amount).toBe(50.00);
    expect(result?.merchant).toBeNull();
  });
});
