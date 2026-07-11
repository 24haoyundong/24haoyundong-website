migrate((app) => {
  function saveRecord(collectionName, data) {
    const collection = app.findCollectionByNameOrId(collectionName);
    const record = new Record(collection, data);
    app.save(record);
  }

  [
    ["我要买店", "买", "orange", "./buy-store.html", 10],
    ["我要卖店", "卖", "red", "#", 20],
    ["代入驻", "入", "blue", "#", 30],
    ["网店评估", "评", "pink", "#", 40],
    ["商标转让", "标", "purple", "#", 50],
    ["违规申诉", "申", "green", "#", 60],
    ["电商服务", "服", "red", "#", 70],
    ["我的", "我", "black", "./my.html", 80],
  ].forEach(([title, icon_text, icon_color, link_url, sort]) => {
    saveRecord("home_menus", {
      title,
      icon_text,
      icon_color,
      link_url,
      sort,
      is_active: true,
    });
  });

  [
    ["淘宝店", "taobao", "taobao", 10],
    ["拼多多店", "pdd", "pdd", 20],
    ["天猫店", "tmall", "tmall", 30],
  ].forEach(([name, code, platform, sort]) => {
    saveRecord("store_categories", {
      name,
      code,
      platform,
      sort,
      is_active: true,
    });
  });

  saveRecord("home_sections", {
    title: "电商资源整合服务",
    subtitle: "这里的内容可以在 PocketBase 后台直接修改。",
    content: "<p>支持首页图片、入口菜单、店铺列表、电话咨询等内容后台管理。</p>",
    button_text: "查看店铺",
    button_link: "./buy-store.html",
    sort: 10,
    is_active: true,
  });

  saveRecord("stores", {
    title: "家居日用 无售假 资料齐全 支持对接",
    platform: "taobao",
    category_text: "淘宝店铺 / 家居日用",
    level: "2心",
    year: "2026年",
    code: "T001",
    price: "咨询报价",
    summary: "这是后台示例店铺，你可以在 stores 表里修改或删除。",
    detail: "<p>店铺详情内容可以在后台编辑，后续详情页会读取这里。</p>",
    sort: 10,
    is_recommended: true,
    is_active: true,
  });
}, (app) => {
  [
    ["stores", "code='T001'"],
    ["home_sections", "title='电商资源整合服务'"],
  ].forEach(([collectionName, where]) => {
    try {
      const records = app.findAllRecords(collectionName, $dbx.exp(where));
      records.forEach((record) => app.delete(record));
    } catch (err) {}
  });
});
