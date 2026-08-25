export interface ParsedTransaction {
  amount: number;
  merchant: string | null;
}

// Ground truth: a real Axis Bank UPI-debit alert (see the design spec's
// "Real sample" section). Gmail's HTML-table layout survives into the
// extracted text as pipe-delimited noise around each field — this parser
// matches on the label text itself, not line position, so it's tolerant of
// that noise.
export function parseAxisBankEmail(body: string): ParsedTransaction | null {
  const amountMatch = body.match(/Amount Debited:\s*INR\s*([\d,]+\.\d{2})/i);
  if (!amountMatch) return null;
  const amount = Number(amountMatch[1].replace(/,/g, ''));

  const infoMatch = body.match(/Transaction Info:\s*([^\n|]+)/i);
  let merchant: string | null = null;
  if (infoMatch) {
    const segments = infoMatch[1].trim().split('/');
    merchant = segments[segments.length - 1].trim() || null;
  }

  return { amount, merchant };
}
