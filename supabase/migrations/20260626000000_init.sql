-- products 테이블
CREATE TABLE products (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  price     INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- orders 테이블
CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) NOT NULL,
  user_email   TEXT NOT NULL,
  product_id   INTEGER REFERENCES products(id) NOT NULL,
  product_name TEXT NOT NULL,
  total_price  INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'paid', 'failed')),
  payment_key  TEXT,
  order_id     TEXT UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_read_all" ON products FOR SELECT USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_read_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_read_admin" ON orders
  FOR SELECT USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@admin.com'
  );
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 상품 데이터 (davelee-fun.github.io 이미지)
INSERT INTO products (name, price, image_url) VALUES
('보몽드 순면스퀘어 솔리드 누빔매트커버 다크블루', 35000, 'https://static.coupangcdn.com/image/retail/images/2018/09/18/11/8/6964dd11-7ff2-448d-8462-db07e3ca2a5f.jpg'),
('슈에뜨룸 선인장 리플 침구 세트 베이지', 89000, 'https://static.coupangcdn.com/image/retail/images/2017/05/15/16/3/cd40fc67-e838-4f5d-b90a-45b0f0336729.jpg'),
('선우랜드 레인보우 2단 문걸이용 옷걸이 화이트', 12000, 'https://static.coupangcdn.com/image/product/image/vendoritem/2015/10/16/3000156691/82761df2-59fb-4970-a67e-cea8bfcd8cac.jpg'),
('보드래 헬로우 누빔 매트리스커버 핑크', 28000, 'https://static.coupangcdn.com/image/retail/images/2020/02/25/12/2/a775b261-1ad7-4bad-873e-85ed4221f091.jpg'),
('보드래 퍼펙트 누빔 매트리스커버 차콜', 32000, 'https://static.coupangcdn.com/image/retail/images/2017/10/11/16/6/bf3b2157-528d-4b24-9991-b601a24f4c6f.jpg'),
('피아블 클래식 방수 매트리스커버 화이트', 45000, 'https://static.coupangcdn.com/image/product/image/vendoritem/2018/11/28/3647689009/d72a996d-1e4e-42be-a23c-f9f6872214bb.jpg'),
('더자리 에코항균 마이크로 매트리스커버 밀키차콜그레이', 38000, 'https://static.coupangcdn.com/image/product/image/vendoritem/2019/06/11/3361297461/699c49cc-5f9f-4927-ab26-b184f90c1571.jpg'),
('더자리 프레쉬 퓨어 매트리스 커버 차콜그레이', 42000, 'https://static.coupangcdn.com/image/retail/images/2018/10/26/16/9/c6dfa004-442c-4f48-9ff1-b76d81bae046.jpg'),
('몽쉐어 알러스킨 항균 매트리스 커버 카키그레이', 55000, 'https://static.coupangcdn.com/image/retail/images/2019/04/01/22/6/f9566f49-cf8c-48dd-bc73-b543a3f47f62.jpg'),
('코멧 홈 40수 트윌 순면 홑겹 매트리스커버 그레이', 29000, 'https://static.coupangcdn.com/image/retail/images/12859794410743-0ab1b2fe-1cd4-4599-b38a-3fb22f3bf620.jpg'),
('패브릭아트 항균 마이크로 원단 매트리스 커버 아이보리', 33000, 'https://static.coupangcdn.com/image/retail/images/2019/03/28/19/3/2d9f9b52-0cc9-424f-8639-8f298429d244.jpg'),
('바숨 순면 누빔 침대 매트리스커버 차콜', 41000, 'https://static.coupangcdn.com/image/retail/images/2017/10/19/15/4/95b93d25-7014-458a-a2a5-9b93189cdcef.jpg'),
('WEMAX 다용도 문옷걸이 화이트', 15000, 'https://static.coupangcdn.com/image/retail/images/2019/07/29/12/3/704931d7-4dbd-4af7-9247-856831bdc61e.jpg'),
('타카타카 나노 화이바 누빔 매트리스 커버 젠틀핑핑', 36000, 'https://static.coupangcdn.com/image/retail/images/2017/10/13/10/3/8379ffd3-63be-4da4-98f9-895aaa0c9b52.jpg'),
('보몽드 순면스퀘어 누빔매트커버 다크그레이', 34000, 'https://static.coupangcdn.com/image/retail/images/2018/09/17/19/4/329dbb2f-a0ad-44d4-af46-1eea0c548b67.jpg'),
('보드래 국내산 순면 60수 누빔 매트리스커버 그레이', 48000, 'https://static.coupangcdn.com/image/retail/images/339338956730835-5cbe0521-2a03-4fe2-8eb7-7a7ae9ff187f.jpg');
