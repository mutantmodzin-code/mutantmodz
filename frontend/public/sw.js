// MutantModz Admin - Push Notification Service Worker

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { title: 'New Order!', body: event.data ? event.data.text() : '' };
    }

    const title = data.title || '🛒 New Online Order!';
    const options = {
        body: data.body || 'A new order has been placed on MutantModz.',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'new-order-' + (data.orderId || Date.now()),
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 400],
        data: {
            url: data.url || 'https://mutantmodzadmin.vercel.app/online-orders',
            orderId: data.orderId
        },
        actions: [
            { action: 'view', title: '👀 View Order' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || 'https://mutantmodzadmin.vercel.app/online-orders';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('mutantmodzadmin') && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
