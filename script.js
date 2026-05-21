// Interactions only. No content logic, no DOM building.
// Each block degrades gracefully if its target nodes aren't present.

(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // 1) Today's date in the masthead — a small friendly touch, not content.
  const dateEl = document.querySelector("[data-date]");
  if (dateEl) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    dateEl.textContent = fmt.format(new Date());
  }

  // 2) Auto-update the © year in the colophon.
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // 3) Reveal-on-scroll for sections (IntersectionObserver, no library).
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // 4) Scroll-spy: highlight the masthead link for the section in view.
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(
    '.masthead__nav a[href^="#"]'
  );
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const linkBySlug = new Map();
    navLinks.forEach((a) =>
      linkBySlug.set(a.getAttribute("href").slice(1), a)
    );
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const link = linkBySlug.get(entry.target.id);
          if (!link) continue;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("is-current"));
            link.classList.add("is-current");
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // 5) Subtle pointer-tilt on project cards. Skips touch devices and reduced motion.
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !prefersReducedMotion) {
    const projects = document.querySelectorAll(".project");
    projects.forEach((card) => {
      let rafId = 0;
      const onMove = (ev) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width - 0.5;
          const y = (ev.clientY - r.top) / r.height - 0.5;
          card.style.setProperty("--tx", `${x * 4}px`);
          card.style.setProperty("--ty", `${y * 4}px`);
          rafId = 0;
        });
      };
      const onLeave = () => {
        card.style.setProperty("--tx", "0px");
        card.style.setProperty("--ty", "0px");
      };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
    });
  }
})();
