import { describe, it, expect } from 'vitest';
import { extractPlainText, type GmailMessage } from './gmail-message';

function b64url(text: string): string {
  return Buffer.from(text, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('extractPlainText', () => {
  it('prefers a text/plain part when present', () => {
    const message: GmailMessage = {
      id: 'm1',
      payload: {
        mimeType: 'multipart/alternative',
        parts: [
          { mimeType: 'text/plain', body: { data: b64url('Amount Debited: INR 100.00') } },
          { mimeType: 'text/html', body: { data: b64url('<p>Amount Debited: INR 999.00</p>') } },
        ],
      },
    };

    expect(extractPlainText(message)).toBe('Amount Debited: INR 100.00');
  });

  it('falls back to stripping tags from text/html when no text/plain part exists', () => {
    const message: GmailMessage = {
      id: 'm2',
      payload: {
        mimeType: 'text/html',
        body: { data: b64url('<p>Amount Debited: <b>INR 347.00</b></p>') },
      },
    };

    expect(extractPlainText(message)).toBe('Amount Debited: INR 347.00');
  });

  it('returns an empty string when no usable part is found', () => {
    const message: GmailMessage = { id: 'm3', payload: { mimeType: 'multipart/mixed', parts: [] } };

    expect(extractPlainText(message)).toBe('');
  });
});
