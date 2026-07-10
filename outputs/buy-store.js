const data = window.siteDataStore.load();
const buyList = document.querySelector("#buyList");
const buySearch = document.querySelector("#buySearch");
const buyPlatforms = document.querySelector("#buyPlatforms");
const buyCount = document.querySelector("#buyCount");
let currentType = "all";
const regions = ["华南地区", "华东地区", "华北地区", "西南地区", "华中地区"];
const prices = ["2.30万", "1.10万", "3.60万", "0.98万", "4.20万", "1.80万"];

function normalizeStore(raw, type) {
  const item = Array.isArray(raw)
    ? { rank: raw[0], category: raw[1], status: raw[2], year: raw[3], code: raw[4] }
    : raw;
  return {
    type,
    rank: item.rank,
    category: item.category,
    status: item.status,
    year: item.year,
    code: item.code,
    price: item.price || "\u54a8\u8be2\u62a5\u4ef7"
  };
}

function platformName(type) {
  if (type === "taobao") return "\u6dd8\u5b9d\u5e97";
  if (type === "pdd") return "\u62fc\u591a\u591a\u5e97";
  return "\u5929\u732b\u5e97";
}

function platformIcon(type) {
  if (type === "taobao") return "\u6dd8";
  if (type === "pdd") return "\u62fc";
  return "\u732b";
}

function detailUrl(type) {
  if (type === "taobao") return "./taobao-store.html";
  if (type === "pdd") return "./pdd-store.html";
  return "./entry-page.html?id=tmall";
}

function allStores() {
  const taobao = (data.stores || []).map((item) => normalizeStore(item, "taobao"));
  const pdd = (data.pddStores || []).map((item) => normalizeStore(item, "pdd"));
  const tmall = [
    { type: "tmall", rank: "\u65d7\u8230\u5e97", category: "\u54c1\u724c\u5165\u9a7b", status: "\u8d44\u6599\u9f50\u5168", year: "2026\u5e74", code: "T001", price: "\u54a8\u8be2\u62a5\u4ef7" },
    { type: "tmall", rank: "\u4e13\u8425\u5e97", category: "\u591a\u7c7b\u76ee", status: "\u53ef\u5bf9\u63a5", year: "2025\u5e74", code: "T002", price: "\u54a8\u8be2\u62a5\u4ef7" }
  ];
  return [...taobao, ...pdd, ...tmall];
}

function renderList() {
  const keyword = buySearch.value.trim();
  let list = allStores().filter((store) => {
    const text = `${platformName(store.type)}${store.rank}${store.category}${store.status}${store.year}${store.code}`;
    const matchType = currentType === "all" || currentType === "sort" || store.type === currentType;
    return matchType && (!keyword || text.includes(keyword));
  });
  if (currentType === "sort") list = list.slice().reverse();
  buyCount.textContent = `${list.length} \u4e2a\u5e97\u94fa`;
  buyList.innerHTML = list.map((store, index) => {
    const region = regions[index % regions.length];
    const price = store.price === "\u54a8\u8be2\u62a5\u4ef7" ? prices[index % prices.length] : store.price;
    return `
    <article class="deal-card">
      <div class="deal-card-top">
        <span class="deal-badge ${store.type}">${platformIcon(store.type)} ${platformName(store.type).replace("\u5e97", "\u8f6c\u8ba9")}</span>
        <span>${store.category} / ${store.rank} / 旗舰店</span>
      </div>
      <h2>${region} ${store.category}${store.rank} 店铺真实在售 商标大气 资料齐全 欢迎咨询</h2>
      <div class="deal-card-bottom">
        <strong>${price}</strong>
        <a href="${detailUrl(store.type)}">微信咨询</a>
      </div>
    </article>
  `;
  }).join("");
}

buyPlatforms.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  buyPlatforms.querySelector(".active").classList.remove("active");
  button.classList.add("active");
  currentType = button.dataset.type;
  renderList();
});

buySearch.addEventListener("input", renderList);
renderList();
