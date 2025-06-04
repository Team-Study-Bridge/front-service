self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    const payload = event.data?.json();
    console.log('[Service Worker] Payload:', payload);

    const { title, body, image, url } = payload?.notification ?? payload?.data ?? {};

    event.waitUntil(
        self.registration.showNotification(title || '🔥 새로운 소식!', {
            body: body || '알림 내용을 확인해보세요.',
            icon: '/icons/pretty-icon.png',               // 컬러풀하고 돋보이는 앱 아이콘
            badge: '/icons/badge-white.png',              // 상태바용 작고 흰색 뱃지
            image: image || '/images/banner-default.png', // 🔥 큰 배너 이미지
            vibrate: [200, 100, 200],                     // 두 번 진동
            data: { url: url || '/' },                    // 클릭 시 이동할 주소
            actions: [
                {
                    action: 'open',
                    title: '👉 열어보기',
                    icon: '/icons/open-icon.png',
                },
                {
                    action: 'dismiss',
                    title: '❌ 닫기',
                    icon: '/icons/close-icon.png',
                },
            ]
        })
    );
});