# GLAX 摄影作品集 - GitHub Pages 部署指南

## 🚀 快速部署步骤

### 第一步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 仓库名建议：`glax-portfolio`
4. 选择 **Public**（公开）
5. **不要**勾选 README
6. 点击 `Create repository`

### 第二步：上传代码

```bash
# 方式一：命令行（推荐）
git init
git add .
git commit -m "初始化 GLAX 摄影作品集"
git branch -M main
git remote add origin https://github.com/你的用户名/glax-portfolio.git
git push -u origin main

# 方式二：直接在 GitHub 网页上传
# 进入仓库 → Add file → Upload files → 拖入所有文件
```

### 第三步：开启 GitHub Pages

1. 进入仓库 → `Settings`（设置）
2. 左侧菜单点击 `Pages`
3. **Source** 选择 `GitHub Actions`
4. 等待自动构建完成（通常 1-3 分钟）
5. 刷新页面，顶部会显示你的网站链接：
   `https://你的用户名.github.io/glax-portfolio/`

### 第四步：查看部署状态

1. 进入仓库 → `Actions` 标签页
2. 可以看到部署工作流的运行状态
3. 绿色 ✅ = 部署成功
4. 红色 ❌ = 部署失败，点击查看错误信息

---

## 📸 如何更新图片和内容

### 方法一：使用后台管理（推荐）

1. 访问你的网站
2. 点击右上角 `Admin` 按钮
3. 输入密码 `glax141`
4. 编辑内容和图片链接
5. 点击 `下载 config.ts`
6. 用下载的文件替换项目中的 `src/config.ts`
7. 推送到 GitHub

### 方法二：直接编辑 config.ts

1. 在 GitHub 仓库中打开 `src/config.ts`
2. 点击编辑按钮（铅笔图标）
3. 修改内容
4. 点击 `Commit changes`
5. 等待自动重新部署

---

## 🖼️ 图片托管方案

### 推荐：jsDelivr CDN（免费、全球加速）

1. 在 GitHub 创建一个图片仓库（如 `glax-images`）
2. 上传图片到仓库
3. 使用 CDN 链接格式：

```
https://cdn.jsdelivr.net/gh/你的用户名/glax-images@main/路径/图片.jpg
```

**示例：**
```
https://cdn.jsdelivr.net/gh/glax/glax-images@main/lookbook/photo1.jpg
```

### 替代方案

- **imgbb.com** - 免费图床，无需注册
- **Cloudinary** - 专业图片 CDN，免费额度充足
- **直接放在仓库里** - 简单但会增加仓库体积

---

## 📁 项目结构

```
glax-portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml          # 自动部署配置
├── public/
│   ├── .nojekyll               # 禁用 Jekyll
│   └── 404.html                # SPA 路由支持
├── src/
│   ├── config.ts               # ⭐ 唯一配置文件
│   ├── App.tsx                 # 主应用
│   ├── main.tsx                # 入口
│   └── index.css               # 样式
├── index.html                  # HTML 模板
├── package.json
├── vite.config.ts
└── DEPLOY.md                   # 本文件
```

## ❓ 常见问题

### Q: 为什么显示 404？
A: 确保 GitHub Pages 的 Source 选择了 `GitHub Actions`（不是 branch）

### Q: 为什么图片不显示？
A: 检查图片链接是否正确，建议使用 jsDelivr CDN 链接

### Q: 如何更改密码？
A: 修改 `src/config.ts` 中的 `ADMIN_PASSWORD`

### Q: 部署后多久生效？
A: 通常 1-3 分钟，可在 Actions 标签页查看进度
