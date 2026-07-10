const data = window.siteDataStore.load();
const settings = data.systemSettings || {};
const phone = settings.consultPhone || "13800138000";

document.querySelector("#consultLink").href = `tel:${phone}`;
document.querySelector("#consultTitle").textContent = settings.consultTitle || "电话咨询";
document.querySelector("#consultText").textContent = settings.consultText || "点击联系服务顾问";
