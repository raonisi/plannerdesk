# PR-124 — Public visibility 확인표

**일시:** PR124 Cursor 세션 (fixture + 기존 tests, 운영 DB 미연결)

---

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 미검수(draft) 보험사 public 미노출 | **pass** | `wouldPublishDraft` · fixture 전건 `needs_review` (draft 아님); guard tests |
| 비공개 보험사 public 미노출 | **pass** | fixture 전건 `isPublished: true`; unpublished 시 `getPublicInsurers` 필터 |
| 미검수(draft) 청구서류 public 미노출 | **pass** | `lib/public/visibility.ts` |
| 비공개 청구서류 public 미노출 | **pass** | 동일 predicate |
| 관리자 전용 상태값 public 과다 노출 없음 | **pass** | public API는 published editorial fields only |
| visibility guard 우회 없음 | **pass** | PR124 **코드 변경 없음**; `tests/public/public-visibility.test.ts` |

---

## PR124 데이터 변경 영향

| 변경 | visibility 영향 |
| --- | --- |
| `hanwha-general` systemUrl HTTPS | **없음** — URL scheme only, `isPublished`/`verificationStatus` 불변 |

---

## 배포 전 (운영자)

- [ ] 스테이징 `/directory` spot check
- [ ] `/claim-documents` draft row 없음
- [ ] PR124 diff에 guard 파일 **미포함** 확인
