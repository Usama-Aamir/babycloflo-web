export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPakistaniPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  // Local mobile: 03XX XXXXXXX (11 digits)
  if (digits.startsWith("03") && digits.length === 11) {
    return true;
  }

  // International without plus: 923XX XXXXXXX (12 digits)
  if (digits.startsWith("923") && digits.length === 12) {
    return true;
  }

  return false;
}
