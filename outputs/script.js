const siteData = window.siteDataStore.load();
const shortcuts = siteData.shortcuts;

const searchInput = document.querySelector("#searchInput");
const shortcutGrid = document.querySelector("#shortcutGrid");
const homeContentList = document.querySelector("#homeContentList");
const heroScroller = document.querySelector("#heroScroller");
const heroPrev = document.querySelector("#heroPrev");
const heroNext = document.querySelector("#heroNext");
const heroDots = document.querySelector("#heroDots");
const homeBanners = siteData.homeBanners || [];
let heroTimer = null;
let heroResumeTimer = null;
let heroIndex = 0;
let heroMoved = false;

function applyHeroHeight() {
  const height = Number(siteData.homeBannerHeight) || 128;
  const safeHeight = Math.min(320, Math.max(80, height));
  document.documentElement.style.setProperty("--hero-height", `${safeHeight}px`);
}

function renderHeroBanners() {
  if (homeBanners.length) {
    heroScroller.innerHTML = homeBanners.map((item) => `
      <a class="hero-slide" href="${item.href || "#"}" draggable="false">
        <img src="${item.image}" alt="${item.title || "\u9996\u9875\u56fe\u7247"}" draggable="false">
      </a>
    `).join("");
  } else {
    heroScroller.innerHTML = `
      <div class="hero-slide hero-fallback">
        <div class="speed-lines"></div>
        <div class="speech-card">
          <span class="pin"></span>
          <h1>&#30005;&#21830;&#36164;&#28304;&#25972;&#21512;</h1>
          <p>&#25163;&#28120;&#31614; &middot; &#21512;&#20316;&#36164;&#28304; &middot; &#23454;&#25112;&#25216;&#26415;</p>
          <span class="spark spark-a"></span>
          <span class="spark spark-b"></span>
        </div>
        <button class="hero-badge" type="button">&#21512;&#20316;</button>
      </div>
    `;
  }

  renderHeroControls();
  setupHeroDrag();
  startHeroAutoScroll();
}

function getHeroSlides() {
  return Array.from(heroScroller.querySelectorAll(".hero-slide"));
}

function renderHeroControls() {
  const slides = getHeroSlides();
  const showControls = slides.length > 1;
  heroPrev.hidden = !showControls;
  heroNext.hidden = !showControls;
  heroDots.hidden = !showControls;
  heroDots.innerHTML = showControls
    ? slides.map((_, index) => `<button class="${index === heroIndex ? "active" : ""}" type="button" data-hero-dot="${index}" aria-label="\u7b2c${index + 1}\u5f20"></button>`).join("")
    : "";
}

function updateHeroDots() {
  heroDots.querySelectorAll("button").forEach((button, index) => {
    button.classList.toggle("active", index === heroIndex);
  });
}

function goHeroSlide(index, behavior = "smooth") {
  const slides = getHeroSlides();
  if (!slides.length) return;
  heroIndex = (index + slides.length) % slides.length;
  heroScroller.scrollTo({ left: slides[heroIndex].offsetLeft, behavior });
  updateHeroDots();
}

function startHeroAutoScroll() {
  if (getHeroSlides().length <= 1) return;
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goHeroSlide(heroIndex + 1), 3000);
}

function pauseHeroAutoScroll() {
  clearInterval(heroTimer);
  clearTimeout(heroResumeTimer);
  heroResumeTimer = setTimeout(startHeroAutoScroll, 5000);
}

function syncHeroIndex() {
  const slides = getHeroSlides();
  if (!slides.length) return;
  const currentLeft = heroScroller.scrollLeft;
  heroIndex = slides.reduce((bestIndex, slide, index) => {
    const bestDistance = Math.abs(slides[bestIndex].offsetLeft - currentLeft);
    const distance = Math.abs(slide.offsetLeft - currentLeft);
    return distance < bestDistance ? index : bestIndex;
  }, 0);
  updateHeroDots();
}

