/**
 * @file stac.js
 * @description
 * Express route for retrieving temperature data from the Microsoft Planetary
 * Computer's STAC API using NOAA nClimGrid monthly collections.
 *
 * This route:
 *  1. Validates a date parameter (:date in YYYY-MM-DD format)
 *  2. Builds a STAC search request for the relevant NOAA monthly climate product
 *  3. Signs the returned COG (Cloud Optimized GeoTIFF) using the MPC SAS signing API
 *  4. Downloads and parses the GeoTIFF using georaster
 *  5. Extracts a pixel window covering the West Virginia bounding box
 *  6. Converts raster cell centers into lat/lon points with Fahrenheit temps
 *  7. Returns a JSON array of points suitable for map rendering
 *
 * Tools Used:
 *  - Express.js              (routing)
 *  - node-fetch              (HTTP requests)
 *  - georaster               (parsing COG rasters)
 *  - Microsoft Planetary Computer STAC API
 *  - SAS URL signing for secured COG access
 *
 * Bounding Box:
 *  The WV bounding box is applied in both the STAC search and in raster sampling.
 *
 * Output Format:
 * [
 *   { "lat": 38.93, "lon": -80.21, "tavg": 54.1 },
 *   ...
 * ]
 *
 * This data drives the frontend Leaflet-based temperature map.
 */

import express from 'express';
import fetch from 'node-fetch';
import parseGeoraster from 'georaster';

const router = express.Router();

/** STAC search endpoint for Microsoft Planetary Computer */
const STAC_SEARCH = 'https://planetarycomputer.microsoft.com/api/stac/v1/search';

/** SAS signing endpoint for generating temporary authorized asset URLs */
const SIGN_URL = 'https://planetarycomputer.microsoft.com/api/sas/v1/sign';

/** Bounding box for West Virginia: [west, south, east, north] */
const BBOX = [-82.644739, 37.201483, -77.719519, 40.638801];

/** Maximum number of raster points to return in JSON */
const MAX_POINTS = 10000;

/**
 * Convert Celsius to Fahrenheit.
 * @param {number} c - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
function c2f(c) {
  return c * 9 / 5 + 32;
}

/**
 * Sign a COG asset URL using the Planetary Computer SAS signing endpoint.
 *
 * @async
 * @param {string} href - The unsigned asset URL
 * @returns {Promise<string>} - Signed URL usable for fetching the GeoTIFF
 * @throws {Error} If the signing service fails or returns improper JSON
 */
async function signHref(href) {
  console.log('Signing URL:', href);

  const res = await fetch(`${SIGN_URL}?href=${encodeURIComponent(href)}`);
  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  console.log('Sign response JSON:', json);

  if (!json.href) {
    throw new Error('No `href` field returned from sign API');
  }

  return json.href;
}

/**
 * GET /:date
 *
 * Main route for retrieving WV temperature point data for a given YYYY-MM-DD date.
 * Only year and month are used: the day is ignored except for validation.
 *
 * Steps:
 *  1. Validate date format
 *  2. STAC search for NOAA nClimGrid monthly item
 *  3. Sign the asset URL
 *  4. Download + parse raster with georaster
 *  5. Compute pixel window corresponding to WV bounding box
 *  6. Sample temperature values, convert to Fahrenheit
 *  7. Return JSON array of lat/lon/tavg points
 */
router.get('/:date', async (req, res) => {

  // Validate incoming date parameter (YYYY-MM-DD)
  const date = req.params.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  /**
   * Build STAC search payload
   * The datetime uses "<year>-<month>-15T00:00:00Z" because the nClimGrid-monthly
   * product is monthly and the 15th ensures we fall within the correct item’s range.
   */
  const payload = {
    collections: ['noaa-nclimgrid-monthly'],
    bbox: BBOX,
    datetime: `${date.split('-').slice(0, 2).join('-')}-15T00:00:00Z`
  };

  // --- STAC Search ---
  const stacRes = await fetch(STAC_SEARCH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const stacJson = await stacRes.json();
  if (!stacRes.ok || !stacJson.features?.length) {
    return res.status(stacRes.status || 404).json({ error: 'No data' });
  }

  // --- Select first returned item + sign its second asset ---
  const item = stacJson.features[0];
  const assetKey = Object.keys(item.assets)[1]; // often tavg band, depending on STAC metadata
  const href = item.assets[assetKey].href;
  const signed = await signHref(href);

  // --- Load GeoTIFF via georaster ---
  const arrayBuffer = await (await fetch(signed)).arrayBuffer();
  const georaster = await parseGeoraster(arrayBuffer);

  // --- Determine pixel window for WV bounding box ---
  const [west, south, east, north] = BBOX;
  const { xmin, ymax, pixelWidth, pixelHeight, width, height } = georaster;

  const ixStart = Math.max(0, Math.floor((west - xmin) / pixelWidth));
  const ixEnd   = Math.min(width - 1, Math.ceil((east - xmin) / pixelWidth));

  const iyStart = Math.max(0, Math.floor((ymax - north) / pixelHeight));
  const iyEnd   = Math.min(height - 1, Math.ceil((ymax - south) / pixelHeight));

  // --- Sample point grid ---
  const points = [];
  let count = 0;

  for (let ix = ixStart; ix <= ixEnd && count < MAX_POINTS; ix++) {
    for (let iy = iyStart; iy <= iyEnd && count < MAX_POINTS; iy++) {

      // Temperature raster value (Celsius)
      const cval = georaster.values[0][iy][ix];  // [band][row][col]
      if (cval == null || Number.isNaN(cval)) continue;

      // Convert pixel index to geographic coordinates
      const lon = xmin + ix * pixelWidth;
      const lat = ymax - iy * pixelHeight;

      points.push({
        lat,
        lon,
        tavg: c2f(cval)
      });

      count++;
    }
  }

  // Final JSON output
  res.json(points);
});

export default router;