const siteData = window.siteDataStore.load();
const systemSettings = siteData.systemSettings || {};
const consultPhone = systemSettings.consultPhone || "13800138000";
const consultTitle = systemSettings.consultTitle || "\u7535\u8bdd\u54a8\u8be2";
const consultStoreText = systemSettings.consultStoreText || "\u54a8\u8be2\u8be5\u5e97";
const detailConsultLink = document.querySelector("#detailConsultLink");
if (detailConsultLink) {
  detailConsultLink.href = `tel:${consultPhone}`;
  detailConsultLink.textContent = consultTitle;
}
const stores = siteData.stores.map((raw, index) => {
  const item = Array.isArray(raw)
    ? { rank: raw[0], category: raw[1], status: raw[2], year: raw[3], code: raw[4] }
    : raw;
  return {
  id: `tb-${item.code}`,
  index: index + 1,
  rank: item.rank,
  category: item.category,
  status: item.status,
  year: item.year,
  code: item.code,
  platform: item.platform || "\u6dd8\u5b9dC\u5e97",
  price: item.price || "\u54a8\u8be2\u62a5\u4ef7",
  transfer: item.transfer || "\u652f\u6301\u8f6c\u8ba9\u6d41\u7a0b\u5bf9\u63a5",
  assets: ["\u5e97\u94fa\u57fa\u7840\u8d44\u6599", "\u7c7b\u76ee\u4fe1\u606f", "\u8fdd\u89c4\u8bb0\u5f55\u6838\u5bf9", "\u8f6c\u8ba9\u6d41\u7a0b\u6307\u5bfc"],
  note: item.status === "\u65e0\u552e\u5047"
    ? "\u5f53\u524d\u5217\u8868\u6807\u6ce8\u4e3a\u65e0\u552e\u5047\uff0c\u5efa\u8bae\u4ea4\u6613\u524d\u518d\u6838\u5bf9\u540e\u53f0\u8bb0\u5f55\u3002"
    : "\u5f53\u524d\u5217\u8868\u6807\u6ce8\u4e3a\u6709\u552e\u5047\uff0c\u9002\u5408\u5148\u54a8\u8be2\u98ce\u9669\u548c\u7c7b\u76ee\u9650\u5236\u3002"
  };
});

let currentRank = "all";
const storeList = document.querySelector("#storeList");
const storeSearch = document.querySelector("#storeSearch");
const rankFilters = document.querySelector("#rankFilters");
const storeModal = document.querySelector("#storeModal");
const storeModalBody = document.querySelector("#storeModalBody");
const modalClose = document.querySelector("#modalClose");

function getRankType(store) {
  if (store.rank.includes("\u5fc3")) return "heart";
  if (store.status === "\u65e0\u552e\u5047") return "clean";
  return "diamond";
}

function storeTitle(store) {
  return `${store.rank} ${store.category} ${store.status} ${store.year}`;
}

function getFilteredStores() {
  const keyword = storeSearch.value.trim();
  return stores.filter((store) => {
    const text = `${store.rank}${store.category}${store.status}${store.year}${store.code}`;
    const rankMatch = currentRank === "all"
      || getRankType(store) === currentRank
      || (currentRank === "diamond" && store.rank.includes("\u94bb"));
    return rankMatch && (!keyword || text.includes(keyword));
  });
}

function renderStores() {
  const filtered = getFilteredStores();
  storeList.innerHTML = filtered.map((store) => `
    <article class="store-card">
      <div class="rank-badge">${store.rank}</div>
      <div>
        <h3>${storeTitle(store)}<span>(${store.code})</span></h3>
        <p>${store.status === "\u65e0\u552e\u5047" ? "\u8d44\u6599\u9f50\u5168\uff0c\u652f\u6301\u8be6\u60c5\u6838\u5bf9" : "\u7279\u6b8a\u60c5\u51b5\uff0c\u5efa\u8bae\u5148\u54a8\u8be2\u786e\u8ba4"}</p>
      </div>
      <button type="button" data-store-id="${store.id}">\u67e5\u770b</button>
    </article>
  `).join("");
}

function renderStoreDetail(store) {
  storeModalBody.innerHTML = `
    <header class="modal-head">
      <span>${store.platform}</span>
      <h2 id="storeModalTitle">${storeTitle(store)}</h2>
      <p>\u5e97\u94fa\u7f16\u53f7\uff1a${store.code}</p>
    </header>
    <dl class="detail-grid">
      <div><dt>\u5e97\u94fa\u7b49\u7ea7</dt><dd>${store.rank}</dd></div>
      <div><dt>\u4e3b\u8425\u7c7b\u76ee</dt><dd>${store.category}</dd></div>
      <div><dt>\u552e\u5047\u72b6\u6001</dt><dd>${store.status}</dd></div>
      <div><dt>\u5e74\u4efd/\u5e97\u9f84</dt><dd>${store.year}</dd></div>
      <div><dt>\u62a5\u4ef7</dt><dd>${store.price}</dd></div>
      <div><dt>\u4ea4\u63a5</dt><dd>${store.transfer}</dd></div>
    </dl>
    <section class="modal-section">
      <h3>\u53ef\u63d0\u4f9b\u8d44\u6599</h3>
      <div class="tag-list">${store.assets.map((item) => `<span>${item}</span>`).join("")}</div>
    </section>
    <section class="modal-section">
      <h3>\u98ce\u9669\u8bf4\u660e</h3>
      <p>${store.note}</p>
    </section>
    <div class="modal-actions">
      <a href="tel:${consultPhone}">${consultStoreText}</a>
      <button type="button" id="modalDone">\u6211\u77e5\u9053\u4e86</button>
    </div>
  `;
  storeModal.classList.add("open");
  storeModal.setAttribute("aria-hidden", "false");
  document.querySelector("#modalDone").addEventListener("click", closeModal);
}

function closeModal() {
  storeModal.classList.remove("open");
  storeModal.setAttribute("aria-hidden", "true");
}

rankFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  rankFilters.querySelector(".active").classList.remove("active");
  button.classList.add("active");
  currentRank = button.dataset.rank;
  renderStores();
});

storeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-store-id]");
  if (!button) return;
  const store = stores.find((item) => item.id === button.dataset.storeId);
  if (store) renderStoreDetail(store);
});

storeModal.addEventListener("click", (event) => {
  if (event.target === storeModal) closeModal();
});

modalClose.addEventListener("click", closeModal);
storeSearch.addEventListener("input", renderStores);
renderStores();
