// Common utility functions for role and status handling

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '👑';
    case 'MANAGER':
      return '🛡️';
    case 'TEACHER':
      return '🎓';
    case 'STUDENT':
      return '👤';
    default:
      return '👤';
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800';
    case 'MANAGER':
      return 'bg-blue-100 text-blue-800';
    case 'TEACHER':
      return 'bg-green-100 text-green-800';
    case 'STUDENT':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'SUSPENDED':
      return 'bg-yellow-100 text-yellow-800';
    case 'BANNED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

export const formatDuration = (seconds?: number) => {
  if (!seconds) return 'Unknown';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
