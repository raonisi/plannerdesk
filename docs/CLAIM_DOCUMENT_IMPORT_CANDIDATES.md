# Claim Document Import Candidates

This document records the safe import path for the first claim-document candidate batch.

## Purpose

PlannerDesk needs starter `ClaimDocument` records so the claim document library can be reviewed by an operator before public release.

The first candidate batch is derived from the public claim-guide list at:

- `https://bohumschool-archive.onrender.com/api/v1/computer-room/claim-guides`

This source is used only as a practical reference. It is not treated as an official insurer source.

## Current Import Scope

The import script adds 35 generic claim-document checklist candidates covering:

- Common claim documents
- Proxy/agent claim documents
- Outpatient actual-expense documents
- Hospitalization actual-expense documents
- Surgery documents
- Fracture documents
- Diagnosis-related documents
- Newborn/fetal related documents
- Dementia related documents
- Death claim documents

The script does not import customer files, medical records, PDFs, images, OCR output, or real customer data.

## Safety Defaults

All imported candidates are intentionally created as:

- `verificationStatus: draft`
- `isPublished: false`
- `lastVerifiedAt: null`
- `insurerId: null`
- `claimFormUrl: null`
- `officialSourceUrl: null`

The records are not publicly visible after import. An authorized admin must review each record against official insurer or policy sources before changing status or publishing.

## Commands

Dry run only:

```bash
npm run claim-documents:import:dry-run
```

Apply import:

```bash
CONFIRM_CLAIM_DOCUMENT_IMPORT=unpublished-draft npm run claim-documents:import:apply
```

On Windows PowerShell:

```powershell
$env:CONFIRM_CLAIM_DOCUMENT_IMPORT="unpublished-draft"
npm run claim-documents:import:apply
```

The apply command requires a valid database connection through the normal runtime environment. Do not paste secrets into code, docs, PRs, or terminal transcripts.

## Existing Record Protection

If a candidate slug already exists and the record is published or verified, the script skips it. This prevents a later rerun from downgrading manually reviewed content.

## Review Required Before Publishing

Before any imported candidate is published, confirm:

- The document requirement is still current.
- The requirement is verified against an official insurer, policy, or disclosure source.
- `officialSourceUrl` is set when an official public source exists.
- `lastVerifiedAt` reflects a real manual review date.
- The copy does not imply claim payout approval, payout amount, final coverage judgment, medical advice, or loss-adjusting work.

## Boundaries

This import does not add:

- File upload
- Customer claim submission
- Customer medical document processing
- OCR
- AI claim judgment
- Claim payout judgment
- Claim amount estimation
- Public visibility changes
- Schema changes
- Migrations
- BOA CRM connection
- Aiven connection
- Secrets or environment variable changes

Required public-safety language remains:

- 플래너데스크는 보험금 지급 여부를 판단하지 않습니다.
- 플래너데스크는 보험금 지급 금액을 산정하지 않습니다.
- 플래너데스크는 손해사정 업무를 수행하지 않습니다.
- 현재 MVP에서는 고객 의료서류를 처리하지 않습니다.
- 공식 링크, 연락처, 서류 기준은 공개 전 공식 출처 확인이 필요합니다.
- 본 자료는 실무 참고와 업무 정리를 위한 용도입니다.
