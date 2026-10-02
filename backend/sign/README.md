# `sign/`

## `sign.js`

`signUrl(href)` turns a Microsoft Planetary Computer asset URL into one you can actually download.

Planetary Computer's files live in Azure Blob Storage, which requires a **SAS (Shared Access Signature) token** on every download. The free, anonymous signing endpoint adds one:

```text
GET https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=<asset URL>
→ { "href": "<asset URL>?st=...&se=...&sig=...", "msft:expiry": "..." }
```

`signUrl` calls it with the built-in `fetch` and returns the signed `href`. It throws if the service fails or the response has no `href`; `routes/stac.js` turns that into a `502` response.

```js
import { signUrl } from '../sign/sign.js';

const downloadUrl = await signUrl(item.assets.tavg.href);
```

The token expires after a while, so sign each URL right before using it rather than storing signed URLs.

Reference: [Planetary Computer: Using tokens for data access](https://planetarycomputer.microsoft.com/docs/concepts/sas/)
