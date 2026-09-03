(function () {
  "use strict";

  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el) { io.observe(el); });
  }

  function initNav() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", function () {
      if (window.scrollY > 60) {
        navbar.classList.add("navbar--scrolled");
      } else {
        navbar.classList.remove("navbar--scrolled");
      }
    }, { passive: true });

    const links = navbar.querySelectorAll("a[href^='#']");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
          const menu = document.getElementById("nav-menu");
          if (menu) menu.classList.remove("nav-menu--open");
        }
      });
    });

    const burger = document.getElementById("nav-burger");
    const menu = document.getElementById("nav-menu");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        menu.classList.toggle("nav-menu--open");
        burger.classList.toggle("nav-burger--active");
      });
    }
  }

  function initTestimonials() {
    const track = document.getElementById("testimonials-track");
    if (!track) return;

    const cards = track.querySelectorAll(".testimonial-card");
    if (cards.length < 2) return;

    cards.forEach(function (c) {
      const clone = c.cloneNode(true);
      track.appendChild(clone);
    });

    let isPaused = false;
    track.addEventListener("mouseenter", function () { isPaused = true; });
    track.addEventListener("mouseleave", function () { isPaused = false; });

    let pos = 0;
    const speed = 0.4;

    function tick() {
      if (!isPaused) {
        pos += speed;
        const half = track.scrollWidth / 2;
        if (pos >= half) pos = 0;
        track.style.transform = "translateX(-" + pos + "px)";
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initGridCanvas() {
    const canvas = document.getElementById("grid-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf;
    let offset = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cellSize = 60;
      const shift = offset % cellSize;

      ctx.strokeStyle = "rgba(100,180,255,0.045)";
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      for (let x = -cellSize + shift; x <= canvas.width + cellSize; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = -cellSize + shift; y <= canvas.height + cellSize; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      offset += 0.3;
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();
  }

  function initScrollspy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("#nav-menu a[href^='#']");
    if (!sections.length || !navLinks.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("active"); });
          const active = document.querySelector('#nav-menu a[href="#' + entry.target.id + '"]');
          if (active) active.classList.add("active");
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function (s) { io.observe(s); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGridCanvas();
    initReveal();
    initNav();
    initTestimonials();
    initScrollspy();
  });
}());
