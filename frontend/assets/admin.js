(function () {
  const stats = {
    home_banners: "statBanners",
    home_menus: "statMenus",
    stores: "statStores",
    bottom_navs: "statBottomNavs",
  };

  async function countRecords(collection) {
    const res = await fetch(`/api/collections/${collection}/records?perPage=1`, { cache: "no-store" });
    if (!res.ok) return "-";
    const data = await res.json();
    return data.totalItems ?? 0;
  }

  async function initStats() {
    await Promise.all(Object.entries(stats).map(async ([collection, elementId]) => {
      const element = document.getElementById(elementId);
      if (!element) return;
      element.textContent = await countRecords(collection);
    }));
  }

  initStats();
}());
