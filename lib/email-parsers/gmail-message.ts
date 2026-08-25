export interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function findPart(part: GmailMessagePart | undefined, mimeType: string): GmailMessagePart | null {
  if (!part) return null;
  if (part.mimeType === mimeType && part.body?.data) return part;
  for (const child of part.parts ?? []) {
    const found = findPart(child, mimeType);
    if (found) return found;
  }
  return null;
}

export function extractPlainText(message: GmailMessage): string {
  const plainPart = findPart(message.payload, 'text/plain');
  if (plainPart?.body?.data) return decodeBase64Url(plainPart.body.data);

  const htmlPart = findPart(message.payload, 'text/html');
  if (htmlPart?.body?.data) {
    const html = decodeBase64Url(htmlPart.body.data);
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}
