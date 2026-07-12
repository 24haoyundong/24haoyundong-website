$ErrorActionPreference = "Stop"

$ProjectDir = "C:\Users\ASUS\Documents\Codex\24haods-site"
$FrontendDir = Join-Path $ProjectDir "frontend"
$AssetsDir = Join-Path $FrontendDir "assets"
$AppJsPath = Join-Path $AssetsDir "app.js"

if (-not (Test-Path $FrontendDir)) {
  throw "Project frontend folder not found: $FrontendDir"
}

$loginHtml = @'
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>用户登录 - 24号电商</title>
    <link rel="stylesheet" href="./assets/app.css">
  </head>
  <body data-page="user-login">
    <main class="phone-page auth-page">
      <header class="page-title">
        <a href="./index.html" aria-label="返回首页">‹</a>
        <strong>用户登录</strong>
        <span></span>
      </header>

      <section class="auth-card">
        <div class="auth-brand">
          <strong>24号电商</strong>
          <span>登录后查看店铺资源和个人服务</span>
        </div>

        <form class="auth-form" id="userLoginForm">
          <label>
            <span>邮箱</span>
            <input id="userEmail" type="email" autocomplete="username" placeholder="请输入邮箱" required>
          </label>
          <label>
            <span>密码</span>
            <input id="userPassword" type="password" autocomplete="current-password" placeholder="请输入密码" required>
          </label>
          <p class="auth-error" id="userLoginError" hidden></p>
          <button type="submit">登录</button>
        </form>

        <p class="auth-tip">还没有账号？<a id="registerLink" href="./register.html">立即注册</a></p>
      </section>
    </main>
    <script src="./assets/app.js"></script>
  </body>
</html>
'@

$registerHtml = @'
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>用户注册 - 24号电商</title>
    <link rel="stylesheet" href="./assets/app.css">
  </head>
  <body data-page="user-register">
    <main class="phone-page auth-page">
      <header class="page-title">
        <a href="./login.html" aria-label="返回登录">‹</a>
        <strong>用户注册</strong>
        <span></span>
      </header>

      <section class="auth-card">
        <div class="auth-brand">
          <strong>创建账号</strong>
          <span>注册后可以查看店铺资源和个人服务</span>
        </div>

        <form class="auth-form" id="userRegisterForm">
          <label>
            <span>邮箱</span>
            <input id="registerEmail" type="email" autocomplete="username" placeholder="请输入邮箱" required>
          </label>
          <label>
            <span>密码</span>
            <input id="registerPassword" type="password" autocomplete="new-password" placeholder="至少 8 位密码" required minlength="8">
          </label>
          <label>
            <span>确认密码</span>
            <input id="registerPasswordConfirm" type="password" autocomplete="new-password" placeholder="请再次输入密码" required minlength="8">
          </label>
          <p class="auth-error" id="userRegisterError" hidden></p>
          <button type="submit">注册并登录</button>
        </form>

        <p class="auth-tip">已有账号？<a id="loginLink" href="./login.html">返回登录</a></p>
      </section>
    </main>
    <script src="./assets/app.js"></script>
  </body>
</html>
'@

$myHtml = @'
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>我的 - 24号电商</title>
    <link rel="stylesheet" href="./assets/app.css">
  </head>
  <body data-page="my">
    <main class="phone-page">
      <header class="page-title">
        <a href="./index.html" aria-label="返回首页">‹</a>
        <strong>我的</strong>
        <span></span>
      </header>

      <section class="content-card profile-card">
        <h1 id="userName">我的服务</h1>
        <p id="userEmailText">已登录用户</p>
      </section>

      <section class="list-card">
        <a href="#" data-consult>
          <strong>电话咨询</strong>
          <span id="phoneText">点击联系服务顾问</span>
        </a>
        <a href="./buy-store.html">
          <strong>我要买店</strong>
          <span>查看店铺资源</span>
        </a>
        <a href="./index.html">
          <strong>返回首页</strong>
          <span>查看全部服务</span>
        </a>
        <button class="logout-button" id="userLogoutBtn" type="button">退出登录</button>
      </section>

      <nav class="bottom-nav">
        <a href="./index.html">首页</a>
        <a href="./buy-store.html">买店</a>
        <a href="#" data-consult>咨询</a>
        <a class="active" href="./my.html">我的</a>
      </nav>
    </main>
    <script src="./assets/app.js"></script>
  </body>
