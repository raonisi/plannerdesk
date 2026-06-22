/**
 * Sync enabled static authorized assets to Firebase Storage.
 * Operator-only — default dry-run; use --apply to upload.
 */
import {
  formatSyncResultsTable,
  syncAuthorizedStaticAssetsToFirebase,
} from "../../lib/assets/sync-static-authorized-assets-to-firebase-core";
import {
  buildAuthorizedStaticAssetsManifest,
  TRIAL_AUTHORIZED_ASSET_IDS,
  validateAuthorizedStaticAssetsManifest,
} from "../../lib/server/authorized-static-assets-manifest";
import { getFirebaseServiceAccountConfig } from "../../lib/server/firebase-service-account";
import { getWorkToolsFirebaseConfig } from "../../lib/api/work-tools-storage-config";

const rootDir = process.cwd();

function parseArgs(argv: string[]) {
  return {
    apply: argv.includes("--apply"),
    trial: argv.includes("--trial"),
    help: argv.includes("--help") || argv.includes("-h"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Usage: node scripts/assets/sync-static-authorized-assets-to-firebase.ts [--dry-run|--apply] [--trial]",
    );
    process.exit(0);
  }

  if (!getWorkToolsFirebaseConfig()) {
    console.error("WORK_TOOLS_FIREBASE_BUCKET is not configured");
    process.exitCode = 1;
    return;
  }

  const config = getFirebaseServiceAccountConfig();
  if (!config) {
    console.error("Firebase upload credentials are not configured");
    process.exitCode = 1;
    return;
  }

  let assets = buildAuthorizedStaticAssetsManifest(rootDir);
  const manifestIssues = validateAuthorizedStaticAssetsManifest(assets);
  if (manifestIssues.length > 0) {
    console.error("Manifest validation failed");
    for (const issue of manifestIssues) {
      console.error(`- ${issue.assetId}: ${issue.reason}`);
    }
    process.exitCode = 1;
    return;
  }

  if (args.trial) {
    const trialIds = new Set(TRIAL_AUTHORIZED_ASSET_IDS);
    assets = assets.filter((asset) => trialIds.has(asset.assetId as (typeof TRIAL_AUTHORIZED_ASSET_IDS)[number]));
  }

  const results = await syncAuthorizedStaticAssetsToFirebase({
    rootDir,
    assets,
    config,
    apply: args.apply,
  });

  console.log(formatSyncResultsTable(results));
  const uploaded = results.filter((row) => row.status === "uploaded").length;
  const skipped = results.filter((row) => row.status === "skipped").length;
  const failed = results.filter((row) => row.status === "failed");
  console.log(
    `\nSummary: uploaded=${uploaded} skipped=${skipped} failed=${failed.length} total=${results.length} mode=${args.apply ? "apply" : "dry-run"}`,
  );

  if (failed.length > 0) {
    for (const row of failed) {
      console.error(`- ${row.assetId}: ${row.reason}`);
    }
    process.exitCode = 1;
  }
}

main().catch(() => {
  console.error("sync_failed");
  process.exitCode = 1;
});
