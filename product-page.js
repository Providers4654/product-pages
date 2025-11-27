// product-page.js
(function () {
  // --- Helpers ---

  function getSlug() {
    var path = window.location.pathname || "/";
    path = path.replace(/\/$/, ""); 
    var parts = path.split("/").filter(Boolean);
    if (!parts.length) return "/";
    var last = parts[parts.length - 1];
    return "/" + last.toLowerCase();
  }

  function parseCsv(text) {
    var lines = text.replace(/\r\n/g, "\n").split("\n");
    lines = lines.filter(function (l) {
      return l.trim() !== "";
    });
    if (!lines.length) return [];

    var headers = splitCsvLine(lines[0]).map(function (h) {
      return h.trim();
    });

    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var rowValues = splitCsvLine(lines[i]);
      if (rowValues.length === 1 && !rowValues[0].trim()) continue;
      var obj = {};
      headers.forEach(function (h, idx) {
        obj[h] = (rowValues[idx] || "").trim();
      });
      rows.push(obj);
    }
    return rows;
  }

  function splitCsvLine(line) {
    var result = [];
    var current = "";
    var inQuotes = false;

    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  // NEW unified parser for "~ Title: Description"
  function parseTitleBodyList(value) {
    if (!value) return [];

    return value
      .split("\n")
      .map(v => v.trim())
      .filter(v => v.startsWith("~"))
      .map(v => v.replace(/^~\s*/, ""))
      .map(v => {
        const idx = v.indexOf(":");
        if (idx === -1) {
          return { title: v.trim(), body: "" };
        }
        return {
          title: v.slice(0, idx).trim(),
          body: v.slice(idx + 1).trim(),
        };
      });
  }

  function findRowForSlug(rows, slug) {
    var match = rows.find(function (row) {
      var val = (row["Product"] || "").trim().toLowerCase();
      return val === slug;
    });
    if (match) return match;

    var bareSlug = slug.replace(/^\//, "");
    match = rows.find(function (row) {
      var val = (row["Product"] || "").trim().toLowerCase();
      val = val.replace(/^\//, "");
      return val === bareSlug;
    });
    return match || null;
  }

  // --- Rendering ---

  function renderProduct(root, row) {
    var heroTitle = row["Header Text"] || "";
    var heroImage = row["Header Pic"] || "";
    var heroBody = row["Hero Body"] || "";
    var whatBody = row["What it is?"] || "";

    var buttonText = row["Header Button Text"] || "Order Requests & Pricing";
    var buttonLink =
      row["Header Button Link"] ||
      "https://www.mtnhlth.com/prescription-order-form";

    var benefits = parseTitleBodyList(row["Key Benefits"] || "");
    var howList = parseTitleBodyList(row["How It Works"] || "");
    var whoForList = parseTitleBodyList(row["Who It's For"] || "");
    var whoNotList = parseTitleBodyList(row["Who It's Not For"] || "");
    var faqs = parseTitleBodyList(row["FAQ"] || "");

    // HERO
    var imgEl = root.querySelector('[data-role="hero-image"]');
    var titleEl = root.querySelector('[data-role="hero-title"]');
    var subtitleEl = root.querySelector('[data-role="hero-subtitle"]');
    var btnEl = root.querySelector('[data-role="hero-button"]');

    if (imgEl && heroImage) {
      imgEl.src = heroImage;
      imgEl.alt = heroTitle || "Product image";
    } else if (imgEl) {
      imgEl.parentElement.style.display = "none";
    }

    if (titleEl) titleEl.textContent = heroTitle || "";
    if (subtitleEl) {
      if (heroBody) subtitleEl.textContent = heroBody;
      else if (whatBody) subtitleEl.textContent = whatBody;
      else subtitleEl.style.display = "none";
    }
    if (btnEl) {
      btnEl.textContent = buttonText;
      btnEl.href = buttonLink;
    }

    // BENEFITS
    var benefitsSection = root.querySelector('[data-section="benefits"]');
    var benefitsGrid = root.querySelector('[data-role="benefits-grid"]');

    if (benefitsGrid && benefits.length) {
      benefitsGrid.innerHTML = benefits
        .map(function (b) {
          return (
            '<div class="benefit-card">' +
            (b.title ? '<h3>' + escapeHtml(b.title) + "</h3>" : "") +
            (b.body ? "<p>" + escapeHtml(b.body) + "</p>" : "") +
            "</div>"
          );
        })
        .join("");
    } else if (benefitsSection) {
      benefitsSection.style.display = "none";
    }

    // WHAT IT IS
    var whatSection = root.querySelector('[data-section="what"]');
    var whatHeadingEl = root.querySelector('[data-role="what-heading"]');
    var whatBodyEl = root.querySelector('[data-role="what-body"]');

    if (whatBody && whatBodyEl) {
      if (whatHeadingEl && heroTitle)
        whatHeadingEl.textContent = "What is " + heroTitle + "?";
      whatBodyEl.textContent = whatBody;
    } else if (whatSection) {
      whatSection.style.display = "none";
    }

    // HOW IT WORKS
    var howSection = root.querySelector('[data-section="how"]');
    var howGrid = root.querySelector('[data-role="how-grid"]');

    if (howGrid && howList.length) {
      howGrid.innerHTML = howList
        .map(function (h) {
          return (
            '<div class="how-card">' +
            (h.title ? "<h3>" + escapeHtml(h.title) + "</h3>" : "") +
            (h.body ? "<p>" + escapeHtml(h.body) + "</p>" : "") +
            "</div>"
          );
        })
        .join("");
    } else if (howSection) {
      howSection.style.display = "none";
    }

    // WHO IT'S FOR
    var whoSection = root.querySelector('[data-section="who"]');
    var whoForCard = root.querySelector('[data-role="who-for-card"]');
    var whoNotCard = root.querySelector('[data-role="who-not-card"]');
    var whoForUl = root.querySelector('[data-role="who-for-list"]');
    var whoNotUl = root.querySelector('[data-role="who-not-list"]');

    if (whoForUl && whoForList.length) {
      whoForUl.innerHTML = whoForList
        .map(function (item) {
          return (
            '<li><span class="emoji">✅</span><span><strong>' +
            escapeHtml(item.title) +
            "</strong>" +
            (item.body ? ": " + escapeHtml(item.body) : "") +
            "</span></li>"
          );
        })
        .join("");
    } else if (whoForCard) {
      whoForCard.style.display = "none";
    }

    if (whoNotUl && whoNotList.length) {
      whoNotUl.innerHTML = whoNotList
        .map(function (item) {
          return (
            '<li><span class="emoji">❌</span><span><strong>' +
            escapeHtml(item.title) +
            "</strong>" +
            (item.body ? ": " + escapeHtml(item.body) : "") +
            "</span></li>"
          );
        })
        .join("");
    } else if (whoNotCard) {
      whoNotCard.style.display = "none";
    }

    if (whoSection && !whoForList.length && !whoNotList.length) {
      whoSection.style.display = "none";
    }

    // FAQ
    var faqSection = root.querySelector('[data-section="faq"]');
    var faqListEl = root.querySelector('[data-role="faq-list"]');

    if (faqListEl && faqs.length) {
      faqListEl.innerHTML = faqs
        .map(function (faq) {
          return (
            '<div class="faq-item">' +
            '<div class="faq-question">' +
            escapeHtml(faq.title) +
            "</div>" +
            '<div class="faq-answer">' +
            escapeHtml(faq.body) +
            "</div>" +
            "</div>"
          );
        })
        .join("");
      initFaq(faqListEl);
    } else if (faqSection) {
      faqSection.style.display = "none";
    }

    // Sticky CTA
    var stickyBar = root.querySelector('[data-role="sticky-cta"]');
    var stickyTextEl = root.querySelector('[data-role="sticky-text"]');
    var stickyBtnEl = root.querySelector('[data-role="sticky-button"]');

    if (stickyBar && btnEl) {
      if (stickyTextEl) {
        stickyTextEl.textContent = heroTitle || "Ready to get started?";
      }
      if (stickyBtnEl) {
        stickyBtnEl.textContent = buttonText;
        stickyBtnEl.href = buttonLink;
      }
      initSticky(stickyBar);
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // --- Interactions ---

  function initFaq(container) {
    var questions = container.querySelectorAll(".faq-question");
    questions.forEach(function (q) {
      q.addEventListener("click", function () {
        q.classList.toggle("open");
        var answer = q.nextElementSibling;
        if (answer) {
          answer.classList.toggle("open");
        }
      });
    });
  }

  function initSticky(bar) {
    var barHeight = 0;
    function onScroll() {
      if (window.scrollY > 300) {
        bar.style.display = "block";
        if (!barHeight) {
          barHeight = bar.offsetHeight;
          document.body.style.paddingBottom = barHeight + "px";
        }
      } else {
        bar.style.display = "none";
        document.body.style.paddingBottom = "0px";
      }
    }
    window.addEventListener("scroll", onScroll);
  }

  // --- Public init called by loader.js ---

  window.MTN_PRODUCT_PAGE_INIT = function (config) {
    var rootId = (config && config.rootId) || "product-root";
    var sheetUrl = config && config.sheetCsvUrl;
    var root = document.getElementById(rootId) || document.body;

    if (!sheetUrl) {
      root.innerHTML =
        "<p>Missing sheet CSV URL in configuration.</p>";
      return;
    }

    fetch(sheetUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load CSV");
        return res.text();
      })
      .then(function (csvText) {
        var rows = parseCsv(csvText);
        var slug = getSlug();
        var row = findRowForSlug(rows, slug);
        if (!row) {
          root.innerHTML =
            '<p style="max-width:700px;margin:40px auto;font-family:Helvetica,Arial,sans-serif;color:#444;">No product data found for this URL. Check the "Product" column in your sheet and ensure it matches the URL slug (e.g. <code>/sermorelin</code>).</p>';
          return;
        }
        renderProduct(root, row);
      })
      .catch(function (err) {
        console.error(err);
        root.innerHTML =
          '<p style="max-width:700px;margin:40px auto;font-family:Helvetica,Arial,sans-serif;color:#c00;">Error loading product data. Please verify your sheet link and try again.</p>';
      });
  };
})();
