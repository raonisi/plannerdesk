# PR-82: Global Search — Safety & Implementation Checklists

PR-83 (public search) · PR-85 (admin search) 착수 전 점검용.

---

## Public Search 안전 체크리스트

- [ ] public 공개 조건을 통과한 데이터만 검색한다 (`lib/public/*` WHERE/헬퍼 재사용)
- [ ] `isPublished === false` 행은 검색하지 않는다
- [ ] Insurer: `verificationStatus`가 `draft`이면 검색하지 않는다
- [ ] KnowledgeArticle: `status`가 `draft` / `archived`이면 검색하지 않는다
- [ ] DisclosureLink: `status !== published` 또는 `reviewedAt === null`이면 검색하지 않는다
- [ ] MessageTemplate: `isInternalOnly === true` 또는 `safeCopy` 비어 있으면 검색하지 않는다
- [ ] MessageTemplate `body`는 검색·결과 표시 모두 하지 않는다
- [ ] MessageTemplate public 결과는 `safeCopy`·금지 표현 필터를 통과한 행만
- [ ] DisclosureLink `adminMemo`는 검색하지 않는다
- [ ] CorrectionRequest는 public 검색하지 않는다
- [ ] `reviewedById`, `resolvedById`, `createdById` 등 운영자 ID는 노출하지 않는다
- [ ] 개인정보·의료정보·계약정보 패턴 검색어는 차단한다
- [ ] 보험금 지급·손해사정·청구 가능성 검색어는 차단한다
- [ ] AI 답변형 UI·채팅형 검색 UI를 만들지 않는다
- [ ] 검색 결과에 admin 경로·내부 status를 넣지 않는다
- [ ] 빈 검색어로 전체 DB 스캔·무한 목록을 노출하지 않는다

---

## Admin Search 안전 체크리스트 (PR-85)

- [ ] `getAdminAccess` / `requireContentManagerAccess` 서버 검증
- [ ] UI 숨김만으로 권한 처리하지 않는다
- [ ] public 검색 API와 admin 검색 API·함수를 분리한다
- [ ] CorrectionRequest: message preview 최소화·민감 플래그 경고
- [ ] CorrectionRequest: public 검색·public route에 포함하지 않는다
- [ ] `adminMemo` 통합 검색 포함 여부를 문서·코드에 명시한다
- [ ] `deletedAt` / `status === deleted` CorrectionRequest 기본 제외 여부 확정
- [ ] MessageTemplate admin 검색 시 `body` 노출 범위 확정 (편집 화면 vs 검색 스니펫)
- [ ] 검색 오류 메시지에 사용자 입력 민감정보를 재노출하지 않는다
- [ ] AuditLog 필요성 검토 (본 PR에서는 모델 추가 없음)

---

## PR-83 Public Search 구현 체크리스트

- [ ] `lib/search/types.ts` 타입 사용
- [ ] `GlobalSearchQueryInput` validation (길이·trim·민감어)
- [ ] 도메인 필터 `PublicSearchDomain`
- [ ] 도메인별 Prisma where = `PUBLIC_*_WHERE` 또는 동등 헬퍼
- [ ] 결과 `GlobalSearchResult` 매핑 + §6 URL
- [ ] pagination ≤ 20
- [ ] ranking §10 초안
- [ ] `revalidatePath` public 콘텐츠 불필요 (read-only)
- [ ] typecheck / lint / build 통과
- [ ] 회귀: 기존 `/directory`, `/claim-documents`, `/knowledge`, `/disclosure-links`, `/message-templates` 정상

---

## PR-85 Admin Search 구현 체크리스트

- [ ] Admin 전용 route 또는 AdminShell 내 검색
- [ ] `AdminSearchResult` + `adminUrl`
- [ ] CorrectionRequest 인박스 정책 (PR-81) 정렬
- [ ] Bulk search / export 없음 (별도 PR)
- [ ] public `revalidate` 호출 없음

---

## 검증 명령 (PR-82)

문서·타입만 변경 시에도 회귀 확인:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run build   # 또는 npx next build (DIRECT_URL 없을 때)
```
