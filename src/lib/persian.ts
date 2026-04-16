// Detect Persian/Arabic script in a string so the UI can apply the Vazirmatn font.
const PERSIAN_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function hasPersian(text: string): boolean {
  return PERSIAN_RE.test(text);
}

// Returns 'rtl' or 'ltr' based on content for a given text field.
export function dirFor(text: string): 'rtl' | 'ltr' {
  return hasPersian(text) ? 'rtl' : 'ltr';
}
