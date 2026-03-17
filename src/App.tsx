import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HOME_CONFIG,
  ABOUT_CONFIG,
  PROJECTS,
  STATS,
  ADMIN_PASSWORD,
  type Project,
} from './config';

// ============================================
// 图标组件
// ============================================
const I = {
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Arrow: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Left: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Right: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Zoom: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  IG: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  WeChat: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66l-.7 2.1 2.46-1.27c.78.22 1.6.34 2.46.34.3 0 .6-.02.89-.05C10.28 13.57 12.6 12 15.5 12c.32 0 .63.02.94.06C16.12 8.58 13.14 4 9.5 4zm-2.7 4.5a.9.9 0 110-1.8.9.9 0 010 1.8zm5.4 0a.9.9 0 110-1.8.9.9 0 010 1.8zM22 16.5c0-2.49-2.69-4.5-6-4.5s-6 2.01-6 4.5 2.69 4.5 6 4.5c.68 0 1.34-.09 1.95-.26l1.83.96-.52-1.56C20.93 19.35 22 18.02 22 16.5zm-7.5-.75a.75.75 0 110-1.5.75.75 0 010 1.5zm3 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  ),
};

// ============================================
// 灯箱（全屏查看图片）
// ============================================
function Lightbox({ images, index, onClose, onChange }: {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChange(index === 0 ? images.length - 1 : index - 1);
      if (e.key === 'ArrowRight') onChange(index === images.length - 1 ? 0 : index + 1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [images, index, onClose, onChange]);

  // 触摸滑动支持
  const touchStart = useRef(0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none">
      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-3 text-white/50 hover:text-white transition-colors">
        <I.Close />
      </button>
      <button onClick={() => onChange(index === 0 ? images.length - 1 : index - 1)} className="absolute left-2 md:left-6 z-10 p-3 text-white/40 hover:text-white transition-colors">
        <I.Left />
      </button>
      <button onClick={() => onChange(index === images.length - 1 ? 0 : index + 1)} className="absolute right-2 md:right-6 z-10 p-3 text-white/40 hover:text-white transition-colors">
        <I.Right />
      </button>
      <div
        className="w-full h-full flex items-center justify-center px-12 md:px-20"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 60) {
            onChange(diff > 0
              ? (index === images.length - 1 ? 0 : index + 1)
              : (index === 0 ? images.length - 1 : index - 1)
            );
          }
        }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <img
          src={images[index]}
          alt=""
          className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm tracking-wider">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

// ============================================
// 项目详情弹窗
// ============================================
function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'gallery'>('info');
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const perPage = 10;
  const totalPages = Math.ceil(project.images.length / perPage);
  const pageImages = project.images.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
        {/* 顶栏 */}
        <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-extralight tracking-[0.2em]">{project.title}</h2>
              <p className="text-white/30 text-xs mt-1 tracking-wider">{project.titleEn}</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <I.Close />
            </button>
          </div>
          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            {(['info', 'gallery'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`pb-3 text-sm tracking-wider transition-all ${tab === t ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}
              >
                {t === 'info' ? '项目介绍' : `全部作品 (${project.images.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {tab === 'info' ? (
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="aspect-[3/4] rounded-lg overflow-hidden">
                <img src={project.cover} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-extralight tracking-wider mb-2">{project.title}</h3>
                <p className="text-white/30 text-sm mb-8">{project.titleEn}</p>
                <p className="text-white/60 leading-[1.8] whitespace-pre-line">{project.description}</p>
                <p className="text-white/20 text-xs mt-4 leading-relaxed italic">{project.descriptionEn}</p>
                <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-white/30 text-sm">共 {project.images.length} 张作品</span>
                  <button onClick={() => setTab('gallery')} className="text-sm text-white/50 hover:text-white transition-colors tracking-wider">
                    查看全部 →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {pageImages.map((img, i) => {
                  const globalI = (page - 1) * perPage + i;
                  return (
                    <div
                      key={globalI}
                      className="relative aspect-square cursor-pointer overflow-hidden rounded-sm group"
                      onMouseEnter={() => setHoveredImg(i)}
                      onMouseLeave={() => setHoveredImg(null)}
                      onClick={() => setLightbox(globalI)}
                      style={{
                        transform: hoveredImg === i ? 'translateY(-6px) scale(1.03)' : 'scale(1)',
                        filter: hoveredImg !== null && hoveredImg !== i ? 'blur(2px) brightness(0.5)' : 'none',
                        transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <I.Zoom />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white/60 text-xs">{globalI + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-10">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-white/40 hover:text-white disabled:opacity-20 transition-all">
                    <I.Left />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-full text-xs transition-all ${page === i + 1 ? 'bg-white text-black' : 'text-white/30 hover:text-white/60'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-white/40 hover:text-white disabled:opacity-20 transition-all">
                    <I.Right />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox
          images={project.images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </>
  );
}

// ============================================
// 磁吸按钮
// ============================================
function MagnetButton({ children, className = '', onClick, type = 'button' }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      setStyle({ transform: `translate(${x * 0.25}px, ${y * 0.25}px)` });
    };
    const onLeave = () => setStyle({ transform: 'translate(0,0)' });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <button ref={ref} type={type} onClick={onClick} className={className} style={{ ...style, transition: 'transform 0.15s ease-out' }}>
      {children}
    </button>
  );
}

// ============================================
// 后台管理面板
// ============================================
function AdminPanel({ onClose }: { onClose: () => void }) {
  const [about, setAbout] = useState({ ...ABOUT_CONFIG });
  const [home, setHome] = useState({ ...HOME_CONFIG });
  const [projects, setProjects] = useState(PROJECTS.map((p) => ({ ...p, images: [...p.images] })));
  const [copied, setCopied] = useState(false);

  const generateConfig = () => {
    const imgArr = (arr: string[]) => arr.map((u) => `      '${u}',`).join('\n');
    const projStr = projects.map((p) => `  {
    id: '${p.id}',
    title: '${p.title}',
    titleEn: '${p.titleEn}',
    description: '${p.description.replace(/'/g, "\\'")}',
    descriptionEn: '${p.descriptionEn.replace(/'/g, "\\'")}',
    cover: '${p.cover}',
    images: [
${imgArr(p.images)}
    ],
  },`).join('\n');

    return `/**
 * GLAX 摄影作品集 - 配置文件
 * 最后更新: ${new Date().toLocaleString('zh-CN')}
 */

export const HOME_CONFIG = {
  heroImage: '${home.heroImage}',
};

export const ABOUT_CONFIG = {
  name: '${about.name}',
  title: '${about.title}',
  titleEn: '${about.titleEn}',
  avatar: '${about.avatar}',
  bio: \`${about.bio}\`,
  email: '${about.email}',
  instagram: '${about.instagram}',
  wechat: '${about.wechat}',
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
${projStr}
];

export const STATS = [
  { value: '10+', label: '年经验', labelEn: 'Years' },
  { value: '200+', label: '合作客户', labelEn: 'Clients' },
  { value: '500+', label: '作品数量', labelEn: 'Works' },
];

export const ADMIN_PASSWORD = '${ADMIN_PASSWORD}';
`;
  };

  const handleDownload = () => {
    const content = generateConfig();
    const blob = new Blob([content], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateConfig());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateProject = (id: string, field: string, value: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const addImageUrl = (id: string) => {
    const url = prompt('请输入图片链接 URL:');
    if (url) {
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, images: [...p.images, url] } : p));
    }
  };

  const removeImage = (id: string, idx: number) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, images: p.images.filter((_, i) => i !== idx) } : p));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-light tracking-[0.15em]">
              后台管理 <span className="text-white/30 text-xs ml-2">Admin Panel</span>
            </h2>
            <p className="text-white/30 text-xs mt-1">修改后点击「下载配置文件」，替换项目中的 src/config.ts 后推送到 GitHub 即可</p>
          </div>
          <div className="flex items-center gap-3">
            <MagnetButton onClick={handleCopy} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {copied ? '✓ 已复制' : '复制配置'}
            </MagnetButton>
            <MagnetButton onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-white/90">
              <I.Download /> 下载 config.ts
            </MagnetButton>
            <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm transition-colors">
              <I.Logout /> 退出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-10 pb-24">
        {/* 使用说明 */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-blue-400 font-medium mb-3">📖 使用说明</h3>
          <ol className="text-blue-300/70 text-sm space-y-2 list-decimal list-inside">
            <li>在下方编辑您的内容和图片链接</li>
            <li>图片推荐上传到 GitHub 仓库，使用 jsDelivr CDN 链接：<code className="bg-blue-500/20 px-1 rounded text-xs">https://cdn.jsdelivr.net/gh/用户名/仓库@main/图片.jpg</code></li>
            <li>也可使用 imgbb.com 等免费图床获取链接</li>
            <li>编辑完成后，点击「下载 config.ts」</li>
            <li>用下载的文件替换项目中的 <code className="bg-blue-500/20 px-1 rounded text-xs">src/config.ts</code></li>
            <li>推送到 GitHub，网站会自动更新</li>
          </ol>
        </div>

        {/* 首页设置 */}
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-white text-lg font-light tracking-wider mb-6">首页设置 <span className="text-white/30 text-xs">Home</span></h3>
          <div>
            <label className="block text-white/50 text-xs mb-2 tracking-wider">主页大图 URL</label>
            <input
              type="text"
              value={home.heroImage}
              onChange={(e) => setHome({ ...home, heroImage: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
            />
            {home.heroImage && (
              <img src={home.heroImage} alt="" className="mt-3 h-32 rounded-lg object-cover" />
            )}
          </div>
        </section>

        {/* 关于我 */}
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-white text-lg font-light tracking-wider mb-6">关于我 <span className="text-white/30 text-xs">About</span></h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {([
                ['name', '姓名', about.name],
                ['title', '身份', about.title],
                ['titleEn', '身份(英)', about.titleEn],
                ['avatar', '头像 URL', about.avatar],
                ['email', '邮箱', about.email],
                ['instagram', 'Instagram', about.instagram],
                ['wechat', '微信', about.wechat],
              ] as const).map(([key, label, val]) => (
                <div key={key}>
                  <label className="block text-white/50 text-xs mb-1 tracking-wider">{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setAbout({ ...about, [key]: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1 tracking-wider">个人简介</label>
              <textarea
                value={about.bio}
                onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                rows={12}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-white/30 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* 项目管理 */}
        {projects.map((project) => (
          <section key={project.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-light tracking-wider">
                {project.title} <span className="text-white/30 text-xs">{project.titleEn}</span>
              </h3>
              <span className="text-white/30 text-xs">{project.images.length} 张</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1">项目标题</label>
                  <input type="text" value={project.title} onChange={(e) => updateProject(project.id, 'title', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">封面图 URL</label>
                  <input type="text" value={project.cover} onChange={(e) => updateProject(project.id, 'cover', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/30 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1">项目描述</label>
                <textarea value={project.description} onChange={(e) => updateProject(project.id, 'description', e.target.value)} rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-white/30 focus:outline-none resize-none" />
              </div>
            </div>

            {/* 封面预览 */}
            {project.cover && (
              <div className="mb-6">
                <label className="block text-white/50 text-xs mb-2">封面预览</label>
                <img src={project.cover} alt="" className="h-28 rounded-lg object-cover" />
              </div>
            )}

            {/* 图片列表 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/50 text-xs">图片列表</label>
                <button onClick={() => addImageUrl(project.id)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                  <I.Upload /> 添加图片链接
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {project.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square bg-white/5 rounded overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <button
                      onClick={() => removeImage(project.id, idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <I.Trash />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/60 text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 主应用
// ============================================
export default function App() {
  const [page, setPage] = useState('home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loginPw, setLoginPw] = useState('');
  const [loginErr, setLoginErr] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // LOOKBOOK 图片用于首页滚动
  const carouselImages = PROJECTS[0]?.images || [];

  // 自动轮播
  useEffect(() => {
    if (page !== 'home' || carouselImages.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [page, carouselImages.length]);

  // 预加载首页大图
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHeroLoaded(true);
    img.src = HOME_CONFIG.heroImage;
  }, []);

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPw === ADMIN_PASSWORD) {
      setShowLogin(false);
      setShowAdmin(true);
      setLoginPw('');
    } else {
      setLoginErr(true);
      setTimeout(() => setLoginErr(false), 800);
    }
  };

  const navTo = useCallback((p: string) => {
    setPage(p);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 登录弹窗
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white tracking-[0.3em] mb-3">GLAX</h1>
            <p className="text-white/30 text-xs tracking-[0.2em]">后台管理 ADMIN</p>
          </div>
          <form onSubmit={doLogin} className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"><I.Lock /></div>
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="输入访问密码"
                autoFocus
                className={`w-full bg-white/[0.03] border ${loginErr ? 'border-red-500 animate-pulse' : 'border-white/[0.08]'} rounded-xl pl-12 pr-4 py-4 text-white text-sm placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-all`}
              />
            </div>
            <MagnetButton type="submit" className="w-full bg-white text-black py-4 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
              进入后台
            </MagnetButton>
            <button type="button" onClick={() => setShowLogin(false)} className="w-full text-white/20 text-xs hover:text-white/40 transition-colors py-2">
              返回网站
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 后台管理
  if (showAdmin) return <AdminPanel onClose={() => setShowAdmin(false)} />;

  const navItems = [
    { id: 'home', zh: '首页', en: 'Home' },
    { id: 'portfolio', zh: '作品集', en: 'Portfolio' },
    { id: 'about', zh: '关于', en: 'About' },
    { id: 'contact', zh: '联系', en: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ====== 导航 ====== */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navTo('home')} className="text-xl font-bold tracking-[0.3em] hover:opacity-60 transition-opacity">
            GLAX
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navTo(item.id)}
                className={`group relative py-1 transition-all ${page === item.id ? 'text-white' : 'text-white/35 hover:text-white/70'}`}
              >
                <span className="text-sm tracking-wider">{item.zh}</span>
                <span className="text-[10px] text-white/20 ml-1.5 group-hover:text-white/30 transition-colors">{item.en}</span>
                {page === item.id && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-white/60" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogin(true)} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-white/20 hover:text-white/40 transition-colors border border-white/[0.06] rounded-md">
              <I.Lock /> Admin
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white/60">
              {mobileMenu ? <I.Close /> : <I.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.04] px-6 py-6 space-y-5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navTo(item.id)} className={`block w-full text-left ${page === item.id ? 'text-white' : 'text-white/40'}`}>
                <span className="text-sm">{item.zh}</span>
                <span className="text-[10px] text-white/20 ml-2">{item.en}</span>
              </button>
            ))}
            <button onClick={() => { setShowLogin(true); setMobileMenu(false); }} className="flex items-center gap-2 text-[10px] text-white/20 mt-4">
              <I.Lock /> 后台管理
            </button>
          </div>
        )}
      </nav>

      {/* ====== 首页 ====== */}
      {page === 'home' && (
        <div>
          {/* Hero */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${HOME_CONFIG.heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
            </div>
            {!heroLoaded && <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />}

            <div className="relative z-10 text-center px-4">
              <h1 className="text-[clamp(4rem,15vw,12rem)] font-bold tracking-[0.2em] leading-none mb-6 opacity-90">
                GLAX
              </h1>
              <p className="text-white/50 text-lg tracking-[0.3em] font-extralight">
                {ABOUT_CONFIG.title}
              </p>
              <p className="text-white/20 text-xs mt-3 tracking-[0.2em]">{ABOUT_CONFIG.titleEn}</p>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
              <I.Arrow />
            </div>
          </section>

          {/* 滚动展示区 - LOOKBOOK 图片 */}
          <section className="py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-6 mb-14">
              <h2 className="text-3xl md:text-4xl font-extralight tracking-[0.15em]">最新作品</h2>
              <p className="text-white/25 text-xs mt-2 tracking-[0.2em]">Latest Works from LOOKBOOK</p>
            </div>

            <div className="relative overflow-hidden px-4">
              <div
                className="flex gap-4 md:gap-6 transition-transform duration-[800ms] ease-out"
                style={{ transform: `translateX(calc(-${carouselIdx * (100 / Math.min(carouselImages.length, 4))}% + ${carouselIdx * 16}px))` }}
              >
                {carouselImages.map((img, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 md:w-80 h-80 md:h-[26rem] rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setLightbox({ images: carouselImages, index: i })}
                    style={{
                      transform: i === carouselIdx ? 'scale(1.08) translateY(-12px)' : 'scale(0.92)',
                      opacity: i === carouselIdx ? 1 : 0.4,
                      filter: i === carouselIdx ? 'blur(0) brightness(1)' : 'blur(2px) brightness(0.6)',
                      transition: 'all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* 指示器 */}
            <div className="flex justify-center gap-1.5 mt-10">
              {carouselImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === carouselIdx ? 'bg-white/70 w-8' : 'bg-white/15 w-3 hover:bg-white/30'}`}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ====== 作品集 ====== */}
      {page === 'portfolio' && (
        <div className="pt-28 pb-24 min-h-screen">
          <div className="max-w-7xl mx-auto px-6">
            <header className="mb-20 text-center">
              <h1 className="text-5xl md:text-6xl font-extralight tracking-[0.2em]">作品集</h1>
              <p className="text-white/20 text-xs mt-3 tracking-[0.25em]">Portfolio</p>
            </header>

            <PortfolioGrid projects={PROJECTS} onView={setViewProject} />
          </div>
        </div>
      )}

      {/* ====== 关于 ====== */}
      {page === 'about' && (
        <div className="pt-28 pb-24 min-h-screen">
          <div className="max-w-6xl mx-auto px-6">
            <header className="mb-20 text-center">
              <h1 className="text-5xl md:text-6xl font-extralight tracking-[0.2em]">关于我</h1>
              <p className="text-white/20 text-xs mt-3 tracking-[0.25em]">About Me</p>
            </header>

            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* 头像 */}
              <div className="relative group">
                <div className="aspect-[3/4] rounded-lg overflow-hidden">
                  <img src={ABOUT_CONFIG.avatar} alt={ABOUT_CONFIG.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-20 h-20 border border-white/10 rounded-full flex flex-col items-center justify-center bg-black/80">
                  <span className="text-[10px] text-white/30">Since</span>
                  <span className="text-sm font-light">2014</span>
                </div>
              </div>

              {/* 简介 */}
              <div>
                <h2 className="text-4xl md:text-5xl font-extralight tracking-[0.15em] mb-2">{ABOUT_CONFIG.name}</h2>
                <p className="text-white/40 text-sm tracking-wider mb-2">{ABOUT_CONFIG.title}</p>
                <p className="text-white/15 text-xs tracking-wider mb-10">{ABOUT_CONFIG.titleEn}</p>
                <div className="space-y-4">
                  {ABOUT_CONFIG.bio.split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="text-white/55 leading-[1.9] text-sm">{p}</p>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-white/[0.06]">
                  {STATS.map((s, i) => (
                    <div key={i}>
                      <p className="text-3xl md:text-4xl font-extralight">{s.value}</p>
                      <p className="text-white/30 text-xs mt-1">{s.label}</p>
                      <p className="text-white/10 text-[10px]">{s.labelEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== 联系 ====== */}
      {page === 'contact' && (
        <div className="pt-28 pb-24 min-h-screen">
          <div className="max-w-4xl mx-auto px-6">
            <header className="mb-20 text-center">
              <h1 className="text-5xl md:text-6xl font-extralight tracking-[0.2em]">联系方式</h1>
              <p className="text-white/20 text-xs mt-3 tracking-[0.25em]">Contact</p>
            </header>

            <div className="grid md:grid-cols-2 gap-16">
              <ContactForm />
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-extralight tracking-wider mb-4">
                    保持联系 <span className="text-white/20 text-xs ml-2">Get In Touch</span>
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    如有合作意向或咨询，请通过以下方式联系我。<br />
                    <span className="text-white/15 text-xs">Feel free to reach out for collaborations.</span>
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <I.Mail />, label: '邮箱', labelEn: 'Email', value: ABOUT_CONFIG.email, href: `mailto:${ABOUT_CONFIG.email}` },
                    { icon: <I.IG />, label: 'Instagram', labelEn: '', value: ABOUT_CONFIG.instagram, href: `https://instagram.com/${ABOUT_CONFIG.instagram.replace('@', '')}` },
                    { icon: <I.WeChat />, label: '微信', labelEn: 'WeChat', value: ABOUT_CONFIG.wechat, href: undefined },
                  ].map((item, i) => (
                    <ContactLink key={i} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== 页脚 ====== */}
      <footer className="py-10 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/15 text-xs tracking-wider">
            © {new Date().getFullYear()} GLAX. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ====== 弹窗层 ====== */}
      {viewProject && <ProjectDetail project={viewProject} onClose={() => setViewProject(null)} />}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onChange={(i) => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </div>
  );
}

// ============================================
// 作品集网格（带浮动+模糊效果）
// ============================================
function PortfolioGrid({ projects, onView }: { projects: Project[]; onView: (p: Project) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // 不对称布局大小
  const sizes = ['md:col-span-2 md:row-span-2', '', 'md:col-span-1'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
      {projects.map((project, idx) => (
        <div
          key={project.id}
          className={`${sizes[idx] || ''} group cursor-pointer`}
          onMouseEnter={() => setHovered(project.id)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onView(project)}
          style={{
            transform: hovered === project.id ? 'translateY(-10px) scale(1.02)' : 'scale(1)',
            filter: hovered && hovered !== project.id ? 'blur(3px) brightness(0.5)' : 'none',
            transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          <div className={`relative overflow-hidden rounded-lg ${idx === 0 ? 'aspect-[4/3] md:aspect-[3/4]' : 'aspect-[3/4]'}`}>
            <img
              src={project.cover}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
              <p className="text-white/70 text-sm line-clamp-2 mb-2">{project.description}</p>
              <span className="text-white/40 text-xs">{project.images.length} 张作品</span>
            </div>
          </div>
          <div className="mt-4 md:mt-5">
            <h3 className="text-xl md:text-2xl font-extralight tracking-[0.15em] group-hover:text-white/80 transition-colors">
              {project.title}
            </h3>
            <p className="text-white/20 text-xs mt-1 tracking-wider">{project.titleEn}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 联系链接
// ============================================
function ContactLink({ icon, label, labelEn, value, href }: {
  icon: React.ReactNode; label: string; labelEn: string; value: string; href?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="p-3 bg-white/[0.05] rounded-full group-hover:bg-white/[0.1] transition-colors text-white/50 group-hover:text-white">
        {icon}
      </div>
      <div>
        <p className="text-white/30 text-[10px] tracking-wider">{label} {labelEn && <span className="text-white/15">{labelEn}</span>}</p>
        <p className="text-white text-sm">{value}</p>
      </div>
    </Tag>
  );
}

// ============================================
// 联系表单
// ============================================
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {[
        { key: 'name', label: '姓名', labelEn: 'Name', type: 'text', placeholder: '您的姓名' },
        { key: 'email', label: '邮箱', labelEn: 'Email', type: 'email', placeholder: 'your@email.com' },
      ].map((field) => (
        <div key={field.key}>
          <label className="block text-white/40 text-xs mb-2 tracking-wider">
            {field.label} <span className="text-white/15">{field.labelEn}</span>
          </label>
          <input
            type={field.type}
            value={form[field.key as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            required
            placeholder={field.placeholder}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors"
          />
        </div>
      ))}
      <div>
        <label className="block text-white/40 text-xs mb-2 tracking-wider">
          留言 <span className="text-white/15">Message</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={5}
          placeholder="请输入您的留言..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:border-white/20 focus:outline-none transition-colors resize-none"
        />
      </div>
      <MagnetButton
        type="submit"
        className={`w-full py-4 rounded-lg text-sm font-medium transition-all ${sent ? 'bg-green-500/80 text-white' : 'bg-white text-black hover:bg-white/90'}`}
      >
        {sent ? '✓ 发送成功 Sent' : '发送消息 Send'}
      </MagnetButton>
    </form>
  );
}
