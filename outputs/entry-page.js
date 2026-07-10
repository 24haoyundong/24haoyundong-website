const data = window.siteDataStore.load();
const params = new URLSearchParams(location.search);
const id = params.get("id") || "taobao";
const shortcut = (data.shortcuts || []).find((item, index) => (item.id || `entry-${index}`) === id) || data.shortcuts[0];
const page = (data.entryPages && data.entryPages[id]) || {};

const title = page.title || shortcut.label;
const subtitle = page.subtitle || "\u4e13\u5c5e\u7535\u5546\u670d\u52a1\u8bf4\u660e";
const body = page.body || "\u8fd9\u91cc\u662f\u670d\u52a1\u8be6\u60c5\u4ecb\u7ecd\uff0c\u60a8\u53ef\u4ee5\u67e5\u770b\u670d\u52a1\u5185\u5bb9\u3001\u9002\u7528\u8303\u56f4\u548c\u54a8\u8be2\u65b9\u5f0f\u3002";
const target = normalizeHref(shortcut.href || "#");

document.title = title;
document.querySelector("#entryNavTitle").textContent = shortcut.label;
document.querySelector("#entryIcon").textContent = shortcut.icon;
document.querySelector("#entryIcon").className = `entry-icon ${shortcut.color}`;
document.querySelector("#entryTitle").textContent = title;
document.querySelector("#entrySubtitle").textContent = subtitle;
document.querySelector("#entryBody").textContent = body;
document.querySelector("#entryButton").textContent = page.button || "\u67e5\u770b\u8be6\u60c5";
document.querySelector("#entryButton").href = target;

if (page.image) {
  document.querySelector("#entryImage").src = page.image;
} else {
  document.querySelector("#entryImageWrap").style.display = "none";
}

function normalizeHref(href) {
  return href.startsWith("#./") ? href.slice(1) : href;
}
