/**
 * Import enabled authorized third-party assets into public/ static paths.
 * Operator-only — never run from request handlers or production boot.
 */
import {
  formatImportResultsTable,
  importAuthorizedAssets,
} from "../../lib/assets/import-authorized-assets-core";

const rootDir = process.cwd();

async function defaultFetch(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const results = await importAuthorizedAssets({
    rootDir,
    fetchImpl: defaultFetch,
    copyFromReview: true,
  });

  console.log(formatImportResultsTable(results));

  const imported = results.filter((row) => row.status === "imported").length;
  const failed = results.filter((row) => row.status === "failed");
  console.log(`\nImported: ${imported} / ${results.length}`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.length}`);
    for (const row of failed) {
      console.log(`- ${row.assetId}: ${row.reason}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
