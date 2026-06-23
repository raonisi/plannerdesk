/**
 * Sync enabled static authorized assets to Firebase Storage.
 * Operator-only — default dry-run; use --apply to upload.
 */
import {
  formatSyncResultsTable,
  selectSyncAssetsForRun,
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
  const assetIdIndex = argv.indexOf("--asset-id");
  let assetId: string | undefined;
  if (assetIdIndex >= 0) {
    assetId = argv[assetIdIndex + 1];
    if (!assetId || assetId.startsWith("--")) {
      return { help: false, apply: false, trial: false, assetId: undefined, invalidAssetIdArg: true };
    }
  }

  return {
    apply: argv.includes("--apply"),
    trial: argv.includes("--trial"),
    help: argv.includes("--help") || argv.includes("-h"),
    assetId,
    invalidAssetIdArg: false,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Usage: node scripts/assets/sync-static-authorized-assets-to-firebase.ts [--dry-run|--apply] [--trial] [--asset-id <assetId>]",
    );
    process.exit(0);
  }

  if (args.invalidAssetIdArg) {
    console.error("Missing value for --asset-id");
    process.exitCode = 1;
    return;
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

  const manifest = buildAuthorizedStaticAssetsManifest(rootDir);
  const manifestIssues = validateAuthorizedStaticAssetsManifest(manifest);
  if (manifestIssues.length > 0) {
    console.error("Manifest validation failed");
    for (const issue of manifestIssues) {
      console.error(`- ${issue.assetId}: ${issue.reason}`);
    }
    process.exitCode = 1;
    return;
  }

  const selection = selectSyncAssetsForRun(manifest, {
    assetId: args.assetId,
    trial: args.trial,
    trialAssetIds: TRIAL_AUTHORIZED_ASSET_IDS,
  });
  if (!selection.ok) {
    console.error(selection.error);
    process.exitCode = 1;
    return;
  }

  if (selection.singleAssetMode && selection.assets.length !== 1) {
    console.error("single_asset_target_count_invalid");
    process.exitCode = 1;
    return;
  }

  const results = await syncAuthorizedStaticAssetsToFirebase({
    rootDir,
    assets: selection.assets,
    config,
    apply: args.apply,
    emitUploadDiagnostics: selection.singleAssetMode,
  });

  console.log(formatSyncResultsTable(results));
  const uploaded = results.filter((row) => row.status === "uploaded").length;
  const skipped = results.filter((row) => row.status === "skipped").length;
  const failed = results.filter((row) => row.status === "failed");
  const modeLabel = args.apply ? "apply" : "dry-run";
  const scopeLabel = selection.singleAssetMode ? "single-asset" : "bulk";
  console.log(
    `\nSummary: uploaded=${uploaded} skipped=${skipped} failed=${failed.length} total=${results.length} mode=${modeLabel} scope=${scopeLabel}`,
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
