const REFERENCE = /^[A-Z0-9-]{4,40}$/;

const root = document.querySelector<HTMLElement>("[data-claims]");
if (root) {
  const form = root.querySelector<HTMLFormElement>("form");
  const input = root.querySelector<HTMLInputElement>("input[name='ref']");
  const result = root.querySelector<HTMLElement>("[data-claim-result]");
  const store = root.querySelector<HTMLElement>("[data-claim-store]");

  const lookup = (raw: string, updateUrl: boolean) => {
    if (!result || !store) return;
    const ref = raw.trim().toUpperCase();
    result.replaceChildren();
    if (!ref) {
      result.hidden = true;
      return;
    }
    const message = document.createElement("p");
    message.className = "empty";
    if (!REFERENCE.test(ref)) {
      message.textContent = root.dataset.invalid ?? "";
      result.append(message);
      result.hidden = false;
    } else {
      const source = store.querySelector<HTMLElement>(`[data-reference="${CSS.escape(ref)}"]`);
      if (!source) {
        message.textContent = root.dataset.notFound ?? "";
        result.append(message);
      } else {
        const heading = document.createElement("h2");
        heading.textContent = root.dataset.resultTitle ?? "";
        const clone = source.cloneNode(true) as HTMLElement;
        clone.hidden = false;
        result.append(heading, clone);
      }
      result.hidden = false;
    }
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set("ref", ref);
      history.replaceState(null, "", url);
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    lookup(input?.value ?? "", true);
  });

  root.querySelectorAll<HTMLButtonElement>("[data-sample-ref]").forEach((button) => {
    button.addEventListener("click", () => {
      const ref = button.dataset.sampleRef ?? "";
      if (input) input.value = ref;
      lookup(ref, true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      result?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  });

  const initial = new URLSearchParams(location.search).get("ref");
  if (initial && input) {
    input.value = initial;
    lookup(initial, false);
  }
}
