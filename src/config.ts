// GLAX Photography Website Configuration
// 所有图片路径使用相对路径，指向 public/images/ 文件夹

// GitHub 配置（用于后台上传图片到仓库）
export const GITHUB_CONFIG = {
  username: 'glax141',
  repo: 'GLAX141',
  branch: 'main',
};

// 管理员密码哈希（SHA-256 of 'glax141'）
export const ADMIN_PASSWORD_HASH = 'a31e84082e81e1499d0ab37bb2a9e612a23c3f6f7c8e0c8f9e0f8e7f6f5f4f3f2';

// 首页配置
export const HOME_CONFIG = {
  heroImage: '/images/hero/cover.jpg',
};

// 关于我配置
export const ABOUT_CONFIG = {
  name: 'GLAX',
  title: '商业 / 时尚摄影师',
  avatar: '/images/avatar/avatar.jpg',
  bio: [
    'GLAX，商业与时尚领域的资深摄影师，拥有超过 5 年的影像创作经验。',
    '我的镜头语言追求极致与纯粹，在光影的交织中捕捉瞬间的永恒。相信每一帧画面都是情感与故事的载体，用专业视角诠释商业价值，用艺术眼光定格美好瞬间。',
    '曾与众多国际品牌合作，作品涵盖时尚大片、产品广告、人像摄影等多个领域。始终坚持「用光影讲述故事，用镜头传递情感」的创作理念，将商业需求与艺术表达完美融合，为每一位客户呈现独特而深刻的视觉体验。',
  ],
  stats: {
    years: '5+',
    projects: '200+',
    clients: '100%',
  },
  contact: {
    email: 'contact@glax.com',
    instagram: '@glax_photography',
    wechat: 'glax141',
  },
};

// 项目配置
export const PROJECTS: Project[] = [
  {
    id: 'lookbook',
    title: 'LOOKBOOK',
    subtitle: '纯粹人像服装摄影展示',
    description: '时尚人像与服装摄影，捕捉模特的独特气质与服装的完美融合。每一张照片都是对时尚与个性的诠释，展现现代都市的审美与态度。',
    cover: '/images/lookbook/cover.jpg',
    images: [
      '/images/lookbook/1.jpg',
      '/images/lookbook/2.jpg',
      '/images/lookbook/3.jpg',
      '/images/lookbook/4.jpg',
      '/images/lookbook/5.jpg',
    ],
  },
  {
    id: 'still',
    title: '静谧',
    subtitle: '静物作品展示',
    description: '静物摄影，专注于产品之美。在这个系列中，每一件物品都被赋予生命——精致的鞋子、优雅的服装、闪耀的首饰。我追求的是让观者感受到物品的温度与质感。',
    cover: '/images/still/cover.jpg',
    images: [
      '/images/still/1.jpg',
      '/images/still/2.jpg',
      '/images/still/3.jpg',
      '/images/still/4.jpg',
      '/images/still/5.jpg',
    ],
  },
  {
    id: 'inside',
    title: 'inside',
    subtitle: '创意作品时尚杂志作品',
    description: '创意时尚杂志作品，探索视觉艺术的边界。通过独特的构图、光影和色彩，创造具有故事性和艺术感的影像作品。',
    cover: '/images/inside/cover.jpg',
    images: [
      '/images/inside/1.jpg',
      '/images/inside/2.jpg',
      '/images/inside/3.jpg',
      '/images/inside/4.jpg',
      '/images/inside/5.jpg',
    ],
  },
];

// 项目类型定义
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  images: string[];
}

// 首页轮播配置
export const CAROUSEL_CONFIG = {
  // 优先展示 inside 项目图片，不足时补充其他项目
  priorityProject: 'inside',
  // 首页精选展示图片数量
  desktopCount: 8,
  mobileCount: 6,
};
