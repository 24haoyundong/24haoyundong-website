const loginTitle = document.querySelector("#loginTitle");
const loginDesc = document.querySelector("#loginDesc");
const loginTab = document.querySelector("#loginTab");
const registerTab = document.querySelector("#registerTab");
const nicknameInput = document.querySelector("#nicknameInput");
const accountInput = document.querySelector("#accountInput");
const passwordInput = document.querySelector("#passwordInput");
const confirmPasswordInput = document.querySelector("#confirmPasswordInput");
const submitBtn = document.querySelector("#submitBtn");
const message = document.querySelector("#loginMessage");
const registerOnlyFields = Array.from(document.querySelectorAll(".register-only"));

let mode = "login";

const text = {
  loginTitle: "\u7528\u6237\u767b\u5f55",
  registerTitle: "\u7528\u6237\u6ce8\u518c",
  loginDesc: "\u767b\u5f55\u540e\u53ef\u67e5\u770b\u4e2a\u4eba\u670d\u52a1\u4e0e\u54a8\u8be2\u8bb0\u5f55\u3002",
  registerDesc: "\u6ce8\u518c\u540e\u53ef\u4f7f\u7528\u4e2a\u4eba\u670d\u52a1\u5165\u53e3\u3002",
  login: "\u767b\u5f55",
  register: "\u6ce8\u518c",
  required: "\u8bf7\u586b\u5199\u8d26\u53f7\u548c\u5bc6\u7801",
  shortPassword: "\u5bc6\u7801\u81f3\u5c11 6 \u4f4d",
  mismatch: "\u4e24\u6b21\u5bc6\u7801\u4e0d\u4e00\u81f4",
  loading: "\u5904\u7406\u4e2d...",
  network: "\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5"
};

function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === "register";
  loginTitle.textContent = isRegister ? text.registerTitle : text.loginTitle;
  loginDesc.textContent = isRegister ? text.registerDesc : text.loginDesc;
  submitBtn.textContent = isRegister ? text.register : text.login;
  loginTab.classList.toggle("active", !isRegister);
  registerTab.classList.toggle("active", isRegister);
  registerOnlyFields.forEach((item) => {
    item.hidden = !isRegister;
  });
  passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
  setMessage("");
}

function setMessage(value, isError = false) {
  message.textContent = value;
  message.className = `login-message${isError ? " error" : ""}`;
}

function saveLogin(result) {
  localStorage.setItem("userToken", result.token);
  localStorage.setItem("userInfo", JSON.stringify(result.user));
  location.href = "./my.html";
}

async function submit() {
  const account = accountInput.value.trim();
  const password = passwordInput.value;
  const nickname = nicknameInput.value.trim() || account;

  if (!account || !password) {
    setMessage(text.required, true);
    return;
  }
  if (password.length < 6) {
    setMessage(text.shortPassword, true);
    return;
  }
  if (mode === "register" && password !== confirmPasswordInput.value) {
    setMessage(text.mismatch, true);
    return;
  }

  const endpoint = mode === "register" ? "/api/user-register" : "/api/user-login";
  submitBtn.disabled = true;
  setMessage(text.loading);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password, nickname })
    });
    const result = await response.json().catch(() => ({ ok: false }));
    if (!response.ok || !result.ok) {
      setMessage(result.message || (mode === "register" ? "\u6ce8\u518c\u5931\u8d25" : "\u767b\u5f55\u5931\u8d25"), true);
      return;
    }
    saveLogin(result);
  } catch (error) {
    setMessage(text.network, true);
  } finally {
    submitBtn.disabled = false;
  }
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
submitBtn.addEventListener("click", submit);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submit();
});

setMode("login");
