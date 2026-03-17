/**
 * GLAX 摄影作品集 - 配置文件
 * 
 * 如何使用：
 * 1. 将图片上传到 GitHub 仓库
 * 2. 使用 jsDelivr CDN 链接格式：https://cdn.jsdelivr.net/gh/用户名/仓库名@分支/路径/图片名.jpg
 * 3. 将链接填入下方配置
 * 
 * GitHub 图片上传：
 * 1. 在 GitHub 创建新仓库（如：glax-photos）
 * 2. 上传您的摄影作品到仓库
 * 3. 点击图片 → 点击 "Copy path" → 替换下面的链接格式
 * 
 * 示例：
 * 原始链接：https://github.com/您的用户名/glax-photos/blob/main/lookbook/1.jpg?raw=true
 * CDN链接：https://cdn.jsdelivr.net/gh/您的用户名/glax-photos@main/lookbook/1.jpg
 */

// ============================================
// 🔧 配置信息 - 请修改为您的信息
// ============================================

// 您的 GitHub 用户名和仓库名
export const GITHUB_CONFIG = {
  username: 'your-username',      // 替换为您的 GitHub 用户名
  repo: 'glax-portfolio',         // 替换为您的仓库名
  branch: 'main',                  // 分支名，通常是 main 或 master
};

// GitHub Gist 配置（用于数据同步）
// 如何获取 GitHub Token:
// 1. 访问 https://github.com/settings/tokens
// 2. 点击 "Generate new token (classic)"
// 3. 勾选 "gist" 权限
// 4. 生成 token 并填入下方
export const GITHUB_TOKEN = 'your-github-token';  // 替换为您的 GitHub Token

// ============================================
// 👤 关于我 - 个人信息
// ============================================

export const ABOUT_CONFIG = {
  name: 'GLAX',
  title: '商业 / 时尚摄影师',
  avatar: 'https://cdn.jsdelivr.net/gh/your-username/glax-portfolio@main/avatar.jpg',
  bio: `GLAX，商业与时尚领域的资深摄影师，拥有超过10年的影像创作经验。

我的镜头语言追求极致与纯粹，在光影的交织中捕捉瞬间的永恒。相信每一帧画面都是情感与故事的载体，用专业视角诠释商业价值，用艺术眼光定格美好瞬间。

曾与众多国际品牌合作，作品涵盖时尚大片、产品广告、人像摄影等多个领域。始终坚持「用光影讲述故事，用镜头传递情感」的创作理念。`,
  email: 'glax@example.com',
  instagram: '@glax_photo',
  wechat: 'GLAX141',
};

// ============================================
// 🖼️ 项目配置
// ============================================

export interface Project {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  cover: string;
  images: string[];
}

// 📁 图片链接格式说明：
// 格式：https://cdn.jsdelivr.net/gh/{用户名}/{仓库名}@{分支}/{项目文件夹}/{图片名}
// 
// 示例：
// https://cdn.jsdelivr.net/gh/myusername/glax-portfolio@main/lookbook/1.jpg
// 
// 如何获取链接：
// 1. 上传图片到 GitHub 仓库
// 2. 点击图片文件
// 3. 点击 "Copy path" 按钮
// 4. 将链接改为 jsDelivr 格式

export const PROJECTS: Project[] = [
  {
    id: 'lookbook',
    title: 'LOOKBOOK',
    titleEn: 'Portrait & Fashion',
    description: '纯粹人像与服装摄影，捕捉时尚的本质与灵魂。在这个系列中，我探索人与服装之间的关系，用镜头讲述每一个穿着背后的故事。光线、构图、情绪——一切都在瞬间定格。',
    cover: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'still',
    title: '静谧',
    titleEn: 'Still Life',
    description: '静物摄影，专注于产品之美。在这个系列中，每一件物品都被赋予生命——精致的鞋子、优雅的服装、闪耀的首饰。我追求的是让观者感受到物品的温度与质感。',
    cover: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'inside',
    title: 'inside',
    titleEn: 'Fashion Editorial',
    description: '创意时尚杂志作品，打破常规边界。这个系列是与顶级时尚杂志的合作成果，探索先锋设计与传统美学的碰撞融合。每一次拍摄都是一场视觉革命。',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
    ],
  },
];

// ============================================
// 🏠 首页配置
// ============================================

export const HOME_CONFIG = {
  // 主页大图 - 时尚摄影作品
  heroImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1920&h=1080&fit=crop',
  
  // 滚动展示的图片（留空则自动使用 LOOKBOOK 图片）
  carouselImages: [] as string[],
};

// ============================================
// 📱 网站配置
// ============================================

export const SITE_CONFIG = {
  title: 'GLAX | 商业时尚摄影师',
  description: 'GLAX - 商业时尚摄影师，专注于人像、服装、产品摄影',
  keywords: '摄影, 时尚, 商业摄影, 人像, GLAX',
};

// ============================================
// 🔗 帮助函数 - 生成 CDN 链接
// ============================================

/**
 * 将 GitHub 文件路径转换为 jsDelivr CDN 链接
 * 
 * @param filePath - GitHub 文件路径，如 "lookbook/1.jpg"
 * @returns jsDelivr CDN 链接
 * 
 * @example
 * // 输入: "lookbook/photo.jpg"
 * // 输出: "https://cdn.jsdelivr.net/gh/your-username/glax-portfolio@main/lookbook/photo.jpg"
 */
export function toCDNUrl(filePath: string): string {
  const { username, repo, branch } = GITHUB_CONFIG;
  return `https://cdn.jsdelivr.net/gh/${username}/${repo}@${branch}/${filePath}`;
}

/**
 * 将普通图片链接转换为 CDN 链接（如果是 GitHub 链接）
 */
export function ensureCDNUrl(url: string): string {
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 否则转换为 CDN 链接
  return toCDNUrl(url);
}
