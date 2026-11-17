/**
 * sign/sign.js
 *
 * Microsoft Planetary Computer stores its data files (here, Cloud Optimized
 * GeoTIFFs) in Azure Blob Storage, which only allows downloads with a
 * short-lived SAS token. The free signing endpoint adds that token to a URL.
 * No API key is needed.
 */

const SIGN_ENDPOINT = 'https://planetarycomputer.microsoft.com/api/sas/v1/sign';

/** Planetary Computer's data files live in Azure Blob Storage, so every file URL ends with this host suffix. */
const TRUSTED_HOST_SUFFIX = '.blob.core.windows.net';

/**
 * Checks that a URL is one this server is willing to request: HTTPS, on Azure Blob Storage.
 *
 * The URL comes from another service's JSON, so it is treated as untrusted input. Without this
 * check, a bad or tampered response could make our server fetch any address it can reach
 * (a "server-side request forgery").
 * @param {string} href - URL taken from an outside service's response
 * @returns {string} The same URL, normalized
 * @throws {Error} If the URL is malformed, not HTTPS, or not on Azure Blob Storage
 */
export function assertTrustedAssetUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    throw new Error('Asset URL is not a valid URL');
  }
  if (url.protocol !== 'https:' || !url.hostname.endsWith(TRUSTED_HOST_SUFFIX)) {
    throw new Error(`Refusing to request an untrusted host: ${url.hostname}`);
  }
  return url.href;
}

/**
 * Returns a signed, temporarily downloadable version of a Planetary Computer asset URL.
 * @param {string} href - Unsigned asset URL from a STAC item
 * @returns {Promise<string>} The same URL with a SAS token appended
 * @throws {Error} If the URL isn't a trusted Blob Storage URL, or the signing service fails or returns no URL
 */
export async function signUrl(href) {
  const trustedHref = assertTrustedAssetUrl(href);
  const res = await fetch(`${SIGN_ENDPOINT}?href=${encodeURIComponent(trustedHref)}`);
  if (!res.ok) {
    throw new Error(`Failed to sign URL: ${res.status} ${await res.text()}`);
  }

  const json = await res.json(); // { href: '<signed url>', 'msft:expiry': '<timestamp>' }
  if (!json.href) {
    throw new Error('Signing service response had no href');
  }
  return assertTrustedAssetUrl(json.href); // never download from a host we don't recognize
}
