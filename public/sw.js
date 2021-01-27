const cacheName = "static-budget-tracker";
const DataCacheName = "data-budget-tracker";

//setting up iconfiles
const iconSizes = ["192", "512"];
const iconFiles = iconSizes.map((size) => `/icons/icon-${size}x${size}.png`);

const staticFilesToPreCache = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest.json",
].concat(iconFiles);

//install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Files Cached");
      return cache.addAll(staticFilesToPreCache);
    })
  );

  self.skipWaiting();
});

//activate
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keylist) => {
      return Promise.all(
        keylist.map((key) => {
          console.log(key);
          if (key !== cacheName && key !== DataCacheName) {
            console.log("removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

//fetch
self.addEventListener("fetch", function (event) {
  const { url } = event.request;
  if (url.includes("/all") || url.includes("/find")) {
    event.respondWith(
      caches
        .open(DataCacheName)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
  } else {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache
          .match(event.request)
          .then((response) => {
            return response || fetch(event.request);
          })
          .catch((err) => console.log(err));
      })
    );
  }
});
