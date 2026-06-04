# PR-122 — PR124 이관 기준

PR122는 **점검만**. 「수정 필요」확정 시 PR124 또는 긴급 PR.

---

| 이슈 유형 | PR124 이관 | 이유 |
| --- | --- | --- |
| 보험사명 오탈자 | ✅ | 공식명 확인 후 |
| 중복 보험사 | ✅ | 병합·비공개 판단 |
| 청구서류 누락 | ✅ | 공식 출처 후 추가 |
| 오래된/깨진 링크 | ✅ | URL 갱신 |
| 팩스/헬프데스크 오류 | ✅ | 공식 출처 후 |
| `lastVerifiedAt` 미기입 | ✅ | 검수 완료 기록 |
| `claimPageUrl` 정책·채움 | ✅ | UX+데이터 |
| insurerId 청구 연결 | ✅ | import dry-run |
| public visibility 위험 | ❌ **별도 긴급 PR** | Critical |
| DB/Auth/Migration | ❌ **High-risk PR** | PR124 범위 초과 |

---

## PR119 → PR124 매핑

| PR119 # | PR124 |
| ---: | --- |
| 2,3,4,5,6 | 보험사·메타 |
| 7,9 | 청구·출처 |
| 8,10,11 | 스테이징 확인 후 이관 |

---

## PR124 티켓 기입 형식 (예)

`PR124: insurer hanwha-general systemUrl HTTPS`

점검표 `비고` + [PR-121 Registry](../PR-121-FEEDBACK-INTAKE-REGISTRY.md) `FB-*` 교차 참조 가능.

---

## PR122에서 하지 않는 것

- seed/DB 일괄 수정
- bulk publish
- 공식 출처 없는 번호·URL 반영

**다음:** [PR-124-DATA-REMEDIATION-OPS.md](./PR-124-DATA-REMEDIATION-OPS.md)
