export const COOKIE_OPTIONS_AT = {
  httpOnly: true,
  secure: process.env.IS_PRODUCTION === "true",
  sameSite: "Strict",
  maxAge: 30 * 60 * 1000, // 30 minutes
  // maxAge: 60 * 1000, // 30 minutes
  // signed: true,
  path: '/',
  domain: "localhost",
};

export const COOKIE_OPTIONS_RT = {
  httpOnly: true,
  secure: process.env.IS_PRODUCTION === "true",
  sameSite: "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // signed: true,
  path: '/',
  domain: "localhost",
};
