// ============================
// PRODUCT PAGE LOADER (FIXED)
// Repo: loader.js
// ============================

(() => {

  console.log("=====================================");
  console.log("🚀 PRODUCT LOADER STARTING...");
  console.log("=====================================");

  // ============================
  // PRODUCT SHEET CSV
  // ============================
  const sheetCSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXIDMkRwQTvRXpQ65e6eRSg5ACt1zr-z5eO29D0BjoeD_houihmxUwZlbAUM6gFdxE2cHtHvhAiROL/pub?output=csv";

  console.log("📌 Sheet URL:", sheetCSV);

  // ============================
  // ROOT CHECK
  // ============================
  const root = document.getElementById("product-root");

  if (!root) {
    console.error("❌ product-root NOT FOUND. Loader exiting.");
    return;
  }

  console.log("✅ product-root found:", root);

  // ============================
  // PAGE SLUG DETECTION
  // ============================
  const slug = window.location.pathname.replace(/^\/+/, "").trim();

  console.log("✅ Page slug detected:", slug);


  // ============================
  // SAFE CSV PARSER
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
      }
      else if (char === '"') {
        insideQuotes = !insideQuotes;
      }
      else if (char === "," && !insideQuotes) {
        row.push(cell);
        cell = "";
      }
      else if (char === "\n" && !insideQuotes) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }
      else {
        cell += char;
      }
    }

    return rows;
  }

  // ============================
  // TEXT FORMATTER
  // ============================
  function formatText(text) {
    if (!text) return "";
    return text.replace(/\n/g, "<br><br>");
  }

  // ============================
  // FAQ TOGGLE ACTIVATION
  // ============================
  function activateFAQ() {
    console.log("⚙️ Activating FAQ accordion...");

    document.querySelectorAll(".product-faq-question").forEach(q => {
      q.addEventListener("click", () => {
        q.classList.toggle("open");

        const answer = q.nextElementSibling;
        if (answer) answer.classList.toggle("open");
      });
    });

    console.log("✅ FAQ accordion active.");
  }

  // ============================
  // MAIN LOAD FLOW
  // ============================

    console.log("=====================================");
    console.log("✅ CSS READY — Now fetching spreadsheet...");
    console.log("=====================================");

    fetch(sheetCSV + "&t=" + Date.now())
      .then(res => res.text())
      .then(csv => {

        const rows = parseCSV(csv).slice(1);

        // ============================
        // MATCH PRODUCT ROWS
        // ============================
        const productRows = rows.filter(r => r[0] === slug);

        console.log("🔍 Matching product rows found:", productRows.length);

        if (!productRows.length) {
          root.innerHTML = `
            <div class="product-page">
              <p style="color:red;text-align:center;">
                No product data found for: <b>${slug}</b>
              </p>
            </div>
          `;
          return;
        }

        console.log("✅ Product data found!");

        const first = productRows[0];

        // ============================
        // HEADER FIELDS
        // ============================
        const headerPic   = first[1];
        const headerTitle = first[2];
        const headerSub   = first[3];
        const btnText     = first[4];
        const btnLink     = first[5];
        const whatItIs    = first[6];

        // ============================
        // BUILD BENEFITS
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
        // BUILD FAQ
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
        // RENDER FULL PAGE
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

            <section class="product-faq">
              <h2>Frequently Asked Questions</h2>
              ${faqHTML}
            </section>

          </div>
        `;

        console.log("✅ Page HTML rendered successfully.");

        // Activate FAQ AFTER render
        activateFAQ();

      })
      .catch(err => {
        console.error("🔥 Loader FAILED:", err);
        root.innerHTML = "<p>Error loading product content.</p>";
      });


})();
