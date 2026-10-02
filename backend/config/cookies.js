/**
 * config/cookies.js
 *
 * Options for the auth cookie, shared by login (set) and logout (clear) so
 * they always match.
 *
 * Development: the frontend (localhost:5173) and backend (localhost:5175) are
 * the SAME SITE (ports don't count), so a SameSite=Lax cookie is sent.
 *
 * Production: the frontend (*.azurestaticapps.net) and backend
 * (*.azurewebsites.net) are DIFFERENT SITES. Browsers only send a cookie on
 * cross-site requests when it is SameSite=None and Secure (HTTPS only).
 * Partitioned (CHIPS) ties the cookie to the frontend's site, which lets it
 * work in browsers that restrict third-party cookies.
 */
export function authCookieOptions() {
  if (process.env.NODE_ENV === 'production') {
    return { httpOnly: true, secure: true, sameSite: 'none', partitioned: true };
  }
  return { httpOnly: true, secure: false, sameSite: 'lax' };
}
