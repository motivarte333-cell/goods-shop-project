var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
let selectedProduct = null

function showToast(msg, isError = false) {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.className = 'toast show' + (isError ? ' error' : '')
  setTimeout(() => t.className = 'toast', 2500)
}

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

function openModal(product) {
  selectedProduct = product
  document.getElementById('modal-img').src = product.image_url
  document.getElementById('modal-img').alt = product.name
  document.getElementById('modal-name').textContent = product.name
  document.getElementById('modal-price').textContent = formatPrice(product.price)
  document.getElementById('modal').classList.add('open')
}

function closeModal(e) {
  if (e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open')
  }
}

async function loadProducts() {
  const { data: products, error } = await supabase.from('products').select('*').order('id')

  const container = document.getElementById('product-list')
  if (error || !products?.length) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">📦</div><div class="empty-text">상품이 없습니다.</div></div>'
    return
  }

  container.innerHTML = products.map(p => `
    <div class="product-card" onclick='openModal(${JSON.stringify(p)})'>
      <img src="${p.image_url}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="btn btn-primary" style="margin-top:auto">구매하기</button>
      </div>
    </div>
  `).join('')
}

async function renderNav() {
  const { data: { session } } = await supabase.auth.getSession()
  const nav = document.getElementById('nav')
  if (session) {
    const isAdmin = session.user.email === 'admin@admin.com'
    nav.innerHTML = `
      ${isAdmin ? '<a href="admin.html">관리자</a>' : ''}
      <a href="orders.html">결제내역</a>
      <button class="btn-logout" onclick="logout()">로그아웃</button>
    `
  } else {
    nav.innerHTML = '<a href="auth.html">로그인</a>'
  }
}

async function logout() {
  await supabase.auth.signOut()
  location.reload()
}

renderNav()
loadProducts()

// 결제 완료 후 리다이렉트 처리 (payment.js에서 처리)