function setupHeroDrag() {
  if (heroScroller.dataset.dragReady === "true") return;
  heroScroller.dataset.dragReady = "true";
  let isDown = false;
  let startX = 0;
  let startLeft = 0;

  function startDrag(clientX) {
    isDown = true;
    heroMoved = false;
    startX = clientX;
    startLeft = heroScroller.scrollLeft;
    heroScroller.classList.add("dragging");
    pauseHeroAutoScroll();
  }

  function moveDrag(clientX) {
    if (!isDown) return;
    const delta = clientX - startX;
    if (Math.abs(delta) > 5) heroMoved = true;
    heroScroller.scrollLeft = startLeft - delta;
  }

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    heroScroller.classList.remove("dragging");
    syncHeroIndex();
    goHeroSlide(heroIndex);
  }

  heroScroller.addEventListener("pointerdown", (event) => {
    startDrag(event.clientX);
    if (heroScroller.setPointerCapture) heroScroller.setPointerCapture(event.pointerId);
  });
  heroScroller.addEventListener("pointermove", (event) => moveDrag(event.clientX));
  heroScroller.addEventListener("pointerup", (event) => {
    if (heroScroller.releasePointerCapture) heroScroller.releasePointerCapture(event.pointerId);
    endDrag();
  });
  heroScroller.addEventListener("pointercancel", endDrag);
  heroScroller.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    startDrag(event.clientX);
    event.preventDefault();
  });
  document.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    moveDrag(event.clientX);
    event.preventDefault();
  });
  document.addEventListener("mouseup", endDrag);
  heroScroller.addEventListener("dragstart", (event) => event.preventDefault());
  heroScroller.addEventListener("click", (event) => {
    if (!heroMoved) return;
    event.preventDefault();
    heroMoved = false;
  }, true);
}

heroPrev.addEventListener("click", () => {
  pauseHeroAutoScroll();
  goHeroSlide(heroIndex - 1);
});

heroNext.addEventListener("click", () => {
  pauseHeroAutoScroll();
  goHeroSlide(heroIndex + 1);
});

heroDots.addEventListener("click", (event) => {
  const button = event.target.closest("[data-hero-dot]");
  if (!button) return;
  pauseHeroAutoScroll();
  goHeroSlide(Number(button.dataset.heroDot));
});

function renderShortcuts() {
  shortcutGrid.innerHTML = shortcuts.map((item, index) => `
    <a class="shortcut shortcut-link ${item.color}" href="./entry-page.html?id=${encodeURIComponent(getShortcutId(item, index))}">
      <b>${item.icon}</b>
      <span>${item.label}</span>
    </a>
  `).join("");
}

function renderHomeContents() {
  const contents = siteData.homeContents || [];
  homeContentList.innerHTML = contents.map((item) => {
    const image = item.image ? `<img src="${item.image}" alt="${item.title || ""}">` : "";
    const body = item.bodyHtml ? `<div class="home-content-body">${item.bodyHtml}</div>` : (item.body ? `<p>${item.body.replace(/\n/g, "<br>")}</p>` : "");
    const button = item.button ? `<a href="${item.href || "#"}">${item.button}</a>` : "";
    const title = item.title ? `<h2>${item.title}</h2>` : "";
    return `
      <article class="home-content-card">
        ${image}
        <div class="home-content-inner">
          ${title}
          ${body}
          ${button}
        </div>
      </article>
    `;
  }).join("");
}

const sharePosterBtn = document.querySelector("#sharePosterBtn");
const sharePosterModal = document.querySelector("#sharePosterModal");
const sharePosterClose = document.querySelector("#sharePosterClose");
const sharePosterBody = document.querySelector("#sharePosterBody");
const sharePosterDownload = document.querySelector("#sharePosterDownload");
const sharePosterCopy = document.querySelector("#sharePosterCopy");
const sharePosterTip = document.querySelector("#sharePosterTip");
let sharePosterImageUrl = "";

function getShareUrl() {
  return new URL("./index.html", location.href).href;
}

function loadPosterImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(src)) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = Array.from(text);
  let line = "";
  let lines = 0;
  for (let index = 0; index < words.length; index += 1) {
    const testLine = line + words[index];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = words[index];
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
  return y + lineHeight;
}

