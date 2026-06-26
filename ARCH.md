# 아키텍처

## 레포 구조
- `goods-shop-project` (private): 전체 작업. Supabase 설정, Edge Function, 프론트엔드 소스
- `goods-shop` (public): `public/` 폴더 내용만 자동 배포 → GitHub Pages 서빙

## 폴더 구조
```
public/          → goods-shop 레포로 배포되는 정적 파일
  index.html     상품 목록 + 결제
  auth.html      로그인/회원가입
  orders.html    내 결제 내역
  admin.html     관리자 전체 내역
  css/style.css  공통 스타일
  js/
    config.js    공개 키 (Supabase URL/anon key, Toss client key)
    auth.js      인증 로직
    products.js  상품 목록 + 모달
    payment.js   Toss 결제 요청 + 승인 처리
    orders.js    결제 내역 조회

supabase/
  migrations/20260626000000_init.sql   products·orders 테이블, RLS, 상품 16개
  functions/toss-confirm/index.ts      결제 승인 Edge Function
```

## DB 테이블
- `products`: 상품 목록 (id, name, price, image_url)
- `orders`: 결제 내역 (user_id, user_email, product_name, total_price, status, order_id, payment_key)

## 결제 플로우
1. 상품 클릭 → 모달 → "결제하기"
2. orders INSERT (status: pending)
3. Toss requestPayment() → Toss 결제 페이지
4. 완료 → index.html?paymentKey=...&orderId=...&amount=...
5. payment.js → `/functions/v1/toss-confirm` 호출
6. Edge Function: Toss 승인 API → orders UPDATE (status: paid)

## 보안
| 키 종류 | 위치 |
|---------|------|
| Supabase anon key | public/js/config.js (공개 가능) |
| Toss client key | public/js/config.js (공개 가능) |
| Supabase service_role | Edge Function 환경변수 (자동 주입) |
| Toss secret key | Edge Function 환경변수 (`supabase secrets set`) |
| DB 비밀번호 | .env.local (gitignored) |

## 관리자
- 계정: admin@admin.com / superadmin (Supabase Dashboard에서 수동 생성)
- RLS: `orders_read_admin` 정책이 해당 이메일에게 전체 행 허용
- 프론트: 이메일 불일치 시 index.html로 즉시 리다이렉트

## 배포
`public/` 변경 후 main 브랜치 push → GitHub Actions → goods-shop 레포 force push → GitHub Pages 자동 반영
