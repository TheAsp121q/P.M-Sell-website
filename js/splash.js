(function () {
  "use strict";

  let _dismissed = false;

  function getSplash() { return document.getElementById("splash"); }
  function getFrames() { return document.querySelectorAll(".splash__frame"); }

  function dismiss() {
    if (_dismissed) return;
    _dismissed = true;
    const splash = getSplash();
    const frames = getFrames();

    frames.forEach(function (f, i) {
      f.style.transitionDelay = (i * 120) + "ms";
      f.classList.add("splash__frame--out");
    });

    setTimeout(function () {
      if (splash) {
        splash.style.pointerEvents = "none";
        splash.style.opacity = "0";
        splash.style.visibility = "hidden";
        document.body.style.overflow = "";
      }
    }, 900);
  }

  function onScroll() {
    if (window.scrollY > 10) {
      dismiss();
      window.removeEventListener("scroll", onScroll);
    }
  }

  function init() {
    const splash = getSplash();
    if (!splash) return;

    document.body.style.overflow = "hidden";

    window.addEventListener("scroll", onScroll, { passive: true });

    setTimeout(function () {
      window.removeEventListener("scroll", onScroll);
      dismiss();
    }, 3000);
  }

  document.addEventListener("DOMContentLoaded", init);
}());
