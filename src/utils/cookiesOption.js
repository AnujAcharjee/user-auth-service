export const COOKIE_OPTIONS_AT = {
  httpOnly: true,
  secure: process.env.IS_PRODUCTION,
  sameSite: "Strict",
  maxAge: 60 * 60 * 1000, // 1 hour,
  path: '/api/user',
  domain: "localhost",
};

export const COOKIE_OPTIONS_RT = {
  httpOnly: true,
  secure: process.env.IS_PRODUCTION,
  sameSite: "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/user',
  domain: "localhost",
};
