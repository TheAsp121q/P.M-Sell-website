(function () {
  "use strict";

  const translations = {
    ro: {
      nav_home: "Acasă",
      nav_services: "Servicii",
      nav_pricing: "Prețuri",
      nav_testimonials: "Recenzii",
      nav_contact: "Contact",
      hero_role: "Dezvoltator Web Premium",
      hero_sub: "Construiesc experiențe digitale care convertesc vizitatorii în clienți.",
      hero_cta: "Discută cu mine",
      hero_scroll: "Derulează în jos",
      mot_headline1: "Transformăm codul brut în experiențe digitale memorabile.",
      mot_headline2: "Afacerea ta merită mai mult decât un template banal.",
      mot_headline3: "Design fără limite. Performanță fără compromisuri.",
      mot_sub: "Fiecare proiect este construit de la zero, cu atenție la fiecare detaliu.",
      services_title: "Ce ofer",
      services_s1_title: "Dezvoltare Web",
      services_s1_desc: "Site-uri și aplicații web performante, scalabile și securizate.",
      services_s2_title: "Design UI/UX",
      services_s2_desc: "Interfețe moderne care convertesc și impresionează.",
      services_s3_title: "Consultanță Digitală",
      services_s3_desc: "Strategie digitală clară pentru afaceri ambițioase.",
      pricing_title: "Planuri",
      pricing_p1_name: "Starter Pack",
      pricing_p1_f1: "Site de prezentare (5 secțiuni)",
      pricing_p1_f2: "Design responsive",
      pricing_p1_f3: "Formular de contact",
      pricing_p1_f4: "Livrare în 7 zile",
      pricing_p1_f5: "1 rundă de revizuire",
      pricing_p2_name: "Pro Growth",
      pricing_p2_f1: "Până la 15 secțiuni",
      pricing_p2_f2: "Animații avansate",
      pricing_p2_f3: "Integrare CMS / Blog",
      pricing_p2_f4: "SEO tehnic complet",
      pricing_p2_f5: "3 runde de revizuire",
      pricing_p3_name: "Enterprise Custom",
      pricing_p3_f1: "Proiect complet personalizat",
      pricing_p3_f2: "Aplicație web complexă",
      pricing_p3_f3: "Integrări API avansate",
      pricing_p3_f4: "Suport dedicat 30 zile",
      pricing_p3_f5: "Runde nelimitate de revizuire",
      pricing_cta: "Fă o ofertă",
      testimonials_title: "Ce spun clienții",
      contact_title: "Ia legătura",
      contact_name: "Numele tău",
      contact_email: "Email",
      contact_message: "Mesajul tău",
      contact_send: "Trimite mesajul",
      contact_success: "Mesaj trimis cu succes. Te voi contacta în curând.",
      contact_error: "Eroare la trimitere. Încearcă din nou.",
      contact_rate: "Prea multe cereri. Încearcă mai târziu.",
      modal_title: "Fă o ofertă",
      modal_name: "Numele tău *",
      modal_email: "Email *",
      modal_phone: "Telefon (opțional)",
      modal_desc: "Descriere proiect *",
      modal_amount: "Suma oferită (RON) *",
      modal_cta: "Trimite oferta",
      modal_success: "Oferta ta a fost trimisă. Te voi contacta în curând.",
      modal_error: "Eroare la trimitere. Încearcă din nou.",
      footer_rights: "Toate drepturile rezervate.",
      splash_skip: "Intră pe site"
    },
    en: {
      nav_home: "Home",
      nav_services: "Services",
      nav_pricing: "Pricing",
      nav_testimonials: "Testimonials",
      nav_contact: "Contact",
      hero_role: "Premium Web Developer",
      hero_sub: "I build digital experiences that turn visitors into clients.",
      hero_cta: "Let's talk",
      hero_scroll: "Scroll down",
      mot_headline1: "We turn raw code into memorable digital experiences.",
      mot_headline2: "Your business deserves more than a generic template.",
      mot_headline3: "Limitless design. Uncompromising performance.",
      mot_sub: "Every project is built from scratch, with attention to every detail.",
      services_title: "What I offer",
      services_s1_title: "Web Development",
      services_s1_desc: "High-performance, scalable and secure websites and web apps.",
      services_s2_title: "UI/UX Design",
      services_s2_desc: "Modern interfaces that convert and impress.",
      services_s3_title: "Digital Consulting",
      services_s3_desc: "Clear digital strategy for ambitious businesses.",
      pricing_title: "Plans",
      pricing_p1_name: "Starter Pack",
      pricing_p1_f1: "Presentation site (5 sections)",
      pricing_p1_f2: "Responsive design",
      pricing_p1_f3: "Contact form",
      pricing_p1_f4: "Delivered in 7 days",
      pricing_p1_f5: "1 revision round",
      pricing_p2_name: "Pro Growth",
      pricing_p2_f1: "Up to 15 sections",
      pricing_p2_f2: "Advanced animations",
      pricing_p2_f3: "CMS / Blog integration",
      pricing_p2_f4: "Full technical SEO",
      pricing_p2_f5: "3 revision rounds",
      pricing_p3_name: "Enterprise Custom",
      pricing_p3_f1: "Fully custom project",
      pricing_p3_f2: "Complex web application",
      pricing_p3_f3: "Advanced API integrations",
      pricing_p3_f4: "Dedicated support 30 days",
      pricing_p3_f5: "Unlimited revision rounds",
      pricing_cta: "Make an offer",
      testimonials_title: "What clients say",
      contact_title: "Get in touch",
      contact_name: "Your name",
      contact_email: "Email",
      contact_message: "Your message",
      contact_send: "Send message",
      contact_success: "Message sent successfully. I will contact you soon.",
      contact_error: "Send error. Please try again.",
      contact_rate: "Too many requests. Please try later.",
      modal_title: "Make an offer",
      modal_name: "Your name *",
      modal_email: "Email *",
      modal_phone: "Phone (optional)",
      modal_desc: "Project description *",
      modal_amount: "Offered amount (EUR) *",
      modal_cta: "Send offer",
      modal_success: "Your offer was sent. I will contact you soon.",
      modal_error: "Send error. Please try again.",
      footer_rights: "All rights reserved.",
      splash_skip: "Enter site"
    }
  };

  let currentLang = "en";

  function applyTranslations(lang) {
    currentLang = lang;
    const dict = translations[lang] || translations["en"];
    const els = document.querySelectorAll("[data-i18n]");
    els.forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.setAttribute("placeholder", dict[key]);
        } else {
          el.textContent = dict[key];
        }
      }
    });
    document.documentElement.setAttribute("lang", lang);
  }

  function detectLanguage() {
    const navLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    if (navLang.startsWith("ro")) {
      applyTranslations("ro");
      return;
    }
    fetch("https://ipapi.co/json/")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.country_code === "RO") {
          applyTranslations("ro");
        } else {
          applyTranslations("en");
        }
      })
      .catch(function () {
        applyTranslations("en");
      });
  }

  function getT(key) {
    return (translations[currentLang] || translations["en"])[key] || key;
  }

  document.addEventListener("DOMContentLoaded", function () {
    detectLanguage();
  });

  window.__i18n = {
    getT: getT,
    applyTranslations: applyTranslations,
    currentLang: function () { return currentLang; }
  };
}());
