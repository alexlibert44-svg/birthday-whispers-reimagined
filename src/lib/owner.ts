/**
 * Anonymous owner key. No account, no email, no password: the browser keeps a
 * random secret, the server only ever stores its hash. Saved in localStorage
 * AND in a long-lived cookie so it survives one of the two being cleared.
 */
const KEY = "lumiere.owner.v1";
const COOKIE = "lumiere_owner";
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR * 5}; samesite=lax`;
}

function randomKey(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  );
}

/** Returns the stable owner key for this browser, creating it on first use. */
export function getOwnerKey(): string {
  if (typeof window === "undefined") return "";
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(KEY);
  } catch {
    /* storage blocked */
  }
  const value = stored || readCookie() || randomKey();
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* storage blocked */
  }
  writeCookie(value);
  return value;
}
