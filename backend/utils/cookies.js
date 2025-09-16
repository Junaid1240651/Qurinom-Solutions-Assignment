// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,           // Prevent XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/'
};

export const setTokenCookie = (res, token) => {
  res.cookie('token', token, COOKIE_OPTIONS);
};

export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

export const getTokenFromCookies = (req) => {
  return req.cookies?.token || null;
};