async function renderSharePoster() {
  const shareUrl = getShareUrl();
  const bannerSrc = homeBanners[0]?.image || "./assets/banner-24-01.png";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(shareUrl)}`;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 750;
  canvas.height = 1180;

  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 750, 420);
  gradient.addColorStop(0, "#ff6a1f");
  gradient.addColorStop(1, "#2563eb");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 750, 350);

  ctx.fillStyle = "rgba(255,255,255,.16)";
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.arc(90 + i * 96, 70 + (i % 3) * 62, 34 + i * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "800 54px sans-serif";
  ctx.fillText("贰拾肆号电商", 54, 105);
  ctx.font = "500 28px sans-serif";
  ctx.fillText("电商资源整合 · 店铺资源 · 入驻服务", 56, 158);

  roundedRect(ctx, 46, 210, 658, 375, 28);
  ctx.fillStyle = "#fff";
  ctx.fill();

  try {
    const banner = await loadPosterImage(bannerSrc);
    roundedRect(ctx, 76, 240, 598, 316, 18);
    ctx.save();
    ctx.clip();
    const ratio = Math.max(598 / banner.width, 316 / banner.height);
    const width = banner.width * ratio;
    const height = banner.height * ratio;
    ctx.drawImage(banner, 76 + (598 - width) / 2, 240 + (316 - height) / 2, width, height);
    ctx.restore();
  } catch (error) {
    ctx.fillStyle = "#111827";
    ctx.font = "800 42px sans-serif";
    ctx.fillText("电商资源整合", 205, 410);
  }

  ctx.fillStyle = "#111827";
  ctx.font = "800 42px sans-serif";
  ctx.fillText("一站式电商服务支持", 56, 670);
  ctx.fillStyle = "#4b5563";
  ctx.font = "28px sans-serif";
  drawWrappedText(ctx, "淘宝、拼多多、天猫、抖店等店铺资源服务，支持咨询、评估、入驻、申诉等业务。", 56, 725, 638, 48, 3);

  const tags = ["真实资源", "在线咨询", "快速对接", "电商服务"];
  tags.forEach((tag, index) => {
    const x = 56 + (index % 2) * 330;
    const y = 845 + Math.floor(index / 2) * 68;
    roundedRect(ctx, x, y, 292, 46, 23);
    ctx.fillStyle = index % 2 ? "#eef2ff" : "#fff3ed";
    ctx.fill();
    ctx.fillStyle = index % 2 ? "#2563eb" : "#ff5b1a";
    ctx.font = "700 24px sans-serif";
    ctx.fillText(tag, x + 28, y + 31);
  });

  roundedRect(ctx, 46, 990, 658, 140, 26);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.font = "800 30px sans-serif";
  ctx.fillText("扫码查看服务详情", 58, 1044);
  ctx.fillStyle = "#64748b";
  ctx.font = "20px sans-serif";
  drawWrappedText(ctx, shareUrl, 58, 1080, 420, 30, 2);

  try {
    const qr = await loadPosterImage(qrSrc);
    ctx.drawImage(qr, 540, 1010, 120, 120);
  } catch (error) {
    ctx.strokeStyle = "#d1d5db";
    ctx.strokeRect(540, 1010, 120, 120);
    ctx.fillStyle = "#64748b";
    ctx.font = "20px sans-serif";
    ctx.fillText("二维码", 570, 1078);
  }

  sharePosterBody.innerHTML = "";
  try {
    sharePosterImageUrl = canvas.toDataURL("image/png");
    const img = document.createElement("img");
    img.src = sharePosterImageUrl;
    img.alt = "分享海报";
    sharePosterBody.appendChild(img);
    sharePosterTip.textContent = "手机上长按海报保存，再发朋友圈。";
  } catch (error) {
    sharePosterImageUrl = "";
    sharePosterBody.appendChild(canvas);
    sharePosterTip.textContent = "如果下载失败，可以直接截图保存海报。";
  }
}

function openSharePoster() {
  sharePosterModal.hidden = false;
  sharePosterBody.innerHTML = "<p>正在生成海报...</p>";
  sharePosterTip.textContent = "手机上可长按海报保存，再发朋友圈。";
  renderSharePoster().catch(() => {
    sharePosterBody.innerHTML = "<p>海报生成失败，请刷新后再试。</p>";
  });
}

function closeSharePoster() {
  sharePosterModal.hidden = true;
}

sharePosterBtn.addEventListener("click", openSharePoster);
sharePosterClose.addEventListener("click", closeSharePoster);
sharePosterModal.addEventListener("click", (event) => {
  if (event.target === sharePosterModal) closeSharePoster();
});

sharePosterDownload.addEventListener("click", () => {
  if (!sharePosterImageUrl) {
    sharePosterTip.textContent = "当前环境不支持直接下载，请截图保存海报。";
    return;
  }
  const link = document.createElement("a");
  link.download = "24haods-share-poster.png";
  link.href = sharePosterImageUrl;
  link.click();
});

sharePosterCopy.addEventListener("click", async () => {
  const shareUrl = getShareUrl();
  try {
    await navigator.clipboard.writeText(shareUrl);
    sharePosterTip.textContent = "链接已复制。";
  } catch (error) {
    sharePosterTip.textContent = shareUrl;
  }
});

function getShortcutId(item, index) {
  return item.id || `entry-${index}`;
}

searchInput.addEventListener("input", (event) => {
  const keyword = event.target.value.trim();
  shortcutGrid.querySelectorAll(".shortcut-link").forEach((link) => {
    link.hidden = keyword && !link.textContent.includes(keyword);
  });
});

applyHeroHeight();
renderHeroBanners();
renderShortcuts();
renderHomeContents();
