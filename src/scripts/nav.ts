const storageKey = "mia.lang";

function withSearch(base: string): string {
  const url = new URL(base, location.origin);
  url.search = location.search;
  return `${url.pathname}${url.search}`;
}

document.querySelectorAll<HTMLAnchorElement>("[data-lang-switch]").forEach((anchor) => {
  const paint = () => {
    const base = anchor.dataset.base;
    if (!base) return;
    anchor.href = withSearch(base);
  };
  anchor.addEventListener("pointerdown", paint);
  anchor.addEventListener("focus", paint);
  anchor.addEventListener("click", (event) => {
    const lang = anchor.dataset.langSwitch;
    if (lang === "zh-hant" || lang === "zh-hans") {
      try {
        localStorage.setItem(storageKey, lang);
      } catch {
        /* private mode */
      }
    }
    paint();
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    location.href = anchor.href;
  });
});

document.querySelectorAll("details.nav-drawer").forEach((details) => {
  details.addEventListener("keydown", (event) => {
    if (event instanceof KeyboardEvent && event.key === "Escape") details.removeAttribute("open");
  });
});
