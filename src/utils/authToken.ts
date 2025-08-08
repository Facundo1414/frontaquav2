// utils/authToken.ts
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};