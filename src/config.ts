/**
 * ============================================
 * GLAX 摄影作品集 - 唯一配置文件
 * ============================================
 * 
 * 📌 所有网站内容都在这个文件中配置
 * 📌 修改后推送到 GitHub，网站会自动更新
 * 
 * 🖼️ 图片链接推荐方式：
 *   方式1: 上传到 GitHub 仓库，使用 jsDelivr CDN
 *          https://cdn.jsdelivr.net/gh/用户名/仓库名@main/路径/图片.jpg
 *   方式2: 使用免费图床 (imgbb, cloudinary 等)
 *   方式3: 使用 Unsplash 等免费图片链接
 */

// ============================================
// 🏠 首页设置
// ============================================
export const HOME_CONFIG = {
  // 主页全屏背景大图
  heroImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1920&h=1080&fit=crop',
};

// ============================================
// 👤 关于我
// ============================================
export const ABOUT_CONFIG = {
  name: 'GLAX',
  title: '商业 / 时尚摄影师',
  titleEn: 'Commercial & Fashion Photographer',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
  bio: `GLAX，商业与时尚领域的资深摄影师，拥有超过10年的影像创作经验。

我的镜头语言追求极致与纯粹，在光影的交织中捕捉瞬间的永恒。相信每一帧画面都是情感与故事的载体，用专业视角诠释商业价值，用艺术眼光定格美好瞬间。

曾与众多国际品牌合作，作品涵盖时尚大片、产品广告、人像摄影等多个领域。始终坚持「用光影讲述故事，用镜头传递情感」的创作理念，将商业需求与艺术表达完美融合，为每一位客户呈现独特而深刻的视觉体验。`,
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
  descriptionEn: string;
  cover: string;       // 封面图
  images: string[];    // 全部作品图片
}

export const PROJECTS: Project[] = [
  {
    id: 'lookbook',
    title: 'LOOKBOOK',
    titleEn: 'Portrait & Fashion',
    description: '纯粹人像与服装摄影，捕捉时尚的本质与灵魂。在这个系列中，我探索人与服装之间的关系，用镜头讲述每一个穿着背后的故事。光线、构图、情绪——一切都在瞬间定格。',
    descriptionEn: 'Pure portrait and fashion photography, capturing the essence and soul of style.',
    cover: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1000&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502716119720-b23a1e3b2b22?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'still',
    title: '静谧',
    titleEn: 'Still Life',
    description: '静物摄影，专注于产品之美。在这个系列中，每一件物品都被赋予生命——精致的鞋子、优雅的服装、闪耀的首饰。我追求的是让观者感受到物品的温度与质感。',
    descriptionEn: 'Still life photography, focusing on the beauty of products — shoes, clothing, jewelry.',
    cover: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'inside',
    title: 'inside',
    titleEn: 'Fashion Editorial',
    description: '创意时尚杂志作品，打破常规边界。这个系列是与顶级时尚杂志的合作成果，探索先锋设计与传统美学的碰撞融合。每一次拍摄都是一场视觉革命。',
    descriptionEn: 'Creative fashion editorial works, breaking conventional boundaries.',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=800&fit=crop',
    ],
  },
];

// ============================================
// 📊 统计数据
// ============================================
export const STATS = [
  { value: '10+', label: '年经验', labelEn: 'Years' },
  { value: '200+', label: '合作客户', labelEn: 'Clients' },
  { value: '500+', label: '作品数量', labelEn: 'Works' },
];

// ============================================
// 🔑 后台密码（SHA-256 加密存储，不显示明文）
// ============================================
// 如需修改密码，请在浏览器控制台运行以下命令获取新密码的哈希值：
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的新密码')).then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
// 然后将下方哈希值替换即可
export const ADMIN_PASSWORD_HASH = 'a31e84082e81e1499d0ab37bb2a9e612f97b646a6881e0b6e3563e181e3e87f6';

// ============================================
// ☁️ GitHub Gist 云同步配置
// ============================================
export const GIST_CONFIG = {
  // ⚠️ 首次同步成功后，把生成的 Gist ID 填入这里
  // 这样所有设备无需 Token 就能自动加载最新数据
  // 例如: publicGistId: 'abc123def456'
  publicGistId: '',
  enabled: true,
};
