// ponytail: a hand-maintained keyword list, not real categorization —
// grows by adding entries as new merchants show up in review. This is the
// documented ceiling of the zero-cost, no-LLM approach chosen for this
// feature (see the design spec's "Extraction method" decision).
const CATEGORY_KEYWORDS: [string, string][] = [
  ['swiggy', 'Food'],
  ['zomato', 'Food'],
  ['uber', 'Transport'],
  ['ola', 'Transport'],
  ['amazon', 'Shopping'],
  ['myntra', 'Shopping'],
  ['flipkart', 'Shopping'],
];

export function categorize(merchant: string): string | null {
  const key = merchant.toLowerCase();
  for (const [keyword, category] of CATEGORY_KEYWORDS) {
    if (key.includes(keyword)) return category;
  }
  return null;
}
