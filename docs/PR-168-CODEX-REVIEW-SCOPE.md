# PR-168 — Codex 제한검수

PR168-A는 구현 없는 workflow 문서 PR이면 Codex 생략 가능하다.
다만 public visibility·청구서류 책임·데이터 수정 workflow가 운영 리스크와 연결되므로 기준 불명확 시 **조건부** 검수를 권장한다.

## 검수 범위

- 운영 DB 수정 부재
- 크롤링·자동 동기화 부재
- 공식 출처 확인 기준
- 데이터 오류 등급표
- 청구서류·디렉터리·검색 workflow
- 비공개·미검수 public 노출 Critical 분류
- 보험금 지급 확정 표현 Critical 분류
- 후속 PR 연결 기준
- PR169 진입 가능 여부

## 제외

- 문구 스타일
- 템플릿 필드명
- Low 오탈자
