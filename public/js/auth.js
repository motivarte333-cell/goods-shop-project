var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function showToast(msg, isError = false) {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.className = 'toast show' + (isError ? ' error' : '')
  setTimeout(() => t.className = 'toast', 2500)
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((el, i) => {
    el.classList.toggle('active', (i === 0) === (tab === 'login'))
  })
  document.getElementById('login-form').classList.toggle('active', tab === 'login')
  document.getElementById('signup-form').classList.toggle('active', tab === 'signup')
}

async function login() {
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value
  if (!email || !password) { showToast('이메일과 비밀번호를 입력해주세요.', true); return }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) { showToast(error.message, true); return }

  const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html'
  location.href = redirect
}

async function signup() {
  const email = document.getElementById('signup-email').value.trim()
  const password = document.getElementById('signup-password').value
  if (!email || !password) { showToast('이메일과 비밀번호를 입력해주세요.', true); return }
  if (password.length < 6) { showToast('비밀번호는 6자 이상이어야 합니다.', true); return }

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) { showToast(error.message, true); return }

  showToast('회원가입 완료! 로그인합니다.')
  setTimeout(() => {
    supabase.auth.signInWithPassword({ email, password }).then(() => {
      location.href = 'index.html'
    })
  }, 1000)
}

// 이미 로그인된 경우 바로 이동
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) location.href = 'index.html'
})

// Enter 키
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return
  const activeForm = document.querySelector('.auth-form.active').id
  if (activeForm === 'login-form') login()
  else signup()
})