</html>
'@

$userAuthBlock = @'
  function getUserAuth() {
    try {
      return JSON.parse(localStorage.getItem(USER_AUTH_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function redirectTarget(defaultPage = "my.html") {
    const target = new URLSearchParams(window.location.search).get("redirect") || defaultPage;
    return target.startsWith("http") ? defaultPage : target;
  }

  function saveUserAuth(data, fallbackEmail) {
    const user = data.record || {};
    localStorage.setItem(USER_AUTH_KEY, JSON.stringify({
      token: data.token,
      id: user.id || "",
      email: user.email || fallbackEmail || "",
      name: user.name || user.username || user.email || fallbackEmail || "用户",
      loginAt: Date.now(),
    }));
  }

  function userLoginUrl() {
    const redirect = `${window.location.pathname.split("/").pop() || "index.html"}${window.location.search || ""}`;
    return `./login.html?redirect=${encodeURIComponent(redirect)}`;
  }

  function requireUserLogin() {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      window.location.replace(userLoginUrl());
      return null;
    }
    return auth;
  }

  function initUserPage() {
    const auth = requireUserLogin();
    if (!auth) return;

    const nameEl = document.getElementById("userName");
    if (nameEl) nameEl.textContent = auth.name || "我的服务";

    const emailEl = document.getElementById("userEmailText");
    if (emailEl) emailEl.textContent = auth.email || "已登录用户";

    const logoutBtn = document.getElementById("userLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(USER_AUTH_KEY);
        window.location.href = "./login.html";
      });
    }
  }

  async function userLogin(email, password) {
    const res = await fetch(`${API_BASE}/api/collections/users/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  function initUserLoginPage() {
    const form = document.getElementById("userLoginForm");
    if (!form) return;

    const auth = getUserAuth();
    if (auth?.token) {
      window.location.replace(`./${redirectTarget()}`);
      return;
    }

    const registerLink = document.getElementById("registerLink");
    if (registerLink) {
      registerLink.href = `./register.html?redirect=${encodeURIComponent(redirectTarget())}`;
    }

    const emailInput = document.getElementById("userEmail");
    const passwordInput = document.getElementById("userPassword");
    const errorEl = document.getElementById("userLoginError");

    function showError(message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorEl.hidden = true;

      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "登录中...";

      try {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const data = await userLogin(email, password);

        if (!data?.token) {
          showError("账号或密码错误，请重新输入。");
          return;
        }

        saveUserAuth(data, email);
        window.location.href = `./${redirectTarget()}`;
      } catch (error) {
        showError("登录失败，请确认网络和服务已启动。");
      } finally {
        button.disabled = false;
        button.textContent = "登录";
      }
    });
  }

  function initUserRegisterPage() {
    const form = document.getElementById("userRegisterForm");
    if (!form) return;

    const auth = getUserAuth();
    if (auth?.token) {
      window.location.replace(`./${redirectTarget()}`);
      return;
    }

    const loginLink = document.getElementById("loginLink");
    if (loginLink) {
      loginLink.href = `./login.html?redirect=${encodeURIComponent(redirectTarget())}`;
    }

    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const passwordConfirmInput = document.getElementById("registerPasswordConfirm");
    const errorEl = document.getElementById("userRegisterError");

    function showError(message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorEl.hidden = true;

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const passwordConfirm = passwordConfirmInput.value;

      if (password.length < 8) {
        showError("密码至少需要 8 位。");
        return;
      }

      if (password !== passwordConfirm) {
        showError("两次输入的密码不一致。");
        return;
      }

      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "注册中...";

      try {
        const createRes = await fetch(`${API_BASE}/api/collections/users/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            passwordConfirm,
          }),
        });

        if (!createRes.ok) {
          showError("注册失败，可能邮箱已被使用。");
          return;
        }

        const data = await userLogin(email, password);
        if (!data?.token) {
          window.location.href = `./login.html?redirect=${encodeURIComponent(redirectTarget())}`;
          return;
        }

        saveUserAuth(data, email);
        window.location.href = `./${redirectTarget()}`;
      } catch (error) {
        showError("注册失败，请确认网络和服务已启动。");
      } finally {
        button.disabled = false;
        button.textContent = "注册并登录";
      }
    });
  }
