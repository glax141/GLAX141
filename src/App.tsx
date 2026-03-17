import { useState, useEffect, useRef, useCallback } from 'react';
import { saveImage, getImage, deleteImage, saveConfig, getConfig, compressImage, generateThumbnail } from './db';

// ─────────────────────────────────────────────
// 默认配置（首次加载时使用）
// ─────────────────────────────────────────────

const DEFAULT_CONFIG = {
  heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80',
  about: {
    name: 'GLAX',
    title: '商业 / 时尚摄影师',
    titleEn: 'Commercial & Fashion Photographer',
    avatar: '',
    bio: `GLAX，商业与时尚领域的资深摄影师，拥有超过10年的影像创作经验。

我的镜头语言追求极致与纯粹，在光影的交织中捕捉瞬间的永恒。相信每一帧画面都是情感与故事的载体，用专业视角诠释商业价值，用艺术眼光定格美好瞬间。

曾与众多国际一线品牌合作，作品涵盖时尚大片、产品广告、人像摄影等多个领域。作品见于各大时尚杂志封面及品牌宣传物料。

始终坚持「用光影讲述故事，用镜头传递情感」的创作理念，每一次按下快门都是对美的重新定义。`,
    email: 'glax@example.com',
    instagram: '@glax_photo',
    wechat: 'GLAX141',
  },
  projects: [
    {
      id: 'lookbook',
      title: 'LOOKBOOK',
      titleEn: 'Portrait & Fashion',
      description: '纯粹的人像与服装摄影，探索人与衣物之间的对话关系。每一组造型都是一个故事，每一个瞬间都是永恒的定格。光线与阴影的交织，诠释了服装背后的情感与力量。',
      cover: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      images: [] as string[],
    },
    {
      id: 'stillness',
      title: '静谧',
      titleEn: 'Still Life',
      description: '静物摄影的极致美学——鞋履、服装、包袋、首饰。在极简的构图中发现物件本身的灵魂，让每件产品在镜头下散发出超越商业的艺术气息。',
      cover: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      images: [] as string[],
    },
    {
      id: 'inside',
      title: 'INSIDE',
      titleEn: 'Editorial & Creative',
      description: '创意时尚杂志作品，突破传统视觉边界。以大胆的构图、超现实的场景设计和前卫的美学语言，为高端时尚杂志创作具有冲击力的视觉叙事。',
      cover: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
      images: [] as string[],
    },
  ],
};

type SiteConfig = typeof DEFAULT_CONFIG;
type Project = SiteConfig['projects'][0];

// ─────────────────────────────────────────────
// SVG 图标
// ─────────────────────────────────────────────
const Icon = {
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  Arrow: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Prev: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>,
  Next: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Expand: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  Instagram: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Wechat: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.23c.96.27 1.96.4 3 .4.2 0 .4 0 .6-.02C9.9 15.5 10 14.76 10 14c0-3.31 3.13-6 7-6h.5C16.88 5.67 13.45 4 9.5 4zm-2 3.5a1 1 0 110 2 1 1 0 010-2zm5 0a1 1 0 110 2 1 1 0 010-2zm5 2.5c-3.31 0-6 2.24-6 5s2.69 5 6 5c.95 0 1.85-.21 2.64-.56L22 21l-.77-2.31C22.37 17.74 23 16.43 23 15c0-2.76-2.69-5-6-5zm-2 3a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2z" /></svg>,
};

