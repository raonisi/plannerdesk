import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildAuthorizedLogoHref,
  buildAuthorizedPdfDownloadHref,
} from "@/lib/public/authorized-asset-delivery-mode";

// We mock the dependencies to verify route logic
// Since this is a diagnostic test requested, we cover the exact scenarios
describe("PR-ASSET-04 Firebase Runtime Diagnostics Mock", () => {
  it("firebase mode에서 PDF href가 /api/authorized-assets/download/<assetId>인지", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "firebase";
    try {
      const href = buildAuthorizedPdfDownloadHref("asset-123", "/static/x.pdf");
      assert.equal(href, "/api/authorized-assets/download/asset-123");
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("firebase mode에서 logo src가 /api/authorized-assets/logo/<insurerId>인지", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "firebase";
    try {
      const src = buildAuthorizedLogoHref("insurer-abc", "/static/logo.png");
      assert.equal(src, "/api/authorized-assets/logo/insurer-abc");
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("static mode -> 기존 /claim-forms/** 및 /insurer-logos/** 유지", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "static";
    try {
      assert.equal(buildAuthorizedPdfDownloadHref("asset-123", "/claim-forms/x.pdf"), "/claim-forms/x.pdf");
      assert.equal(buildAuthorizedLogoHref("insurer-abc", "/insurer-logos/y.png"), "/insurer-logos/y.png");
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });
});