'@

$fallbackBlock = @'
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
    { title: "我要卖店", icon_text: "卖", icon_color: "red", link_url: "./service-page.html?key=sell", sort: 20, is_active: true },
    { title: "代入驻", icon_text: "入", icon_color: "blue", link_url: "./service-page.html?key=ruzhu", sort: 30, is_active: true },
    { title: "网店评估", icon_text: "评", icon_color: "pink", link_url: "./service-page.html?key=evaluate", sort: 40, is_active: true },
    { title: "商标转让", icon_text: "标", icon_color: "purple", link_url: "./service-page.html?key=trademark", sort: 50, is_active: true },
    { title: "违规申诉", icon_text: "申", icon_color: "green", link_url: "./service-page.html?key=appeal", sort: 60, is_active: true },
    { title: "电商服务", icon_text: "服", icon_color: "red", link_url: "./service-page.html?key=service", sort: 70, is_active: true },
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
'@

Set-Content -LiteralPath (Join-Path $FrontendDir "login.html") -Value $loginHtml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $FrontendDir "register.html") -Value $registerHtml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $FrontendDir "my.html") -Value $myHtml -Encoding UTF8

$js = Get-Content -LiteralPath $AppJsPath -Raw

$js = [regex]::Replace(
  $js,
  '(?s)  const fallbackSettings = \{.*?  \];\s*',
  $fallbackBlock + "`r`n",
  1
)

$js = [regex]::Replace(
  $js,
  '(?s)  function getUserAuth\(\) \{.*?  function firstImageFromHtml\(html\) \{',
  $userAuthBlock + "`r`n  function firstImageFromHtml(html) {",
  1
)

$js = $js -replace 'if \(page === "user-login"\) \{\s*initUserLoginPage\(\);\s*return;\s*\}', @'
if (page === "user-login") {
      initUserLoginPage();
      return;
    }

    if (page === "user-register") {
      initUserRegisterPage();
      return;
    }
'@

$js = [regex]::Replace(
  $js,
  '(?s)  function menuLinkFor\(item\) \{.*?  async function loadSettings\(\) \{',
@'
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
      ["我的", "./my.html"],
    ];
    const found = map.find(([name]) => title.includes(name));
    return found ? found[1] : "#";
  }

  async function loadSettings() {
'@,
  1
)

Set-Content -LiteralPath $AppJsPath -Value $js -Encoding UTF8

$cssPath = Join-Path $AssetsDir "app.css"
$css = Get-Content -LiteralPath $cssPath -Raw
if ($css -notmatch "\.auth-card") {
  Add-Content -LiteralPath $cssPath -Encoding UTF8 -Value @'

.auth-page {
  display: flex;
  flex-direction: column;
}

.auth-card {
  margin-top: 18px;
  padding: 22px 18px;
  border-radius: 18px;
  background: #fff;
}

.auth-brand {
  margin-bottom: 22px;
  text-align: center;
}

.auth-brand strong,
.auth-brand span {
  display: block;
}

.auth-brand strong {
  font-size: 24px;
}

.auth-brand span,
.auth-tip {
  margin-top: 8px;
  color: var(--muted);
  font-size: 13px;
}

.auth-form {
  display: grid;
  gap: 14px;
}

.auth-form label {
  display: grid;
  gap: 8px;
}

.auth-form label span {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.auth-form input {
  height: 44px;
  width: 100%;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--text);
  background: #fff;
  font: inherit;
  outline: 0;
}

.auth-form input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 79, 31, .12);
}

.auth-form button {
  width: 100%;
  min-height: 44px;
  margin-top: 4px;
}

.auth-form button:disabled {
  opacity: .65;
}

.auth-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  color: #dc2626;
  background: #fef2f2;
  font-size: 13px;
}

.auth-tip {
  margin: 16px 0 0;
  text-align: center;
}

.auth-tip a {
  color: var(--primary);
  font-weight: 800;
}

.logout-button {
  width: calc(100% - 28px);
  min-height: 44px;
  margin: 14px;
  color: var(--primary);
  background: var(--soft);
}
'@
}

Write-Host "Done. User login/register stage 1 has been applied." -ForegroundColor Green
Write-Host "Open: http://127.0.0.1:8081/register.html"
Write-Host "Open: http://127.0.0.1:8081/login.html"
