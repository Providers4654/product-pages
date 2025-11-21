// loader.js
(function () {
  var scriptTag = document.currentScript;
  if (!scriptTag) return;

  var cssUrl = scriptTag.dataset.cssUrl;
  var jsUrl = scriptTag.dataset.jsUrl;
  var sheetId = scriptTag.dataset.sheetId;
  var gid = scriptTag.dataset.gid || '0';

  // Make config available to main script
  window.MTN_PRODUCT_CONFIG = {
    sheetId: sheetId,
    gid: gid
  };

  // Inject CSS
  if (cssUrl) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);
  }

  // Inject main JS
  if (jsUrl) {
    var mainScript = document.createElement('script');
    mainScript.src = jsUrl;
    mainScript.defer = true;
    document.head.appendChild(mainScript);
  }
})();
