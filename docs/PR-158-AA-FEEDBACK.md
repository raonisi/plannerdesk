# PR-158 — Answer Assistant 피드백

SSOT: `AA_FEEDBACK_HANDLING`

- prompt/response/상담 원문 **저장 금지**
- 지급 확정·PII 유도·injection·secret → Critical, 유형·safety flag만
- 품질·지연 → Medium, metadata만
- 재현은 비식별 더미 사례로 재구성

PR156 red-team·PR148 정책과 정합.