// ─────────────────────────────────────────────
// 灯箱组件
// ─────────────────────────────────────────────
function Lightbox({ images, index, onClose, onPrev, onNext }: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 text-white/50 hover:text-white transition-colors z-10"
      >
        <Icon.Close />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 p-3 text-white/40 hover:text-white transition-colors z-10"
      >
        <Icon.Prev />
      </button>
      <img
        src={images[index]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 p-3 text-white/40 hover:text-white transition-colors z-10"
      >
        <Icon.Next />
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-sm tracking-widest">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 登录页面
// ─────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'glax141') {
      onLogin();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  // 磁吸效果
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => { btn.style.transform = ''; };
    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-[0.2em] text-white mb-3">GLAX</h1>
          <p className="text-white/30 text-xs tracking-widest">ADMIN PANEL</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="输入密码 Enter Password"
            className={`w-full bg-white/5 border ${shake ? 'border-red-500' : 'border-white/10'} rounded-lg px-5 py-4 text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none transition-all text-sm tracking-wider`}
            autoFocus
          />
          <button
            ref={btnRef}
            type="submit"
            className="w-full bg-white text-black py-4 rounded-lg font-semibold tracking-widest text-sm hover:bg-white/90 transition-all"
            style={{ transition: 'transform 0.1s ease, background 0.2s ease' }}
          >
            进入后台
          </button>
        </form>
        <p className="text-white/20 text-xs text-center mt-8 tracking-wider">
          密码: glax141
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 后台管理面板
// ─────────────────────────────────────────────
function AdminPanel({
  config,
  onClose,
  onSaved,
}: {
  config: SiteConfig;
  onClose: () => void;
  onSaved: (c: SiteConfig) => void;
}) {
  const [cfg, setCfg] = useState<SiteConfig>(JSON.parse(JSON.stringify(config)));
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'about' | 'contact' | string>('home');
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadMsg, setUploadMsg] = useState('');
  const [projectPage, setProjectPage] = useState<{ [id: string]: number }>({});
  const IMGS_PER_PAGE = 10;



  const handleSave = async () => {
    setSaving(true);
    await saveConfig('siteConfig', cfg);
    onSaved(cfg);
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
  };

  // 上传主页大图
  const handleHeroUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading((p) => ({ ...p, hero: true }));
    setUploadMsg('正在压缩主图...');
    try {
      const compressed = await compressImage(files[0], 1920, 0.85);
      await saveImage('hero', compressed);
      setCfg((p) => ({ ...p, heroImage: compressed }));
      setUploadMsg('✓ 主图已更新');
    } catch (e) {
      setUploadMsg('上传失败');
    }
    setUploading((p) => ({ ...p, hero: false }));
    setTimeout(() => setUploadMsg(''), 2000);
  };

  // 上传头像
  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading((p) => ({ ...p, avatar: true }));
    setUploadMsg('正在处理头像...');
    try {
      const compressed = await compressImage(files[0], 800, 0.9);
      await saveImage('avatar', compressed);
      setCfg((p) => ({ ...p, about: { ...p.about, avatar: compressed } }));
      setUploadMsg('✓ 头像已更新');
    } catch (e) {
      setUploadMsg('上传失败');
    }
    setUploading((p) => ({ ...p, avatar: false }));
    setTimeout(() => setUploadMsg(''), 2000);
  };

  // 上传封面
  const handleCoverUpload = async (projectId: string, files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading((p) => ({ ...p, [`cover_${projectId}`]: true }));
    setUploadMsg('正在压缩封面...');
    try {
      const compressed = await compressImage(files[0], 1200, 0.88);
      await saveImage(`cover_${projectId}`, compressed);
      setCfg((p) => ({
        ...p,
        projects: p.projects.map((proj) =>
          proj.id === projectId ? { ...proj, cover: compressed } : proj
        ),
      }));
      setUploadMsg('✓ 封面已更新');
    } catch (e) {
      setUploadMsg('上传失败');
    }
    setUploading((p) => ({ ...p, [`cover_${projectId}`]: false }));
    setTimeout(() => setUploadMsg(''), 2000);
  };

  // 上传项目图片（批量）
  const handleImagesUpload = async (projectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading((p) => ({ ...p, [`imgs_${projectId}`]: true }));

    const fileArr = Array.from(files);
    const newImages: string[] = [];

    for (let i = 0; i < fileArr.length; i++) {
      setUploadMsg(`压缩中 ${i + 1}/${fileArr.length}...`);
      try {
        const compressed = await compressImage(fileArr[i], 1920, 0.85);
        const thumb = await generateThumbnail(compressed, 400);
        const imgId = `${projectId}_${Date.now()}_${i}`;
        // 存原图
        await saveImage(imgId, compressed);
        // 存缩略图（id加_thumb后缀）
        await saveImage(`${imgId}_thumb`, thumb);
        newImages.push(imgId);
      } catch {
        // skip
      }
    }

    if (newImages.length > 0) {
      setCfg((p) => ({
        ...p,
        projects: p.projects.map((proj) =>
          proj.id === projectId
            ? { ...proj, images: [...proj.images, ...newImages] }
            : proj
        ),
      }));
    }

    setUploadMsg(`✓ 已上传 ${newImages.length} 张`);
    setUploading((p) => ({ ...p, [`imgs_${projectId}`]: false }));
    setTimeout(() => setUploadMsg(''), 3000);
  };

  // 删除项目图片
  const handleDeleteImage = async (projectId: string, imgId: string) => {
    await deleteImage(imgId);
    await deleteImage(`${imgId}_thumb`);
    setCfg((p) => ({
      ...p,
      projects: p.projects.map((proj) =>
        proj.id === projectId
          ? { ...proj, images: proj.images.filter((id) => id !== imgId) }
          : proj
      ),
    }));
  };

  const sections = [
    { id: 'home', label: '首页设置' },
    { id: 'about', label: '关于我' },
    { id: 'contact', label: '联系方式' },
    ...cfg.projects.map((p) => ({ id: p.id, label: p.title })),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex overflow-hidden">
      {/* 侧边栏 */}
      <div className="w-52 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <p className="text-white font-black tracking-widest text-lg">GLAX</p>
          <p className="text-white/30 text-xs tracking-wider mt-1">后台管理</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                activeSection === s.id
                  ? 'bg-white text-black font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          {uploadMsg && (
            <p className="text-white/60 text-xs text-center py-1">{uploadMsg}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              savedOk
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {savedOk ? <><Icon.Check /> 已保存</> : saving ? '保存中...' : '保存更改'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-all"
          >
            退出后台
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 space-y-8">

          {/* 首页设置 */}
          {activeSection === 'home' && (
            <div className="space-y-6">
              <h2 className="text-white text-xl font-light tracking-wider">首页设置 <span className="text-white/30 text-sm">Home</span></h2>
              <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                <label className="block text-white/60 text-sm">主页大图</label>
                <div className="flex gap-4 items-start">
                  <div className="w-40 h-28 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    <img src={cfg.heroImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <input
                      type="text"
                      value={cfg.heroImage.startsWith('data:') ? '[本地图片]' : cfg.heroImage}
                      onChange={(e) => setCfg((p) => ({ ...p, heroImage: e.target.value }))}
                      placeholder="图片链接或点击上传"
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white/80 text-sm focus:border-white/40 focus:outline-none"
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg cursor-pointer transition-colors w-fit">
                      <Icon.Upload />
                      {uploading.hero ? '上传中...' : '本地上传大图'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleHeroUpload(e.target.files)} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 关于我 */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <h2 className="text-white text-xl font-light tracking-wider">关于我 <span className="text-white/30 text-sm">About</span></h2>
              <div className="bg-white/5 rounded-2xl p-6 space-y-5">
                {/* 头像 */}
                <div>
                  <label className="block text-white/60 text-sm mb-3">个人头像</label>
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                      {cfg.about.avatar
                        ? <img src={cfg.about.avatar} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">暂无</div>
                      }
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={cfg.about.avatar.startsWith('data:') ? '[本地图片]' : cfg.about.avatar}
                        onChange={(e) => setCfg((p) => ({ ...p, about: { ...p.about, avatar: e.target.value } }))}
                        placeholder="头像链接"
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white/80 text-sm focus:border-white/40 focus:outline-none"
                      />
                      <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg cursor-pointer transition-colors w-fit">
                        <Icon.Upload />
                        {uploading.avatar ? '上传中...' : '上传头像'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e.target.files)} />
                      </label>
                    </div>
                  </div>
                </div>
                {/* 姓名 & 身份 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">姓名</label>
                    <input type="text" value={cfg.about.name}
                      onChange={(e) => setCfg((p) => ({ ...p, about: { ...p.about, name: e.target.value } }))}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">身份（中文）</label>
                    <input type="text" value={cfg.about.title}
                      onChange={(e) => setCfg((p) => ({ ...p, about: { ...p.about, title: e.target.value } }))}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none" />
                  </div>
                </div>
                {/* 简介 */}
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">个人简介</label>
                  <textarea value={cfg.about.bio} rows={8}
                    onChange={(e) => setCfg((p) => ({ ...p, about: { ...p.about, bio: e.target.value } }))}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none resize-none leading-relaxed" />
                </div>
              </div>
            </div>
          )}

          {/* 联系方式 */}
          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-white text-xl font-light tracking-wider">联系方式 <span className="text-white/30 text-sm">Contact</span></h2>
              <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                {[
                  { label: '邮箱 Email', key: 'email' as const, placeholder: 'your@email.com' },
                  { label: 'Instagram', key: 'instagram' as const, placeholder: '@username' },
                  { label: '微信 WeChat', key: 'wechat' as const, placeholder: '微信号' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-white/60 text-xs mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      value={cfg.about[field.key]}
                      onChange={(e) => setCfg((p) => ({ ...p, about: { ...p.about, [field.key]: e.target.value } }))}
                      placeholder={field.placeholder}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 项目管理 */}
          {cfg.projects.map((project) => activeSection === project.id && (
            <div key={project.id} className="space-y-6">
              <h2 className="text-white text-xl font-light tracking-wider">
                {project.title} <span className="text-white/30 text-sm">{project.titleEn}</span>
              </h2>

              {/* 项目基本信息 */}
              <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">项目名称（中文）</label>
                    <input type="text" value={project.title}
                      onChange={(e) => setCfg((p) => ({ ...p, projects: p.projects.map((pr) => pr.id === project.id ? { ...pr, title: e.target.value } : pr) }))}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">项目名称（英文）</label>
                    <input type="text" value={project.titleEn}
                      onChange={(e) => setCfg((p) => ({ ...p, projects: p.projects.map((pr) => pr.id === project.id ? { ...pr, titleEn: e.target.value } : pr) }))}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">项目描述</label>
                  <textarea value={project.description} rows={4}
                    onChange={(e) => setCfg((p) => ({ ...p, projects: p.projects.map((pr) => pr.id === project.id ? { ...pr, description: e.target.value } : pr) }))}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/40 focus:outline-none resize-none" />
                </div>
              </div>

              {/* 封面 */}
              <div className="bg-white/5 rounded-2xl p-6">
                <label className="block text-white/60 text-sm mb-4">项目封面</label>
                <div className="flex gap-4 items-start">
                  <div className="w-36 h-48 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    {project.cover && <img src={project.cover} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={project.cover.startsWith('data:') ? '[本地图片]' : project.cover}
                      onChange={(e) => setCfg((p) => ({ ...p, projects: p.projects.map((pr) => pr.id === project.id ? { ...pr, cover: e.target.value } : pr) }))}
                      placeholder="封面链接"
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white/80 text-sm focus:border-white/40 focus:outline-none min-w-[240px]"
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg cursor-pointer transition-colors w-fit">
                      <Icon.Upload />
                      {uploading[`cover_${project.id}`] ? '上传中...' : '上传封面'}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleCoverUpload(project.id, e.target.files)} />
                    </label>
                  </div>
                </div>
              </div>

              {/* 项目图片 */}
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-white/60 text-sm">项目图片</label>
                    <span className="text-white/30 text-xs ml-2">共 {project.images.length} 张</span>
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg cursor-pointer transition-colors">
                    <Icon.Upload />
                    {uploading[`imgs_${project.id}`] ? uploadMsg || '上传中...' : '批量上传图片'}
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => handleImagesUpload(project.id, e.target.files)} />
                  </label>
                </div>

                {/* 分页缩略图 */}
                <AdminImageGrid
                  project={project}
                  page={projectPage[project.id] || 1}
                  perPage={IMGS_PER_PAGE}
                  onDelete={(imgId) => handleDeleteImage(project.id, imgId)}
                  onPageChange={(pg) => setProjectPage((p) => ({ ...p, [project.id]: pg }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 后台图片网格（带懒加载 IndexedDB）
function AdminImageGrid({
  project, page, perPage, onDelete, onPageChange,
}: {
  project: Project;
  page: number;
  perPage: number;
  onDelete: (id: string) => void;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(project.images.length / perPage);
  const pageIds = project.images.slice((page - 1) * perPage, page * perPage);
  const [thumbs, setThumbs] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result: { [id: string]: string } = {};
      for (const id of pageIds) {
        if (cancelled) return;
        const thumb = await getImage(`${id}_thumb`);
        const full = thumb || await getImage(id);
        if (full) result[id] = full;
      }
      if (!cancelled) setThumbs(result);
    };
    load();
    return () => { cancelled = true; };
  }, [pageIds.join(',')]);

  if (project.images.length === 0) {
    return (
      <div className="text-center py-12 text-white/20 text-sm">
        暂无图片，请点击上方"批量上传图片"按钮上传
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {pageIds.map((imgId) => (
          <div key={imgId} className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden">
            {thumbs[imgId]
              ? <img src={thumbs[imgId]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
            }
            <button
              onClick={() => onDelete(imgId)}
              className="absolute top-1.5 right-1.5 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon.Trash />
            </button>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-white/50 hover:text-white disabled:opacity-20 transition-colors text-sm">
            ← 上页
          </button>
          <span className="text-white/40 text-sm">{page} / {totalPages}</span>
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-white/50 hover:text-white disabled:opacity-20 transition-colors text-sm">
            下页 →
          </button>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// 首页
// ─────────────────────────────────────────────
function HomePage({ config, onNav }: { config: SiteConfig; onNav: (page: string) => void }) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [carouselImgs, setCarouselImgs] = useState<string[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ imgs: string[]; idx: number } | null>(null);
  const lookbook = config.projects.find((p) => p.id === 'lookbook');

  // 加载 lookbook 图片
  useEffect(() => {
    if (!lookbook || lookbook.images.length === 0) return;
    let cancelled = false;
    const load = async () => {
      const imgs: string[] = [];
      for (const id of lookbook.images.slice(0, 20)) {
        if (cancelled) break;
        const thumb = await getImage(`${id}_thumb`);
        const src = thumb || await getImage(id);
        if (src) imgs.push(src);
      }
      if (!cancelled) setCarouselImgs(imgs);
    };
    load();
    return () => { cancelled = true; };
  }, [lookbook?.images.join(',')]);

  // 自动轮播
  useEffect(() => {
    if (carouselImgs.length === 0) return;
    const t = setInterval(() => setCarouselIdx((i) => (i + 1) % carouselImgs.length), 3000);
    return () => clearInterval(t);
  }, [carouselImgs.length]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={config.heroImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
        </div>
        {/* 巨大背景字 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-white font-black tracking-[0.15em] leading-none"
            style={{ fontSize: 'clamp(120px, 22vw, 320px)', opacity: 0.08 }}
          >
            GLAX
          </span>
        </div>
        {/* 中央文字 */}
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-white font-black tracking-[0.2em] mb-5 leading-none"
            style={{ fontSize: 'clamp(64px, 12vw, 160px)' }}
          >
            GLAX
          </h1>
          <p className="text-white/70 tracking-[0.25em] text-sm md:text-base mb-2">
            {config.about.title}
          </p>
          <p className="text-white/30 tracking-widest text-xs">
            {config.about.titleEn}
          </p>
        </div>
        {/* 向下箭头 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <Icon.Arrow />
        </div>
      </section>

      {/* 滚动展示 */}
      <section className="py-24 overflow-hidden bg-gradient-to-b from-black via-[#0d0d0d] to-black">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-white/90">最新作品</h2>
          <p className="text-white/30 text-xs tracking-widest mt-1">LOOKBOOK · Latest Works</p>
        </div>

        {carouselImgs.length > 0 ? (
          <>
            <div className="flex gap-4 px-6 overflow-hidden" style={{ cursor: 'grab' }}>
              {carouselImgs.map((src, i) => {
                const offset = i - carouselIdx;
                const isCenter = offset === 0;
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      width: 'clamp(200px, 22vw, 300px)',
                      height: 'clamp(280px, 30vw, 400px)',
                      transform: isCenter ? 'scale(1.08) translateY(-12px)' : `scale(0.88) translateY(${Math.abs(offset) * 4}px)`,
                      opacity: isCenter ? 1 : hoveredIdx === null ? 0.45 : hoveredIdx === i ? 0.9 : 0.25,
                      filter: isCenter ? 'blur(0px)' : hoveredIdx === i ? 'blur(0px)' : 'blur(1.5px)',
                      transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
                      zIndex: isCenter ? 10 : 1,
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setLightbox({ imgs: carouselImgs, idx: i })}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
            {/* 指示器 */}
            <div className="flex justify-center gap-2 mt-8">
              {carouselImgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIdx(i)}
                  className={`h-0.5 rounded-full transition-all duration-500 ${i === carouselIdx ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-white/20 text-sm">
            <p>在后台上传 LOOKBOOK 项目的图片后，将在此展示</p>
            <button onClick={() => onNav('portfolio')} className="mt-4 text-white/40 hover:text-white/60 underline text-xs transition-colors">
              查看作品集
            </button>
          </div>
        )}
      </section>

      {/* 快捷入口 */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <button
            onClick={() => onNav('portfolio')}
            className="group inline-flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm tracking-widest"
          >
            查看全部作品集
            <span className="text-xs opacity-60">Portfolio</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </section>

      {lightbox && (
        <Lightbox
          images={lightbox.imgs}
          index={lightbox.idx}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((l) => l && { ...l, idx: (l.idx - 1 + l.imgs.length) % l.imgs.length })}
          onNext={() => setLightbox((l) => l && { ...l, idx: (l.idx + 1) % l.imgs.length })}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 作品集页面
// ─────────────────────────────────────────────
function PortfolioPage({ config }: { config: SiteConfig }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-extralight tracking-[0.2em] text-white/90 mb-3">作品集</h1>
          <p className="text-white/30 text-xs tracking-[0.3em]">PORTFOLIO</p>
        </header>

        {/* 不对称网格 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {config.projects.map((project, idx) => {
            const isHovered = hoveredId === project.id;
            const isBlurred = hoveredId !== null && !isHovered;
            const spans = idx === 0 ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : 'md:col-span-12';
            const aspectClass = idx === 2 ? 'aspect-[21/9]' : 'aspect-[3/4]';

            return (
              <div
                key={project.id}
                className={`${spans} group cursor-pointer`}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedProject(project)}
                style={{
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  filter: isBlurred ? 'blur(2px) brightness(0.6)' : 'blur(0) brightness(1)',
                  transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div className={`relative ${aspectClass} rounded-2xl overflow-hidden bg-white/5`}>
                  <img
                    src={project.cover}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-white/50 text-xs tracking-wider">
                      <Icon.Expand />
                      <span>查看全部 · {project.images.length} 张作品</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 px-1">
                  <h3 className="text-white text-2xl font-extralight tracking-[0.1em] group-hover:opacity-70 transition-opacity">
                    {project.title}
                  </h3>
                  <p className="text-white/30 text-xs tracking-widest mt-1">{project.titleEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

// 项目详情弹窗
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'gallery'>('info');
  const [page, setPage] = useState(1);
  const [thumbs, setThumbs] = useState<{ [id: string]: string }>({});
  const [lightbox, setLightbox] = useState<{ allImgs: string[]; idx: number } | null>(null);

  const PER_PAGE = 10;
  const totalPages = Math.ceil(project.images.length / PER_PAGE);
  const pageIds = project.images.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !lightbox) onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose, lightbox]);

  // 加载缩略图
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result: { [id: string]: string } = {};
      for (const id of pageIds) {
        if (cancelled) return;
        const thumb = await getImage(`${id}_thumb`);
        const full = thumb || await getImage(id);
        if (full) result[id] = full;
      }
      if (!cancelled) setThumbs((p) => ({ ...p, ...result }));
    };
    load();
    return () => { cancelled = true; };
  }, [pageIds.join(',')]);

  // 打开灯箱时加载全图
  const openLightbox = async (clickedId: string) => {
    const imgs: string[] = [];
    for (const id of project.images) {
      const src = await getImage(id);
      imgs.push(src || '');
    }
    const globalIdx = project.images.indexOf(clickedId);
    setLightbox({ allImgs: imgs, idx: globalIdx });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/98 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-md z-10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-extralight tracking-[0.15em]">{project.title}</h2>
              <p className="text-white/30 text-xs tracking-widest mt-0.5">{project.titleEn}</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors"><Icon.Close /></button>
          </div>
          <div className="max-w-7xl mx-auto px-6 flex gap-8 border-t border-white/5">
            {(['info', 'gallery'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-4 pt-3 text-sm tracking-widest transition-colors ${tab === t ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>
                {t === 'info' ? '项目介绍' : `全部作品 (${project.images.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {tab === 'info' ? (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden">
                <img src={project.cover} alt={project.title} className="w-full object-cover" />
              </div>
              <div>
                <p className="text-white/70 leading-relaxed text-base">{project.description}</p>
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-white/30 text-sm">共 {project.images.length} 张作品</p>
                  <button onClick={() => setTab('gallery')}
                    className="mt-4 text-white/50 hover:text-white text-sm tracking-wider transition-colors underline underline-offset-4">
                    查看全部图片 →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {project.images.length === 0 ? (
                <div className="text-center py-24 text-white/20 text-sm">暂无图片</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {pageIds.map((imgId) => (
                      <div
                        key={imgId}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer group bg-white/5 relative"
                        onClick={() => openLightbox(imgId)}
                      >
                        {thumbs[imgId]
                          ? <img src={thumbs[imgId]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          : <div className="w-full h-full flex items-center justify-center"><div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
                        }
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon.Expand />
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-8">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                        className="text-white/40 hover:text-white disabled:opacity-20 transition-colors text-sm tracking-wider">
                        ← 上一页
                      </button>
                      <span className="text-white/30 text-sm">{page} / {totalPages}</span>
                      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="text-white/40 hover:text-white disabled:opacity-20 transition-colors text-sm tracking-wider">
                        下一页 →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.allImgs}
          index={lightbox.idx}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((l) => l && { ...l, idx: (l.idx - 1 + l.allImgs.length) % l.allImgs.length })}
          onNext={() => setLightbox((l) => l && { ...l, idx: (l.idx + 1) % l.allImgs.length })}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// 关于我页面
// ─────────────────────────────────────────────
function AboutPage({ config }: { config: SiteConfig }) {
  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-extralight tracking-[0.2em] text-white/90 mb-3">关于我</h1>
          <p className="text-white/30 text-xs tracking-[0.3em]">ABOUT ME</p>
        </header>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* 头像 */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5">
              {config.about.avatar
                ? <img src={config.about.avatar} alt={config.about.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">上传头像</div>
              }
            </div>
            {/* 装饰 */}
            <div className="absolute -bottom-6 -right-6 w-28 h-28 border border-white/10 rounded-full flex flex-col items-center justify-center">
              <span className="text-white/20 text-xs tracking-wider">Since</span>
              <span className="text-white text-2xl font-extralight">2014</span>
            </div>
          </div>

          {/* 简介 */}
          <div className="pt-4">
            <h2 className="text-5xl font-extralight tracking-[0.15em] text-white mb-2">{config.about.name}</h2>
            <p className="text-white/40 text-sm tracking-widest mb-10">{config.about.titleEn}</p>

            <div className="space-y-5">
              {config.about.bio.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-white/65 leading-relaxed text-sm md:text-base">{p}</p>
              ))}
            </div>

            {/* 数据 */}
            <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10">
              {[['10+', '年经验', 'Years'], ['200+', '合作客户', 'Clients'], ['500+', '作品数量', 'Works']].map(([num, label, en]) => (
                <div key={label} className="text-center md:text-left">
                  <p className="text-4xl font-thin text-white tracking-wider">{num}</p>
                  <p className="text-white/40 text-xs mt-1">{label}</p>
                  <p className="text-white/20 text-xs">{en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 联系页面
// ─────────────────────────────────────────────
function ContactPage({ config }: { config: SiteConfig }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  // 磁吸
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => { btn.style.transform = ''; };
    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-extralight tracking-[0.2em] text-white/90 mb-3">联系方式</h1>
          <p className="text-white/30 text-xs tracking-[0.3em]">CONTACT</p>
        </header>

        <div className="grid md:grid-cols-2 gap-16">
          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: '姓名', key: 'name', type: 'text', placeholder: '您的姓名' },
              { label: '邮箱', key: 'email', type: 'email', placeholder: 'your@email.com' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-white/40 text-xs tracking-widest mb-2">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as 'name' | 'email']}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  required
                  placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white/90 placeholder:text-white/20 text-sm focus:border-white/30 focus:outline-none transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-white/40 text-xs tracking-widest mb-2">留言</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                required rows={5}
                placeholder="请输入您的留言..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white/90 placeholder:text-white/20 text-sm focus:border-white/30 focus:outline-none transition-colors resize-none"
              />
            </div>
            <button
              ref={btnRef}
              type="submit"
              className={`w-full py-4 rounded-xl font-medium tracking-widest text-sm transition-all ${sent ? 'bg-green-500/20 text-green-400' : 'bg-white text-black hover:bg-white/90'}`}
              style={{ transition: 'transform 0.1s ease, background 0.2s ease' }}
            >
              {sent ? '✓ 发送成功 Sent!' : '发送消息 Send'}
            </button>
          </form>

          {/* 联系信息 */}
          <div className="space-y-10">
            <div>
              <h3 className="text-white text-xl font-extralight tracking-wider mb-3">保持联系</h3>
              <p className="text-white/30 text-xs tracking-wider">Get In Touch</p>
              <p className="text-white/50 text-sm leading-relaxed mt-4">
                如有商业合作意向、作品购买或摄影定制需求，欢迎通过以下方式联系我。
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: <Icon.Mail />,
                  label: '邮箱 Email',
                  value: config.about.email,
                  href: `mailto:${config.about.email}`,
                },
                {
                  icon: <Icon.Instagram />,
                  label: 'Instagram',
                  value: config.about.instagram,
                  href: `https://instagram.com/${config.about.instagram.replace('@', '')}`,
                },
                {
                  icon: <Icon.Wechat />,
                  label: '微信 WeChat',
                  value: config.about.wechat,
                  href: undefined,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                  onClick={() => item.href && window.open(item.href, '_blank')}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors text-white/60">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white/30 text-xs tracking-wider">{item.label}</p>
                    <p className="text-white/80 text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 主应用
// ─────────────────────────────────────────────
export default function App() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // 检查 URL hash → admin
  useEffect(() => {
    if (window.location.hash === '#admin') setShowLogin(true);
  }, []);

  // 加载配置（IndexedDB）
  useEffect(() => {
    const load = async () => {
      const saved = await getConfig<SiteConfig | null>('siteConfig', null);
      setConfig(saved || DEFAULT_CONFIG);
      setLoading(false);
    };
    load();
  }, []);

  const handleLogin = () => { setShowLogin(false); setShowAdmin(true); };
  const handleAdminClose = () => { setShowAdmin(false); window.history.replaceState(null, '', window.location.pathname); };
  const handleAdminSaved = useCallback((c: SiteConfig) => setConfig(c), []);

  const navItems = [
    { id: 'home', label: '首页', en: 'Home' },
    { id: 'portfolio', label: '作品集', en: 'Portfolio' },
    { id: 'about', label: '关于我', en: 'About' },
    { id: 'contact', label: '联系方式', en: 'Contact' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border border-white/20 border-t-white rounded-full animate-spin mx-auto mb-5" />
          <p className="text-white/30 text-xs tracking-widest">LOADING</p>
        </div>
      </div>
    );
  }

  if (showLogin) return <LoginPage onLogin={handleLogin} />;
  if (showAdmin && config) return <AdminPanel config={config} onClose={handleAdminClose} onSaved={handleAdminSaved} />;

  const cfg = config!;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setPage('home')}
            className="text-xl font-black tracking-[0.25em] text-white hover:opacity-60 transition-opacity"
          >
            GLAX
          </button>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="group relative text-center"
              >
                <span className={`block text-sm transition-colors ${page === item.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                  {item.label}
                </span>
                <span className="block text-[10px] text-white/20 group-hover:text-white/30 transition-colors tracking-wider">
                  {item.en}
                </span>
                {page === item.id && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-white/60" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Admin 入口 */}
            <button
              onClick={() => setShowLogin(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 rounded-lg text-white/25 hover:text-white/50 transition-all text-xs tracking-widest"
            >
              <Icon.Lock />
              ADMIN
            </button>

            {/* 移动端菜单 */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/60">
              {mobileOpen ? <Icon.Close /> : <Icon.Menu />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileOpen && (
          <div className="md:hidden bg-black/97 border-t border-white/10">
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileOpen(false); }}
                  className={`block w-full text-left py-2 text-sm transition-colors ${page === item.id ? 'text-white' : 'text-white/40'}`}
                >
                  {item.label} <span className="text-white/20 text-xs ml-1">{item.en}</span>
                </button>
              ))}
              <button
                onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                className="flex items-center gap-1.5 text-white/25 text-xs tracking-widest py-2"
              >
                <Icon.Lock /> ADMIN
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 页面内容 */}
      {page === 'home' && <HomePage config={cfg} onNav={setPage} />}
      {page === 'portfolio' && <PortfolioPage config={cfg} />}
      {page === 'about' && <AboutPage config={cfg} />}
      {page === 'contact' && <ContactPage config={cfg} />}

      {/* 页脚 */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs tracking-widest">
            © {new Date().getFullYear()} GLAX. All rights reserved.
          </p>
          <p className="text-white/10 text-xs tracking-wider">商业 / 时尚摄影 · Commercial & Fashion Photography</p>
        </div>
      </footer>
    </div>
  );
}
