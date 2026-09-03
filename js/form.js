(function () {
  "use strict";

  const EMAILJS_SERVICE_ID = "service_o6pkrkx";
  const EMAILJS_TEMPLATE_CONTACT = "template_lqjjfx4";
  const EMAILJS_TEMPLATE_OFFER = "template_lqjjfx4";
  const EMAILJS_PUBLIC_KEY = "W4Ihc8bD6gZQM41iJ";

  function initEmailJS() {
    if (window.emailjs) {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }

  function showFormMessage(container, msg, isError) {
    let el = container.querySelector(".form-msg");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-msg";
      container.appendChild(el);
    }
    el.textContent = msg;
    el.className = "form-msg" + (isError ? " form-msg--error" : " form-msg--success");
    el.style.opacity = "1";
    setTimeout(function () { el.style.opacity = "0"; }, 6000);
  }

  function getFieldVal(form, name) {
    const el = form.querySelector('[name="' + name + '"]');
    return el ? (window.__sec ? window.__sec.sanitize(el.value.trim()) : el.value.trim()) : "";
  }

  function validateField(form, name) {
    const el = form.querySelector('[name="' + name + '"]');
    if (!el) return false;
    if (window.__sec) return window.__sec.validateInput(el);
    return el.value.trim().length > 0;
  }

  function isEmailValid(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('[type="submit"]');

    if (window.__sec && window.__sec.isHoneypotTriggered(form)) { return; }
    if (window.__sec && window.__sec.isRateLimited()) {
      showFormMessage(form, window.__i18n ? window.__i18n.getT("contact_rate") : "Too many requests.", true);
      return;
    }

    const name = getFieldVal(form, "contact_name");
    const email = getFieldVal(form, "contact_email");
    const message = getFieldVal(form, "contact_message");

    if (!name || !isEmailValid(email) || !message) {
      return;
    }

    if (window.__sec && (window.__sec.isMalicious(name) || window.__sec.isMalicious(email) || window.__sec.isMalicious(message))) {
      return;
    }

    btn.disabled = true;
    btn.style.opacity = "0.6";

    if (!confirm("Confirm trimiterea acestui mesaj?")) {
      btn.disabled = false;
      btn.style.opacity = "1";
      return;
    }

    if (!window.emailjs) {
      showFormMessage(form, "Eroare de configurare EmailJS.", true);
      btn.disabled = false;
      btn.style.opacity = "1";
      return;
    }

    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CONTACT, {
      offer_name: name,
      offer_email: email,
      offer_phone: "-",
      offer_type: "Contact General",
      offer_amount: "-",
      offer_deadline: "-",
      offer_features: message,
      offer_design: "-"
    }).then(function () {
      showFormMessage(form, window.__i18n ? window.__i18n.getT("contact_success") : "Message sent.", false);
      form.reset();
      btn.disabled = false;
      btn.style.opacity = "1";
    }).catch(function () {
      showFormMessage(form, window.__i18n ? window.__i18n.getT("contact_error") : "Error.", true);
      btn.disabled = false;
      btn.style.opacity = "1";
    });
  }

  function handleOfferSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('[type="submit"]');

    if (window.__sec && window.__sec.isHoneypotTriggered(form)) { return; }
    if (window.__sec && window.__sec.isRateLimited()) {
      showFormMessage(form, window.__i18n ? window.__i18n.getT("contact_rate") : "Too many requests.", true);
      return;
    }

    const name = getFieldVal(form, "offer_name");
    const email = getFieldVal(form, "offer_email");
    const phone = getFieldVal(form, "offer_phone");
    const type = getFieldVal(form, "offer_type");
    const features = getFieldVal(form, "offer_features");
    const design = getFieldVal(form, "offer_design");
    const deadline = getFieldVal(form, "offer_deadline");
    const amount = getFieldVal(form, "offer_amount");
    const useAiCheckbox = form.querySelector("#offer_ai");
    const useAi = useAiCheckbox && useAiCheckbox.checked ? "Da (Livrare mai rapidă)" : "Nu (Fără AI, preț standard/crescut)";

    if (!name || !isEmailValid(email) || !type || !features || !amount) { return; }

    if (window.__sec && (window.__sec.isMalicious(name) || window.__sec.isMalicious(email) || window.__sec.isMalicious(features) || window.__sec.isMalicious(amount))) {
      return;
    }

    btn.disabled = true;
    btn.style.opacity = "0.6";

    if (!confirm("Confirm trimiterea ofertei?")) {
      btn.disabled = false;
      btn.style.opacity = "1";
      return;
    }

    if (!window.emailjs) {
      showFormMessage(form, "Eroare de configurare EmailJS.", true);
      btn.disabled = false;
      btn.style.opacity = "1";
      return;
    }

    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_OFFER, {
      offer_name: name,
      offer_email: email,
      offer_phone: phone,
      offer_type: type,
      offer_amount: amount,
      offer_deadline: deadline,
      offer_features: features + "\n\nFolosire AI: " + useAi,
      offer_design: design
    }).then(function () {
      showFormMessage(form, window.__i18n ? window.__i18n.getT("modal_success") : "Sent.", false);
      form.reset();
      btn.disabled = false;
      btn.style.opacity = "1";
      setTimeout(closeModal, 3000);
    }).catch(function () {
      showFormMessage(form, window.__i18n ? window.__i18n.getT("modal_error") : "Error.", true);
      btn.disabled = false;
      btn.style.opacity = "1";
    });
  }

  function closeModal() {
    const modal = document.getElementById("offer-modal");
    if (modal) {
      modal.classList.remove("modal--open");
      document.body.style.overflow = "";
    }
  }

  function openModal(planName, typeName) {
    const modal = document.getElementById("offer-modal");
    if (!modal) return;
    const planInput = modal.querySelector('[name="offer_plan"]');
    if (planInput) planInput.value = planName || "";
    
    const typeSelect = modal.querySelector('#offer_type');
    if (typeSelect && typeName) {
      typeSelect.value = typeName;
      typeSelect.dispatchEvent(new Event('change'));
    }

    modal.classList.add("modal--open");
    document.body.style.overflow = "hidden";
  }

  function initForms() {
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", handleContactSubmit);
    }

    const offerForm = document.getElementById("offer-form");
    if (offerForm) {
      offerForm.addEventListener("submit", handleOfferSubmit);
    }

    const modalClose = document.getElementById("modal-close");
    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    const modalOverlay = document.getElementById("offer-modal");
    if (modalOverlay) {
      modalOverlay.addEventListener("click", function (e) {
        if (e.target === modalOverlay) closeModal();
      });
    }

    const typeSelect = document.getElementById("offer_type");
    const featuresInput = document.getElementById("offer_features");
    const aiGroup = document.getElementById("ai_checkbox_group");
    if (typeSelect) {
      typeSelect.addEventListener("change", function() {
        const val = this.value;
        if (val.startsWith("cybersec")) {
          if (aiGroup) aiGroup.style.display = "none";
          if (featuresInput) featuresInput.placeholder = "ex: Tipul de audit dorit, IP-uri, domeniu vizat, sau detalii despre investigația OSINT pe care o soliciți...";
        } else {
          if (aiGroup) aiGroup.style.display = "flex";
          if (featuresInput) featuresInput.placeholder = "ex: formular de contact, baze de date, panou de admin, integrare API...";
        }
      });
    }

    document.querySelectorAll("[data-offer-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-offer-btn"), btn.getAttribute("data-offer-type"));
      });
    });

    initEmailJS();
  }

  document.addEventListener("DOMContentLoaded", initForms);

  window.__form = { openModal: openModal, closeModal: closeModal };
}());
