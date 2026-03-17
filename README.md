# GLAX 摄影作品集网站

## 🚀 GitHub Pages 部署教程

### ⚠️ 重要：您之前空白的原因
您上传的是**源代码文件**（.tsx），浏览器无法直接运行。
需要通过 GitHub Actions **自动构建**后才能显示。

---

## 📋 方案一：GitHub Actions 自动构建（推荐）

> 💡 `.github` 文件夹**可以**通过 GitHub 网页创建！方法如下：

### 第一步：上传项目源代码

将以下文件/文件夹上传到您的 `GLAX141` 仓库：
```
src/          ← 整个文件夹
index.html
package.json
package-lock.json    ← 必须有这个文件！
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
```

### 第二步：在 GitHub 网页上创建 Actions 配置文件

1. 打开 https://github.com/glax141/GLAX141
2. 点击 **「Add file」** → **「Create new file」**
3. 在文件名输入框中输入：`.github/workflows/deploy.yml`
   - GitHub 会**自动创建**文件夹，不用担心！
   - 你会看到路径变成 `.github / workflows / deploy.yml`
4. 将下面 `deploy-workflow.txt` 文件中的内容**完整复制粘贴**到编辑器
5. 点击 **「Commit changes」**

### 第三步：设置 GitHub Pages 来源

1. 打开仓库 → **Settings**（设置）
2. 左侧找到 **Pages**
3. **Source（来源）** 选择 **「GitHub Actions」**
   > ⚠️ 不要选 "Deploy from a branch"！

### 第四步：等待自动部署

1. 点击仓库的 **Actions** 标签
2. 你会看到一个正在运行的工作流（黄色圆圈）
3. 等待变成绿色 ✅（约2-3分钟）
4. 访问 https://glax141.github.io/GLAX141/ 🎉

---

## 📋 方案二：使用 Vercel 部署（最简单，无需任何配置）

1. 打开 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 **「Import Project」**
4. 选择 **GLAX141** 仓库
5. 点击 **「Deploy」**
6. 等待2分钟，Vercel 会自动给你一个链接！

> Vercel 完全免费，部署速度更快，访问速度更好！

---

## 📸 如何更新网站内容

1. 打开网站，点击右上角 **Admin** 按钮
2. 输入密码：`glax141`
3. 修改内容和图片链接
4. 点击 **「下载 config.ts」**
5. 用下载的文件替换仓库中的 `src/config.ts`
6. 推送后网站会自动更新

## 🖼️ 图片链接推荐

将图片上传到一个 **公开的 GitHub 仓库**（如 `GLAX-images`），然后使用 jsDelivr CDN：
```
https://cdn.jsdelivr.net/gh/glax141/GLAX-images@main/照片名.jpg
```
