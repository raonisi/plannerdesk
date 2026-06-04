# PR-128 — Public visibility 확인

**전제:** `lib/public/insurers.ts` 및 visibility helper **미변경**.

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 미검수 보험사 링크 public 미노출 | 유지 | draft + unpublished 차단 |
| 비공개 보험사 링크 public 미노출 | 유지 | `isPublished === false` 차단 |
| 확인 필요를 정상으로 단정하지 않음 | 유지 | `DIRECTORY_TEXT.missing`, `publicContentTrustHint` |
| 관리자 상태값 public 과다 노출 없음 | 유지 | `verificationStatusLabel` 미사용 (PR112) |
| visibility guard 우회 없음 | 유지 | fetch WHERE 미변경 |
| 공식 출처 확인 필요 항목 분리 | 반영 | partial 공시 안내 문구 |
