// product-page.js
(function () {
  function getConfig() {
    return window.MTN_PRODUCT_CONFIG || {};
  }

  function getSlug() {
    var path = window.location.pathname || '/';
    path = path.replace(/\/$/, ''); // remove trailing slash
    var parts = path.split('/').filter(Boolean);
    if (!parts.length) return '/';
    var last = parts[parts.length - 1];
    return '/' + last; // e.g. "/sermorelin"
  }

  function fetchSheetRows(config) {
    var sheetId = config.sheetId;
    var gid = config.gid || '0';

    if (!sheetId) return Promise.reject(new Error('Missing sheetId'));

    // Google Sheets "gviz" JSON endpoint
    var url =
      'https://docs.google.com/spreadsheets/d/' +
      sheetId +
      '/gviz/tq?gid=' +
      encodeURIComponent(gid) +
      '&tqx=out:json';

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Network error');
        return res.text();
      })
      .then(function (text) {
        // Strip the JS wrapper around the JSON
        var jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        var data = JSON.parse(jsonStr);
        var cols = data.table.cols.map(function (c) {
          return c.label;
        });
        var rows = data.table.rows.map(function (r) {
          var obj = {};
          r.c.forEach(function (cell, idx) {
            obj[cols[idx]] = cell && cell.v ? String(cell.v) : '';
          });
          return obj;
        });
        return rows;
      });
  }

  function findRowBySlug(rows, slug) {
    // Expect "Product" column to contain "/sermorelin"
    var match = rows.find(function (row) {
      return (row['Product'] || '').trim() === slug;
    });
    if (match) return match;

    // Fallback: try WITHOUT leading slash
    var bare = slug.replace(/^\//, '');
    match = rows.find(function (row) {
      var val = (row['Product'] || '').trim().replace(/^\//, '');
      return val === bare;
    });
    return match || null;
  }

  function splitList(value) {
    if (!value) return [];
    return value
      .split('||')
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function parseTitleBodyList(value) {
    return splitList(value).map(function (item) {
      var parts = item.split('::');
      return {
        title: (parts[0] || '').trim(),
        body: (parts[1] || '').trim()
      };
    });
  }

  function renderProduct(root, row) {
    var headerImage = row['Header Pic'] || '';
    var headerText = row['Header Text'] || '';
    var heroBody = row['What it is?'] || '';
    var buttonText = row['Header Button Text'] || 'Order Requests & Pricing';
    var buttonLink =
      row['Header Button Link'] ||
      'https://www.mtnhlth.com/prescription-order-form';

    var whatIsBody = row['What it is?'] || '';

    var benefits = parseTitleBodyList(row['Key Benefits'] || '');
    var howBlocks = parseTitleBodyList(row['How It Works'] || '');
    var whoForList = splitList(row["Who It's For"] || '');
    var whoNotList = splitList(row["Who It's Not For"] || '');

    var faqs = [];
    for (var i = 1; i <= 5; i++) {
      var q = row['Q' + i];
      var a = row['A' + i];
      if (q && a) {
        faqs.push({ q: q, a: a });
      }
    }

    root.innerHTML = `
      <section class="product-hero">
        <div class="product-hero-image">
          ${headerImage ? `<img src="${headerImage}" alt="${headerText}">` : ''}
        </div>
        <div class="product-hero-text">
          <h2>${headerText}</h2>
          ${heroBody ? `<p>${heroBody}</p>` : ''}
          <div class="product-cta">
            <a href="${buttonLink}" id="mtn-product-cta-btn">${buttonText}</a>
          </div>
        </div>
      </section>

      ${
        whatIsBody
          ? `
      <section class="section-product-intro">
        <h2>What is ${headerText}?</h2>
        <div class="divider"></div>
        <p>${whatIsBody}</p>
      </section>`
          : ''
      }

      ${
        benefits.length
          ? `
      <section class="benefits-section">
        <div class="benefits-overlay">
          <h2>Key Benefits</h2>
          <div class="benefits-grid">
            ${benefits
              .map(function (b) {
                return `
              <div class="benefit-card">
                <h4>${b.title}</h4>
                <p>${b.body}</p>
              </div>`;
              })
              .join('')}
          </div>
        </div>
      </section>`
          : ''
      }

      ${
        howBlocks.length
          ? `
      <section class="section-how-it-works">
        <h2>How ${headerText} Works</h2>
        <div class="how-grid">
          ${howBlocks
            .map(function (h) {
              return `
            <div class="how-block">
              <h3>${h.title}</h3>
              <p>${h.body}</p>
            </div>`;
            })
            .join('')}
        </div>
      </section>`
          : ''
      }

      ${
        whoForList.length || whoNotList.length
          ? `
      <section class="section-who-for">
        <h2>Who It’s For (and Not For)</h2>
        <div class="who-grid">
          ${
            whoForList.length
              ? `
          <div class="who-card">
            <h3>Ideal Candidates</h3>
            <ul class="who-list">
              ${whoForList
                .map(function (item) {
                  return `<li><span class="emoji">✅</span>${item}</li>`;
                })
                .join('')}
            </ul>
          </div>`
              : ''
          }
          ${
            whoNotList.length
              ? `
          <div class="who-card">
            <h3>Not Recommended For</h3>
            <ul class="who-list">
              ${whoNotList
                .map(function (item) {
                  return `<li><span class="emoji">❌</span>${item}</li>`;
                })
                .join('')}
            </ul>
          </div>`
              : ''
          }
        </div>
      </section>`
          : ''
      }

      ${
        faqs.length
          ? `
      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        ${faqs
          .map(function (f) {
            return `
          <div class="faq-item">
            <div class="faq-question">${f.q}</div>
            <div class="faq-answer">${f.a}</div>
          </div>`;
          })
          .join('')}
      </section>`
          : ''
      }

      <div class="sticky-cta-bar" id="mtn-sticky-cta">
        <div class="sticky-cta-inner">
          <div class="sticky-cta-text">Experience the benefits of ${headerText}</div>
          <a href="${buttonLink}" class="sticky-cta-button">${buttonText}</a>
        </div>
      </div>
    `;
  }

  function initStickyCTA() {
    var bar = document.getElementById('mtn-sticky-cta');
    if (!bar) return;

    var barHeight = 0;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        bar.style.display = 'flex';
        if (!barHeight) {
          barHeight = bar.offsetHeight;
          document.body.style.paddingBottom = barHeight + 'px';
        }
      } else {
        bar.style.display = 'none';
        document.body.style.paddingBottom = '0px';
      }
    });
  }

  function initFaqAccordions(root) {
    var questions = root.querySelectorAll('.faq-question');
    questions.forEach(function (q) {
      q.addEventListener('click', function () {
        q.classList.toggle('open');
        var answer = q.nextElementSibling;
        if (answer) {
          answer.classList.toggle('open');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('mtn-product-root');
    if (!root) return;

    var config = getConfig();

    fetchSheetRows(config)
      .then(function (rows) {
        var slug = getSlug();
        var row = findRowBySlug(rows, slug);

        if (!row) {
          root.innerHTML =
            '<p style="max-width:700px;margin:40px auto;font-family:Helvetica,Arial,sans-serif;color:#444;">No product data found for this URL. Check the "Product" column in your Google Sheet.</p>';
          return;
        }

        renderProduct(root, row);
        initStickyCTA();
        initFaqAccordions(root);
      })
      .catch(function (err) {
        console.error(err);
        root.innerHTML =
          '<p style="max-width:700px;margin:40px auto;font-family:Helvetica,Arial,sans-serif;color:#c00;">Error loading product data. Please check your Sheet sharing settings and IDs.</p>';
      });
  });
})();
