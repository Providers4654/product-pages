// ============================
// PRODUCT PAGE LOADER (DEBUG)
// ============================

(() => {

  console.log("=====================================");
  console.log("🚀 PRODUCT LOADER STARTING...");
  console.log("=====================================");

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
  // SLUG CHECK
  // ============================
  const slug = window.location.pathname.replace(/^\/+/, "").trim();

  console.log("✅ Page slug detected:", slug);

  // ============================
  // LOAD CSS PROPERLY
  // ============================
  console.log("🎨 Attempting CSS injection...");

  if (!document.getElementById("product-css")) {

    const link = document.createElement("link");
    link.id = "product-css";
    link.rel = "stylesheet";

    link.href =
      "https://cdn.jsdelivr.net/gh/Providers4654/product-pages@main/product-page.css?v=" +
      Date.now();

    console.log("📌 CSS href:", link.href);

    // Success callback
    link.onload = () => {
      console.log("✅ CSS LOADED SUCCESSFULLY!");
    };

    // Failure callback
    link.onerror = (e) => {
      console.error("❌ CSS FAILED TO LOAD!", e);
    };

    document.head.appendChild(link);

    console.log("✅ CSS <link> appended to <head>:", link);

  } else {
    console.log("⚠️ CSS already exists, skipping injection.");
  }

  // ============================
  // SAFE CSV PARSER
  // ============================
  function parseCSV(text) {
    console.log("📄 Parsing CSV text...");

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

    console.log("✅ CSV Parsed. Total rows:", rows.length);
    return rows;
  }

  // ============================
  // FORMAT RETURNS
  // ============================
  function formatText(text) {
    if (!text) return "";
    return text.replace(/\n/g, "<br><br>");
  }

  // ============================
  // FETCH SHEET DATA
  // ============================
  console.log("🌐 Fetching spreadsheet CSV...");

  fetch(sheetCSV + "&t=" + Date.now())
    .then(res => {
      console.log("✅ Fetch response received:", res.status);
      return res.text();
    })
    .then(csv => {

      console.log("✅ CSV Raw Length:", csv.length);

      const rows = parseCSV(csv).slice(1);

      console.log("📌 First row sample:", rows[0]);

      // ============================
      // MATCH PRODUCT ROWS
      // ============================
      const productRows = rows.filter(r => r[0] === slug);

      console.log("🔍 Matching product rows found:", productRows.length);

      if (!productRows.length) {
        console.error("❌ NO MATCHING PRODUCT FOUND FOR:", slug);

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

      console.log("🖼 Header image:", headerPic);
      console.log("📝 Title:", headerTitle);

      // ============================
      // BUILD SECTIONS
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

      console.log("✅ Benefits built.");

      const faqHTML = productRows
        .filter(r => r[13])
        .map(r => `
          <div class="product-faq-item">
            <div class="product-faq-question">${r[13]}</div>
            <div class="product-faq-answer">${formatText(r[14])}</div>
          </div>
        `)
        .join("");

      console.log("✅ FAQ built.");

      // ============================
      // RENDER FULL PAGE
      // ============================
      console.log("🧱 Rendering HTML into root...");

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

      // ============================
      // STYLE CHECK
      // ============================
      console.log("🎯 Checking if CSS is applying...");

      setTimeout(() => {
        const hero = document.querySelector(".product-hero");
        if (!hero) {
          console.error("❌ HERO NOT FOUND AFTER RENDER.");
          return;
        }

        const styles = window.getComputedStyle(hero);

        console.log("🎨 HERO background-color:", styles.backgroundColor);
        console.log("🎨 HERO padding:", styles.padding);

        if (styles.backgroundColor === "rgba(0, 0, 0, 0)" || styles.padding === "0px") {
          console.error("❌ CSS NOT APPLYING. Hero still looks unstyled.");
        } else {
          console.log("✅ CSS IS APPLYING CORRECTLY!");
        }
      }, 800);

      // ============================
      // FAQ TOGGLE
      // ============================
      console.log("⚙️ Activating FAQ accordion...");

      document.querySelectorAll(".product-faq-question").forEach(q => {
        q.addEventListener("click", () => {
          q.classList.toggle("open");
          const a = q.nextElementSibling;
          if (a) a.classList.toggle("open");
        });
      });

      console.log("✅ FAQ accordion active.");

    })
    .catch(err => {
      console.error("🔥 Loader FAILED completely:", err);
      root.innerHTML = "<p>Error loading product content.</p>";
    });

})();
