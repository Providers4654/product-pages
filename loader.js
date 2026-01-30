// ============================
// PRODUCT PAGE LOADER (SLOTS ENABLED)
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
  const slug = window.location.pathname
  .replace(/^\/+|\/+$/g, "")
  .split("/")
  .pop()
  .trim();


  console.log("✅ Page slug detected:", slug);

  // ============================
  // NORMALIZE HELPERS
  // ============================
  function normalizeSlug(val) {
    return (val || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\u00A0/g, " ");
  }

 function formatText(text){
  if(!text)return "";
  return text
    .replace(/\r\n/g,"\n")
    .replace(/\n{3,}/g,"\n\n")
    .replace(/\n\n/g,"</p><p>")
    .replace(/\n/g,"<br>")
    .replace(/^/,"<p>")
    .replace(/$/,"</p>");
}


  // ============================
  // SAFE CSV PARSER (FIXED)
  // Ensures last cell/row is included
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
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        // Handle CRLF + LF cleanly
        if (char === "\r" && next === "\n") i++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    // ✅ Push last cell/row if file doesn't end with newline
    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }

  // ============================
  // FAQ TOGGLE ACTIVATION
  // ============================
  function activateFAQ() {
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
  console.log("📥 Fetching spreadsheet...");
  console.log("=====================================");

  fetch(sheetCSV + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {

      const rows = parseCSV(csv).slice(1); // skip header row

      // ============================
      // MATCH PRODUCT ROWS (COL 0)
      // ============================
      const productRows = rows.filter(r => normalizeSlug(r[0]) === normalizeSlug(slug));

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

      const first = productRows[0];

      // ============================
      // COLUMN MAP (0–15)
      // 0 Product
      // 1 Header Pic
      // 2 Header Title
      // 3 Header Subtitle
      // 4 Header Button Text
      // 5 Header Button Link
      // 6 What It Is
      // 7 Benefit Title
      // 8 Benefit Text
      // 9 How Header
      // 10 How Section Titles
      // 11 How Sections Text
      // 12 Who It's For
      // 13 Who It's Not For
      // 14 FAQ Question
      // 15 FAQ Answer
      // ============================

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

      // ✅ SECTION HEADER (COL 9)
      const howHeader = (first[9] || "").trim() || "How It Works";

      // ============================
      // BUILD BENEFITS (COL 7–8)
      // ============================
      const benefitsHTML = productRows
        .filter(r => (r[7] || "").trim())
        .map(r => `
          <div class="product-benefit-card">
            <h4>${r[7]}</h4>
            <p>${formatText(r[8])}</p>
          </div>
        `)
        .join("");

      // ============================
      // BUILD HOW SECTIONS (COL 10–11)
      // ============================
      const howCardsHTML = productRows
        .filter(r => ((r[10] || "").trim() || (r[11] || "").trim()))
        .map(r => `
          <div class="product-how-card">
            ${(r[10] || "").trim() ? `<h3>${r[10]}</h3>` : ""}
            ${(r[11] || "").trim() ? `<p>${formatText(r[11])}</p>` : ""}
          </div>
        `)
        .join("");

      // If no how cards, don't render the section (keeps pages clean)
      const howSectionHTML = howCardsHTML
        ? `
          <section class="product-how">
            <h2>${howHeader}</h2>
            <div class="product-how-grid">
              ${howCardsHTML}
            </div>
          </section>
        `
        : "";

      // ============================
      // BUILD WHO (COL 12–13)
      // ============================
      const whoForHTML = productRows
        .filter(r => (r[12] || "").trim())
        .map(r => `<li><span class="icon check"></span>${formatText(r[12])}</li>`)

        .join("");

      const whoNotHTML = productRows
        .filter(r => (r[13] || "").trim())
        .map(r => `<li><span class="icon x"></span>${formatText(r[13])}</li>`)

        .join("");

      const whoSectionHTML = (whoForHTML || whoNotHTML)
        ? `
          <section class="product-who">
            <h2>Who It's For (and Not For)</h2>
            <div class="product-who-grid">
              <div class="product-who-card">
                <h3>Ideal Candidates</h3>
                <ul>${whoForHTML}</ul>
              </div>
              <div class="product-who-card">
                <h3>Not Recommended For</h3>
                <ul>${whoNotHTML}</ul>
              </div>
            </div>
          </section>
        `
        : "";

      // ============================
      // BUILD FAQ (COL 14–15)
      // ============================
      const faqHTML = productRows
        .filter(r => (r[14] || "").trim())
        .map(r => `
          <div class="product-faq-item">
            <div class="product-faq-question">${r[14]}</div>
            <div class="product-faq-answer">${formatText(r[15])}</div>
          </div>
        `)
        .join("");

      // ============================
      // ✅ RENDER FULL PAGE + SLOTS
      // ============================
      root.innerHTML = `
        <div class="product-page">

          <!-- HERO -->
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

          <!-- ✅ SLOT: AFTER HERO -->
          <div id="slot-after-hero"></div>

          <!-- INTRO -->
          <section class="product-intro">
            <h2>What is it?</h2>
            <div class="product-intro-divider"></div>
            <p>${formatText(whatItIs)}</p>
          </section>

          <!-- ✅ SLOT: AFTER INTRO -->
          <div id="slot-after-intro"></div>

          <!-- BENEFITS -->
          <section class="product-benefits">
            <div class="product-benefits-overlay">
              <h2>Key Benefits</h2>
              <div class="product-benefits-grid">
                ${benefitsHTML}
              </div>
            </div>
          </section>

          <!-- ✅ SLOT: AFTER BENEFITS -->
          <div id="slot-after-benefits"></div>

          <!-- HOW (dynamic header + cards) -->
          ${howSectionHTML}

          <!-- ✅ SLOT: AFTER HOW -->
          <div id="slot-after-how"></div>

          <!-- WHO -->
          ${whoSectionHTML}

          <!-- ✅ SLOT: AFTER WHO -->
          <div id="slot-after-who"></div>

          <!-- FAQ -->
          <section class="product-faq">
            <h2>Frequently Asked Questions</h2>
            ${faqHTML}
          </section>

          <!-- ✅ SLOT: AFTER FAQ -->
          <div id="slot-after-faq"></div>

        </div>
      `;

      console.log("✅ Page HTML rendered successfully.");
      activateFAQ();

    })
    .catch(err => {
      console.error("🔥 Loader FAILED:", err);
      root.innerHTML = "<p>Error loading product content.</p>";
    });

})();
