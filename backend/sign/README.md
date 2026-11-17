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

### Only trusted addresses are used

The asset URL comes from *another service's JSON*, so the server treats it as untrusted input. If a response were ever tampered with, a server that fetches whatever address it is handed could be tricked into requesting internal addresses (a *server-side request forgery*, which SonarQube reports as a security issue).

`assertTrustedAssetUrl(href)` accepts only **`https`** URLs whose host ends in **`.blob.core.windows.net`** (Azure Blob Storage, where Planetary Computer keeps its files) and throws otherwise. It runs three times: on the asset URL before asking to sign it, on the signed URL the service returns, and in `routes/stac.js` before the file is downloaded. The route turns the error into a `502`.

```js
assertTrustedAssetUrl('https://example.blob.core.windows.net/a.tif'); // ok
assertTrustedAssetUrl('http://169.254.169.254/latest/meta-data');     // throws: not https, not Blob Storage
```

This allows any Azure storage account, not just Microsoft's, which is far narrower than "anywhere" and enough for this project. If you copy the idea, name the exact hosts your own data source uses. `tests/sign.test.js` checks the rules, including look-alike hosts and addresses with embedded credentials.

Reference: [Planetary Computer: Using tokens for data access](https://planetarycomputer.microsoft.com/docs/concepts/sas/)
