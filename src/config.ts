/**
 * GLAX 摄影作品集 - 配置文件
 * 最后更新: 2026/3/17 17:15:52
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
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738377248_l0o58.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738383191_q4y12.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738396769_oybfe.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738405540_6e81k.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738407863_4agrd.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738419162_i9ixg.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738429260_v7w2b.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738435329_xxuih.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738441272_0oyau.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738451773_uob9f.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738461982_w6gmc.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738470451_j64wh.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738481353_pwthw.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738491466_ttbi9.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738500653_yqh5x.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738506551_gc65a.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738517297_b74v3.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738524138_rwxe4.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738537563_qgxb9.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738540909_fe30t.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738546584_eda6g.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738550084_e1d4s.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738555600_f5soh.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738557604_zj7gv.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738562091_mlrjo.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738568081_oe0gs.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738572243_st6lf.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738586094_r9x2o.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738595829_svhoh.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738606021_maz8u.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738617960_vvqwx.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738633933_gdt23.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738638777_06x01.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738642987_ngff4.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738648291_7xxao.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738656723_tfddk.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738664752_48hn6.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738677087_4yj92.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738687701_soudl.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738694575_zazhg.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738699507_o44r9.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738704903_h6b9r.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738712898_cvsr2.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738720702_tve2j.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738730383_t2549.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738738379_ecujr.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738747725_v6ick.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738758582_t8s3y.jpg',
      'https://cdn.jsdelivr.net/gh/glax141/GLAX141@main/public/images/still/1773738764326_4cn4j.jpg',
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
