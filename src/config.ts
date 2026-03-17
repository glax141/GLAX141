/**
 * GLAX 摄影作品集 - 配置文件
 * 最后更新: 2026/3/17 16:54:59
 */

export const HOME_CONFIG = {
  heroImage: 'https://raw.githubusercontent.com/glax141/glax/refs/heads/main/glax-hero.jpg',
};

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

export interface Project {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  cover: string;
  images: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 'lookbook',
    title: 'LOOKBOOK',
    titleEn: 'Portrait & Fashion',
    description: '纯粹人像与服装摄影，捕捉时尚的本质与灵魂。在这个系列中，我探索人与服装之间的关系，用镜头讲述每一个穿着背后的故事。光线、构图、情绪——一切都在瞬间定格。',
    descriptionEn: 'Pure portrait and fashion photography, capturing the essence and soul of style.',
    cover: 'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773737640537_ymxuh.jpg',
    images: [

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
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 'inside',
    title: 'inside',
    titleEn: 'Fashion Editorial',
    description: '创意时尚杂志作品，打破常规边界。这个系列是与顶级时尚杂志的合作成果，探索先锋设计与传统美学的碰撞融合。每一次拍摄都是一场视觉革命。',
    descriptionEn: 'Creative fashion editorial works, breaking conventional boundaries.',
    cover: 'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/inside/1773737677447_jivvf.jpg',
    images: [

    ],
  }
];

export const STATS = [
  { value: '10+', label: '年经验', labelEn: 'Years' },
  { value: '200+', label: '合作客户', labelEn: 'Clients' },
  { value: '500+', label: '作品数量', labelEn: 'Works' },
];

export const ADMIN_PASSWORD_HASH = 'a31e84082e81e1499d0ab37bb2a9e612f97b646a6881e0b6e3563e181e3e87f6';

export const GIST_CONFIG = {
  publicGistId: '',
  enabled: true,
};
