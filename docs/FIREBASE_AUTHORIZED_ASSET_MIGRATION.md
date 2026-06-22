# Firebase Authorized Asset Migration (PR-ASSET-04)

This document describes how PlannerDesk migrates approved claim PDFs, insurer logos, and learning resources from `public/` static files to Firebase Storage without deleting local copies.

## Bucket reuse

- Use **`WORK_TOOLS_FIREBASE_BUCKET`** only.
- Do **not** introduce `FIREBASE_STORAGE_BUCKET` or hardcode bucket names in application code.
- Server upload and signed URL issuance reuse existing operator credentials (`FIREBASE_UPLOAD_CLIENT_EMAIL`, `FIREBASE_UPLOAD_PRIVATE_KEY`).

## Path separation

Existing Work Tools objects remain under their current prefixes (for example `quick-link-files/**`). Do not modify Work Tools paths.

Approved assets use a dedicated prefix only:

```text
plannerdesk/authorized-assets/
  claim-pdfs/<insurer-id>/<asset-id>.pdf
  insurer-logos/<insurer-id>/<insurer-id>.<ext>
  learning-resources/<asset-id>.<ext>
```

## Delivery mode

Environment variable:

```text
AUTHORIZED_ASSET_DELIVERY_MODE=static   # default
AUTHORIZED_ASSET_DELIVERY_MODE=firebase
```

| Mode | PDF | Logo |
|------|-----|------|
| `static` | `/claim-forms/authorized/**` direct download | `/insurer-logos/authorized/**` |
| `firebase` | `/api/authorized-assets/download/<assetId>` → signed URL | `/api/authorized-assets/logo/<insurerId>` → signed URL |

Invalid values fall back to `static`.

## Rollout order

1. Deploy with `AUTHORIZED_ASSET_DELIVERY_MODE=static` (no user-visible change).
2. Dry-run sync:

   ```powershell
   node scripts/assets/sync-static-authorized-assets-to-firebase.ts --dry-run --trial
   ```

3. Upload trial set (7 assets):

   ```powershell
   node scripts/assets/sync-static-authorized-assets-to-firebase.ts --apply --trial
   ```

4. Verify Firebase metadata (`assetId`, `sha256`, `permissionRecordKey`).
5. Set `AUTHORIZED_ASSET_DELIVERY_MODE=firebase` on Railway for a staging test.
6. Verify PDF download, logo display, and learning resource download.
7. Roll back to `static` immediately if anything fails.
8. After trial success, sync the full manifest with `--apply` (no `--trial`).
9. Keep `public/` static files until a separate approved cleanup PR.

## Static file deletion

**Do not delete** `public/claim-forms/authorized/**` or `public/insurer-logos/authorized/**` in this migration PR. Static copies are the rollback source.

## Firebase Console (manual)

Review Storage Rules so `plannerdesk/authorized-assets/**` denies direct client read/write. Work Tools prefixes must remain unchanged. Rule deployment in Firebase Console is a manual operator step.

## Security notes

- Never commit service account keys, signed URLs, permission document text, or bucket secrets.
- Sync and API routes must not log source URLs, object paths in error responses to clients, or credential values.
