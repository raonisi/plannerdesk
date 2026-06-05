# PR-149 — Build / CI / Deployment 감사

| 명령 | migration |
| --- | --- |
| `npm run build` | **없음** (`prisma generate && next build`) |
| `db:migrate:deploy` | 별도 script |
| CI `npm run build` | 주석: migrate deploy 없음 |

PR149에서 `prisma migrate deploy` **실행하지 않음**.

Railway/Neon: 운영 DB 직접 접근 금지 (AGENTS.md).
