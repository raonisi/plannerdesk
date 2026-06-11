/**
 * PR-BS-05: Correction flow PII guard copy and topic lists (no logging of raw input).
 */

export const CORRECTION_FORBIDDEN_UI_PHRASES = [
  "고객 정보를 입력하면 더 정확합니다",
  "상담 내용을 그대로 붙여넣어 주세요",
  "진단서 내용을 올려 주세요",
  "보험증권을 첨부해 주세요",
  "청구 가능 여부를 확인해드립니다",
  "보험금 지급 여부를 확인해드립니다",
  "이 정보만 보면 됩니다",
  "최신 정보가 100% 보장됩니다",
  "최신 정보 100% 보장",
] as const;

/** Topics users may report (operational metadata only). */
export const CORRECTION_ALLOWED_REPORT_TOPICS = [
  "보험사 전산 링크 오류",
  "고객센터 번호 오류",
  "전산 헬프데스크 번호 오류",
  "인콜/모니터링 번호 오류",
  "청구 팩스 번호 오류",
  "등기우편 주소 오류",
  "약관 링크 오류",
  "청구양식 링크 오류",
  "공시/약관 링크 오류",
  "청구서류 명칭 또는 분류 오류",
  "카드납 가능 여부 오류",
  "지원 브라우저 정보 오류",
  "오탈자 또는 UI 표시 오류",
  "공식 출처 변경 제보",
  "정보 최신성·확인일 문제",
] as const;

/** Must not be submitted in free-text fields. */
export const CORRECTION_PROHIBITED_INPUT_TOPICS = [
  "고객 이름",
  "주민등록번호",
  "휴대폰 번호",
  "주소",
  "이메일",
  "계약번호",
  "증권번호",
  "계좌번호",
  "카드번호",
  "병명",
  "진단명",
  "진단서",
  "처방전",
  "진료기록",
  "검사결과지",
  "상담 원문",
  "입퇴원확인서 원본",
  "수술확인서 원본",
  "보험금 청구서 원본",
  "고객 의료자료",
  "신분증·보험증권 이미지",
  "secret·token·API key",
  "보험금 지급 가능 여부 판단 요청",
  "보험금 지급 금액 산정 요청",
  "손해사정 판단 요청",
  "의료 진단 해석 요청",
] as const;
