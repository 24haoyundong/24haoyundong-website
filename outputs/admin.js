let data = window.siteDataStore.load();
const shortcutEditor = document.querySelector("#shortcutEditor");
const storeEditor = document.querySelector("#storeEditor");
const pddStoreEditor = document.querySelector("#pddStoreEditor");
const entryEditor = document.querySelector("#entryEditor");
const bannerEditor = document.querySelector("#bannerEditor");
const bannerHeightInput = document.querySelector("#bannerHeightInput");
const homeContentEditor = document.querySelector("#homeContentEditor");
const toast = document.querySelector("#toast");
const dataBox = document.querySelector("#dataBox");
const adminUserInput = document.querySelector("#adminUserInput");
const adminPassInput = document.querySelector("#adminPassInput");
const adminPassConfirmInput = document.querySelector("#adminPassConfirmInput");
const consultPhoneInput = document.querySelector("#consultPhoneInput");
const consultTitleInput = document.querySelector("#consultTitleInput");
const consultTextInput = document.querySelector("#consultTextInput");
const consultStoreTextInput = document.querySelector("#consultStoreTextInput");
const consultPrimaryTextInput = document.querySelector("#consultPrimaryTextInput");
const sidebarToggle = document.querySelector("#sidebarToggle");
const refreshAdmin = document.querySelector("#refreshAdmin");
const backTop = document.querySelector("#backTop");
const confirmMask = document.querySelector("#confirmMask");
const confirmText = document.querySelector("#confirmText");
const confirmCancel = document.querySelector("#confirmCancel");
const confirmOk = document.querySelector("#confirmOk");
const statShortcutCount = document.querySelector("#statShortcutCount");
const statStoreCount = document.querySelector("#statStoreCount");
const statImageCount = document.querySelector("#statImageCount");
const statContentCount = document.querySelector("#statContentCount");
const userTableBody = document.querySelector("#userTableBody");
const refreshUsers = document.querySelector("#refreshUsers");

let isDirty = false;
let pendingConfirm = null;

