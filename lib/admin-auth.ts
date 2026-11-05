/**
 * Checks the Cloudflare Access login on /admin and /api/admin requests.
 *
 * Access sits in front of those paths and does the sign-in (a one-time email code).
 * This check makes the app refuse anything that did not come through Access, so the
 * admin stays locked even when someone goes round Cloudflare to the Netlify address
 * directly. With ACCESS_TEAM_DOMAIN or ACCESS_AUD unset, it refuses everything.
 *
 * Same environment variables as the lachlankorpar site:
 *   ACCESS_TEAM_DOMAIN  https://<team-name>.cloudflareaccess.com
 *   ACCESS_AUD          the Access application's Audience (AUD) tag
 *   ADMIN_EMAILS        optional comma-separated allow list, a second check on top of Access
 *   DEV_ADMIN_BYPASS    'true' skips the login on localhost only (local development)
 */

interface AccessKey extends JsonWebKey {
  kid?: string;
}

let certCache: { at: number; keys: AccessKey[] } = { at: 0, keys: [] };

const SIGN_IN_MESSAGE = 'Not signed in. Open /admin to log in.';

function b64urlBytes(s: string): Uint8Array<ArrayBuffer> {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function b64urlJson(s: string): Record<string, any> {
  return JSON.parse(new TextDecoder().decode(b64urlBytes(s)));
}

async function accessKeys(team: string, force = false): Promise<AccessKey[]> {
  if (!force && certCache.keys.length && Date.now() - certCache.at < 3_600_000) return certCache.keys;
  const res = await fetch(`${team}/cdn-cgi/access/certs`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`certs ${res.status}`);
  certCache = { at: Date.now(), keys: ((await res.json()) as { keys?: AccessKey[] }).keys || [] };
  return certCache.keys;
}

/** Test helper: forget the cached Cloudflare signing keys */
export function resetAccessKeyCache() {
  certCache = { at: 0, keys: [] };
}

function tokenFrom(headers: Headers): string {
  const header = headers.get('Cf-Access-Jwt-Assertion');
  if (header) return header;
  const m = (headers.get('Cookie') || '').match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return m ? m[1] : '';
}

type Verified = { payload: Record<string, any> } | { error: string };

async function verifyJwt(token: string): Promise<Verified> {
  const team = String(process.env.ACCESS_TEAM_DOMAIN || '').replace(/\/+$/, '');
  if (!team) return { error: 'The admin login isn’t configured yet (ACCESS_TEAM_DOMAIN is missing).' };
  if (!token) return { error: SIGN_IN_MESSAGE };

  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return { error: SIGN_IN_MESSAGE };
  const header = b64urlJson(h);
  const payload = b64urlJson(p);
  if (header.alg !== 'RS256') return { error: SIGN_IN_MESSAGE };

  let jwk = (await accessKeys(team)).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await accessKeys(team, true)).find((k) => k.kid === header.kid);
  if (!jwk) return { error: 'Your sign-in wasn’t issued by this site’s login (check ACCESS_TEAM_DOMAIN).' };

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return { error: SIGN_IN_MESSAGE };

  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== team) return { error: 'Your sign-in wasn’t issued by this site’s login (check ACCESS_TEAM_DOMAIN).' };
  if (!payload.exp || payload.exp < now - 60) return { error: 'Your sign-in has expired. Reload the page to sign in again.' };
  if (payload.nbf && payload.nbf > now + 60) return { error: SIGN_IN_MESSAGE };

  // The signature checked out, so the token really came from this team's login. If ACCESS_AUD is
  // missing or wrong, say which value it should be: the AUD tag is not secret (it is in every token).
  const auds: string[] = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!process.env.ACCESS_AUD || !auds.includes(process.env.ACCESS_AUD)) {
    return { error: `Signed in, but ACCESS_AUD isn’t set to this login app’s AUD tag. Set ACCESS_AUD to: ${auds[0]} and redeploy.` };
  }
  return { payload };
}

/** Returns { email } for a signed-in admin, or { error } saying why not */
export async function adminUser(
  headers: Headers,
  hostname: string
): Promise<{ email: string } | { error: string }> {
  // Local development only: DEV_ADMIN_BYPASS=true on localhost
  if (process.env.DEV_ADMIN_BYPASS === 'true' && ['localhost', '127.0.0.1'].includes(hostname)) {
    return { email: 'dev@localhost' };
  }

  let result: Verified;
  try {
    result = await verifyJwt(tokenFrom(headers));
  } catch (err) {
    console.error('Access JWT check failed', err);
    return { error: 'Couldn’t check your sign-in. Try reloading the page.' };
  }
  if ('error' in result) return result;
  const { payload } = result;
  if (!payload.email) return { error: SIGN_IN_MESSAGE };

  // Optional second gate: a comma-separated allow list of admin emails
  const allow = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length && !allow.includes(String(payload.email).toLowerCase())) {
    return { error: `${payload.email} isn’t on the admin list (ADMIN_EMAILS).` };
  }
  return { email: String(payload.email) };
}
