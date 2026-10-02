/**
 * sign/sign.js
 *
 * Microsoft Planetary Computer stores its data files (here, Cloud Optimized
 * GeoTIFFs) in Azure Blob Storage, which only allows downloads with a
 * short-lived SAS token. The free signing endpoint adds that token to a URL.
 * No API key is needed.
 */

const SIGN_ENDPOINT = 'https://planetarycomputer.microsoft.com/api/sas/v1/sign';

/**
 * Returns a signed, temporarily downloadable version of a Planetary Computer asset URL.
 * @param {string} href - Unsigned asset URL from a STAC item
 * @returns {Promise<string>} The same URL with a SAS token appended
 * @throws {Error} If the signing service fails or returns no URL
 */
export async function signUrl(href) {
  const res = await fetch(`${SIGN_ENDPOINT}?href=${encodeURIComponent(href)}`);
  if (!res.ok) {
    throw new Error(`Failed to sign URL: ${res.status} ${await res.text()}`);
  }

  const json = await res.json(); // { href: '<signed url>', 'msft:expiry': '<timestamp>' }
  if (!json.href) {
    throw new Error('Signing service response had no href');
  }
  return json.href;
}