const colors = [
  ["orange", "\u6a59\u8272"],
  ["red", "\u7ea2\u8272"],
  ["crimson", "\u5929\u732b\u7ea2"],
  ["dark", "\u9ed1\u8272"],
  ["pink", "\u7c89\u8272"],
  ["purple", "\u7d2b\u8272"],
  ["mint", "\u7eff\u8272"],
  ["coral", "\u73ca\u745a\u8272"]
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function markSaved(message) {
  isDirty = false;
  showToast(message);
  updateDashboardStats();
}

function markDirty() {
  isDirty = true;
  updateDashboardStats();
}

function showConfirm(message, onConfirm) {
  pendingConfirm = onConfirm;
  confirmText.textContent = message;
  confirmMask.classList.add("show");
  confirmMask.setAttribute("aria-hidden", "false");
}

function hideConfirm() {
  pendingConfirm = null;
  confirmMask.classList.remove("show");
  confirmMask.setAttribute("aria-hidden", "true");
}

function updateDashboardStats() {
  if (!statShortcutCount) return;
  statShortcutCount.textContent = (data.shortcuts || []).length;
  statStoreCount.textContent = (data.stores || []).length + (data.pddStores || []).length;
  statImageCount.textContent = (data.homeBanners || []).length;
  statContentCount.textContent = (data.homeContents || []).length;
}

function setActiveNav() {
  const links = Array.from(document.querySelectorAll(".sidebar-nav a"));
  const visible = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
    .filter((item) => item.section)
    .reverse()
    .find((item) => item.section.getBoundingClientRect().top <= 90);
  links.forEach((link) => link.classList.toggle("active", link === (visible?.link || links[0])));
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderUserRows(users) {
  if (!userTableBody) return;
  if (!users.length) {
    userTableBody.innerHTML = `<tr><td colspan="4">还没有注册用户</td></tr>`;
    return;
  }
  userTableBody.innerHTML = users.map((user) => `
    <tr>
      <td>${escapeHtml(user.nickname || "-")}</td>
      <td>${escapeHtml(user.account || "-")}</td>
      <td>${escapeHtml(formatTime(user.createdAt))}</td>
      <td>${Number(user.sessionCount || 0)}</td>
    </tr>
  `).join("");
}

function loadUsers() {
  if (!userTableBody) return;
  userTableBody.innerHTML = `<tr><td colspan="4">正在加载...</td></tr>`;
  fetch("/api/users")
    .then((response) => {
      if (!response.ok) throw new Error("load users failed");
      return response.json();
    })
    .then((result) => renderUserRows(result.users || []))
    .catch(() => {
      userTableBody.innerHTML = `<tr><td colspan="4">用户加载失败，请刷新后台重试</td></tr>`;
    });
}

function renderBanners() {
  data.homeBanners = data.homeBanners || [];
  bannerHeightInput.value = Number(data.homeBannerHeight) || 128;
  if (!data.homeBanners.length) {
    bannerEditor.innerHTML = `<div class="empty-banner">\u8fd8\u6ca1\u6709\u4e0a\u4f20\u56fe\u7247\uff0c\u524d\u53f0\u4f1a\u5148\u663e\u793a\u9ed8\u8ba4\u56fe\u7247\u3002</div>`;
    return;
  }
  bannerEditor.innerHTML = data.homeBanners.map((item, index) => `
    <div class="banner-row" data-index="${index}">
      <img src="${item.image}" alt="">
      <label>\u56fe\u7247\u6807\u9898<input data-field="title" value="${escapeHtml(item.title || `\u9996\u9875\u56fe\u7247${index + 1}`)}"></label>
      <label>\u70b9\u51fb\u8df3\u8f6c\u94fe\u63a5<input data-field="href" value="${escapeHtml(item.href || "#")}"></label>
      <button class="delete-banner" type="button" data-delete-banner="${index}">\u5220</button>
    </div>
  `).join("");
}

function renderShortcuts() {
  shortcutEditor.innerHTML = data.shortcuts.map((item, index) => `
    <div class="shortcut-row" data-index="${index}">
      <label>\u663e\u793a\u540d\u79f0<input data-field="label" value="${escapeHtml(item.label)}"></label>
      <label>\u56fe\u6807\u5b57<input data-field="icon" value="${escapeHtml(item.icon)}" maxlength="2"></label>
      <label>\u989c\u8272
        <select data-field="color">
          ${colors.map(([value, label]) => `<option value="${value}" ${item.color === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label>\u8df3\u8f6c\u94fe\u63a5<input data-field="href" value="${escapeHtml(item.href)}"></label>
    </div>
  `).join("");
}

function renderHomeContents() {
  data.homeContents = data.homeContents || [];
  if (!data.homeContents.length) {
    homeContentEditor.innerHTML = `<div class="empty-banner">\u8fd8\u6ca1\u6709\u9996\u9875\u81ea\u5b9a\u4e49\u5185\u5bb9\uff0c\u70b9\u51fb\u201c\u65b0\u589e\u5185\u5bb9\u201d\u6dfb\u52a0\u3002</div>`;
    return;
  }
  homeContentEditor.innerHTML = data.homeContents.map((item, index) => `
    <div class="content-row" data-index="${index}">
      <label>\u6807\u9898<input data-field="title" value="${escapeHtml(item.title || "")}"></label>
      <label>\u56fe\u7247\u5730\u5740<input data-field="image" value="${escapeHtml(item.image || "")}"></label>
      <label>\u6309\u94ae\u6587\u5b57<input data-field="button" value="${escapeHtml(item.button || "")}"></label>
      <label>\u6309\u94ae\u8df3\u8f6c\u94fe\u63a5<input data-field="href" value="${escapeHtml(item.href || "#")}"></label>
      <label class="full">\u6587\u5b57\u5185\u5bb9 / Ctrl+V \u7c98\u8d34\u56fe\u7247</label>
      <div class="rich-editor full" contenteditable="true" data-field="bodyHtml">${item.bodyHtml || escapeHtml(item.body || "")}</div>
      <button class="delete-content" type="button" data-delete-content="${index}">\u5220</button>
    </div>
  `).join("");
}

function shortcutId(item, index) {
  return item.id || `entry-${index}`;
}

function renderEntryPages() {
  data.entryPages = data.entryPages || {};
  entryEditor.innerHTML = data.shortcuts.map((item, index) => {
    const id = shortcutId(item, index);
    const page = data.entryPages[id] || {};
    return `
      <div class="entry-row" data-entry-id="${id}">
        <label>\u5bf9\u5e94\u5165\u53e3<input value="${escapeHtml(item.label)}" disabled></label>
        <label>\u9875\u9762\u6807\u9898<input data-field="title" value="${escapeHtml(page.title || item.label)}"></label>
        <label>\u526f\u6807\u9898<input data-field="subtitle" value="${escapeHtml(page.subtitle || "")}"></label>
        <label>\u9876\u90e8\u56fe\u7247\u5730\u5740<input data-field="image" value="${escapeHtml(page.image || "")}"></label>
        <label>\u6309\u94ae\u6587\u5b57<input data-field="button" value="${escapeHtml(page.button || "\u67e5\u770b\u8be6\u60c5")}"></label>
        <label>\u6700\u7ec8\u8df3\u8f6c\u94fe\u63a5<input data-field="href" value="${escapeHtml(item.href || "#")}"></label>
        <label class="full">\u9875\u9762\u4ecb\u7ecd<textarea data-field="body">${escapeHtml(page.body || "")}</textarea></label>
      </div>
    `;
  }).join("");
}

function normalizeStore(raw, index) {
  if (Array.isArray(raw)) {
    return { rank: raw[0], category: raw[1], status: raw[2], year: raw[3], code: raw[4] };
  }
  return Object.assign({ rank: "", category: "", status: "", year: "", code: String(index + 1) }, raw);
}

function renderStoreEditor(target, stores) {
  target.innerHTML = stores.map((raw, index) => {
    const item = normalizeStore(raw, index);
    return `
      <div class="store-row" data-index="${index}">
        <label>\u7b49\u7ea7<input data-field="rank" value="${escapeHtml(item.rank)}"></label>
        <label>\u7c7b\u76ee<input data-field="category" value="${escapeHtml(item.category)}"></label>
        <label>\u72b6\u6001
          <select data-field="status">
            <option value="\u65e0\u552e\u5047" ${item.status === "\u65e0\u552e\u5047" ? "selected" : ""}>\u65e0\u552e\u5047</option>
            <option value="\u6709\u552e\u5047" ${item.status === "\u6709\u552e\u5047" ? "selected" : ""}>\u6709\u552e\u5047</option>
          </select>
        </label>
        <label>\u5e74\u4efd/\u5e97\u9f84<input data-field="year" value="${escapeHtml(item.year)}"></label>
        <label>\u7f16\u53f7<input data-field="code" value="${escapeHtml(item.code)}"></label>
        <label>\u62a5\u4ef7<input data-field="price" value="${escapeHtml(item.price || "\u54a8\u8be2\u62a5\u4ef7")}"></label>
        <button class="delete-store" type="button" data-delete="${index}">\u5220</button>
      </div>
    `;
  }).join("");
}

function renderStores() {
  renderStoreEditor(storeEditor, data.stores);
  renderStoreEditor(pddStoreEditor, data.pddStores || []);
}

function renderSystemSettings() {
  data.systemSettings = Object.assign({
    consultPhone: "13800138000",
    consultTitle: "\u7535\u8bdd\u54a8\u8be2",
    consultText: "\u70b9\u51fb\u8054\u7cfb\u670d\u52a1\u987e\u95ee",
    consultStoreText: "\u54a8\u8be2\u8be5\u5e97",
    consultPrimaryText: "\u7acb\u5373\u54a8\u8be2"
  }, data.systemSettings || {});
  consultPhoneInput.value = data.systemSettings.consultPhone;
  consultTitleInput.value = data.systemSettings.consultTitle;
  consultTextInput.value = data.systemSettings.consultText;
  consultStoreTextInput.value = data.systemSettings.consultStoreText;
  consultPrimaryTextInput.value = data.systemSettings.consultPrimaryText;
}

function collectBanners() {
  const previous = data.homeBanners || [];
  data.homeBannerHeight = Math.min(320, Math.max(80, Number(bannerHeightInput.value) || 128));
  data.homeBanners = Array.from(bannerEditor.querySelectorAll(".banner-row")).map((row, index) => ({
    image: previous[index]?.image || row.querySelector("img")?.src || "",
    title: row.querySelector('[data-field="title"]').value.trim(),
    href: row.querySelector('[data-field="href"]').value.trim() || "#"
  })).filter((item) => item.image);
}

function collectShortcuts() {
  data.shortcuts = Array.from(shortcutEditor.querySelectorAll(".shortcut-row")).map((row, index) => ({
    id: data.shortcuts[index]?.id || `entry-${index}`,
    label: row.querySelector('[data-field="label"]').value.trim(),
    icon: row.querySelector('[data-field="icon"]').value.trim(),
    color: row.querySelector('[data-field="color"]').value,
    href: row.querySelector('[data-field="href"]').value.trim()
  }));
}

function collectHomeContents() {
  data.homeContents = Array.from(homeContentEditor.querySelectorAll(".content-row")).map((row) => ({
    title: row.querySelector('[data-field="title"]').value.trim(),
    image: row.querySelector('[data-field="image"]').value.trim(),
    button: row.querySelector('[data-field="button"]').value.trim(),
    href: row.querySelector('[data-field="href"]').value.trim() || "#",
    bodyHtml: row.querySelector('[data-field="bodyHtml"]').innerHTML.trim()
  })).filter((item) => item.title || item.image || item.bodyHtml || item.button);
}

function collectEntryPages() {
  data.entryPages = data.entryPages || {};
  Array.from(entryEditor.querySelectorAll(".entry-row")).forEach((row) => {
    const id = row.dataset.entryId;
    data.entryPages[id] = {
      title: row.querySelector('[data-field="title"]').value.trim(),
      subtitle: row.querySelector('[data-field="subtitle"]').value.trim(),
      image: row.querySelector('[data-field="image"]').value.trim(),
      button: row.querySelector('[data-field="button"]').value.trim(),
      body: row.querySelector('[data-field="body"]').value.trim()
    };
    const shortcut = data.shortcuts.find((item, index) => shortcutId(item, index) === id);
    if (shortcut) shortcut.href = row.querySelector('[data-field="href"]').value.trim();
  });
}

function collectStoreEditor(target) {
  return Array.from(target.querySelectorAll(".store-row")).map((row, index) => ({
    rank: row.querySelector('[data-field="rank"]').value.trim(),
    category: row.querySelector('[data-field="category"]').value.trim(),
    status: row.querySelector('[data-field="status"]').value,
    year: row.querySelector('[data-field="year"]').value.trim(),
    code: row.querySelector('[data-field="code"]').value.trim() || String(index + 1),
    price: row.querySelector('[data-field="price"]').value.trim() || "\u54a8\u8be2\u62a5\u4ef7"
  }));
}

function collectStores() {
  data.stores = collectStoreEditor(storeEditor);
  data.pddStores = collectStoreEditor(pddStoreEditor);
}

function collectSystemSettings() {
  data.systemSettings = {
    consultPhone: consultPhoneInput.value.trim() || "13800138000",
    consultTitle: consultTitleInput.value.trim() || "\u7535\u8bdd\u54a8\u8be2",
    consultText: consultTextInput.value.trim() || "\u70b9\u51fb\u8054\u7cfb\u670d\u52a1\u987e\u95ee",
    consultStoreText: consultStoreTextInput.value.trim() || "\u54a8\u8be2\u8be5\u5e97",
    consultPrimaryText: consultPrimaryTextInput.value.trim() || "\u7acb\u5373\u54a8\u8be2"
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeBannerImage(file, options = {}) {
  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxWidth = options.maxWidth || 1200;
      const maxHeight = options.maxHeight || 360;
      const quality = options.quality || 0.86;
      const ratio = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readFileAsDataUrl(file).then(resolve);
    };
    image.src = objectUrl;
  });
}

function insertHtmlAtCursor(html) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const template = document.createElement("template");
  template.innerHTML = html;
  const fragment = template.content;
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

homeContentEditor.addEventListener("paste", (event) => {
  const editor = event.target.closest(".rich-editor");
  if (!editor) return;
  const imageItem = Array.from(event.clipboardData?.items || []).find((item) => item.type.startsWith("image/"));
  if (!imageItem) return;
  event.preventDefault();
  const file = imageItem.getAsFile();
  if (!file) return;
  resizeBannerImage(file, { maxWidth: 1400, maxHeight: 2200, quality: 0.96 }).then((image) => {
    editor.focus();
    insertHtmlAtCursor(`<img src="${image}" alt="">`);
    showToast("\u56fe\u7247\u5df2\u7c98\u8d34\u5230\u5185\u5bb9\u6846");
  });
});

document.querySelector("#bannerUpload").addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const readers = files.map((file) => resizeBannerImage(file).then((image) => ({
      image,
      title: file.name.replace(/\.[^.]+$/, ""),
      href: "#"
    })));

  Promise.all(readers).then((items) => {
    collectBanners();
    data.homeBanners.push(...items);
    renderBanners();
    markDirty();
    event.target.value = "";
    showToast("\u56fe\u7247\u5df2\u4e0a\u4f20\uff0c\u5df2\u5728\u4e0b\u65b9\u663e\u793a\u9884\u89c8");
  }).catch(() => showToast("\u56fe\u7247\u8bfb\u53d6\u5931\u8d25\uff0c\u8bf7\u6362\u4e00\u5f20\u56fe"));
});

document.querySelector("#saveBanners").addEventListener("click", () => {
  collectBanners();
  try {
    window.siteDataStore.save(data);
    markSaved("\u9996\u9875\u56fe\u7247\u5df2\u4fdd\u5b58");
  } catch (error) {
    showToast("\u56fe\u7247\u592a\u5927\uff0c\u8bf7\u6362\u5c0f\u4e00\u70b9\u7684\u56fe");
  }
});

document.querySelector("#exportBanners").addEventListener("click", () => {
  collectBanners();
  if (!data.homeBanners.length) {
    showToast("\u8fd8\u6ca1\u6709\u56fe\u7247\u53ef\u5907\u4efd");
    return;
  }
  downloadText("home-banners-backup.json", JSON.stringify({ homeBanners: data.homeBanners, homeBannerHeight: data.homeBannerHeight }, null, 2));
  showToast("\u56fe\u7247\u5907\u4efd\u5df2\u4e0b\u8f7d");
});

document.querySelector("#bannerBackupInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);
      if (!Array.isArray(backup.homeBanners)) throw new Error("bad backup");
      data.homeBanners = backup.homeBanners;
      data.homeBannerHeight = Number(backup.homeBannerHeight) || data.homeBannerHeight || 128;
      renderBanners();
      window.siteDataStore.save(data);
      markSaved("\u56fe\u7247\u5907\u4efd\u5df2\u5bfc\u5165");
    } catch (error) {
      showToast("\u5907\u4efd\u6587\u4ef6\u4e0d\u5bf9\uff0c\u8bf7\u9009\u62e9\u4e4b\u524d\u4e0b\u8f7d\u7684\u56fe\u7247\u5907\u4efd");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
});

bannerEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-banner]");
  if (!button) return;
  collectBanners();
  data.homeBanners.splice(Number(button.dataset.deleteBanner), 1);
  renderBanners();
  markDirty();
});

document.querySelector("#saveShortcuts").addEventListener("click", () => {
  collectShortcuts();
  renderEntryPages();
  window.siteDataStore.save(data);
  markSaved("\u5165\u53e3\u5df2\u4fdd\u5b58");
});

document.querySelector("#addHomeContent").addEventListener("click", () => {
  collectHomeContents();
  data.homeContents.unshift({
    title: "\u65b0\u589e\u5185\u5bb9\u6807\u9898",
    body: "\u8fd9\u91cc\u586b\u5199\u9996\u9875\u5c55\u793a\u7684\u5185\u5bb9\u3002",
    image: "",
    button: "\u67e5\u770b\u8be6\u60c5",
    href: "#"
  });
  renderHomeContents();
  markDirty();
});

document.querySelector("#saveHomeContents").addEventListener("click", () => {
  collectHomeContents();
  window.siteDataStore.save(data);
  markSaved("\u9996\u9875\u5185\u5bb9\u5df2\u4fdd\u5b58");
});

homeContentEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-content]");
  if (!button) return;
  collectHomeContents();
  data.homeContents.splice(Number(button.dataset.deleteContent), 1);
  renderHomeContents();
  markDirty();
});

document.querySelector("#saveEntryPages").addEventListener("click", () => {
  collectShortcuts();
  collectEntryPages();
  window.siteDataStore.save(data);
  markSaved("\u5185\u5bb9\u9875\u5df2\u4fdd\u5b58");
});

document.querySelector("#saveStores").addEventListener("click", () => {
  collectEntryPages();
  collectStores();
  window.siteDataStore.save(data);
  markSaved("\u5e97\u94fa\u5df2\u4fdd\u5b58");
});

document.querySelector("#savePddStores").addEventListener("click", () => {
  collectEntryPages();
  collectStores();
  window.siteDataStore.save(data);
  markSaved("\u591a\u591a\u5e97\u5df2\u4fdd\u5b58");
});

document.querySelector("#saveSystemSettings").addEventListener("click", () => {
  collectSystemSettings();
  window.siteDataStore.save(data);
  markSaved("\u54a8\u8be2\u8bbe\u7f6e\u5df2\u4fdd\u5b58");
});

document.querySelector("#addStore").addEventListener("click", () => {
  collectStores();
  data.stores.unshift({
    rank: "1\u94bb",
    category: "\u5bb6\u5c45\u65e5\u7528",
    status: "\u65e0\u552e\u5047",
    year: "2026\u5e74",
    code: String(Date.now()).slice(-4),
    price: "\u54a8\u8be2\u62a5\u4ef7"
  });
  renderStores();
  markDirty();
});

document.querySelector("#addPddStore").addEventListener("click", () => {
  collectStores();
  data.pddStores.unshift({
    rank: "1\u94bb",
    category: "\u767e\u8d27\u65e5\u7528",
    status: "\u65e0\u552e\u5047",
    year: "2026\u5e74",
    code: `P${String(Date.now()).slice(-4)}`,
    price: "\u54a8\u8be2\u62a5\u4ef7"
  });
  renderStores();
  markDirty();
});

storeEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  collectStores();
  data.stores.splice(Number(button.dataset.delete), 1);
  renderStores();
  markDirty();
});

pddStoreEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  collectStores();
  data.pddStores.splice(Number(button.dataset.delete), 1);
  renderStores();
  markDirty();
});

document.querySelector("#exportData").addEventListener("click", () => {
  collectBanners();
  collectShortcuts();
  collectHomeContents();
  collectEntryPages();
  collectStores();
  collectSystemSettings();
  dataBox.value = JSON.stringify(data, null, 2);
  showToast("\u6570\u636e\u5df2\u5bfc\u51fa");
});

document.querySelector("#resetData").addEventListener("click", () => {
  showConfirm("\u786e\u5b9a\u6062\u590d\u9ed8\u8ba4\u6570\u636e\uff1f\u5f53\u524d\u540e\u53f0\u586b\u5199\u7684\u5185\u5bb9\u4f1a\u88ab\u9ed8\u8ba4\u5185\u5bb9\u8986\u76d6\u3002", () => {
    window.siteDataStore.reset();
    data = window.siteDataStore.load();
    renderBanners();
    renderShortcuts();
    renderHomeContents();
    renderEntryPages();
    renderStores();
    renderSystemSettings();
    markSaved("\u5df2\u6062\u590d\u9ed8\u8ba4");
  });
});

document.querySelector("#saveAdminPassword").addEventListener("click", () => {
  const user = adminUserInput.value.trim() || "admin";
  const pass = adminPassInput.value;
  const confirmPass = adminPassConfirmInput.value;

  if (pass.length < 6) {
    showToast("\u65b0\u5bc6\u7801\u81f3\u5c11 6 \u4f4d");
    return;
  }

  if (pass !== confirmPass) {
    showToast("\u4e24\u6b21\u5bc6\u7801\u4e0d\u4e00\u81f4");
    return;
  }

  fetch("/api/admin-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, pass })
  }).then((response) => {
    if (!response.ok) throw new Error("save failed");
    adminPassInput.value = "";
    adminPassConfirmInput.value = "";
    markSaved("\u540e\u53f0\u5bc6\u7801\u5df2\u4fee\u6539");
  }).catch(() => {
    showToast("\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u786e\u8ba4\u662f\u7528 start-website.bat \u542f\u52a8");
  });
});

document.addEventListener("input", (event) => {
  if (event.target.closest(".admin-layout")) markDirty();
});

document.addEventListener("change", (event) => {
  if (event.target.closest(".admin-layout")) markDirty();
});

window.addEventListener("beforeunload", (event) => {
  if (!isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

sidebarToggle.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 900px)").matches) {
    document.body.classList.toggle("sidebar-open");
    return;
  }
  document.body.classList.toggle("sidebar-collapsed");
});

document.querySelectorAll(".sidebar-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      document.body.classList.remove("sidebar-open");
    }
  });
});

refreshAdmin.addEventListener("click", () => {
  if (isDirty) {
    showConfirm("\u5f53\u524d\u6709\u672a\u4fdd\u5b58\u7684\u5185\u5bb9\uff0c\u786e\u5b9a\u5237\u65b0\u9875\u9762\u5417\uff1f", () => window.location.reload());
    return;
  }
  window.location.reload();
});

if (refreshUsers) {
  refreshUsers.addEventListener("click", loadUsers);
}

confirmCancel.addEventListener("click", hideConfirm);
confirmMask.addEventListener("click", (event) => {
  if (event.target === confirmMask) hideConfirm();
});
confirmOk.addEventListener("click", () => {
  const action = pendingConfirm;
  hideConfirm();
  if (action) action();
});

window.addEventListener("scroll", () => {
  setActiveNav();
  backTop.classList.toggle("show", window.scrollY > 420);
});

backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

renderBanners();
renderShortcuts();
renderHomeContents();
renderEntryPages();
renderStores();
renderSystemSettings();
loadUsers();
updateDashboardStats();
setActiveNav();
