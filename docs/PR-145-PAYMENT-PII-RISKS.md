# PR-145 — 결제·개인정보·세금정보 리스크

PR145에서 결제정보·환불 계좌 **수집 구조 추가 금지**.

결제 로그는 metadata 최소화. webhook secret·PG API key는 env에만(본 PR에서 설정 금지).
