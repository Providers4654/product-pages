// ============================
// PRODUCT PAGE LOADER (HTML + CSS + JS)
// Repo: product-pages
// ============================

(() => {

  const manualBump = "1"; // change only if needed

  const today = new Date();
  const daily =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  const version = daily + (manualBump ? "-" + manualBump : "");
  const ts = Date.now();

  // Only run if product-root exists
  const root = document.getElementById("product-root");
  if (!root) return;

  // === 1. Load Product HTML ===
  fetch(`https://providers4654.github.io/product-pages/product-page.html?v=${version}&t=${ts}`)
    .then(res => res.text())
    .then(html => {

      root.innerHTML = html;

      // === 2. Load Product CSS ===
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = `https://providers4654.github.io/product-pages/product-page.css?v=${version}&t=${ts}`;
      css.crossOrigin = "anonymous";
      css.referrerPolicy = "no-referrer";
      document.head.appendChild(css);

      // === 3. Load Product JS ===
      const js = document.createElement("script");
      js.src = `https://providers4654.github.io/product-pages/product-page.js?v=${version}&t=${ts}`;
      js.crossOrigin = "anonymous";
      js.referrerPolicy = "no-referrer";

      js.onload = () => {
        console.log("[Loader] product-page.js loaded");
      };

      document.body.appendChild(js);

    })
    .catch(err => console.error("[Product Loader] Failed:", err));

  console.log(`[Product Loader] version=${version}, ts=${ts}`);

})();
