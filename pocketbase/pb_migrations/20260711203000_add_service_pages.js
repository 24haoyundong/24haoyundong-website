migrate((app) => {
  const publicRead = "is_active = true";
  const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  function ensureCollection() {
    try {
      app.findCollectionByNameOrId("service_pages");
      return;
    } catch (err) {
      // Collection does not exist yet.
    }

    const collection = new Collection({
      type: "base",
      name: "service_pages",
      listRule: publicRead,
      viewRule: publicRead,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "page_key", type: "text", required: true, max: 60, help: "页面标识，例如 sell、ruzhu、evaluate。前台链接会用到它。" },
        { name: "title", type: "text", required: true, max: 120, help: "页面标题" },
        { name: "subtitle", type: "text", max: 200, help: "页面副标题" },
        { name: "content", type: "editor", help: "页面正文，可以放文字和图片" },
        { name: "image", type: "file", maxSelect: 1, maxSize: 10485760, mimeTypes: imageMimeTypes, thumbs: ["430x0", "860x0"], help: "页面主图，可选" },
        { name: "image_url", type: "text", max: 500, help: "外部图片地址，可选" },
        { name: "button_text", type: "text", max: 40, help: "按钮文字，例如 电话咨询" },
        { name: "button_link", type: "text", max: 500, help: "按钮跳转链接，不填则默认走全站咨询" },
        { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
        { name: "is_active", type: "bool", required: true, help: "是否显示" },
      ],
    });

    app.save(collection);
  }

  function savePage(page_key, title, subtitle, sort) {
    const collection = app.findCollectionByNameOrId("service_pages");
    const record = new Record(collection, {
      page_key,
      title,
      subtitle,
      content: `<p>${title} 的内容可以在后台 service_pages 表里编辑。你可以写文字、粘贴图片，也可以放办理说明。</p>`,
      button_text: "电话咨询",
      button_link: "",
      sort,
      is_active: true,
    });
    app.save(record);
  }

  function updateMenuLink(sort, link_url) {
    try {
      const records = app.findAllRecords("home_menus", $dbx.exp(`sort=${sort}`));
      records.forEach((record) => {
        record.set("link_url", link_url);
        app.save(record);
      });
    } catch (err) {}
  }

  ensureCollection();

  [
    ["buy-store", "我要买店", "精选电商店铺资源，支持按平台和类目筛选", 10],
    ["sell", "我要卖店", "提交店铺出售需求，联系客服对接买家", 20],
    ["ruzhu", "代入驻", "淘宝、天猫、抖音、京东等平台入驻服务", 30],
    ["evaluate", "网店评估", "评估店铺价值、类目、资质和交易方案", 40],
    ["trademark", "商标转让", "商标资源转让、授权和资质对接", 50],
    ["appeal", "违规申诉", "店铺处罚、限制、信息层申诉咨询", 60],
    ["service", "电商服务", "电商资源整合、运营支持和技术服务", 70],
    ["my", "我的", "用户中心和联系方式", 80],
  ].forEach(([page_key, title, subtitle, sort]) => {
    savePage(page_key, title, subtitle, sort);
  });

  updateMenuLink(10, "./buy-store.html");
  updateMenuLink(20, "./service-page.html?key=sell");
  updateMenuLink(30, "./service-page.html?key=ruzhu");
  updateMenuLink(40, "./service-page.html?key=evaluate");
  updateMenuLink(50, "./service-page.html?key=trademark");
  updateMenuLink(60, "./service-page.html?key=appeal");
  updateMenuLink(70, "./service-page.html?key=service");
  updateMenuLink(80, "./service-page.html?key=my");
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("service_pages");
    app.delete(collection);
  } catch (err) {}
});
