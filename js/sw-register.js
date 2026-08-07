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
