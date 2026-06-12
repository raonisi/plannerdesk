# PR-BS-17 Card Payment Info Policy Gate

## 1. 목적

보험사별 카드납·보험료 납입 방식·자동이체·가상계좌·고객센터 납입 문의 정보를 **실제로 표시하기 전에**, 공식 출처·검수 상태·공개 범위·금지 표현·고객 결제정보 저장 금지 기준을 코드와 테스트로 고정한다.

선행 문서: [PR-BS-08 Card Payment Info Model Review](./PR-BS-08-CARD-PAYMENT-INFO-MODEL-REVIEW.md), [PR-BS-15 Verified Work Link UX](./PR-BS-15-VERIFIED-WORK-LINK-UX.md).

## 2. 이번 PR의 범위

| 포함 | 비포함 |
| --- | --- |
| `lib/payment-info/payment-info-policy.ts` 정책 helper | 실제 보험사별 카드납 데이터 추가 |
| High-risk 유형·금지 필드·금지 표현 상수 | public 카드납 UI 구현 |
| public/planner 노출 조건 helper | PlannerDesk PG/checkout/billing 구현 |
| verified work link projection 연동 (최소) | Prisma schema/migration |
| 정적 테스트·문서 | package.json / lockfile 변경 |

## 3. 이번 PR에서 하지 않는 것

- 보험사별 카드납 가능/불가능 값·조건 임의 작성
- 고객센터·팩스 번호 임의 추가
- checkout / billing / subscription / webhook route
- TossPayments / PortOne / NICEPAY 등 PG SDK
- 고객 결제정보(카드번호, CVC, 계좌번호, 결제 토큰 등) 저장
- 기존 insurer directory `cardPayment*` public 필드 변경 (BS-08 유지)

## 4. 보험사 납입 정보와 PlannerDesk PG 결제의 구분

| 구분 | 의미 | PR-BS-17 처리 |
| --- | --- | --- |
| 보험사 보험료 카드납 | 보험료를 카드로 납입할 수 있는지에 대한 **업무 참고** 정보 | policy gate 대상 |
| PlannerDesk PG 결제 | PlannerDesk 유료 구독 결제 (PR170/PR175) | 이번 PR 제외 |
| 고객 결제정보 | 카드번호, CVC, 계좌번호, 결제 토큰 등 | 저장 금지 |
| checkout/billing/webhook | 결제 기능 구현 | 금지 |

코드 상수: `PLANNERDESK_PG_SCOPE_NOTICE` (`lib/payment-info/payment-info-policy.ts`).

## 5. High-risk 정보 유형

`PAYMENT_INFO_HIGH_RISK_TYPES`:

- `paymentInfo`
- `cardPayment`
- `premiumPayment`
- `autoTransfer`
- `virtualAccount`
- `customerCenterPayment`
- `faxPayment`

## 6. Public 노출 기준

- payment-info 계열은 **기본적으로 public 노출 금지** (`isPaymentInfoPublicVisible` → 항상 `false`).
- verified work link projection: `isWorkLinkPublicVisible`은 payment high-risk type을 선차단.
- 향후 public 노출이 필요하면 **별도 Codex 제한검수** 후 정책 변경.

## 7. Planner 노출 기준

`isPaymentInfoPlannerCandidate` 조건:

- `reviewStatus` ∈ `verified`, `published`
- `visibilityScope` === `planner`
- `officialSourceUrl` 존재
- `lastVerifiedAt` 존재
- `riskLevel` === `high`
- `displayNotice`는 확정 표현 없이 `PAYMENT_INFO_ALLOWED_NOTICES` 조합

planner에서도 “가능/불가능 확정”이 아니라 **업무 참고 + 공식 확인 필요**만 허용.

## 8. 저장 금지 필드

`PAYMENT_INFO_FORBIDDEN_FIELDS`:

`cardNumber`, `cvc`, `accountNumber`, `paymentPassword`, `paymentToken`, `customerName`, `residentNumber`, `phone`, `contractNumber`, `policyNumber`, `customerPremium`, `paymentHistory`

## 9. 금지 표현

`PAYMENT_INFO_FORBIDDEN_PHRASES` — 예: “카드납 가능합니다”, “100% 정확”, “공식 확정”, “고객 결제정보를 입력하세요” 등.

허용 안내 (`PAYMENT_INFO_ALLOWED_NOTICES`):

- 보험사 정책과 상품·채널에 따라 납입 가능 여부가 달라질 수 있습니다.
- 고객 안내 전 보험사 공식 출처와 최근 확인일을 다시 확인하세요.
- 카드납·납입 조건은 업무 참고용 정보이며 확정 안내가 아닙니다.
- 고객 결제정보, 카드번호, 계좌번호는 PlannerDesk에 입력하거나 저장하지 마세요.

## 10. 테스트 기준

| 테스트 | 경로 |
| --- | --- |
| 정책 gate·route·PG SDK | `tests/ops/payment-info-policy-gate.test.ts` |
| public visibility | `tests/public/payment-info-public-visibility.test.ts` |
| 금지 필드 | `tests/ops/payment-info-forbidden-fields.test.ts` |
| 금지 표현·copy | `tests/ops/payment-info-copy-safety.test.ts` |

실행 예:

```bash
npx tsx --test tests/ops/payment-info-policy-gate.test.ts tests/ops/payment-info-forbidden-fields.test.ts tests/ops/payment-info-copy-safety.test.ts
npm run test:public
```

## 11. 후속 PR 후보

- Admin 검수 완료 후 planner 전용 납입 참고 링크 데이터 (mock → 운영)
- insurer directory `cardPayment*` public 표현 정책 재검토 (Codex 제한검수)
- PR-BS-18 이후 단계 (별도 요청서)

## 12. 최종 결론

PR-BS-17은 **데이터 추가 없이** 카드납·납입 정보의 High-risk 분류, public 차단, planner 노출 조건, 금지 필드/표현, PG 구분을 코드·테스트로 고정한다. Antigravity 검수 및 Codex 제한검수를 권장한다.
