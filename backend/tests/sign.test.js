/**
 * Tests for sign/sign.js: the check that only Azure Blob Storage URLs are used,
 * and the call to Planetary Computer's signing service (replaced by a fake `fetch`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertTrustedAssetUrl, signUrl } from '../sign/sign.js';

const GOOD = 'https://example.blob.core.windows.net/data/tavg.tif';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('assertTrustedAssetUrl', () => {
  it('accepts an https Azure Blob Storage URL', () => {
    expect(assertTrustedAssetUrl(GOOD)).toBe(GOOD);
  });

  it.each([
    ['plain http', 'http://example.blob.core.windows.net/a.tif'],
    ['another host', 'https://example.com/a.tif'],
    ['a cloud metadata address', 'http://169.254.169.254/latest/meta-data'],
    ['a look-alike host', 'https://blob.core.windows.net.evil.example/a.tif'],
    ['credentials hiding the real host', 'https://example.blob.core.windows.net@evil.example/a.tif'],
  ])('rejects %s', (_label, href) => {
    expect(() => assertTrustedAssetUrl(href)).toThrow(/untrusted host/);
  });

  it('rejects text that is not a URL', () => {
    expect(() => assertTrustedAssetUrl('not a url')).toThrow(/not a valid URL/);
  });
});

describe('signUrl', () => {
  it('returns the signed URL from the signing service', async () => {
    const fetchSpy = vi.fn(async () => Response.json({ href: `${GOOD}?sas=token` }));
    vi.stubGlobal('fetch', fetchSpy);

    await expect(signUrl(GOOD)).resolves.toBe(`${GOOD}?sas=token`);
    expect(String(fetchSpy.mock.calls[0][0])).toContain(encodeURIComponent(GOOD));
  });

  it('does not call the signing service for an untrusted URL', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(signUrl('https://example.com/a.tif')).rejects.toThrow(/untrusted host/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('throws when the signing service answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('busy', { status: 503 })));
    await expect(signUrl(GOOD)).rejects.toThrow(/Failed to sign URL: 503/);
  });

  it('throws when the response has no href', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})));
    await expect(signUrl(GOOD)).rejects.toThrow(/no href/);
  });

  it('refuses a signed URL that points somewhere else', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ href: 'https://evil.example/a.tif' })));
    await expect(signUrl(GOOD)).rejects.toThrow(/untrusted host/);
  });
});
