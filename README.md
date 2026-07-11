# 24haods-site

24号电商轻量版网站项目。

## 技术路线

- PocketBase：后台、登录、数据、图片上传、API。
- Frontend：自定义 H5 前台页面。
- SQLite：PocketBase 自带数据库，不需要 MySQL。
- Windows：适合深圳测试环境和湖北生产环境。

## 本机地址

PocketBase 后台：

```text
http://127.0.0.1:8090/_/
```

前台页面：

```text
http://127.0.0.1:8081/index.html
```

前台 API 代理：

```text
http://127.0.0.1:8081/api/...
```

前台页面会通过这个代理读取 PocketBase，部署到湖北生产环境时也只需要对外暴露前台服务端口。

## 启动方式

双击：

```text
scripts/start-all.bat
```

也可以分开启动：

```text
scripts/start-pocketbase.bat
scripts/start-frontend.bat
```

## 后台数据表

- `site_settings`：网站基础配置，电话、微信、咨询按钮文案等。
- `home_banners`：首页顶部轮播图，支持上传图片、设置高度、排序和跳转链接。
- `home_menus`：首页入口菜单，例如买淘宝店、买多多店、天猫入驻。
- `home_sections`：首页自定义内容，可以放标题、正文、图片和按钮。
- `store_categories`：店铺分类，例如淘宝、拼多多、天猫。
- `stores`：店铺资源列表和详情内容。
- `faqs`：常见问题。
- `members`：前台用户登录账号，和 PocketBase 超级管理员分开。

## 已接入后台的页面

- `frontend/index.html`：读取 `site_settings`、`home_banners`、`home_menus`、`home_sections`。
- `frontend/buy-store.html`：读取 `site_settings`、`stores`。
- `frontend/my.html`：读取 `site_settings`。

## 后台填写顺序

1. 先在 `site_settings` 填电话、微信和咨询链接。
2. 再在 `home_banners` 上传首页轮播图。
3. 然后在 `home_menus` 设置首页入口。
4. 需要展示图文内容时，在 `home_sections` 新增内容。
5. 有店铺数据后，先建 `store_categories`，再建 `stores`。

## PocketBase 下载

不用拉 PocketBase 源码。

从 PocketBase 官方 GitHub Release 下载 Windows amd64 版本，解压后把 `pocketbase.exe` 放到：

```text
pocketbase/pocketbase.exe
```

下载地址：

```text
https://github.com/pocketbase/pocketbase/releases
```

## 环境分工

- 【深圳测试环境】：开发、测试、提交 GitHub。
- 【湖北生产环境】：拉取 GitHub、运行网站、cpolar 对外访问。

## 下一步

把前台页面接入 PocketBase API，让首页、买店页、我的页面都从后台读取内容。
