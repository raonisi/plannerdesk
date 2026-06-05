# PR-151 — Answer Assistant Dry Run

`ANSWER_ASSISTANT_DRY_RUN` 기준. PR148·PR146 연계.

- public route 없음 (`/planner/answer-assistant` only)
- verified + allowlist 이중 게이트
- 베타 접근 ≠ AA 자동 허용
- forbidden input/output · output safety · rate limit · retention (PR148)
- usage audit metadata-only, query/draft 필드 없음
- Critical 시 disable (PR148)

**partial:** PR148-B~H hardening 잔존 — PR156 red-team 전제.
