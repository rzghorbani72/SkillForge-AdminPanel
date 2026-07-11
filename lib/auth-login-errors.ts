export function isUserNotRegisteredError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('user not registered') ||
    normalized.includes('no account found for this phone') ||
    message.includes('ثبت نشده') ||
    message.includes('حسابی با این شماره')
  );
}
