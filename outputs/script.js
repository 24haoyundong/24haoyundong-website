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
