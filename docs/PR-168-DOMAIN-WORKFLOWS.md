# PR-168 — 도메인별 수정 workflow

## 보험사 디렉터리

1. **오류 접수** — 보험사명·항목·요약·공식 근거 후보(비식별)
2. **공식 확인** — 공식 홈·안내·불가 시 확인 필요 보류
3. **등급 분류** — 연락처·청구 High+ · secret URL Critical
4. **조치 판단** — Critical→hotfix · High→PR168-E Insurer Directory Correction
5. **종료** — PR168에서 수정 안 함·후속 PR에 출처 연결

## 청구서류

1. **오류 접수** — 보험사·서류 유형·요약
2. **공식 확인** — 보험사 공식 청구·약관·공시
3. **등급 분류** — 청구 High · 지급 확정 Critical · 「이 서류만」 High+
4. **조치 판단** — 확정 수정 금지·보류 후보·PR168-D Claim Document Correction
5. **종료** — 지급 확정 없음·확인일·근거 후속 PR

## 업무 링크

1. **오류 접수** — 링크 유형·화면·오류·secret URL→Critical
2. **공식 확인** — 공식 페이지·권한 필요 링크 안내
3. **등급 분류** — 청구 High · 404 Medium~High · admin Critical
4. **조치 판단** — PR168-F Link Correction Workflow

## 지식 아카이브

1. **오류 접수** — 문서·주제·유형·공식 근거 여부
2. **공식 확인** — 약관·공시·보험사·공공기관
3. **등급 분류** — 지급·가입·공포 Critical~High · 미검수 public Critical
4. **조치 판단** — PR168-G Knowledge Source Review · PR168-B Visibility Hotfix

## Public Search

1. **오류 접수** — 검색어·화면·결과 유형·요약(PII 검색어 금지)
2. **확인** — 공개·검수 데이터만·admin/bulk 노출 여부
3. **등급 분류** — 미검수 노출 Critical · 청구/보험사 High · 누락 Medium
4. **조치 판단** — PR168-B Visibility Hotfix · PR168-H Public Search Quality
