// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/data-service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        registration.update();
      }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Transición Suave entre Páginas (View Transitions & Anti-Flicker)
(function() {
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || link.hasAttribute('download')) {
      return;
    }

    try {
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin && (destination.pathname !== window.location.pathname || destination.search !== window.location.search)) {
        if (CSS.supports && CSS.supports('view-transition-name', 'root')) {
          return; // Native cross-document view transition handled by browser engine
        }
        
        e.preventDefault();
        document.body.classList.add('page-exiting');
        setTimeout(function() {
          window.location.href = destination.href;
        }, 180);
      }
    } catch (err) {
      // Ignore invalid URLs
    }
  });

  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      document.body.classList.remove('page-exiting');
    }
  });
})();
