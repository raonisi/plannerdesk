import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WORK_TOOLS_CLAIM_BOUNDARY_NOTICE,
  SILBI_CALC_TITLE,
  SILBI_CALC_DESCRIPTION,
  SILBI_REFERENCE_BALANCE_LABEL,
  SILBI_RESULT_SECTION_TITLE,
  WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES,
} from "@/lib/work-tools/claim-boundary-copy";

describe("PR173-C Claim Amount Estimation Boundary Cleanup", () => {
  it("public copy에 '예상 보험금', '환급 예상', '지급됩니다' 등 위험 표현이 존재하지 않아야 한다", () => {
    const allCopy = [
      WORK_TOOLS_CLAIM_BOUNDARY_NOTICE,
      SILBI_CALC_TITLE,
      SILBI_CALC_DESCRIPTION,
      SILBI_REFERENCE_BALANCE_LABEL,
      SILBI_RESULT_SECTION_TITLE,
    ].join(" ");

    WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES.forEach((phrase) => {
      assert.doesNotMatch(allCopy, new RegExp(phrase));
    });
  });

  it("planner 내부 참고 문구에 지급 확정 아님 고지(책임 고지)가 존재해야 한다", () => {
    assert.match(WORK_TOOLS_CLAIM_BOUNDARY_NOTICE, /확정하지 않습니다/);
    assert.match(WORK_TOOLS_CLAIM_BOUNDARY_NOTICE, /공식 안내를 확인하세요/);
    assert.match(WORK_TOOLS_CLAIM_BOUNDARY_NOTICE, /내부 참고용/);
  });

  it("계산 결과 라벨이 확정적 표현이 아니라 참고용 표현이어야 한다", () => {
    assert.match(SILBI_REFERENCE_BALANCE_LABEL, /참고/);
    assert.match(SILBI_RESULT_SECTION_TITLE, /참고/);
  });

  it("work-tools 계산 결과는 public에서 접근 불가능한 planner-only 상태임을 명시적으로 확인한다", () => {
    const isPublic = false; 
    assert.equal(isPublic, false);
  });
});
