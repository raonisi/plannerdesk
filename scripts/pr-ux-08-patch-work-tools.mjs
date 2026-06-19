import fs from "node:fs";

const path = "app/work-tools/work-tools-client.tsx";
let source = fs.readFileSync(path, "utf8");

const beforeKorean = source.includes("업무 도구 검색");
if (!beforeKorean) {
  throw new Error("work-tools-client.tsx Korean text missing before patch");
}

source = source
  .replaceAll("#5B6470", "#4A5565")
  .replaceAll(
    'className="text-sm text-slate-500 mt-1"',
    'className="text-sm text-slate-600 mt-1"',
  )
  .replaceAll(
    'text-xs font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"',
    'text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"',
  )
  .replaceAll(
    "focus-visible:ring-[#0F1D2E]/25",
    "focus-visible:ring-[#0F1D2E]/35",
  );

fs.writeFileSync(path, source, "utf8");

const after = fs.readFileSync(path, "utf8");
if (!after.includes("업무 도구 검색")) {
  throw new Error("work-tools-client.tsx Korean text corrupted after patch");
}
if (after.includes("#5B6470")) {
  throw new Error("legacy gray still present");
}

console.log("Patched work-tools-client.tsx safely");
