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

  // ============================
  // Load CSS (cache-busted)
  // ============================
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href =
    "https://providers4654.github.io/product-pages/product-page.css?v=" +
    Date.now();
  document.head.appendChild(css);

  // ============================
  // Helper: Safe CSV Parser
  // ============================
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && insideQuotes && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(cell);
        cell = "";
      } else if (char === "\n" && !insideQuotes) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    return rows;
  }

  // ============================
  // Helper: Preserve Returns
  // ============================
  function formatText(text) {
    if (!text) return "";
    return text.replace(/\n/g, "<br><br>");
  }

  // ============================
  // Fetch CSV Data (no cache)
  // ============================
  fetch(sheetCSV + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {

      // Parse all rows safely
      const rows = parseCSV(csv).slice(1);

      // Find all matching product rows
      const productRows = rows.filter(r => r[0] === slug);

      if (!productRows.length) {
        root.innerHTML = `
          <p style="color:red;text-align:center;">
            No product data found for: ${slug}
          </p>
        `;
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

      // ============================
      // Build Benefits Section
      // ============================
      const benefitsHTML = productRows
        .filter(r => r[7])
        .map(r => `
          <div class="product-benefit-card">
            <h4>${r[7]}</h4>
            <p>${formatText(r[8])}</p>
          </div>
        `)
        .join("");

      // ============================
      // Build FAQ Section
      // ============================
      const faqHTML = productRows
        .filter(r => r[13])
        .map(r => `
          <div class="product-faq-item">
            <div class="product-faq-question">${r[13]}</div>
            <div class="product-faq-answer">${formatText(r[14])}</div>
          </div>
        `)
        .join("");

      // ============================
      // Render Full Page
      // ============================
      root.innerHTML = `

        <!-- HERO -->
        <section class="product-hero">
          <div class="product-hero-image">
            <img src="${headerPic}" alt="${headerTitle}">
          </div>

          <div class="product-hero-text">
            <h2>${headerTitle}</h2>
            <p>${formatText(headerSub)}</p>

            <div class="product-cta">
              <a href="${btnLink}">${btnText}</a>
            </div>
          </div>
        </section>

        <!-- INTRO -->
        <section class="product-intro">
          <h2>What is it?</h2>
          <div class="product-intro-divider"></div>
          <p>${formatText(whatItIs)}</p>
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

      // ============================
      // Activate FAQ Accordion
      // ============================
      document.querySelectorAll(".product-faq-question").forEach(q => {
        q.addEventListener("click", () => {
          q.classList.toggle("open");
          const a = q.nextElementSibling;
          if (a) a.classList.toggle("open");
        });
      });

    })
    .catch(err => {
      console.error("[Loader] Failed to load product sheet:", err);
      root.innerHTML = "<p>Error loading product content.</p>";
    });

})();
