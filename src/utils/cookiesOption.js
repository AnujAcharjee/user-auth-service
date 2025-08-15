export const COOKIE_OPTIONS_AT = {
  httpOnly: true, // not accessible via JavaScript
  secure: process.env.IS_PRODUCTION, // not accessible via JavaScript
  sameSite: "Strict",
  path: process.env.COOKIE_PATH_AT, // specific path for refresh token
};

export const COOKIE_OPTIONS_RT = {
  httpOnly: true, // not accessible via JavaScript
  secure: process.env.IS_PRODUCTION, // not accessible via JavaScript
  sameSite: "Strict",
  path: process.env.COOKIE_PATH_RT, // specific path for refresh token
};
