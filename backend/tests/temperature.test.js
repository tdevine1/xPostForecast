/**
 * Tests for GET /temperature/:date and the grid-sampling helper.
 *
 * Planetary Computer is replaced with a fake `fetch`, and geotiff with a fake
 * image, so these tests are fast and work offline.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { fromArrayBuffer } from 'geotiff';
import app from '../app.js';
import { BBOX, c2f, samplePoints } from '../routes/stac.js';

vi.mock('../config/database.js', () => ({ default: { execute: vi.fn() } }));
vi.mock('geotiff', () => ({ fromArrayBuffer: vi.fn() }));

const SECRET = 'test-secret';
const authCookie = () => `token=${jwt.sign({ id: 1, username: 'alice' }, SECRET)}`;

/** A fake GeoTIFF image: a 0.5° grid whose top-left corner is at (-83, 41), every cell 20 °C. */
function fakeImage() {
  return {
    getOrigin: () => [-83, 41],
    getResolution: () => [0.5, -0.5],
    getWidth: () => 20,
    getHeight: () => 20,
    getGDALNoData: () => null,
    readRasters: async ({ window: [x0, y0, x1, y1] }) => [new Float32Array((x1 - x0) * (y1 - y0)).fill(20)],
  };
}

/** Fake Planetary Computer. `features` is what the STAC search returns. */
function fakePlanetaryComputer({ features, stacStatus = 200 } = {}) {
  return vi.fn(async (url) => {
    url = String(url);
    if (url.includes('/stac/v1/search')) {
      return Response.json({ features }, { status: stacStatus });
    }
    if (url.includes('/sas/v1/sign')) {
      const href = new URL(url).searchParams.get('href');
      return Response.json({ href: `${href}?sas=token` });
    }
    return new Response(new ArrayBuffer(8)); // the GeoTIFF download
  });
}

const ITEM = {
  id: 'nclimgrid-test',
  // tavg is deliberately NOT first: the code must pick it by name
  assets: {
    prcp: { href: 'https://blob.example/prcp.tif' },
    tavg: { href: 'https://blob.example/tavg.tif' },
  },
};

beforeEach(() => {
  vi.stubEnv('JWT_SECRET', SECRET);
  fromArrayBuffer.mockResolvedValue({ getImage: async () => fakeImage() });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('GET /temperature/:date', () => {
  it('requires login', async () => {
    const fetchSpy = fakePlanetaryComputer({ features: [ITEM] });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await request(app).get('/temperature/2020-01-01');
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a malformed date', async () => {
    const res = await request(app).get('/temperature/2020-13-01').set('Cookie', authCookie());
    expect(res.status).toBe(400);
  });

  it('returns °F points for the tavg asset, chosen by name', async () => {
    const fetchSpy = fakePlanetaryComputer({ features: [ITEM] });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await request(app).get('/temperature/2020-02-01').set('Cookie', authCookie());

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].tavg).toBe(68); // 20 °C
    const urls = fetchSpy.mock.calls.map(([url]) => String(url));
    expect(urls.some((u) => u.includes(encodeURIComponent(ITEM.assets.tavg.href)))).toBe(true);
    expect(urls.some((u) => u.includes('prcp'))).toBe(false);
  });

  it('caches each month so repeat requests skip Planetary Computer', async () => {
    const fetchSpy = fakePlanetaryComputer({ features: [ITEM] });
    vi.stubGlobal('fetch', fetchSpy);

    await request(app).get('/temperature/2020-03-01').set('Cookie', authCookie());
    const callsAfterFirst = fetchSpy.mock.calls.length;
    const res = await request(app).get('/temperature/2020-03-20').set('Cookie', authCookie());

    expect(res.status).toBe(200);
    expect(fetchSpy.mock.calls.length).toBe(callsAfterFirst);
  });

  it('returns 404 when the dataset has no item for that month', async () => {
    vi.stubGlobal('fetch', fakePlanetaryComputer({ features: [] }));
    const res = await request(app).get('/temperature/2022-12-01').set('Cookie', authCookie());
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/2022-12/);
  });

  it('returns 502 when Planetary Computer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', fakePlanetaryComputer({ features: [], stacStatus: 503 }));
    const res = await request(app).get('/temperature/2020-04-01').set('Cookie', authCookie());
    expect(res.status).toBe(502);
  });
});

describe('samplePoints', () => {
  // 3 x 2 grid of 1° cells; top-left corner at (-80, 40)
  const grid = {
    values: Float32Array.from([0, NaN, 10, -999, 100, 30]),
    width: 3,
    height: 2,
    west: -80,
    north: 40,
    pixelWidth: 1,
    pixelHeight: 1,
    noData: -999,
  };

  it('returns cell centers in °F and skips NaN and no-data cells', () => {
    const points = samplePoints(grid, [-80, 38, -77, 40]);
    expect(points).toEqual([
      { lat: 39.5, lon: -79.5, tavg: 32 },
      { lat: 39.5, lon: -77.5, tavg: 50 },
      { lat: 38.5, lon: -78.5, tavg: 212 },
      { lat: 38.5, lon: -77.5, tavg: 86 },
    ]);
  });

  it('drops cells whose center is outside the box', () => {
    const points = samplePoints(grid, [-80, 39, -78, 40]);
    expect(points).toEqual([{ lat: 39.5, lon: -79.5, tavg: 32 }]);
  });

  it('converts Celsius to Fahrenheit and exposes the West Virginia box', () => {
    expect(BBOX).toEqual([-82.644739, 37.201483, -77.719519, 40.638801]);
    expect(c2f(100)).toBe(212);
  });
});
