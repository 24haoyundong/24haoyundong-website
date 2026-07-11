migrate((app) => {
  const publicRead = "is_active = true";

  function createCollection(name, fields, options = {}) {
    try {
      app.findCollectionByNameOrId(name);
      console.log("Collection already exists, skip:", name);
      return;
    } catch (err) {
      // Collection does not exist yet.
    }

    const collection = new Collection({
      type: options.type || "base",
      name,
      listRule: options.listRule === undefined ? publicRead : options.listRule,
      viewRule: options.viewRule === undefined ? publicRead : options.viewRule,
      createRule: options.createRule || null,
      updateRule: options.updateRule || null,
      deleteRule: options.deleteRule || null,
      fields,
    });

    app.save(collection);
  }

  const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  createCollection("site_settings", [
    { name: "site_name", type: "text", required: true, max: 80, help: "网站名称，例如：24号电商" },
    { name: "slogan", type: "text", max: 160, help: "网站一句话介绍" },
    { name: "phone", type: "text", max: 40, help: "全站电话咨询号码" },
    { name: "wechat", type: "text", max: 80, help: "客服微信号" },
    { name: "consult_text", type: "text", max: 80, help: "咨询按钮文案，例如：电话咨询" },
    { name: "contact_link", type: "text", max: 255, help: "咨询跳转链接，可填 tel:手机号 或微信二维码页面" },
    { name: "footer_text", type: "text", max: 255, help: "底部说明文字" },
    { name: "is_active", type: "bool", required: true, help: "是否启用" },
  ]);

  createCollection("home_banners", [
    { name: "title", type: "text", required: true, max: 120, help: "轮播图名称，方便后台识别" },
    { name: "image", type: "file", required: false, maxSelect: 1, maxSize: 10485760, mimeTypes: imageMimeTypes, thumbs: ["430x240f", "860x480f"], help: "上传首页轮播图片" },
    { name: "image_url", type: "text", max: 500, help: "也可以填外部图片地址，和上传图片二选一" },
    { name: "link_url", type: "text", max: 500, help: "点击轮播图跳转链接" },
    { name: "height_px", type: "number", min: 120, max: 600, onlyInt: true, help: "前台显示高度，建议 240" },
    { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
    { name: "is_active", type: "bool", required: true, help: "是否显示" },
  ]);

  createCollection("home_menus", [
    { name: "title", type: "text", required: true, max: 40, help: "入口名称，例如：买淘宝店" },
    { name: "icon_text", type: "text", max: 8, help: "纯文字图标，例如：淘、拼、猫" },
    { name: "icon_image", type: "file", maxSelect: 1, maxSize: 2097152, mimeTypes: imageMimeTypes, thumbs: ["96x96"], help: "也可以上传图标图片" },
    { name: "icon_color", type: "select", values: ["orange", "red", "pink", "purple", "green", "blue", "black"], maxSelect: 1, help: "圆形图标颜色" },
    { name: "link_url", type: "text", required: true, max: 500, help: "点击入口跳转链接" },
    { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
    { name: "is_active", type: "bool", required: true, help: "是否显示" },
  ]);

  createCollection("home_sections", [
    { name: "title", type: "text", required: true, max: 120, help: "内容标题" },
    { name: "subtitle", type: "text", max: 200, help: "副标题或简短说明" },
    { name: "content", type: "editor", help: "正文内容，可放文字和富文本" },
    { name: "image", type: "file", maxSelect: 1, maxSize: 10485760, mimeTypes: imageMimeTypes, thumbs: ["430x0", "860x0"], help: "内容图片" },
    { name: "image_url", type: "text", max: 500, help: "外部图片地址" },
    { name: "button_text", type: "text", max: 40, help: "按钮文字，例如：查看详情" },
    { name: "button_link", type: "text", max: 500, help: "按钮跳转链接" },
    { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
    { name: "is_active", type: "bool", required: true, help: "是否显示" },
  ]);

  createCollection("store_categories", [
    { name: "name", type: "text", required: true, max: 80, help: "分类名称，例如：淘宝店、拼多多店、天猫店" },
    { name: "code", type: "text", required: true, max: 40, help: "分类编码，例如：taobao、pdd、tmall" },
    { name: "platform", type: "select", values: ["taobao", "pdd", "tmall", "douyin", "jd", "other"], maxSelect: 1, help: "所属平台" },
    { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
    { name: "is_active", type: "bool", required: true, help: "是否启用" },
  ]);

  createCollection("stores", [
    { name: "title", type: "text", required: true, max: 160, help: "店铺标题" },
    { name: "platform", type: "select", values: ["taobao", "pdd", "tmall", "douyin", "jd", "other"], maxSelect: 1, help: "平台" },
    { name: "category_text", type: "text", max: 120, help: "类目文字，例如：家居日用 / R标 / 旗舰店" },
    { name: "level", type: "text", max: 40, help: "店铺等级，例如：1钻、2心" },
    { name: "year", type: "text", max: 20, help: "年份，例如：2026年" },
    { name: "code", type: "text", max: 60, help: "编号，例如：P001" },
    { name: "price", type: "text", max: 40, help: "价格，例如：2.30万 或 咨询报价" },
    { name: "summary", type: "text", max: 300, help: "列表页简短卖点" },
    { name: "detail", type: "editor", help: "详情页内容" },
    { name: "image", type: "file", maxSelect: 1, maxSize: 10485760, mimeTypes: imageMimeTypes, thumbs: ["320x180f", "640x360f"], help: "店铺图片，可选" },
    { name: "original_url", type: "text", max: 500, help: "原始链接，可选" },
    { name: "phone", type: "text", max: 40, help: "单个店铺咨询电话，可不填，默认用全站电话" },
    { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
    { name: "is_recommended", type: "bool", help: "是否推荐" },
    { name: "is_active", type: "bool", required: true, help: "是否显示" },
  ]);

  createCollection("faqs", [
    { name: "question", type: "text", required: true, max: 160, help: "常见问题" },
    { name: "answer", type: "editor", help: "问题答案" },
    { name: "sort", type: "number", min: 0, max: 9999, onlyInt: true, help: "排序，数字越小越靠前" },
    { name: "is_active", type: "bool", required: true, help: "是否显示" },
  ]);

  createCollection("members", [
    { name: "nickname", type: "text", max: 80, help: "用户昵称" },
    { name: "phone", type: "text", max: 40, help: "手机号" },
    { name: "role", type: "select", values: ["customer", "staff"], maxSelect: 1, help: "用户角色" },
    { name: "is_active", type: "bool", required: true, help: "是否启用" },
  ], {
    type: "auth",
    listRule: null,
    viewRule: null,
  });

  const settingsCollection = app.findCollectionByNameOrId("site_settings");
  const settings = new Record(settingsCollection, {
    site_name: "24号电商",
    slogan: "电商资源整合服务",
    phone: "",
    wechat: "",
    consult_text: "电话咨询",
    contact_link: "",
    footer_text: "",
    is_active: true,
  });
  app.save(settings);
}, (app) => {
  [
    "members",
    "faqs",
    "stores",
    "store_categories",
    "home_sections",
    "home_menus",
    "home_banners",
    "site_settings",
  ].forEach((name) => {
    try {
      const collection = app.findCollectionByNameOrId(name);
      app.delete(collection);
    } catch (err) {
      // Already removed.
    }
  });
});
