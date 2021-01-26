window.onload =() => {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then(reg =>{
        console.log("service worker found", reg))
    })
  }
}