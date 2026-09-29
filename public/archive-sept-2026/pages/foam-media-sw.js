/* Retire only the formerly public archive's media cache. */
const archivedScope = '/NEWFOAMHOME/archive-sept-2026/pages/';
const archivedCachePrefix = 'foam-media-v1:' + archivedScope + ':';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const scope = new URL(self.registration.scope);
  if (scope.pathname !== archivedScope) return;
  try {
    await Promise.all((await caches.keys()).filter(name => name.startsWith(archivedCachePrefix)).map(name => caches.delete(name)));
  } finally {
    await self.registration.unregister();
  }
})()));
