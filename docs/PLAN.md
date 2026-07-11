# 24号电商 PocketBase 项目计划

## 当前阶段

先把后台数据结构搭好，让你可以在 PocketBase 后台录入内容。

## 后台表说明

- `site_settings`：网站基础配置，电话、微信、咨询按钮文案等。
- `home_banners`：首页顶部轮播图，支持上传图片、设置高度、排序和跳转链接。
- `home_menus`：首页入口菜单，例如买淘宝店、买多多店、天猫入驻。
- `home_sections`：首页自定义内容，可以放标题、正文、图片和按钮。
- `store_categories`：店铺分类，例如淘宝、拼多多、天猫。
- `stores`：店铺资源列表和详情内容。
- `faqs`：常见问题。
- `members`：前台用户登录账号，和 PocketBase 超级管理员分开。

## 使用顺序

1. 先在 `site_settings` 填电话和微信。
2. 再在 `home_banners` 上传首页轮播图。
3. 然后在 `home_menus` 设置首页入口。
4. 需要展示图文内容时，在 `home_sections` 新增内容。
5. 有店铺数据后，先建 `store_categories`，再建 `stores`。

## 环境约定

- 【深圳测试环境】：本机开发和测试。
- 【湖北生产环境】：24小时电脑运行正式访问版本。

## 下一步

把前台页面接入 PocketBase API，让首页、买店页、我的页面都从后台读取内容。
