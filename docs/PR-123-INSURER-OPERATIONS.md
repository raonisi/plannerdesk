# PR-123 — 보험사 디렉터리 운영 기준

**Admin 경로:** `/admin/insurers`  
**Public:** `/directory`, `/disclosure-links` (published rows only)

---

## 단계별 기준

| 단계 | 기준 | 확인 항목 |
| --- | --- | --- |
| **등록** | 공식 명칭 또는 내부 표기 기준으로 등록 | 보험사명, 구분(life/non-life 등), 업무 링크(전산·홈·약관), `sourceNote` |
| **검수** | 공개 전 표기·링크·상태 확인 | 오탈자, 중복 slug, 공식 출처 URL, `verificationStatus` |
| **공개** | `isPublished` + review status 충족 | `verificationStatus ∈ {verified, needs_review}`, public visibility test |
| **보류** | 공식 출처 불명확 또는 정보 부족 | 보류 사유·`sourceNote` 기록, **public 미공개** |
| **수정** | 오탈자, 링크 변경, 공식 출처 변경 시 | 변경 사유·확인일(`lastVerifiedAt` 후속), PR124 연계 |
| **비공개** | 부정확·중복·노출 부적합 | `isPublished=false`, public 미노출 재확인 |

---

## 필수 원칙

- 공식 출처 없이 **최신성·정확성 단정 금지**
- **draft** 또는 미검수 보험사 **public 노출 금지** — `wouldPublishDraft` 서버 거부
- 관리자 전용 상태값·메모를 public UI에 과다 노출하지 않음
- **중복 보험사** — 병합 또는 한쪽 비공개; slug 충돌 방지
- HTTP → HTTPS 권장; PR119: `hanwha-general` HTTP `systemUrl` → **수정 필요** (PR124)

---

## 필드·상태 참고

| 필드 | 운영 메모 |
| --- | --- |
| `verificationStatus` | draft → needs_review → verified (또는 보류 시 needs_review 유지 + unpublished) |
| `isPublished` | true여도 draft면 public **불가** |
| `claimPageUrl` / `claimFormUrl` | PR119/122: fixture 전부 null — 등록·확인 필요 |
| `lastVerifiedAt` | PR122 월/분기 점검 시 갱신 |
| `sourceNote` | 출처·검수 메모 (고객 PII·의료 기록 **금지**) |

---

## 공개 전 체크 (최소)

- [ ] 보험사 **공식 홈**에서 명칭 확인
- [ ] 전산·청구·홈 링크 **HTTPS** 및 접속 가능(운영자 수동)
- [ ] 중복·slug 충돌 없음
- [ ] `isPublished=true` 시 `verificationStatus !== draft`
- [ ] public `/directory`에 draft·unpublished **미표시** (스테이징 QA)

**연계:** [PR-122-OFFICIAL-SOURCE-CRITERIA.md](./PR-122-OFFICIAL-SOURCE-CRITERIA.md) · [ADMIN_CRUD_OPERATIONS.md](./ADMIN_CRUD_OPERATIONS.md)
