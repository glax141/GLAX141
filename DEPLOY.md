# 🚀 GLAX 摄影作品集 - GitHub Pages 部署指南

## 📋 部署步骤

### 第一步：创建 GitHub 仓库

1. 登录 [github.com](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 仓库名称填写：`glax` 或任意名称（**不要用空格**）
4. 设置为 **Public**（必须公开才能用 GitHub Pages 免费版）
5. **不要**勾选 Initialize README
6. 点击 `Create repository`

---

### 第二步：上传代码到 GitHub

#### 方法A：使用 GitHub Desktop（推荐新手）
1. 下载安装 [GitHub Desktop](https://desktop.github.com)
2. 登录您的 GitHub 账号
3. `File` → `Add Local Repository` → 选择您的项目文件夹
4. 点击 `Publish repository`
5. 选择刚才创建的仓库名称
6. 点击 `Publish`

#### 方法B：直接拖拽上传
1. 打开您的 GitHub 仓库页面
2. 点击 `uploading an existing file`
3. 将所有项目文件拖拽到上传区域
4. 点击 `Commit changes`

#### 方法C：使用命令行
```bash
cd 您的项目文件夹
git init
git add .
git commit -m "初始化 GLAX 摄影作品集"
git branch -M main
git remote add origin https://github.com/您的用户名/仓库名.git
git push -u origin main
```

---

### 第三步：开启 GitHub Pages

**方法一：使用 GitHub Actions（推荐）**

1. 打开仓库 → 点击 `Settings`（设置）
2. 左侧菜单找到 `Pages`
3. `Source` 选择 `GitHub Actions`
4. 等待 Actions 自动运行（约 2-3 分钟）
5. 完成后页面会显示您的网站链接

**方法二：使用 main 分支（简单）**

1. 打开仓库 → 点击 `Settings`（设置）
2. 左侧菜单找到 `Pages`
3. `Source` 选择 `Deploy from a branch`
4. Branch 选择 `main`，文件夹选择 `/ (root)`
5. 但这个方法需要先手动构建，把 dist 文件夹内容放到根目录

---

### 第四步：访问您的网站

部署成功后，您的网站地址是：
```
https://您的GitHub用户名.github.io/仓库名/
```

例如：
```
https://glax.github.io/portfolio/
```

---

## ⚠️ 常见问题排查

### 问题1：显示 404 Not Found
**原因：** GitHub Pages 还没有部署完成，或者 Actions 有错误

**解决：**
- 等待 3-5 分钟后刷新
- 检查仓库的 `Actions` 标签页，看是否有红色错误
- 确保 `Pages` 设置中 Source 已正确设置

### 问题2：页面空白或样式丢失
**原因：** 这个项目使用了 `vite-plugin-singlefile`，打包成单一 HTML，通常不会有此问题

**解决：**
- 检查 `dist/index.html` 是否存在
- 清除浏览器缓存后刷新

### 问题3：Actions 构建失败
**常见错误及解决：**
- `npm install` 失败 → 检查 package.json 是否正确
- `npm run build` 失败 → 检查代码是否有语法错误
- 权限问题 → Settings → Actions → General → 确保 Workflow permissions 为 Read and write

### 问题4：更新代码后网站没有更新
**解决：**
- 确认代码已推送到 `main` 分支
- 查看 `Actions` 标签页是否有新的构建任务
- 等待 Actions 完成（绿色勾勾）
- 强制刷新浏览器（Ctrl+Shift+R）

---

## 📸 图片上传方案（跨设备同步）

由于 GitHub Pages 是静态网站，图片上传后需要通过以下方式共享：

### 推荐方案：GitHub 仓库 + jsDelivr CDN

1. 在仓库创建 `images/` 文件夹
2. 上传您的摄影作品到对应文件夹：
   ```
   images/
   ├── lookbook/
   │   ├── cover.jpg
   │   ├── 01.jpg
   │   └── ...
   ├── jingmi/
   │   └── ...
   └── inside/
       └── ...
   ```
3. 图片访问链接格式：
   ```
   https://cdn.jsdelivr.net/gh/用户名/仓库名@main/images/lookbook/01.jpg
   ```
4. 在后台管理中填入此链接即可

### 为什么选择 jsDelivr？
- ✅ 完全免费
- ✅ 全球 CDN 加速
- ✅ 国内访问速度也很好
- ✅ 自动缓存，节省 GitHub 流量
- ✅ 稳定可靠

---

## 🔄 后续更新网站

每次修改代码后：

**使用 GitHub Desktop：**
1. 在 GitHub Desktop 中看到变更文件
2. 填写提交说明（如"更新作品集图片"）
3. 点击 `Commit to main`
4. 点击 `Push origin`
5. 等待 GitHub Actions 自动部署（约 2-3 分钟）

**使用命令行：**
```bash
git add .
git commit -m "更新内容"
git push
```

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 您的仓库链接
2. `Actions` 页面的错误信息截图
3. 问题描述

祝您的作品集网站成功上线！🎉
