/* ============================================================
   You Aspirant — Main Script (dynamic & interactive)
   Features: theme toggle, scroll progress, sticky header,
   mobile nav, scroll reveal, animated counters, progress bars,
   testimonials carousel, story & program filters, FAQ search,
   FAQ accordion, form validation + async submit + draft autosave,
   quick-enquiry FAB + modal, toast notifications, newsletter,
   back-to-top, smooth anchors.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const mqDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ============================================================
     THEME (dark / light) with persistence
     ============================================================ */
  const THEME_KEY = "ya-theme";
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1120" : "#4f46e5");
  }
  // apply early to avoid flash
  applyTheme(localStorage.getItem(THEME_KEY) || (mqDark && mqDark.matches ? "dark" : "light"));

  function injectThemeToggle() {
    const actions = $(".nav-actions");
    if (!actions) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.innerHTML =
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
      '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
    actions.insertBefore(btn, actions.firstChild);
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      showToast(next === "dark" ? "Dark mode on" : "Light mode on");
    });
  }

  /* ============================================================
     SCROLL: progress bar + header shadow + back-to-top
     ============================================================ */
  let progressEl = null;
  function injectScrollProgress() {
    progressEl = document.createElement("div");
    progressEl.className = "scroll-progress";
    document.body.appendChild(progressEl);
  }

  const header = $(".header");
  const toTopBtn = $(".to-top");

  function onScroll() {
    const h = document.documentElement;
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTopBtn) toTopBtn.classList.toggle("show", y > 480);
    if (progressEl) {
      const sh = (h.scrollHeight - h.clientHeight) || 1;
      progressEl.style.width = (y / sh) * 100 + "%";
    }
  }

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  function initMobileNav() {
    const toggle = $(".nav-toggle");
    const navLinks = $(".nav-links");
    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open && window.innerWidth <= 760 ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        navLinks.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  function initReveal() {
    const reveals = $$(".reveal");
    if (!("IntersectionObserver" in window) || prefersReduced) {
      reveals.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const duration = prefersReduced ? 0 : 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent =
        (decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (decimals ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
    };
    requestAnimationFrame(tick);
  }
  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ============================================================
     ANIMATED PROGRESS BARS (hero)
     ============================================================ */
  function initProgressBars() {
    const bars = $$(".bar > i");
    if (!bars.length) return;
    if (!("IntersectionObserver" in window)) {
      bars.forEach((b) => (b.style.width = b.dataset.value + "%"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.width = entry.target.dataset.value + "%";
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((b) => io.observe(b));
  }

  /* ============================================================
     TESTIMONIALS CAROUSEL
     ============================================================ */
  function initCarousel() {
    const track = $(".testimonials-track");
    if (!track) return;

    // consolidate testimonials from any other grids into this track
    const extraParents = new Set();
    $$(".testimonial").forEach((t) => {
      if (!track.contains(t)) {
        extraParents.add(t.parentElement);
        track.appendChild(t);
      }
    });
    extraParents.forEach((p) => {
      if (p && !p.classList.contains("testimonials-track") && !p.querySelector(".testimonial")) p.remove();
    });

    const slides = $$(".testimonial", track);
    if (slides.length < 2) return;

    // make sure slides are visible (drop reveal gating)
    slides.forEach((s) => {
      s.classList.remove("reveal");
      s.classList.add("in");
    });

    // wrap track
    const wrap = document.createElement("div");
    wrap.className = "carousel";
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);
    track.classList.add("carousel-track");

    // controls
    const controls = document.createElement("div");
    controls.className = "carousel-controls";
    controls.innerHTML =
      '<button class="carousel-btn prev" aria-label="Previous testimonial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<div class="carousel-dots"></div>' +
      '<button class="carousel-btn next" aria-label="Next testimonial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>';
    wrap.appendChild(controls);
    const dotsEl = $(".carousel-dots", controls);
    const prevBtn = $(".prev", controls);
    const nextBtn = $(".next", controls);

    const GAP = 24;
    const total = slides.length;
    let index = 0;
    let perView = 1;
    let timer = null;

    function computePerView() {
      const w = window.innerWidth;
      if (w < 560) perView = 1;
      else if (w < 980) perView = Math.min(2, total - 1);
      else perView = Math.min(3, Math.max(2, total - 1));
      if (perView < 1) perView = 1;
    }
    const maxIndex = () => Math.max(0, total - perView);

    function setBasis() {
      const basis = `calc((100% - ${GAP * (perView - 1)}px) / ${perView})`;
      slides.forEach((s) => (s.style.flex = `0 0 ${basis}`));
    }
    function buildDots() {
      const count = maxIndex() + 1;
      dotsEl.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const d = document.createElement("button");
        d.className = "carousel-dot" + (i === index ? " active" : "");
        d.setAttribute("aria-label", "Go to slide " + (i + 1));
        d.addEventListener("click", () => {
          go(i);
          resetAuto();
        });
        dotsEl.appendChild(d);
      }
    }
    function go(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      const trackW = track.getBoundingClientRect().width;
      const slideWidth = (trackW - GAP * (perView - 1)) / perView;
      track.style.transform = `translateX(-${index * (slideWidth + GAP)}px)`;
      $$(".carousel-dot", dotsEl).forEach((d, k) => d.classList.toggle("active", k === index));
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index >= maxIndex();
    }
    const next = () => go(index + 1 > maxIndex() ? 0 : index + 1);
    const prev = () => go(index - 1);
    prevBtn.addEventListener("click", () => {
      prev();
      resetAuto();
    });
    nextBtn.addEventListener("click", () => {
      next();
      resetAuto();
    });
    function startAuto() {
      if (prefersReduced) return;
      timer = setInterval(next, 5000);
    }
    function resetAuto() {
      clearInterval(timer);
      startAuto();
    }
    wrap.addEventListener("mouseenter", () => clearInterval(timer));
    wrap.addEventListener("mouseleave", startAuto);

    // touch swipe
    let startX = null;
    track.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? next() : prev();
        resetAuto();
      }
      startX = null;
    });

    // keyboard
    wrap.tabIndex = 0;
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prev();
        resetAuto();
      } else if (e.key === "ArrowRight") {
        next();
        resetAuto();
      }
    });

    let rT;
    function rebuild() {
      const old = index;
      computePerView();
      setBasis();
      index = Math.min(old, maxIndex());
      buildDots();
      go(index);
    }
    window.addEventListener("resize", () => {
      clearTimeout(rT);
      rT = setTimeout(rebuild, 150);
    });

    computePerView();
    setBasis();
    buildDots();
    go(0);
    startAuto();
    if (total <= perView) {
      controls.style.display = "none";
      clearInterval(timer);
    }
  }

  /* ============================================================
     SUCCESS STORY FILTER
     ============================================================ */
  function initStoryFilter() {
    const first = $(".story-card");
    if (!first) return;
    const grid = first.closest(".grid");
    if (!grid) return;
    const cards = $$(".story-card", grid);

    // categorize by content
    cards.forEach((c) => {
      const text = ((c.querySelector("h3")?.textContent || "") + " " + (c.querySelector("p")?.textContent || "")).toLowerCase();
      let cat = "Tech";
      if (/data/.test(text)) cat = "Data";
      else if (/design/.test(text)) cat = "Design";
      else if (/marketing/.test(text)) cat = "Marketing";
      else cat = "Tech";
      c.dataset.category = cat;
    });

    // make grid reflow gracefully when items are hidden
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";

    const filters = ["All", "Tech", "Data", "Design", "Marketing"];
    const bar = document.createElement("div");
    bar.className = "filters";
    filters.forEach((f, i) => {
      const b = document.createElement("button");
      b.className = "filter-btn" + (i === 0 ? " active" : "");
      b.textContent = f;
      b.dataset.filter = f;
      b.addEventListener("click", () => {
        $$(".filter-btn", bar).forEach((x) => x.classList.toggle("active", x === b));
        applyFilter(f);
      });
      bar.appendChild(b);
    });
    grid.parentNode.insertBefore(bar, grid);

    function applyFilter(f) {
      cards.forEach((c) => {
        const show = f === "All" || c.dataset.category === f;
        c.classList.add("filter-target");
        if (show) {
          c.classList.remove("hidden");
          void c.offsetWidth;
          c.classList.remove("fade-out");
        } else {
          c.classList.add("fade-out");
          setTimeout(() => {
            if (c.classList.contains("fade-out")) c.classList.add("hidden");
          }, 300);
        }
      });
    }
  }

  /* ============================================================
     PROGRAM FILTER
     ============================================================ */
  function initProgramFilter() {
    const first = $(".program-card");
    if (!first) return;
    const grid = first.closest(".grid");
    if (!grid) return;
    const cards = $$(".program-card", grid);

    const map = {
      "Career Launchpad": "Beginner",
      "Aspirant Pro Track": "Intermediate",
      "Interview Sprint": "Advanced",
    };
    cards.forEach((c) => {
      const t = c.querySelector("h3")?.textContent.trim() || "";
      c.dataset.level = map[t] || "Beginner";
    });

    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(290px, 1fr))";

    const filters = ["All", "Beginner", "Intermediate", "Advanced"];
    const bar = document.createElement("div");
    bar.className = "filters";
    filters.forEach((f, i) => {
      const b = document.createElement("button");
      b.className = "filter-btn" + (i === 0 ? " active" : "");
      b.textContent = f;
      b.dataset.filter = f;
      b.addEventListener("click", () => {
        $$(".filter-btn", bar).forEach((x) => x.classList.toggle("active", x === b));
        cards.forEach((c) => {
          const show = f === "All" || c.dataset.level === f;
          c.classList.add("filter-target");
          if (show) {
            c.classList.remove("hidden");
            void c.offsetWidth;
            c.classList.remove("fade-out");
          } else {
            c.classList.add("fade-out");
            setTimeout(() => {
              if (c.classList.contains("fade-out")) c.classList.add("hidden");
            }, 300);
          }
        });
      });
      bar.appendChild(b);
    });
    grid.parentNode.insertBefore(bar, grid);
  }

  /* ============================================================
     FAQ SEARCH + ACCORDION
     ============================================================ */
  function initFaqSearch() {
    const items = $$(".faq-item");
    if (items.length < 2) return;
    const wrap = items[0].parentElement;

    const search = document.createElement("div");
    search.className = "faq-search";
    search.innerHTML =
      '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input type="search" placeholder="Search questions..." aria-label="Search questions" />';
    wrap.parentNode.insertBefore(search, wrap);

    const empty = document.createElement("div");
    empty.className = "faq-search-empty";
    empty.textContent = "No questions match your search.";
    wrap.parentNode.insertBefore(empty, wrap.nextSibling);

    const input = search.querySelector("input");
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      items.forEach((it) => {
        const match = !q || it.textContent.toLowerCase().includes(q);
        it.style.display = match ? "" : "none";
        if (match) visible++;
      });
      empty.classList.toggle("show", visible === 0);
    });
  }

  function initFaqAccordion() {
    const items = $$(".faq-item");
    items.forEach((item) => {
      const q = item.querySelector(".faq-q");
      const a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        items.forEach((other) => {
          if (other !== item) {
            other.classList.remove("open");
            const oq = other.querySelector(".faq-q");
            const oa = other.querySelector(".faq-a");
            if (oq) oq.setAttribute("aria-expanded", "false");
            if (oa) oa.style.maxHeight = null;
          }
        });
        item.classList.toggle("open", !isOpen);
        q.setAttribute("aria-expanded", !isOpen ? "true" : "false");
        a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
      });
    });
  }

  /* ============================================================
     FORMS: validation + async submit + draft autosave + leads
     ============================================================ */
  const DRAFT_KEY = "ya-contact-draft";
  const LEADS_KEY = "ya-leads";

  function validate(form) {
    let valid = true;
    const fields = form.querySelectorAll("[data-required]");
    fields.forEach((field) => {
      const input = field.querySelector("input, textarea, select");
      const err = field.querySelector(".error-msg");
      const value = (input.value || "").trim();
      let fieldValid = true;
      if (input.type === "email") {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      } else if (input.type === "tel") {
        fieldValid = value === "" || /^[+]?[\d\s()-]{7,18}$/.test(value);
      } else {
        fieldValid = value.length > 0;
      }
      if (!fieldValid) {
        valid = false;
        input.classList.add("field-error");
        if (err) err.classList.add("show");
      } else {
        input.classList.remove("field-error");
        if (err) err.classList.remove("show");
      }
      input.addEventListener(
        "input",
        () => {
          input.classList.remove("field-error");
          if (err) err.classList.remove("show");
        },
        { once: true }
      );
    });
    return valid;
  }

  function gather(form) {
    const data = {};
    $$("input, select, textarea", form).forEach((el) => {
      if (el.name) data[el.name] = el.value.trim();
    });
    return data;
  }

  function saveLead(data) {
    let arr = [];
    try {
      arr = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    } catch (e) {}
    arr.push(Object.assign({ at: new Date().toISOString(), page: location.pathname }, data));
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function setupDraft(form) {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      Object.keys(saved).forEach((n) => {
        const el = form.querySelector('[name="' + n + '"]');
        if (el) el.value = saved[n];
      });
    } catch (e) {}
    form.addEventListener("input", () => {
      const data = {};
      $$("input, select, textarea", form).forEach((el) => {
        if (el.name && el.type !== "submit") data[el.name] = el.value;
      });
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch (e) {}
    });
  }

  function addSubmitSpinner(btn) {
    if (!btn || btn.querySelector(".btn-label")) return;
    const label = document.createElement("span");
    label.className = "btn-label";
    while (btn.firstChild) label.appendChild(btn.firstChild);
    btn.appendChild(label);
    const sp = document.createElement("span");
    sp.className = "spinner";
    btn.appendChild(sp);
  }

  function setupForm(form, isQuick) {
    if (!form) return;
    form.setAttribute("novalidate", "");
    addSubmitSpinner(form.querySelector("button[type=submit]"));
    if (!isQuick) setupDraft(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) {
        const firstErr = form.querySelector(".field-error");
        if (firstErr) firstErr.focus();
        return;
      }
      const btn = form.querySelector("button[type=submit]");
      const label = btn ? btn.querySelector(".btn-label") : null;
      const originalHTML = label ? label.innerHTML : "";
      if (btn) btn.classList.add("loading");
      if (label) label.textContent = "Sending...";

      const data = gather(form);

      setTimeout(() => {
        if (btn) btn.classList.remove("loading");
        if (label) label.innerHTML = originalHTML;
        saveLead(data);

        if (isQuick) {
          showToast("Request sent! We'll reach out within 24 hours.");
          form.reset();
          const ov = form.closest(".modal-overlay");
          if (ov) {
            ov.classList.remove("open");
            document.body.style.overflow = "";
          }
        } else {
          const success = form.parentElement.querySelector(".form-success");
          if (success) {
            success.classList.add("show");
            success.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => success.classList.remove("show"), 6000);
          }
          showToast("Thank you! Your request is in.");
          form.reset();
          try {
            localStorage.removeItem(DRAFT_KEY);
          } catch (e) {}
        }
      }, 1100);
    });
  }

  function initForms() {
    // contact page form
    $$("form[data-validate]:not([data-quick])").forEach((f) => setupForm(f, false));
  }

  /* ============================================================
     NEWSLETTER (with duplicate detection + persistence)
     ============================================================ */
  function initNewsletter() {
    const form = $(".newsletter-form");
    if (!form) return;
    const sendIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const btn = form.querySelector("button");
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.style.borderColor = "#e11d48";
        input.focus();
        showToast("Please enter a valid email.");
        return;
      }
      input.style.borderColor = "";
      let subs = [];
      try {
        subs = JSON.parse(localStorage.getItem("ya-subscribers") || "[]");
      } catch (e) {}
      if (subs.includes(email)) {
        showToast("You're already subscribed!");
      } else {
        subs.push(email);
        try {
          localStorage.setItem("ya-subscribers", JSON.stringify(subs));
        } catch (e) {}
        showToast("Subscribed! Watch your inbox.");
      }
      input.value = "";
      input.placeholder = "Subscribed!";
      btn.innerHTML = "✓";
      setTimeout(() => {
        btn.innerHTML = sendIcon;
        input.placeholder = "Enter your email";
      }, 2600);
    });
  }

  /* ============================================================
     TOASTS
     ============================================================ */
  let toastWrap = null;
  function ensureToastWrap() {
    if (toastWrap) return toastWrap;
    toastWrap = document.createElement("div");
    toastWrap.className = "toast-wrap";
    toastWrap.setAttribute("aria-live", "polite");
    document.body.appendChild(toastWrap);
    return toastWrap;
  }
  function showToast(msg) {
    const wrap = ensureToastWrap();
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg><span>' +
      msg +
      "</span>";
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 3200);
  }

  /* ============================================================
     QUICK ENQUIRY FAB + MODAL
     ============================================================ */
  function injectFabModal() {
    // FAB
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "fab";
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Quick Enquiry</span>';
    document.body.appendChild(fab);

    // modal
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle">' +
      '<button class="modal-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<span class="eyebrow">Quick enquiry</span>' +
      '<h3 id="mtitle">Book your free session</h3>' +
      '<p class="muted">Share a few details and our team will reach out within 24 hours to schedule your free 30-minute counseling.</p>' +
      '<form data-validate data-quick novalidate>' +
      '<div class="field" data-required><label for="q-name">Name <span class="req">*</span></label><input id="q-name" name="name" type="text" autocomplete="name" placeholder="Your name" /><span class="error-msg">Please enter your name.</span></div>' +
      '<div class="field" data-required><label for="q-email">Email <span class="req">*</span></label><input id="q-email" name="email" type="email" autocomplete="email" placeholder="you@email.com" /><span class="error-msg">Please enter a valid email.</span></div>' +
      '<div class="field" data-required><label for="q-interest">Interested in <span class="req">*</span></label><select id="q-interest" name="interest"><option value="" disabled selected>Choose a service</option><option>Career Counseling</option><option>Skill Training Program</option><option>1:1 Mentorship</option><option>Mock Interviews</option><option>Resume &amp; Profile Building</option><option>Placement Assistance</option><option>Not sure yet</option></select><span class="error-msg">Please select an option.</span></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Request Session</button>' +
      '<p class="center-link">Prefer the full form? <a href="contact.html">Open contact page</a></p>' +
      "</form>" +
      "</div>";
    document.body.appendChild(overlay);

    const modalForm = overlay.querySelector("form");
    setupForm(modalForm, true);

    const close = $(".modal-close", overlay);
    fab.addEventListener("click", () => openModal());
    close.addEventListener("click", () => closeModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });

    function openModal() {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        const f = $("#q-name", overlay);
        if (f) f.focus();
      }, 120);
    }
    function closeModal() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  /* ============================================================
     BACK TO TOP + SMOOTH ANCHORS + YEAR
     ============================================================ */
  function initBackToTop() {
    if (toTopBtn) toTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }
  function initYear() {
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    injectThemeToggle();
    injectScrollProgress();
    initMobileNav();
    initReveal();
    initCounters();
    initProgressBars();
    initCarousel();
    initStoryFilter();
    initProgramFilter();
    initFaqSearch();
    initFaqAccordion();
    initForms();
    injectFabModal();
    initNewsletter();
    initBackToTop();
    initAnchors();
    initYear();

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
