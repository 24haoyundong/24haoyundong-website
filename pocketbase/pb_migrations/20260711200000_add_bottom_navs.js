migrate((app) => {
  try {
    app.findCollectionByNameOrId("bottom_navs");
    return;
  } catch (err) {
    // Collection does not exist yet.
  }

  const collection = new Collection({
    type: "base",
    name: "bottom_navs",
    listRule: "is_active = true",
    viewRule: "is_active = true",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "title", type: "text", required: true, max: 30, help: "底部菜单名称，例如：首页" },
      { name: "link_url", type: "text", max: 500, help: "跳转链接，例如：./index.html" },
      { name: "page_key", type: "text", max: 40, help: "对应页面标识：home、buy-store、my，用来高亮当前菜单" },
      { name: "action", type: "select", values: ["link", "consult"], maxSelect: 1, help: "link 是普通跳转，consult 是电话咨询" },
      { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
      { name: "is_active", type: "bool", required: true, help: "是否显示" },
    ],
  });

  app.save(collection);

  [
    ["首页", "./index.html", "home", "link", 10],
    ["买店", "./buy-store.html", "buy-store", "link", 20],
    ["咨询", "#", "consult", "consult", 30],
    ["我的", "./my.html", "my", "link", 40],
  ].forEach(([title, link_url, page_key, action, sort]) => {
    const record = new Record(collection, {
      title,
      link_url,
      page_key,
      action,
      sort,
      is_active: true,
    });
    app.save(record);
  });
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("bottom_navs");
    app.delete(collection);
  } catch (err) {
    // Already removed.
  }
});
