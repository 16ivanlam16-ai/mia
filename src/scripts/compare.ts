const board = document.querySelector<HTMLElement>("[data-compare]");
if (board) {
  const form = board.querySelector<HTMLFormElement>("[data-compare-form]");
  const search = board.querySelector<HTMLInputElement>("[name='q']");
  const reward = board.querySelector<HTMLSelectElement>("[name='reward']");
  const network = board.querySelector<HTMLSelectElement>("[name='network']");
  const audience = board.querySelector<HTMLSelectElement>("[name='audience']");
  const live = board.querySelector<HTMLInputElement>("[name='live']");
  const count = board.querySelector<HTMLElement>("[data-compare-count]");
  const empty = board.querySelector<HTMLElement>("[data-compare-empty]");
  const template = board.dataset.countTemplate ?? "{shown} / {total}";
  const total = Number(board.dataset.total ?? "0");

  const readUrl = () => {
    const params = new URLSearchParams(location.search);
    if (search) search.value = params.get("q") ?? "";
    if (reward) reward.value = params.get("reward") ?? "";
    if (network) network.value = params.get("network") ?? "";
    if (audience) audience.value = params.get("audience") ?? "";
    if (live) live.checked = params.get("live") === "1";
  };

  const writeUrl = () => {
    const params = new URLSearchParams();
    if (search?.value.trim()) params.set("q", search.value.trim());
    if (reward?.value) params.set("reward", reward.value);
    if (network?.value) params.set("network", network.value);
    if (audience?.value) params.set("audience", audience.value);
    if (live?.checked) params.set("live", "1");
    const next = `${location.pathname}${params.toString() ? `?${params}` : ""}`;
    history.replaceState(null, "", next);
  };

  const apply = () => {
    const query = (search?.value ?? "").trim().toLowerCase();
    const rows = board.querySelectorAll<HTMLElement>("[data-card-id]");
    const visible = new Set<string>();
    rows.forEach((row) => {
      const id = row.dataset.cardId ?? "";
      const text = (row.dataset.text ?? "").toLowerCase();
      const audiences = (row.dataset.audiences ?? "").split(" ").filter(Boolean);
      const ok =
        (!query || text.includes(query)) &&
        (!reward?.value || row.dataset.reward === reward.value) &&
        (!network?.value || row.dataset.network === network.value) &&
        (!audience?.value || audiences.includes(audience.value)) &&
        (!live?.checked || row.dataset.status === "published");
      row.hidden = !ok;
      if (ok) visible.add(id);
    });
    if (count) {
      count.textContent = template.replace("{shown}", String(visible.size)).replace("{total}", String(total));
    }
    if (empty) empty.hidden = visible.size !== 0;
  };

  readUrl();
  apply();
  form?.addEventListener("input", () => {
    apply();
    writeUrl();
  });
  form?.addEventListener("change", () => {
    apply();
    writeUrl();
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    apply();
    writeUrl();
  });
  board.querySelector<HTMLButtonElement>("[data-clear]")?.addEventListener("click", () => {
    form?.reset();
    apply();
    writeUrl();
  });
}
