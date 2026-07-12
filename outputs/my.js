const data = window.siteDataStore.load();
const settings = data.systemSettings || {};
const phone = settings.consultPhone || "13800138000";
const token = localStorage.getItem("userToken");
const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

document.querySelector("#consultLink").href = `tel:${phone}`;
document.querySelector("#consultTitle").textContent = settings.consultTitle || "电话咨询";
document.querySelector("#consultText").textContent = settings.consultText || "点击联系服务顾问";

const loginLink = document.querySelector("#loginLink");
const logoutBtn = document.querySelector("#logoutBtn");
const userName = document.querySelector("#userName");
const userDesc = document.querySelector("#userDesc");
const userAvatar = document.querySelector("#userAvatar");

function renderUser(user) {
  if (!user) return;
  loginLink.hidden = true;
  logoutBtn.hidden = false;
  userName.textContent = user.nickname || user.account || "我的";
  userDesc.textContent = "已登录，欢迎回来";
  userAvatar.textContent = (user.nickname || user.account || "我").slice(0, 1).toUpperCase();
}

if (token && userInfo) {
  renderUser(userInfo);
  fetch("/api/user-me", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((result) => {
      if (result.ok) {
        localStorage.setItem("userInfo", JSON.stringify(result.user));
        renderUser(result.user);
      }
    })
    .catch(() => {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
    });
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userInfo");
  location.reload();
});
