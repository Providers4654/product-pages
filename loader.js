// ============================
// PRODUCT PAGE LOADER (FULL CMS)
// ============================

(() => {

  const sheetCSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXIDMkRwQTvRXpQ65e6eRSg5ACt1zr-z5eO29D0BjoeD_houihmxUwZlbAUM6gFdxE2cHtHvhAiROL/pub?output=csv";

  const root = document.getElementById("product-root");
  if (!root) return;

  // Slug: sermorelin-2
  const slug = window.location.pathname.replace(/^\/+/, "").trim();

  console.log("[Loader] Product slug:", slug);

// ============================
// Load CSS (Correct Way)
// ============================
if (!document.getElementById("product-css")) {

  const link = document.createElement("link");
  link.id = "product-css";
  link.rel = "stylesheet";

  link.href =
    "https://cdn.jsdelivr.net/gh/Providers4654/product-pages@main/product-page.css?v=" +
    Date.now();

  document.head.appendChild(link);
}


  // ============================
  // Safe CSV Parser (Commas OK)
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
  // Preserve Returns in Cells
  // ============================
  function formatText(text) {
    if (!text) return "";
    return text.replace(/\n/g, "<br><br>");
  }

  // ============================
  // Fetch Spreadsheet
  // ============================
  fetch(sheetCSV + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {

      const rows = parseCSV(csv).slice(1);

      // Match product rows
      const productRows = rows.filter(r => r[0] === slug);

      if (!productRows.length) {
        root.innerHTML = `
          <p style="color:red;text-align:center;">
            No product data found for: <b>${slug}</b>
          </p>
        `;
        return;
      }

      const first = productRows[0];

      const headerPic   = first[1];
      const headerTitle = first[2];
      const headerSub   = first[3];
      const btnText     = first[4];
      const btnLink     = first[5];
      const whatItIs    = first[6];

      // BENEFITS
      const benefitsHTML = productRows
        .filter(r => r[7])
        .map(r => `
          <div class="product-benefit-card">
            <h4>${r[7]}</h4>
            <p>${formatText(r[8])}</p>
          </div>
        `)
        .join("");

      // HOW IT WORKS
      const howHTML = productRows
        .filter(r => r[9])
        .map(r => `
          <div class="product-how-card">
            <h3>${r[9]}</h3>
            <p>${formatText(r[10])}</p>
          </div>
        `)
        .join("");

      // WHO IT'S FOR
      const forHTML = productRows
        .filter(r => r[11])
        .map(r => `
          <li><span class="emoji">✅</span>${r[11]}</li>
        `)
        .join("");

      // WHO IT'S NOT FOR
      const notHTML = productRows
        .filter(r => r[12])
        .map(r => `
          <li><span class="emoji">❌</span>${r[12]}</li>
        `)
        .join("");

      // FAQ
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
      // Render Full Page (WRAPPED)
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
                <a href="${btnLink}">${btnText}</a>
              </div>
            </div>
          </section>

          <section class="product-intro">
            <h2>What is it?</h2>
            <div class="product-intro-divider"></div>
            <p>${formatText(whatItIs)}</p>
          </section>

          <section class="product-benefits">
            <div class="product-benefits-overlay">
              <h2>Key Benefits</h2>
              <div class="product-benefits-grid">
                ${benefitsHTML}
              </div>
            </div>
          </section>

          <section class="product-how">
            <h2>How It Works</h2>
            <div class="product-how-grid">
              ${howHTML}
            </div>
          </section>

          <section class="product-who">
            <h2>Who It’s For (and Not For)</h2>

            <div class="product-who-grid">

              <div class="product-who-card">
                <h3>Ideal Candidates</h3>
                <ul class="product-who-list">
                  ${forHTML}
                </ul>
              </div>

              <div class="product-who-card">
                <h3>Not Recommended For</h3>
                <ul class="product-who-list">
                  ${notHTML}
                </ul>
              </div>

            </div>
          </section>

          <section class="product-faq">
            <h2>Frequently Asked Questions</h2>
            ${faqHTML}
          </section>

        </div>
      `;

      console.log("[Loader] Product page rendered successfully.");

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
      console.error("[Loader] Spreadsheet load failed:", err);
      root.innerHTML = "<p>Error loading product content.</p>";
    });

})();
