(function () {
  "use strict";

  const _sqli = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|CAST|CONVERT|CHAR|NCHAR|VARCHAR|NVARCHAR|FROM|WHERE|ORDER|GROUP|HAVING|JOIN|INTO|TABLE|DATABASE|SCHEMA|GRANT|REVOKE|TRUNCATE|REPLACE|MERGE|CALL|PROCEDURE|FUNCTION|TRIGGER|INDEX|VIEW|CURSOR)\b|--|;|'|"|\*|\/\*|\*\/|xp_|0x[0-9a-fA-F]+)/gi;
  const _xss = /<[^>]*>|javascript\s*:|on\w+\s*=|<\s*script|<\s*iframe|<\s*object|<\s*embed|<\s*link|<\s*meta|data\s*:|vbscript\s*:/gi;
  const _path = /(\.\.\/)|(\.\.\\)|(\/etc\/)|(%00)|(%2e%2e)|(%252e)/gi;
  const _shellCmd = /(\$\()|(`)|(\|{1,2})|(&{1,2})|(>\s*\/dev)|(\bwget\b)|(\bcurl\b)|(\bchmod\b)|(\brm\s+-)/gi;

  function sanitize(val) {
    if (typeof val !== "string") return "";
    return val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .replace(/\\/g, "&#x5C;")
      .replace(/`/g, "&#96;");
  }

  function isMalicious(val) {
    if (typeof val !== "string") return false;
    return _sqli.test(val) || _xss.test(val) || _path.test(val) || _shellCmd.test(val);
  }

  function validateInput(el) {
    const raw = el.value || "";
    if (isMalicious(raw)) {
      el.value = "";
      el.setAttribute("aria-invalid", "true");
      el.style.borderColor = "rgba(255,80,80,0.6)";
      return false;
    }
    el.removeAttribute("aria-invalid");
    el.style.borderColor = "";
    return true;
  }

  function patchAllInputs() {
    const fields = document.querySelectorAll("input, textarea");
    fields.forEach(function (el) {
      el.addEventListener("input", function () { validateInput(el); });
      el.addEventListener("paste", function (e) {
        setTimeout(function () { validateInput(el); }, 0);
      });
    });
  }

  const _noop = function () {};
  const _originalLog = console.log;
  const _originalWarn = console.warn;
  const _originalError = console.error;

  Object.defineProperty(window, "_securityBanner", {
    get: function () { return "Security active."; },
    configurable: false
  });

  let _devtoolsOpen = false;
  let _threshold = 160;

  function detectDevtools() {
    const widthDiff = window.outerWidth - window.innerWidth > _threshold;
    const heightDiff = window.outerHeight - window.innerHeight > _threshold;
    if (widthDiff || heightDiff) {
      if (!_devtoolsOpen) {
        _devtoolsOpen = true;
        document.body.setAttribute("data-sec-active", "1");
      }
    } else {
      _devtoolsOpen = false;
      document.body.removeAttribute("data-sec-active");
    }
  }

  setInterval(detectDevtools, 1000);

  document.addEventListener("keydown", function (e) {
    if (e.key === "F12") { e.preventDefault(); }
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) { e.preventDefault(); }
    if (e.ctrlKey && e.key === "U") { e.preventDefault(); }
    if (e.ctrlKey && e.key === "S") { e.preventDefault(); }
  });

  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  document.addEventListener("selectstart", function (e) {
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  });

  function addHoneypot(form) {
    const trap = document.createElement("input");
    trap.setAttribute("type", "text");
    trap.setAttribute("name", "website");
    trap.setAttribute("autocomplete", "off");
    trap.setAttribute("tabindex", "-1");
    trap.setAttribute("aria-hidden", "true");
    trap.style.cssText = "position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";
    form.appendChild(trap);
  }

  function isHoneypotTriggered(form) {
    const trap = form.querySelector('[name="website"]');
    return trap && trap.value.length > 0;
  }

  function addCSPMeta() {
    const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existing) return;
    const meta = document.createElement("meta");
    meta.setAttribute("http-equiv", "Content-Security-Policy");
    meta.setAttribute(
      "content",
      "default-src 'self'; script-src 'self' https://cdn.emailjs.com https://fonts.googleapis.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com https://ipapi.co; frame-ancestors 'none';"
    );
    document.head.insertBefore(meta, document.head.firstChild);
  }

  let _formSubmitTimes = [];
  const _RATE_LIMIT = 3;
  const _RATE_WINDOW = 60000;

  function isRateLimited() {
    const now = Date.now();
    _formSubmitTimes = _formSubmitTimes.filter(function (t) { return now - t < _RATE_WINDOW; });
    if (_formSubmitTimes.length >= _RATE_LIMIT) return true;
    _formSubmitTimes.push(now);
    return false;
  }

  const _ua = navigator.userAgent || "";
  const _badBots = /bot|crawl|spider|scraper|wget|curl|python-requests|go-http|java\/|libwww|lwp-|jakarta|httpclient|semrush|ahrefsbot|dotbot|mj12bot|baiduspider|yandexbot|seznambot|sogou|exabot|facebot|ia_archiver/i;

  function isKnownBot() {
    return _badBots.test(_ua);
  }

  if (isKnownBot()) {
    document.documentElement.innerHTML = "<html><body></body></html>";
  }

  function init() {
    addCSPMeta();
    patchAllInputs();
    const forms = document.querySelectorAll("form");
    forms.forEach(function (f) { addHoneypot(f); });
  }

  document.addEventListener("DOMContentLoaded", init);

  window.__sec = {
    sanitize: sanitize,
    isMalicious: isMalicious,
    validateInput: validateInput,
    isHoneypotTriggered: isHoneypotTriggered,
    isRateLimited: isRateLimited
  };
}());
