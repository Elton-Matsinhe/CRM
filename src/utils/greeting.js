const TIMEZONE = 'Africa/Maputo';

export const getGreetingKey = () => {
  const hour = parseInt(
    new Intl.DateTimeFormat('pt-PT', {
      hour: 'numeric',
      hour12: false,
      timeZone: TIMEZONE,
    }).format(new Date()),
    10
  );

  if (hour >= 5 && hour < 12) return 'greeting.morning';
  if (hour >= 12 && hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
};

export const getFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'Utilizador';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  return parts[0] || 'Utilizador';
};
