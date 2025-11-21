// loader.js
// Single entry point used by Squarespace.
// Responsibilities:
//  - Inject HTML shell into #product-root
//  - Inject shared CSS
//  - Inject main JS
//  - Pass sheet CSV URL + root ID into the initializer

(function () {
  var HTML_URL =
    "https://cdn.jsdelivr.net/gh/Providers4654/product-pages@main/product-page.html";
  var CSS_URL =
    "https://cdn.jsdelivr.net/gh/Providers4654/product-pages@main/product-page.css";
  var JS_URL =
    "https://cdn.jsdelivr.net/gh/Providers4654/product-pages@main/product-page.js";

  // Your published CSV (from Google Sheets)
  var SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXIDMkRwQTvRXpQ65e6eRSg5ACt1zr-z5eO29D0BjoeD_houihmxUwZlbAUM6gFdxE2cHtHvhAiROL/pub?gid=0&single=true&output=csv";

  function ensureRoot() {
    var root = document.getElementById("product-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "product-root";
      document.body.appendChild(root);
    }
    return root;
  }

  function injectCss() {
    if (document.querySelector('link[data-mtn-product-css="1"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_URL;
    link.setAttribute("data-mtn-product-css", "1");
    document.head.appendChild(link);
  }

  function injectHtml(root) {
    return fetch(HTML_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load HTML shell");
        return res.text();
      })
      .then(function (html) {
        root.innerHTML = html;
      });
  }

  function injectJs() {
    return new Promise(function (resolve, reject) {
      if (window.MTN_PRODUCT_PAGE_INIT) {
        // Already loaded
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = JS_URL;
      script.async = true;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Failed to load product-page.js"));
      };
      document.head.appendChild(script);
    });
  }

  function init() {
    var root = ensureRoot();
    injectCss();
    injectHtml(root)
      .then(injectJs)
      .then(function () {
        if (typeof window.MTN_PRODUCT_PAGE_INIT === "function") {
          window.MTN_PRODUCT_PAGE_INIT({
            rootId: "product-root",
            sheetCsvUrl: SHEET_CSV_URL,
          });
        } else {
          console.error("MTN_PRODUCT_PAGE_INIT not found");
        }
      })
      .catch(function (err) {
        console.error(err);
        root.innerHTML =
          '<p style="max-width:700px;margin:40px auto;font-family:Helvetica,Arial,sans-serif;color:#c00;">Error loading product page. Please try again later.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
