const { response } = require("express");

const cacheName = "static-budget-tracker";
const DataCacheName = "data-budget-tracker";

//setting up iconfiles
const iconsizes = ["72", "96", "128", "144", "152", "192", "384", "512"];
const iconFiles = iconsizes.map(
  (size) => `/public/icons/icon-${size}x${size}.png`
);

const staticFilesToPreCache = [
  "/",
  "/models/transaction.js",
  "/public/index.html",
  "/public/index.js",
  "/public/styles.css",
  "/routes/api.js",
  "/favicon.ico",
  "/manifest.webmanifest",
].concat(iconfiles);

//install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Files Cached");
      return cache.addAll(staticFilesToPreCache);
    })
  );

  self.skipwaiting();
});

//activate
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keylist) => {
      return Promise.all(
        keylist.map((key) => {
          if (key !== cacheName && key !== DataCacheName) {
            console.log("removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.cliants.claim();
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
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request);
        });
      })
    );
  }
});
