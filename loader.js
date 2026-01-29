// ============================
// PRODUCT PAGE LOADER (CSV CMS)
// ============================

(() => {

  const sheetCSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXIDMkRwQTvRXpQ65e6eRSg5ACt1zr-z5eO29D0BjoeD_houihmxUwZlbAUM6gFdxE2cHtHvhAiROL/pub?output=csv";

  const root = document.getElementById("product-root");
  if (!root) return;

  // Get current slug (ex: sermorelin-2)
  const slug = window.location.pathname.replace("/", "").trim();

  console.log("[Loader] Product slug:", slug);

  // Load CSS (always global)
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://providers4654.github.io/product-pages/product-page.css?v=" + Date.now();
  document.head.appendChild(css);

  // Fetch CSV data
  fetch(sheetCSV + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {

      const rows = csv.split("\n").slice(1).map(r => r.split(","));

      // Find all matching product rows
      const productRows = rows.filter(r => r[0] === slug);

      if (!productRows.length) {
        root.innerHTML = `<p style="color:red;text-align:center;">
          No product data found for: ${slug}
        </p>`;
        return;
      }

      // Use first row for header fields
      const first = productRows[0];

      const headerPic   = first[1];
      const headerTitle = first[2];
      const headerSub   = first[3];
      const btnText     = first[4];
      const btnLink     = first[5];
      const whatItIs    = first[6];

      // Build Benefits
      const benefitsHTML = productRows
        .filter(r => r[7])
        .map(r => `
          <div class="product-benefit-card">
            <h4>${r[7]}</h4>
            <p>${r[8]}</p>
          </div>
        `)
        .join("");

      // Build FAQ
      const faqHTML = productRows
        .filter(r => r[13])
        .map(r => `
          <div class="product-faq-item">
            <div class="product-faq-question">${r[13]}</div>
            <div class="product-faq-answer">${r[14]}</div>
          </div>
        `)
        .join("");

      // Render Full Page
      root.innerHTML = `

        <!-- HERO -->
        <section class="product-hero">
          <div class="product-hero-image">
            <img src="${headerPic}" alt="${headerTitle}">
          </div>

          <div class="product-hero-text">
            <h2>${headerTitle}</h2>
            <p>${headerSub}</p>

            <div class="product-cta">
              <a href="${btnLink}">${btnText}</a>
            </div>
          </div>
        </section>

        <!-- INTRO -->
        <section class="product-intro">
          <h2>What is it?</h2>
          <div class="product-intro-divider"></div>
          <p>${whatItIs}</p>
        </section>

        <!-- BENEFITS -->
        <section class="product-benefits">
          <div class="product-benefits-overlay">
            <h2>Key Benefits</h2>
            <div class="product-benefits-grid">
              ${benefitsHTML}
            </div>
          </div>
        </section>

        <!-- FAQ -->
        <section class="product-faq">
          <h2>Frequently Asked Questions</h2>
          ${faqHTML}
        </section>

      `;

      console.log("[Loader] Page rendered successfully.");

    })
    .catch(err => {
      console.error("[Loader] Failed to load product sheet:", err);
      root.innerHTML = "<p>Error loading product content.</p>";
    });

})();
