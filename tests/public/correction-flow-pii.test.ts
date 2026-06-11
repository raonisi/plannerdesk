import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hasClientSensitiveSignal,
  validateCorrectionSubmit,
} from "@/lib/correction-request/validation";

const BASE_PAYLOAD = {
  targetType: "insurer",
  targetId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  requestType: "broken_link",
  title: "전산 링크 오류 제보",
  message: "공식 홈페이지 전산 메뉴 링크가 404로 표시됩니다.",
  honeypot: "",
  sourceUrl: null,
} as const;

describe("PR-BS-05 correction PII guard", () => {
  it("blocks resident id and phone patterns", () => {
    assert.equal(hasClientSensitiveSignal("고객 주민번호 900101-1234567"), true);
    assert.equal(hasClientSensitiveSignal("연락처 010-1234-5678"), true);
    const result = validateCorrectionSubmit({
      ...BASE_PAYLOAD,
      message: "계약번호 12345678901234 로 확인 부탁",
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "personal_info");
  });

  it("blocks medical and consultation keywords", () => {
    assert.equal(hasClientSensitiveSignal("상담 원문 전체를 붙입니다"), true);
    assert.equal(hasClientSensitiveSignal("진단명 원문: 급성 위염"), true);
    const medical = validateCorrectionSubmit({
      ...BASE_PAYLOAD,
      message: "병원 진단서 내용에 따라 청구 가능한지 문의",
    });
    assert.equal(medical.ok, false);
    assert.equal(medical.reason, "medical_info");
  });

  it("blocks payout judgment and file upload prompts", () => {
    const payout = validateCorrectionSubmit({
      ...BASE_PAYLOAD,
      message: "이 경우 보험금 지급 가능한지 알려주세요",
    });
    assert.equal(payout.ok, false);
    assert.equal(payout.reason, "payout_judgment");

    const upload = validateCorrectionSubmit({
      ...BASE_PAYLOAD,
      message: "캡처본을 첨부해서 보내드리겠습니다",
    });
    assert.equal(upload.ok, false);
    assert.equal(upload.reason, "file_upload");
  });

  it("blocks secret and card keywords", () => {
    assert.equal(hasClientSensitiveSignal("API key 값을 공유합니다"), true);
    assert.equal(hasClientSensitiveSignal("카드번호 1234-5678-9012-3456"), true);

    const secret = validateCorrectionSubmit({
      ...BASE_PAYLOAD,
      message: "process.env AUTH_SECRET 값이 필요합니다",
    });
    assert.equal(secret.ok, false);
    assert.equal(secret.reason, "personal_info");
  });

  it("allows operational correction without PII", () => {
    const ok = validateCorrectionSubmit({
      ...BASE_PAYLOAD,
      sourceUrl: "https://www.example-insurer.co.kr/portal",
    });
    assert.equal(ok.ok, true);
    assert.ok(ok.data?.title);
  });
});
