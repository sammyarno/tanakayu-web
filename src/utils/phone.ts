/** Normalize phone number to 62xxx format (no + prefix, no leading 0) */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+62')) return trimmed.slice(1);
  if (trimmed.startsWith('62')) return trimmed;
  if (trimmed.startsWith('0')) return `62${trimmed.slice(1)}`;
  return trimmed;
}
