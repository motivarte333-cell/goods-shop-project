async function pay() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    location.href = 'auth.html?redirect=index.html'
    return
  }

  if (!selectedProduct) return

  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // 주문 미리 저장 (pending)
  const { error: insertError } = await supabase.from('orders').insert({
    user_id: session.user.id,
    user_email: session.user.email,
    product_id: selectedProduct.id,
    product_name: selectedProduct.name,
    total_price: selectedProduct.price,
    order_id: orderId,
    status: 'pending',
  })

  if (insertError) {
    showToast('주문 생성 실패: ' + insertError.message, true)
    return
  }

  document.getElementById('modal').classList.remove('open')

  // Toss 결제 요청
  const toss = TossPayments(TOSS_CLIENT_KEY)
  toss.requestPayment('카드', {
    amount: selectedProduct.price,
    orderId,
    orderName: selectedProduct.name,
    customerName: session.user.email,
    successUrl: BASE_URL + '/index.html',
    failUrl: BASE_URL + '/index.html?payment=fail',
  }).catch(() => {})
}

// 페이지 로드 시 결제 결과 처리
;(async function handlePaymentResult() {
  const params = new URLSearchParams(location.search)
  const paymentKey = params.get('paymentKey')
  const orderId = params.get('orderId')
  const amount = params.get('amount')
  const fail = params.get('payment')

  // URL 파라미터 제거
  if (paymentKey || fail) {
    history.replaceState(null, '', location.pathname)
  }

  if (fail) {
    showToast('결제가 취소되었습니다.', true)
    return
  }

  if (!paymentKey || !orderId || !amount) return

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const res = await fetch(`${SUPABASE_URL}/functions/v1/toss-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  })

  const result = await res.json()
  if (result.success) {
    showToast('결제 완료! 결제 내역을 확인해보세요.')
    setTimeout(() => location.href = 'orders.html', 1500)
  } else {
    showToast('결제 승인 실패: ' + (result.error || '알 수 없는 오류'), true)
  }
})()
