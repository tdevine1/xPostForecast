/**
 * routes/stac.js
 *
 * GET /temperature/:date (mounted at /temperature in app.js, behind authMiddleware)
 *
 * Returns West Virginia's average temperature for one month as a grid of points,
 * from NOAA's nClimGrid monthly dataset hosted on Microsoft Planetary Computer:
 *
 *  1. Validate :date (YYYY-MM-DD; only the year and month are used)
 *  2. STAC search: find the dataset item for that month
 *  3. Pick the item's `tavg` (average temperature) asset and sign its URL
 *  4. Download the Cloud Optimized GeoTIFF and decode only the West Virginia
 *     part of it with geotiff.js
 *  5. Convert each grid cell inside the WV bounding box to { lat, lon, tavg °F }
 *
 * Results are cached in memory by month, so repeat requests skip steps 2-5.
 *
 * Response: [ { "lat": 38.9375, "lon": -80.2292, "tavg": 54.1 }, ... ]
 */

import express from 'express';
import { fromArrayBuffer } from 'geotiff';
import { signUrl } from '../sign/sign.js';

const router = express.Router();

/** STAC search endpoint for Microsoft Planetary Computer */
const STAC_SEARCH = 'https://planetarycomputer.microsoft.com/api/stac/v1/search';

/** nClimGrid monthly collection, and the asset (band file) we want from each item */
const COLLECTION = 'noaa-nclimgrid-monthly';
const ASSET_KEY = 'tavg'; // other assets: prcp, tmax, tmin

/** Bounding box for West Virginia: [west, south, east, north] in degrees */
export const BBOX = [-82.644739, 37.201483, -77.719519, 40.638801];

/** Safety cap on points returned (the WV box is about 9,800 cells) */
const MAX_POINTS = 10000;

/** In-memory cache: 'YYYY-MM' -> points. Historical data never changes. */
const cache = new Map();
const CACHE_LIMIT = 24; // months to keep; the oldest entry is dropped first

/**
 * Convert Celsius to Fahrenheit.
 * @param {number} c - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export function c2f(c) {
  return (c * 9) / 5 + 32;
}

/**
 * Downloads a GeoTIFF and reads the block of raster cells covering a bounding box.
 *
 * A Cloud Optimized GeoTIFF is stored in tiles, so a client could request
 * just the tiles it needs (geotiff.js's fromUrl does this with HTTP range
 * requests). These files are small (about 1.2 MB for the whole U.S.), and one
 * download proved faster and more predictable than many small requests, so we
 * download it all and decode only the tiles inside the box.
 *
 * @param {string} url - Signed GeoTIFF URL
 * @param {number[]} bbox - [west, south, east, north]
 * @returns {Promise<object>} Grid: { values, width, height, west, north, pixelWidth, pixelHeight, noData }
 */
async function readGrid(url, bbox) {
  const [west, south, east, north] = bbox;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GeoTIFF download failed: ${res.status}`);
  }
  const tiff = await fromArrayBuffer(await res.arrayBuffer());
  const image = await tiff.getImage();

  const [originX, originY] = image.getOrigin(); // top-left corner of the whole raster
  const [pixelWidth, negPixelHeight] = image.getResolution(); // degrees per cell
  const pixelHeight = Math.abs(negPixelHeight); // y resolution is negative: rows go south

  // Column (x) and row (y) range overlapping the box, clamped to the raster.
  // The window's end index is exclusive, hence the + 1.
  const clamp = (v, max) => Math.min(Math.max(v, 0), max);
  const x0 = clamp(Math.floor((west - originX) / pixelWidth), image.getWidth());
  const x1 = clamp(Math.floor((east - originX) / pixelWidth) + 1, image.getWidth());
  const y0 = clamp(Math.floor((originY - north) / pixelHeight), image.getHeight());
  const y1 = clamp(Math.floor((originY - south) / pixelHeight) + 1, image.getHeight());

  const [values] = await image.readRasters({ window: [x0, y0, x1, y1] }); // band 1, row by row

  return {
    values,
    width: x1 - x0,
    height: y1 - y0,
    west: originX + x0 * pixelWidth,   // left edge of the window
    north: originY - y0 * pixelHeight, // top edge of the window
    pixelWidth,
    pixelHeight,
    noData: image.getGDALNoData(),
  };
}

/**
 * Turns grid cells into map points, keeping cells whose CENTER is inside the box.
 *
 * @param {object} grid - From readGrid: values are row by row, starting at the top-left
 * @param {number[]} bbox - [west, south, east, north]
 * @returns {{lat: number, lon: number, tavg: number}[]} Points with temperatures in °F
 */
export function samplePoints(grid, bbox) {
  const [west, south, east, north] = bbox;
  const points = [];

  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      const celsius = grid.values[row * grid.width + col];
      if (Number.isNaN(celsius) || celsius === grid.noData) continue; // no data for this cell

      // Cell center: half a cell in from the cell's top-left corner
      const lon = grid.west + (col + 0.5) * grid.pixelWidth;
      const lat = grid.north - (row + 0.5) * grid.pixelHeight;
      if (lon < west || lon > east || lat < south || lat > north) continue;

      points.push({ lat, lon, tavg: c2f(celsius) });
      if (points.length >= MAX_POINTS) return points;
    }
  }
  return points;
}

/**
 * Fetches and samples one month of data from Planetary Computer.
 * @param {string} yearMonth - 'YYYY-MM'
 * @returns {Promise<object[]|null>} Points, or null if the dataset has no item for that month
 * @throws {Error} If Planetary Computer can't be reached or returns something unexpected
 */
async function loadMonth(yearMonth) {
  // nClimGrid items cover a whole month, so any instant inside the month finds it; use the 15th
  const stacRes = await fetch(STAC_SEARCH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collections: [COLLECTION],
      bbox: BBOX,
      datetime: `${yearMonth}-15T00:00:00Z`,
    }),
  });
  if (!stacRes.ok) {
    throw new Error(`STAC search failed: ${stacRes.status} ${await stacRes.text()}`);
  }

  const stacJson = await stacRes.json();
  const item = stacJson.features?.[0];
  if (!item) return null; // no data published for this month

  // Look the asset up by name; its position in the list is not guaranteed
  const asset = item.assets?.[ASSET_KEY];
  if (!asset) {
    throw new Error(`STAC item ${item.id} has no "${ASSET_KEY}" asset`);
  }

  const signedHref = await signUrl(asset.href);
  const grid = await readGrid(signedHref, BBOX);
  return samplePoints(grid, BBOX);
}

router.get('/:date', async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  }
  const yearMonth = date.slice(0, 7);

  if (cache.has(yearMonth)) {
    return res.json(cache.get(yearMonth));
  }

  let points;
  try {
    points = await loadMonth(yearMonth);
  } catch (error) {
    // Problem with an outside service, not with the request: 502 Bad Gateway
    console.error('Error fetching temperature data:', error);
    return res.status(502).json({ error: 'The temperature data service is unavailable. Try again later.' });
  }

  if (!points) {
    return res.status(404).json({ error: `No temperature data is available for ${yearMonth}` });
  }

  cache.set(yearMonth, points);
  if (cache.size > CACHE_LIMIT) {
    cache.delete(cache.keys().next().value); // Maps keep insertion order: first key is oldest
  }

  res.json(points);
});

export default router;
