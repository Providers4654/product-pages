// ============================
// PRODUCT PAGE LOADER (SLOTS ENABLED)
// Repo: loader.js
// ============================

(() => {

  console.log("🚀 PRODUCT LOADER STARTING");

  // ============================
  // PRODUCT SHEET CSV
  // ============================
  const sheetCSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXIDMkRwQTvRXpQ65e6eRSg5ACt1zr-z5eO29D0BjoeD_houihmxUwZlbAUM6gFdxE2cHtHvhAiROL/pub?output=csv";

  // ============================
  // ROOT CHECK
  // ============================
  const root = document.getElementById("product-root");
  if (!root) return console.error("❌ product-root not found");

  // ============================
  // PAGE SLUG
  // ============================
  const slug = window.location.pathname.replace(/^\/+/, "").trim().toLowerCase();

  // ============================
  // SAFE CSV PARSER
  // ============================
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (c === '"' && insideQuotes && n === '"') { cell += '"'; i++; }
      else if (c === '"') insideQuotes = !insideQuotes;
      else if (c === "," && !insideQuotes) { row.push(cell); cell = ""; }
      else if (c === "\n" && !insideQuotes) { row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    return rows;
  }

  // ============================
  // TEXT FORMATTER
  // ============================
  const formatText = t => t ? t.replace(/\n/g, "<br><br>") : "";

  // ============================
  // FAQ TOGGLE
  // ============================
  function activateFAQ() {
    document.querySelectorAll(".product-faq-question").forEach(q => {
      q.addEventListener("click", () => {
        q.classList.toggle("open");
        q.nextElementSibling?.classList.toggle("open");
      });
    });
  }

  // ============================
  // LOAD DATA
  // ============================
  fetch(sheetCSV + "&t=" + Date.now())
    .then(r => r.text())
    .then(csv => {

      const rows = parseCSV(csv).slice(1);

      const productRows = rows.filter(r =>
        r[0]?.toString().trim().toLowerCase().replace(/\u00A0/g, " ") === slug
      );

      if (!productRows.length) {
        root.innerHTML = `<p style="text-align:center;color:red;">No product data for <b>${slug}</b></p>`;
        return;
      }

      const first = productRows[0];

      // ============================
      // HEADER FIELDS
      // ============================
      const headerPic   = first[1];
      const headerTitle = first[2];
      const headerSub   = first[3];
      const btnText     = first[4];

      let btnLink = first[5] || "";
      if (btnLink && !btnLink.startsWith("http")) {
        btnLink = "https://mtnhlth.com/" + btnLink.replace(/^\/+/, "");
      }

      const whatItIs  = first[6];
      const howHeader = first[9] || "How It Works";

      // ============================
      // BENEFITS
      // ============================
      const benefitsHTML = productRows
        .filter(r => r[7])
        .map(r => `
          <div class="product-benefit-card">
            <h4>${r[7]}</h4>
            <p>${formatText(r[8])}</p>
          </div>
        `).join("");

      // ============================
      // HOW SECTIONS
      // ============================
      const howHTML = productRows
        .filter(r => r[10] || r[11])
        .map(r => `
          <div class="product-how-card">
            ${r[10] ? `<h3>${r[10]}</h3>` : ""}
            ${r[11] ? `<p>${formatText(r[11])}</p>` : ""}
          </div>
        `).join("");

      // ============================
      // FAQ
      // ============================
      const faqHTML = productRows
        .filter(r => r[14])
        .map(r => `
          <div class="product-faq-item">
            <div class="product-faq-question">${r[14]}</div>
            <div class="product-faq-answer">${formatText(r[15])}</div>
          </div>
        `).join("");

      // ============================
      // RENDER PAGE
      // ============================
      root.innerHTML = `
        <div class="product-page">

          <section class="product-hero">
            <div class="product-hero-image">
              <img src="${headerPic}" alt="${headerTitle}">
            </div>
            <div class="product-hero-text">
              <h2>${headerTitle}</h2>
              <p>${formatText(headerSub)}</p>
              <div class="product-cta">
                <a href="${btnLink}" target="_blank" rel="noopener">${btnText}</a>
              </div>
            </div>
          </section>

          <div id="slot-after-hero"></div>

          <section class="product-intro">
            <h2>What is it?</h2>
            <div class="product-intro-divider"></div>
            <p>${formatText(whatItIs)}</p>
          </section>

          <div id="slot-after-intro"></div>

          <section class="product-benefits">
            <div class="product-benefits-overlay">
              <h2>Key Benefits</h2>
              <div class="product-benefits-grid">
                ${benefitsHTML}
              </div>
            </div>
          </section>

          <div id="slot-after-benefits"></div>

          <section class="product-how">
            <h2>${howHeader}</h2>
            <div class="product-how-grid">
              ${howHTML}
            </div>
          </section>

          <div id="slot-after-how"></div>

          <section class="product-faq">
            <h2>Frequently Asked Questions</h2>
            ${faqHTML}
          </section>

          <div id="slot-after-faq"></div>

        </div>
      `;

      activateFAQ();

    })
    .catch(err => {
      console.error("🔥 Loader failed:", err);
      root.innerHTML = "<p>Error loading product content.</p>";
    });

})();
