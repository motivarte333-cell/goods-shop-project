(function () {
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (window.navigator.standalone === true) return
  if (localStorage.getItem('pwa-banner-dismissed')) return
  if (window.innerWidth >= 768) return

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
                !/crios|fxios/i.test(navigator.userAgent)

  let deferredPrompt = null

  function createBanner(subText, actionLabel, onAction) {
    const banner = document.createElement('div')
    banner.className = 'pwa-banner'
    banner.innerHTML = `
      <div class="pwa-banner-inner">
        <img src="icons/icon-192.png" class="pwa-banner-icon" alt="">
        <div class="pwa-banner-text">
          <strong>Turingshop</strong>
          <span class="pwa-banner-sub">${subText}</span>
        </div>
        <button class="pwa-banner-action">${actionLabel}</button>
        <button class="pwa-banner-close" aria-label="닫기">✕</button>
      </div>
    `
    banner.querySelector('.pwa-banner-close').addEventListener('click', () => {
      banner.remove()
      localStorage.setItem('pwa-banner-dismissed', '1')
    })
    banner.querySelector('.pwa-banner-action').addEventListener('click', onAction)
    document.body.appendChild(banner)
    return banner
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    const banner = createBanner('홈 화면에 추가하고 앱처럼 사용하세요', '설치하기', () => {
      if (!deferredPrompt) return
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') banner.remove()
        deferredPrompt = null
      })
    })
  })

  if (isIOS) {
    setTimeout(() => {
      createBanner('하단 공유(⬆) → 홈 화면에 추가를 탭하세요', '알겠어요', (e) => {
        e.target.closest('.pwa-banner').remove()
        localStorage.setItem('pwa-banner-dismissed', '1')
      })
    }, 800)
  }
})()
