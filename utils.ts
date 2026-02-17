export const formatDate = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

export const formatDateMMDDYYYY = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

export const formatTimeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return formatDate(isoString);
};

export const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const truncated = numbers.substring(0, 10);
  
  const char = { 0: '(', 3: ') ', 6: '-' };
  let formatted = '';
  for (let i = 0; i < truncated.length; i++) {
    // @ts-ignore
    formatted += (char[i] || '') + truncated[i];
  }
  return formatted;
};

export const isValidPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.length === 10;
};