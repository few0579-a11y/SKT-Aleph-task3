
# 카드 5 — JSON 백업·복원 테스트 기록

- 검사 날짜: 2026-10-16
- 검사 환경: Chrome / Live Server
- 검사 대상: JSON 내보내기, 복원, 오류 처리
- 검사 결과: 자체 테스트 PASS

## 1. 구현 기능

- 저장된 템플릿 목록을 JSON 파일로 내보내기
- JSON 백업 파일에서 템플릿 복원
- 복원 전 JSON 구조와 필수 항목 검사
- 중복 템플릿 ID 검사 기능 구현
- 기존 데이터 교체 전 사용자 확인
- 잘못된 파일 복원 실패 시 기존 데이터 유지

※ 이미지 원본은 JSON 백업에 포함되지 않는다.

## 2. JSON 다운로드 테스트

1. JSON 파일 다운로드: PASS
2. VS Code에서 JSON 파일 열기: PASS
3. version, exportedAt, templates 확인: PASS
4. 저장한 템플릿 설정 확인: PASS

결과: 4/4 PASS

## 3. 정상 JSON 복원 테스트

- 백업 파일: card-studio-backup.json
- 복원 완료 메시지 표시: PASS
- 저장된 템플릿 목록 복원: PASS

결과: PASS

## 4. TEST 01 — 손상된 JSON

- 검사 파일: broken_backup.json
- 검사 조건: JSON 문법이 잘못된 파일
- 오류 메시지 표시: PASS
- 기존 템플릿 목록 유지: PASS
- 새로고침 후 데이터 유지: PASS
- 기존 템플릿 불러오기: PASS

결과: 5/5 PASS

## 5. TEST 02 — 필수 항목 누락 JSON

- 검사 파일: missing_fields_backup.json
- 검사 조건: JSON 문법은 정상이지만 필수 설정 누락
- 필수 데이터 오류 메시지 표시: PASS
- 잘못된 템플릿 추가 방지: PASS
- 기존 템플릿 목록 유지: PASS
- 새로고침 후 데이터 유지: PASS

결과: 5/5 PASS

## 6. 최종 통합 검사

1. JSON 백업 다운로드: PASS
2. 백업 데이터 내용 확인: PASS
3. 백업 후 테스트 템플릿 추가: PASS
4. JSON 복원 후 이전 상태로 복구: PASS
5. 새로고침 후 복원 상태 유지: PASS
6. 손상된 JSON 거부 및 데이터 보호: PASS
7. 필수 항목 누락 JSON 거부 및 데이터 보호: PASS

결과: 7/7 PASS

## 7. 배운 점

- JSON.stringify()는 객체를 JSON 문자열로 변환한다.
- JSON.parse()는 JSON 문자열을 JavaScript 데이터로 변환한다.
- Blob과 URL.createObjectURL()을 이용해 파일 다운로드를 구현할 수 있다.
- every()로 배열의 모든 항목이 조건을 만족하는지 검사할 수 있다.
- try...catch로 오류를 처리할 수 있다.
- 기존 데이터를 보호하려면 검증을 마친 후에 저장해야 한다.
- localStorage 데이터는 다른 브라우저와 자동 동기화되지 않는다.

## 8. 최종 결과

카드 5 기능 자체 테스트: PASS
공식 평가 승인 여부: 미확인
최종 제출·공개 URL·보안 점검: 진행 예정
