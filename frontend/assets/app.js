(function () {
  const API_BASE = window.PB_BASE_URL || "";
  const state = {
    settings: null,
    stores: [],
    currentPlatform: "",
    searchKeyword: "",
  };

  const fallbackSettings = {
    site_name: "24号电商",
    slogan: "电商资源整合服务",
    phone: "",
    wechat: "",
    consult_text: "电话咨询",
    contact_link: "",
  };

  const fallbackMenus = [
    { title: "我要买店", icon_text: "买", icon_color: "orange", link_url: "./buy-store.html", sort: 10, is_active: true },
    { title: "我要卖店", icon_text: "卖", icon_color: "red", link_url: "#", sort: 20, is_active: true },
    { title: "代入驻", icon_text: "入", icon_color: "blue", link_url: "#", sort: 30, is_active: true },
    { title: "网店评估", icon_text: "评", icon_color: "pink", link_url: "#", sort: 40, is_active: true },
    { title: "商标转让", icon_text: "标", icon_color: "purple", link_url: "#", sort: 50, is_active: true },
    { title: "违规申诉", icon_text: "申", icon_color: "green", link_url: "#", sort: 60, is_active: true },
    { title: "电商服务", icon_text: "服", icon_color: "red", link_url: "#", sort: 70, is_active: true },
    { title: "我的", icon_text: "我", icon_color: "black", link_url: "./my.html", sort: 80, is_active: true },
  ];

  const fallbackStores = [
    {
      platform: "taobao",
      category_text: "淘宝店铺",
      title: "家居日用 无售假 资料齐全 支持对接",
      price: "咨询报价",
      summary: "后台新增店铺后，这里会自动替换成你的真实店铺数据。",
      sort: 10,
      is_active: true,
    },
  ];

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function collectionUrl(name) {
    return `${API_BASE}/api/collections/${name}/records?perPage=200`;
  }

  async function fetchRecords(name) {
    const res = await fetch(collectionUrl(name), { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Load ${name} failed`);
    }
    const data = await res.json();
    return data.items || [];
  }

  async function fetchRecord(name, id) {
    const res = await fetch(`${API_BASE}/api/collections/${name}/records/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Load ${name}/${id} failed`);
    }
    return res.json();
  }

  function activeSorted(items) {
    return (items || [])
      .filter((item) => item.is_active !== false)
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  }

  function fileUrl(record, field) {
    const file = record && record[field];
    if (!file) return "";
    const filename = Array.isArray(file) ? file[0] : file;
    if (!filename) return "";
    return `${API_BASE}/api/files/${record.collectionName}/${record.id}/${filename}`;
  }

  function firstImageFromHtml(html) {
    if (!html) return "";
    const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  }

  function normalizeSearch(value) {
    return String(value || "").trim().toLowerCase();
  }

  function storeMatchesSearch(item, keyword) {
    if (!keyword) return true;
    const haystack = [
      item.title,
      item.platform,
      item.category_text,
      item.level,
      item.year,
      item.code,
      item.price,
      item.summary,
    ].map(normalizeSearch).join(" ");
    return haystack.includes(keyword);
  }

  function menuLinkFor(item) {
    const link = String(item.link_url || "").trim();
    if (link && link !== "#") return link;
    const title = String(item.title || "");
    const map = [
      ["我要买店", "./buy-store.html"],
      ["我要卖店", "./service-page.html?key=sell"],
      ["代入驻", "./service-page.html?key=ruzhu"],
      ["网店评估", "./service-page.html?key=evaluate"],
      ["商标转让", "./service-page.html?key=trademark"],
      ["违规申诉", "./service-page.html?key=appeal"],
      ["电商服务", "./service-page.html?key=service"],
      ["我的", "./service-page.html?key=my"],
    ];
    const found = map.find(([name]) => title.includes(name));
    return found ? found[1] : "#";
  }

  async function loadSettings() {
    try {
      const items = activeSorted(await fetchRecords("site_settings"));
      state.settings = items[0] || fallbackSettings;
    } catch (err) {
      state.settings = fallbackSettings;
    }

    document.title = document.title.replace("24号电商", state.settings.site_name || "24号电商");

    document.querySelectorAll("[data-consult]").forEach((el) => {
      if (state.settings.consult_text && el.tagName === "BUTTON") {
        el.textContent = state.settings.consult_text;
      }

      el.addEventListener("click", (event) => {
        const link = state.settings.contact_link || (state.settings.phone ? `tel:${state.settings.phone}` : "");
        if (!link) {
          event.preventDefault();
          alert("请先在后台 site_settings 里填写电话或咨询链接。");
          return;
        }
        event.preventDefault();
        window.location.href = link;
      });
    });

    const slogan = document.getElementById("siteSlogan");
    if (slogan) slogan.textContent = state.settings.slogan || fallbackSettings.slogan;

    const phoneText = document.getElementById("phoneText");
    if (phoneText) phoneText.textContent = state.settings.phone || "点击联系服务顾问";
  }

  async function renderHomeBanners() {
    const container = document.getElementById("homeBanners");
    if (!container) return;

    let banners = [];
    try {
      banners = activeSorted(await fetchRecords("home_banners"));
    } catch (err) {
      banners = [];
    }

    if (!banners.length) return;

    container.innerHTML = `
      <div class="banner-track">
        ${banners.map((item) => {
          const image = fileUrl(item, "image") || item.image_url;
          const height = Number(item.height_px) > 0 ? Number(item.height_px) : 240;
          const content = image
            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}">`
            : `<div class="hero fallback-hero"><div class="brand">${escapeHtml(item.title)}</div><p>${escapeHtml(state.settings?.slogan || "")}</p></div>`;
          return `<a class="banner-item" style="height:${height}px" href="${escapeHtml(item.link_url || "#")}">${content}</a>`;
        }).join("")}
      </div>
      ${banners.length > 1 ? `<div class="banner-dots">${banners.map((_, index) => `<button type="button" class="${index === 0 ? "active" : ""}" aria-label="第 ${index + 1} 张"></button>`).join("")}</div>` : ""}
    `;

    setupBannerCarousel(container);
  }

  function setupBannerCarousel(container) {
    const track = container.querySelector(".banner-track");
    const items = Array.from(container.querySelectorAll(".banner-item"));
    const dots = Array.from(container.querySelectorAll(".banner-dots button"));
    if (!track || items.length <= 1) return;

    let current = 0;
    let timer = null;
    let isDragging = false;
    let startX = 0;
    let startLeft = 0;

    function itemLeft(index) {
      return items[index].offsetLeft - track.offsetLeft;
    }

    function setActive(index) {
      current = Math.max(0, Math.min(index, items.length - 1));
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === current));
    }

    function scrollToIndex(index) {
      setActive(index);
      track.scrollTo({ left: itemLeft(current), behavior: "smooth" });
    }

    function next() {
      scrollToIndex((current + 1) % items.length);
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(next, 3000);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        scrollToIndex(index);
        startAuto();
      });
    });

    track.addEventListener("scroll", () => {
      const nearest = items.reduce((best, item, index) => {
        const distance = Math.abs(track.scrollLeft - itemLeft(index));
        return distance < best.distance ? { index, distance } : best;
      }, { index: current, distance: Infinity });
      setActive(nearest.index);
    }, { passive: true });

    track.addEventListener("pointerdown", (event) => {
      isDragging = true;
      startX = event.clientX;
      startLeft = track.scrollLeft;
      track.classList.add("dragging");
      stopAuto();
    });

    track.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      event.preventDefault();
      track.scrollLeft = startLeft - (event.clientX - startX);
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("dragging");
      scrollToIndex(current);
      startAuto();
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", endDrag);
    track.addEventListener("mouseenter", stopAuto);
    track.addEventListener("mouseleave", startAuto);

    startAuto();
  }

  async function renderHomeMenus() {
    const container = document.getElementById("homeMenus");
    if (!container) return;

    let menus = [];
    try {
      menus = activeSorted(await fetchRecords("home_menus"));
    } catch (err) {
      menus = [];
    }

    const list = menus.length ? menus : fallbackMenus;
    container.innerHTML = list.map((item) => {
      const iconImage = fileUrl(item, "icon_image");
      const icon = iconImage
        ? `<img src="${escapeHtml(iconImage)}" alt="">`
        : escapeHtml(item.icon_text || item.title.slice(0, 1));
      return `
        <a href="${escapeHtml(menuLinkFor(item))}">
          <b class="menu-${escapeHtml(item.icon_color || "orange")}">${icon}</b>
          <span>${escapeHtml(item.title)}</span>
        </a>
      `;
    }).join("");
  }

  async function renderHomeSections() {
    const container = document.getElementById("homeSections");
    if (!container) return;

    let sections = [];
    try {
      sections = activeSorted(await fetchRecords("home_sections"));
    } catch (err) {
      sections = [];
    }

    if (!sections.length) return;

    container.innerHTML = sections.map((item) => {
      const image = fileUrl(item, "image") || item.image_url;
      return `
        <article class="content-card">
          <h2>${escapeHtml(item.title)}</h2>
          ${item.subtitle ? `<p>${escapeHtml(item.subtitle)}</p>` : ""}
          ${image ? `<img class="section-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}">` : ""}
          ${item.content ? `<div class="rich-content">${item.content}</div>` : ""}
          ${item.button_text ? `<a class="pill-button" href="${escapeHtml(item.button_link || "#")}">${escapeHtml(item.button_text)}</a>` : ""}
        </article>
      `;
    }).join("");
  }

  async function renderStores(platform) {
    const container = document.getElementById("storeList");
    if (!container) return;

    if (typeof platform === "string") {
      state.currentPlatform = platform;
    }

    if (!state.stores.length) {
      try {
        state.stores = activeSorted(await fetchRecords("stores"));
      } catch (err) {
        state.stores = [];
      }
    }

    const source = state.stores.length ? state.stores : fallbackStores;
    const list = state.currentPlatform ? source.filter((item) => item.platform === state.currentPlatform) : source;
    const keyword = normalizeSearch(state.searchKeyword);
    const shown = list.filter((item) => storeMatchesSearch(item, keyword));

    if (!shown.length) {
      container.innerHTML = `
        <article class="empty-card">
          <h2>暂无店铺</h2>
          <p>这个分类下面还没有店铺，你可以去后台 stores 表新增。</p>
        </article>
      `;
      return;
    }

    container.innerHTML = shown.map((item) => {
      const image = fileUrl(item, "image") || firstImageFromHtml(item.detail);
      return `
        <article class="store-card">
          <a class="store-link" href="./store-detail.html?id=${encodeURIComponent(item.id)}">
            ${image ? `<img class="store-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}">` : ""}
            <small>${escapeHtml(item.category_text || item.platform || "店铺资源")}</small>
            <h2>${escapeHtml(item.title)}</h2>
            ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
            <div class="price">${escapeHtml(item.price || "咨询报价")}</div>
          </a>
          <button type="button" data-consult>微信咨询</button>
        </article>
      `;
    }).join("");

    document.querySelectorAll("#storeList [data-consult]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const link = state.settings?.contact_link || (state.settings?.phone ? `tel:${state.settings.phone}` : "");
        if (!link) {
          alert("请先在后台 site_settings 里填写电话或咨询链接。");
          return;
        }
        window.location.href = link;
      });
    });
  }

  async function renderStoreDetail() {
    const container = document.getElementById("storeDetail");
    if (!container) return;

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      container.innerHTML = `<p class="muted">没有找到店铺 ID，请从买店列表进入。</p>`;
      return;
    }

    let item = null;
    try {
      item = await fetchRecord("stores", id);
    } catch (err) {
      container.innerHTML = `<p class="muted">店铺详情加载失败，请返回列表重试。</p>`;
      return;
    }

    const image = fileUrl(item, "image");
    document.title = `${item.title || "店铺详情"} - ${state.settings?.site_name || "24号电商"}`;

    container.innerHTML = `
      ${image ? `<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}">` : ""}
      <small>${escapeHtml(item.category_text || item.platform || "店铺资源")}</small>
      <h1>${escapeHtml(item.title)}</h1>
      <div class="detail-meta">
        ${item.level ? `<span>${escapeHtml(item.level)}</span>` : ""}
        ${item.year ? `<span>${escapeHtml(item.year)}</span>` : ""}
        ${item.code ? `<span>${escapeHtml(item.code)}</span>` : ""}
      </div>
      <div class="price">${escapeHtml(item.price || "咨询报价")}</div>
      ${item.summary ? `<p class="detail-summary">${escapeHtml(item.summary)}</p>` : ""}
      ${item.detail ? `<div class="rich-content detail-content">${item.detail}</div>` : `<p class="muted">暂无更多详情。</p>`}
      <div class="detail-actions">
        <a class="pill-button" href="./buy-store.html">返回列表</a>
        <button type="button" data-consult>${escapeHtml(state.settings?.consult_text || "电话咨询")}</button>
      </div>
    `;

    container.querySelectorAll("[data-consult]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const link = item.phone ? `tel:${item.phone}` : (state.settings?.contact_link || (state.settings?.phone ? `tel:${state.settings.phone}` : ""));
        if (!link) {
          alert("请先在后台 site_settings 里填写电话或咨询链接。");
          return;
        }
        window.location.href = link;
      });
    });
  }

  async function renderServicePage() {
    const container = document.getElementById("servicePage");
    if (!container) return;

    const key = new URLSearchParams(window.location.search).get("key") || "";
    if (!key) {
      container.innerHTML = `<p class="muted">没有找到页面标识，请从首页入口进入。</p>`;
      return;
    }

    let pages = [];
    try {
      pages = activeSorted(await fetchRecords("service_pages"));
    } catch (err) {
      pages = [];
    }

    const item = pages.find((page) => page.page_key === key);
    if (!item) {
      container.innerHTML = `
        <h1>页面还没配置</h1>
        <p class="muted">请到后台 service_pages 表里新增 page_key 为 ${escapeHtml(key)} 的内容。</p>
      `;
      return;
    }

    const titleEl = document.getElementById("servicePageTitle");
    if (titleEl) titleEl.textContent = item.title || "服务详情";
    document.title = `${item.title || "服务详情"} - ${state.settings?.site_name || "24号电商"}`;

    const image = fileUrl(item, "image") || item.image_url;
    container.innerHTML = `
      ${image ? `<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}">` : ""}
      <h1>${escapeHtml(item.title)}</h1>
      ${item.subtitle ? `<p class="detail-summary">${escapeHtml(item.subtitle)}</p>` : ""}
      ${item.content ? `<div class="rich-content detail-content">${item.content}</div>` : `<p class="muted">暂无内容，请到后台编辑。</p>`}
      <div class="detail-actions single-action">
        <button type="button" data-consult>${escapeHtml(item.button_text || state.settings?.consult_text || "电话咨询")}</button>
      </div>
    `;

    container.querySelectorAll("[data-consult]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const link = item.button_link || state.settings?.contact_link || (state.settings?.phone ? `tel:${state.settings.phone}` : "");
        if (!link) {
          alert("请先在后台 site_settings 里填写电话或咨询链接。");
          return;
        }
        window.location.href = link;
      });
    });
  }

  async function renderStoreCategories() {
    const filters = document.getElementById("storeFilters");
    if (!filters) return;

    let categories = [];
    try {
      categories = activeSorted(await fetchRecords("store_categories"));
    } catch (err) {
      categories = [];
    }

    if (!categories.length) return;

    filters.innerHTML = `
      <button class="active" data-platform="">全部</button>
      ${categories.map((item) => `
        <button data-platform="${escapeHtml(item.platform || item.code || "")}">${escapeHtml(item.name || item.code)}</button>
      `).join("")}
    `;
  }

  function bindStoreFilters() {
    const filters = document.getElementById("storeFilters");
    if (!filters) return;

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      filters.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderStores(button.dataset.platform || "");
    });
  }

  function bindStoreSearch() {
    const input = document.getElementById("storeSearch");
    if (!input) return;

    const keyword = new URLSearchParams(window.location.search).get("q") || "";
    if (keyword) {
      input.value = keyword;
      state.searchKeyword = keyword;
    }

    input.addEventListener("input", () => {
      state.searchKeyword = input.value;
      renderStores(state.currentPlatform);
    });
  }

  function bindHomeSearch() {
    const input = document.getElementById("homeSearch");
    if (!input) return;

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const keyword = input.value.trim();
      if (!keyword) return;
      window.location.href = `./buy-store.html?q=${encodeURIComponent(keyword)}`;
    });
  }

  async function renderBottomNavs(page) {
    const nav = document.querySelector(".bottom-nav");
    if (!nav) return;

    let navs = [];
    try {
      navs = activeSorted(await fetchRecords("bottom_navs"));
    } catch (err) {
      navs = [];
    }

    if (!navs.length) return;

    const iconForNav = (item) => {
      const key = item.page_key || "";
      const title = item.title || "";
      if (item.action === "consult" || key === "consult" || title.includes("咨询")) return "☎";
      if (key === "home" || title.includes("首页")) return "⌂";
      if (key === "buy-store" || title.includes("买")) return "▣";
      if (key === "my" || title.includes("我")) return "◇";
      return "•";
    };

    nav.innerHTML = navs.map((item) => {
      const isActive = item.page_key === page;
      const isConsult = item.action === "consult";
      const attrs = isConsult ? 'href="#" data-consult' : `href="${escapeHtml(item.link_url || "#")}"`;
      const classes = ["nav-item", isActive ? "active" : "", isConsult ? "consult-item" : ""].filter(Boolean).join(" ");
      return `<a class="${classes}" ${attrs}>
        <span class="nav-icon">${escapeHtml(iconForNav(item))}</span>
        <span class="nav-label">${escapeHtml(item.title)}</span>
      </a>`;
    }).join("");

    document.querySelectorAll(".bottom-nav [data-consult]").forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        const link = state.settings?.contact_link || (state.settings?.phone ? `tel:${state.settings.phone}` : "");
        if (!link) {
          alert("请先在后台 site_settings 里填写电话或咨询链接。");
          return;
        }
        window.location.href = link;
      });
    });
  }

  async function init() {
    await loadSettings();
    const page = document.body.dataset.page;
    await renderBottomNavs(page);

    if (page === "home") {
      bindHomeSearch();
      await Promise.all([renderHomeBanners(), renderHomeMenus(), renderHomeSections()]);
    }

    if (page === "buy-store") {
      await renderStoreCategories();
      bindStoreFilters();
      bindStoreSearch();
      await renderStores("");
    }

    if (page === "store-detail") {
      await renderStoreDetail();
    }

    if (page === "service-page") {
      await renderServicePage();
    }
  }

  init();
}());
