/**
 * GLAX 摄影作品集 - 配置文件
 * 最后更新: 2026/3/17 17:05:14
 */

export const HOME_CONFIG = {
  heroImage: 'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/hero/1773737900844_g53ef.jpg',
};

export const ABOUT_CONFIG = {
  name: 'GLAX',
  title: '商业 / 时尚摄影师',
  titleEn: 'Commercial & Fashion Photographer',
  avatar: 'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/avatar/1773738288058_j8ehc.jpg',
  bio: `GLAX，商业与时尚领域的资深摄影师，拥有超过5年的影像创作经验。

我的镜头语言追求极致与纯粹，在光影的交织中捕捉瞬间的永恒。相信每一帧画面都是情感与故事的载体，用专业视角诠释商业价值，用艺术眼光定格美好瞬间。

曾与众多国际品牌合作，作品涵盖时尚大片、产品广告、人像摄影等多个领域。始终坚持「用光影讲述故事，用镜头传递情感」的创作理念，将商业需求与艺术表达完美融合，为每一位客户呈现独特而深刻的视觉体验。`,
  email: '1281956497@qq.com',
  instagram: 'glax141',
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
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738009566_ro49x.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738016425_29d0o.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738023245_ia4c4.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738029190_ht15e.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738037063_qk5xh.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738046163_2s0je.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738052673_ryalm.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738058334_io5y5.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738061474_ox8zr.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738065970_txzp0.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/lookbook/1773738074360_bv79b.jpg',
    ],
  },
  {
    id: 'still',
    title: '静谧',
    titleEn: 'Still Life',
    description: '静物摄影，专注于产品之美。在这个系列中，每一件物品都被赋予生命——精致的鞋子、优雅的服装、闪耀的首饰。我追求的是让观者感受到物品的温度与质感。',
    descriptionEn: 'Still life photography, focusing on the beauty of products — shoes, clothing, jewelry.',
    cover: 'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738033352_m5rx0.jpg',
    images: [
      '',
      '',
      '',
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
