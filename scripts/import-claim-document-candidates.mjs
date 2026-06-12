/**
 * Historical import hook retained as a no-op.
 *
 * PR-BS-19A removed external archive-derived claim document candidates from
 * public fallback and import paths. Claim-document data should be entered only
 * through reviewed official-source workflows.
 */

function main() {
  if (process.argv.includes("--apply")) {
    throw new Error(
      "Claim document candidate import is disabled. Use reviewed official-source workflows instead.",
    );
  }

  console.log("ClaimDocument import dry run");
  console.log("records=0");
  console.log("No database writes were performed.");
}

main();
