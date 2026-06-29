var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function badgeHTML(status) {
  const map = { paid: ['paid', '결제완료'], pending: ['pending', '대기중'], failed: ['failed', '실패'] }
  const [cls, label] = map[status] || ['pending', status]
  return `<span class="badge badge-${cls}">${label}</span>`
}

async function logout() {
  await supabase.auth.signOut()
  location.href = 'index.html'
}

async function loadOrders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { location.href = 'auth.html?redirect=orders.html'; return }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const container = document.getElementById('order-list')

  if (error || !orders?.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🛍️</div>
        <div class="empty-text">결제 내역이 없습니다.</div>
        <a href="index.html" class="btn btn-primary btn-sm" style="width:auto">쇼핑하러 가기</a>
      </div>`
    return
  }

  container.innerHTML = orders.map(o => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-name">${o.product_name}</div>
        <div class="order-price">${formatPrice(o.total_price)}</div>
        <div class="order-date">${formatDate(o.created_at)}</div>
        <div style="margin-top:6px">${badgeHTML(o.status)}</div>
      </div>
    </div>
  `).join('')
}

loadOrders()
