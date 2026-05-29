### Summary
공시·약관 페이지 및 고객문구 복사 페이지의 UI/UX 완성도 개선, 모바일 최적화, 컴플라이언스 준수 강화

### Changed files
- app/disclosure-links/*: 고급 필터 기능 추가, 카드 UI 리팩토링
- app/message-templates/*: 치환 기능 유지, 4가지 스타일 복사 버튼 분리
- components/disclosure/disclosure-card.tsx (신규)
- components/ui/copy-toast.tsx (신규)
- lib/disclosure-display.ts (신규)

### Tests
- npm run typecheck, npm run lint, npm run build 모두 통과

### Risk level
- Low (프론트엔드 UI 및 컴포넌트 구조 변경에 한정됨)

### Security/privacy impact
- 없음 (고객명 입력값은 로컬 상태로만 유지되고 저장되지 않음)

### User-facing changes
- 공시·약관 화면: 공식 출처 열기 버튼 강조, 운영 참고용 검수 배지를 고급 필터 내로 숨김
- 고객문구 화면: 4가지 복사 옵션(기본, 짧은 카톡, 정중한 버전, 전문가용)을 카드 내 배치, 클릭 시 명시적인 복사 피드백 추가
- 모바일 가로 390px 화면 겹침 문제 해소 및 UI 대응

### Admin-facing changes
- 없음

### Follow-up
- 없음
