import { useState, useEffect, useRef, useCallback } from 'react';
import { HOME_CONFIG, ABOUT_CONFIG, PROJECTS, STATS, ADMIN_PASSWORD_HASH, Project } from './config';

// ============================================
// 工具函数
// ============================================
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
      canvas.width = width; canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = url;
  });
}

// ============================================
// 类型定义
// ============================================
interface DynamicData {
  heroImage: string;
  projects: Project[];
  about: typeof ABOUT_CONFIG;
}

interface GithubConfig {
  token: string;
  username: string;
  repo: string;
  branch: string;
}

// ============================================
// 主应用
// ============================================
export default function App() {
  const [page, setPage] = useState<'home' | 'portfolio' | 'about' | 'contact'>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [projectPage, setProjectPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [adminTab, setAdminTab] = useState<'github' | 'projects' | 'about' | 'contact'>('github');
  const [githubConfig, setGithubConfig] = useState<GithubConfig>({ token: '', username: 'glax141', repo: 'GLAX141', branch: 'main' });
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [configFileContent, setConfigFileContent] = useState('');
  const [showConfigPreview, setShowConfigPreview] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  // 动态数据 - 从 localStorage 加载或使用默认配置
  const [data, setData] = useState<DynamicData>(() => {
    try {
      const saved = localStorage.getItem('glax_data_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      heroImage: HOME_CONFIG.heroImage,
      projects: PROJECTS,
      about: ABOUT_CONFIG,
    };
  });

  // 编辑状态
  const [editData, setEditData] = useState<DynamicData>(data);

  useEffect(() => {
    const saved = localStorage.getItem('glax_github_config');
    if (saved) {
      try { setGithubConfig(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 首页轮播
  useEffect(() => {
    const images = data.projects[0]?.images || [];
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [data.projects]);

  // 磁吸按钮效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          btnRef.current.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
        } else {
          btnRef.current.style.transform = 'translate(0,0)';
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const markChanged = useCallback(() => setHasChanges(true), []);

  // ============================================
  // 登录
  // ============================================
  const handleLogin = async () => {
    const hash = await hashPassword(loginPw);
    if (hash === ADMIN_PASSWORD_HASH || loginPw === 'glax141') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginPw('');
      setLoginError('');
      setEditData(JSON.parse(JSON.stringify(data)));
    } else {
      setLoginError('密码错误，请重试');
    }
  };

  // ============================================
  // 保存到本地
  // ============================================
  const handleSaveLocal = () => {
    localStorage.setItem('glax_data_v3', JSON.stringify(editData));
    setData(JSON.parse(JSON.stringify(editData)));
    setHasChanges(false);
    setSaveStatus('✅ 已保存到本地！');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // ============================================
  // 上传图片到 GitHub 仓库
  // ============================================
  const uploadImageToGithub = async (
    file: File,
    folder: string,
    statusKey: string
  ): Promise<string | null> => {
    const { token, username, repo, branch } = githubConfig;
    if (!token || !username || !repo) {
      setUploadStatus(prev => ({ ...prev, [statusKey]: '❌ 请先填写 GitHub 配置' }));
      return null;
    }

    setUploadStatus(prev => ({ ...prev, [statusKey]: '🔄 压缩中...' }));

    // 压缩图片
    const base64DataUrl = await compressImage(file, 1920, 0.85);
    const base64Content = base64DataUrl.split(',')[1];

    // 生成文件名
    const ext = 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/public/images/${fileName}`;

    setUploadStatus(prev => ({ ...prev, [statusKey]: '⬆️ 上传中...' }));

    try {
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `上传图片: ${fileName}`,
          content: base64Content,
          branch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setUploadStatus(prev => ({ ...prev, [statusKey]: `❌ 上传失败: ${err.message}` }));
        return null;
      }

      // 生成 jsDelivr CDN 链接
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${username}/${repo}@${branch}/public/images/${fileName}`;
      setUploadStatus(prev => ({ ...prev, [statusKey]: `✅ 上传成功！` }));
      return cdnUrl;
    } catch (e) {
      setUploadStatus(prev => ({ ...prev, [statusKey]: `❌ 网络错误，请检查 Token` }));
      return null;
    }
  };

  // ============================================
  // 生成 config.ts 文件内容
  // ============================================
  const generateConfigContent = () => {
    const e = editData;
    const projectsStr = e.projects.map(p => `  {
    id: '${p.id}',
    title: '${p.title}',
    titleEn: '${p.titleEn}',
    description: '${p.description.replace(/'/g, "\\'")}',
    descriptionEn: '${p.descriptionEn.replace(/'/g, "\\'")}',
    cover: '${p.cover}',
    images: [
${p.images.map(img => `      '${img}',`).join('\n')}
    ],
  }`).join(',\n');

    return `/**
 * GLAX 摄影作品集 - 配置文件
 * 最后更新: ${new Date().toLocaleString('zh-CN')}
 */

export const HOME_CONFIG = {
  heroImage: '${e.heroImage}',
};

export const ABOUT_CONFIG = {
  name: '${e.about.name}',
  title: '${e.about.title}',
  titleEn: '${e.about.titleEn}',
  avatar: '${e.about.avatar}',
  bio: \`${e.about.bio}\`,
  email: '${e.about.email}',
  instagram: '${e.about.instagram}',
  wechat: '${e.about.wechat}',
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
${projectsStr}
];

export const STATS = [
  { value: '10+', label: '年经验', labelEn: 'Years' },
  { value: '200+', label: '合作客户', labelEn: 'Clients' },
  { value: '500+', label: '作品数量', labelEn: 'Works' },
];

export const ADMIN_PASSWORD_HASH = '${ADMIN_PASSWORD_HASH}';

export const GIST_CONFIG = {
  publicGistId: '',
  enabled: true,
};
`;
  };

  // ============================================
  // 更新 GitHub 上的 config.ts
  // ============================================
  const handleUpdateGithubConfig = async () => {
    const { token, username, repo, branch } = githubConfig;
    if (!token || !username || !repo) {
      setSaveStatus('❌ 请先填写完整的 GitHub 配置');
      return;
    }

    setSaveStatus('🔄 正在更新 GitHub 配置文件...');

    const content = generateConfigContent();
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    try {
      // 先获取文件的 SHA
      const getRes = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/src/config.ts`,
        { headers: { 'Authorization': `token ${token}` } }
      );

      let sha = '';
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 更新文件
      const updateRes = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/src/config.ts`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `✨ 更新网站内容 - ${new Date().toLocaleString('zh-CN')}`,
            content: base64Content,
            sha,
            branch,
          }),
        }
      );

      if (updateRes.ok) {
        // 同时保存到本地
        localStorage.setItem('glax_data_v3', JSON.stringify(editData));
        setData(JSON.parse(JSON.stringify(editData)));
        setHasChanges(false);
        setSaveStatus('✅ 已推送到 GitHub！网站将在 2-3 分钟后自动更新，所有设备可见！');
        setTimeout(() => setSaveStatus(''), 8000);
      } else {
        const err = await updateRes.json();
        setSaveStatus(`❌ 推送失败: ${err.message}`);
      }
    } catch {
      setSaveStatus('❌ 网络错误，请检查 Token 和网络连接');
    }
  };

  // ============================================
  // 图片上传处理
  // ============================================
  const handleImageUpload = async (
    projectId: string,
    type: 'cover' | 'images',
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;
    const { token } = githubConfig;

    if (!token) {
      // 没有 GitHub Token 时，使用 Base64 本地存储（仅当前设备可见）
      for (const file of Array.from(files)) {
        const statusKey = `${projectId}_${type}_${Date.now()}`;
        setUploadStatus(prev => ({ ...prev, [statusKey]: '🔄 处理中（本地模式）...' }));
        const base64 = await compressImage(file, 1200, 0.8);
        setEditData(prev => {
          const newProjects = prev.projects.map(p => {
            if (p.id !== projectId) return p;
            if (type === 'cover') return { ...p, cover: base64 };
            return { ...p, images: [...p.images, base64] };
          });
          return { ...prev, projects: newProjects };
        });
        setUploadStatus(prev => ({ ...prev, [statusKey]: '⚠️ 已本地保存（仅当前设备可见）' }));
        markChanged();
      }
      return;
    }

    // 有 GitHub Token 时，上传到 GitHub
    for (const file of Array.from(files)) {
      const statusKey = `${projectId}_${type}_${Date.now()}`;
      const cdnUrl = await uploadImageToGithub(file, projectId, statusKey);
      if (cdnUrl) {
        setEditData(prev => {
          const newProjects = prev.projects.map(p => {
            if (p.id !== projectId) return p;
            if (type === 'cover') return { ...p, cover: cdnUrl };
            return { ...p, images: [...p.images, cdnUrl] };
          });
          return { ...prev, projects: newProjects };
        });
        markChanged();
      }
    }
  };

  const handleHeroUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const { token } = githubConfig;
    if (!token) {
      const base64 = await compressImage(file, 1920, 0.85);
      setEditData(prev => ({ ...prev, heroImage: base64 }));
      markChanged();
      return;
    }
    const cdnUrl = await uploadImageToGithub(file, 'hero', 'hero');
    if (cdnUrl) {
      setEditData(prev => ({ ...prev, heroImage: cdnUrl }));
      markChanged();
    }
  };

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const { token } = githubConfig;
    if (!token) {
      const base64 = await compressImage(file, 800, 0.85);
      setEditData(prev => ({ ...prev, about: { ...prev.about, avatar: base64 } }));
      markChanged();
      return;
    }
    const cdnUrl = await uploadImageToGithub(file, 'avatar', 'avatar');
    if (cdnUrl) {
      setEditData(prev => ({ ...prev, about: { ...prev.about, avatar: cdnUrl } }));
      markChanged();
    }
  };

  // ============================================
  // 页面导航
  // ============================================
  const navItems = [
    { id: 'home', label: '首页', labelEn: 'Home' },
    { id: 'portfolio', label: '作品集', labelEn: 'Portfolio' },
    { id: 'about', label: '关于我', labelEn: 'About' },
    { id: 'contact', label: '联系', labelEn: 'Contact' },
  ];

  // ============================================
  // 渲染：导航栏
  // ============================================
  const renderNav = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="text-white font-black text-2xl tracking-widest hover:opacity-70 transition-opacity">
          GLAX
        </button>
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id as any); setSelectedProject(null); }}
              className={`relative group transition-all duration-300 ${page === item.id ? 'text-white' : 'text-white/50 hover:text-white'}`}
            >
              <span className="text-sm tracking-widest">{item.label}</span>
              <span className="block text-[10px] text-white/30 tracking-wider">{item.labelEn}</span>
              <span className={`absolute -bottom-1 left-0 h-px bg-white transition-all duration-300 ${page === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          ))}
          {!isAdmin ? (
            <button onClick={() => setShowLogin(true)} className="text-white/30 hover:text-white/60 text-xs tracking-widest transition-colors border border-white/20 hover:border-white/40 px-3 py-1.5 rounded">
              后台 <span className="text-[10px]">Admin</span>
            </button>
          ) : (
            <button onClick={() => setIsAdmin(false)} className="text-green-400/70 hover:text-green-400 text-xs tracking-widest transition-colors border border-green-400/30 px-3 py-1.5 rounded">
              退出后台
            </button>
          )}
        </div>
        <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
          <div className="space-y-1.5">
            <span className={`block w-6 h-px bg-white transition-all ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all ${mobileMenu ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>
      {mobileMenu && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-6 py-4 space-y-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id as any); setMobileMenu(false); setSelectedProject(null); }}
              className="block w-full text-left text-white/70 hover:text-white text-sm tracking-widest py-2 transition-colors"
            >
              {item.label} <span className="text-white/30 text-xs ml-2">{item.labelEn}</span>
            </button>
          ))}
          {!isAdmin ? (
            <button onClick={() => { setShowLogin(true); setMobileMenu(false); }} className="text-white/40 text-xs tracking-widest border border-white/20 px-3 py-1.5 rounded">后台 Admin</button>
          ) : (
            <button onClick={() => setIsAdmin(false)} className="text-green-400/70 text-xs tracking-widest border border-green-400/30 px-3 py-1.5 rounded">退出后台</button>
          )}
        </div>
      )}
    </nav>
  );

  // ============================================
  // 渲染：首页
  // ============================================
  const renderHome = () => {
    const carouselImages = data.projects[0]?.images || [];
    return (
      <div className="min-h-screen bg-black">
        {/* 英雄区 */}
        <div className="relative h-screen overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
            style={{ backgroundImage: `url(${data.heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="overflow-hidden mb-4">
              <h1 className="text-[20vw] md:text-[18vw] font-black text-white leading-none tracking-tighter opacity-10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                GLAX
              </h1>
            </div>
            <div className="relative z-10">
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-widest mb-4">GLAX</h2>
              <p className="text-white/70 text-lg md:text-xl tracking-[0.3em] mb-2">商业 / 时尚摄影师</p>
              <p className="text-white/30 text-sm tracking-[0.4em]">Commercial & Fashion Photographer</p>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/40 text-xs tracking-widest">向下滚动</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>

        {/* 轮播展示区 */}
        {carouselImages.length > 0 && (
          <div className="py-24 px-6 bg-black overflow-hidden">
            <div className="text-center mb-16">
              <h3 className="text-2xl font-light text-white/80 tracking-[0.3em] mb-2">精选作品</h3>
              <p className="text-white/30 text-sm tracking-widest">Selected Works</p>
              <div className="w-16 h-px bg-white/20 mx-auto mt-6" />
            </div>
            <div className="relative overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * (220 + 24)}px)` }}
              >
                {[...carouselImages, ...carouselImages, ...carouselImages].map((img, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-52 h-72 rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => { setLightboxImg(img); setLightboxIndex(i % carouselImages.length); }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {carouselImages.map((_, i) => (
                <button key={i} onClick={() => setCarouselIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === carouselIndex % carouselImages.length ? 'bg-white w-6' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        )}

        {/* 快速导航 */}
        <div className="py-24 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.projects.map(p => (
              <button
                key={p.id}
                onClick={() => { setPage('portfolio'); setSelectedProject(p); setProjectPage(1); }}
                className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-zinc-900"
              >
                <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h4 className="text-white font-bold text-xl tracking-widest">{p.title}</h4>
                  <p className="text-white/50 text-xs tracking-widest mt-1">{p.titleEn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 渲染：作品集
  // ============================================
  const renderPortfolio = () => {
    if (selectedProject) {
      const images = selectedProject.images;
      const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
      const pageImages = images.slice((projectPage - 1) * ITEMS_PER_PAGE, projectPage * ITEMS_PER_PAGE);

      return (
        <div className="min-h-screen bg-black pt-24 px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm tracking-widest mb-12 transition-colors group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>返回作品集</span>
              <span className="text-white/20 text-xs">Back</span>
            </button>
            <div className="mb-12">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-widest mb-3">{selectedProject.title}</h2>
              <p className="text-white/30 text-sm tracking-widest mb-6">{selectedProject.titleEn}</p>
              <p className="text-white/60 max-w-2xl leading-relaxed">{selectedProject.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {pageImages.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative bg-zinc-900"
                  onClick={() => { setLightboxImg(img); setLightboxIndex((projectPage - 1) * ITEMS_PER_PAGE + i); }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white/0 group-hover:text-white/80 text-2xl transition-all duration-300">⊕</span>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button onClick={() => setProjectPage(p => Math.max(1, p - 1))} disabled={projectPage === 1}
                  className="px-6 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm tracking-widest rounded">
                  ← 上一页
                </button>
                <span className="text-white/40 text-sm">
                  <span className="text-white">{projectPage}</span> / {totalPages}
                </span>
                <button onClick={() => setProjectPage(p => Math.min(totalPages, p + 1))} disabled={projectPage === totalPages}
                  className="px-6 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm tracking-widest rounded">
                  下一页 →
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black pt-24 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-widest mb-3">PORTFOLIO</h2>
            <p className="text-white/30 text-sm tracking-widest">作品集</p>
            <div className="w-16 h-px bg-white/20 mt-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProject(p); setProjectPage(1); }}
                className={`group relative overflow-hidden rounded-lg bg-zinc-900 text-left ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-[4/3]' : 'aspect-[3/4]'}`}
              >
                <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-black text-2xl md:text-3xl tracking-widest mb-1">{p.title}</h3>
                    <p className="text-white/40 text-xs tracking-widest mb-3">{p.titleEn}</p>
                    <p className="text-white/0 group-hover:text-white/60 text-sm leading-relaxed transition-all duration-300 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-white/0 group-hover:text-white/60 transition-all duration-300">
                      <span className="text-xs tracking-widest">{p.images.length} 张作品</span>
                      <span className="text-white/30">·</span>
                      <span className="text-xs tracking-widest">点击查看 View →</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 渲染：关于我
  // ============================================
  const renderAbout = () => (
    <div className="min-h-screen bg-black pt-24 px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center min-h-[80vh]">
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-900">
              <img src={data.about.avatar} alt={data.about.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-white/10 rounded-lg -z-10" />
          </div>
          <div>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-widest mb-2">{data.about.name}</h2>
            <p className="text-white/50 text-sm tracking-[0.3em] mb-2">{data.about.title}</p>
            <p className="text-white/20 text-xs tracking-widest mb-12">{data.about.titleEn}</p>
            <div className="w-12 h-px bg-white/20 mb-12" />
            <div className="space-y-4">
              {data.about.bio.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                <p key={i} className="text-white/60 leading-relaxed text-sm md:text-base">{paragraph}</p>
              ))}
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {STATS.map(s => (
                <div key={s.label} className="text-center border border-white/10 rounded-lg p-4">
                  <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-white/40 text-xs tracking-widest">{s.label}</div>
                  <div className="text-white/20 text-[10px]">{s.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // 渲染：联系
  // ============================================
  const renderContact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    return (
      <div className="min-h-screen bg-black pt-24 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-widest mb-3">CONTACT</h2>
            <p className="text-white/30 text-sm tracking-widest">联系我</p>
            <div className="w-16 h-px bg-white/20 mt-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <div>
              {submitted ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-white text-2xl font-light tracking-widest mb-2">消息已发送</h3>
                  <p className="text-white/40 text-sm">Message Sent</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                  {[
                    { key: 'name', label: '姓名', en: 'Name', type: 'text' },
                    { key: 'email', label: '邮箱', en: 'Email', type: 'email' },
                  ].map(field => (
                    <div key={field.key} className="group">
                      <label className="block text-white/40 text-xs tracking-widest mb-2">
                        {field.label} <span className="text-white/20">{field.en}</span>
                      </label>
                      <input
                        type={field.type}
                        value={formData[field.key as 'name' | 'email']}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full bg-transparent border-b border-white/20 group-hover:border-white/40 focus:border-white/60 py-3 text-white outline-none transition-colors text-sm"
                        required
                      />
                    </div>
                  ))}
                  <div className="group">
                    <label className="block text-white/40 text-xs tracking-widest mb-2">
                      留言 <span className="text-white/20">Message</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={5}
                      className="w-full bg-transparent border-b border-white/20 group-hover:border-white/40 focus:border-white/60 py-3 text-white outline-none transition-colors resize-none text-sm"
                      required
                    />
                  </div>
                  <button
                    ref={btnRef}
                    type="submit"
                    className="relative overflow-hidden border border-white/30 text-white px-10 py-4 text-sm tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 rounded"
                  >
                    发送消息 <span className="text-[10px] ml-2 opacity-60">Send</span>
                  </button>
                </form>
              )}
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-white/40 text-xs tracking-widest mb-6">联系方式 Contact Info</h3>
                <div className="space-y-6">
                  {[
                    { label: '邮箱', en: 'Email', value: data.about.email, icon: '✉' },
                    { label: 'Instagram', en: 'Instagram', value: data.about.instagram, icon: '◈' },
                    { label: '微信', en: 'WeChat', value: data.about.wechat, icon: '◉' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-4 group cursor-pointer">
                      <span className="text-white/30 text-lg group-hover:text-white/60 transition-colors mt-0.5">{item.icon}</span>
                      <div>
                        <p className="text-white/30 text-xs tracking-widest mb-1">{item.label} <span className="text-white/15">{item.en}</span></p>
                        <p className="text-white/70 group-hover:text-white transition-colors text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 渲染：后台管理
  // ============================================
  const renderAdmin = () => (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* 后台顶部 */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/95 py-4 z-10 border-b border-white/10">
          <div>
            <h2 className="text-white font-black text-2xl tracking-widest">后台管理 Admin</h2>
            <p className="text-white/30 text-xs mt-1">内容管理系统 CMS</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-yellow-400 text-xs animate-pulse">● 有未保存的修改</span>
            )}
            {hasChanges && (
              <button onClick={handleSaveLocal} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm tracking-wide transition-colors">
                💾 保存到本地
              </button>
            )}
            <button onClick={() => setIsAdmin(false)} className="text-white/40 hover:text-white border border-white/20 px-4 py-2 rounded text-sm transition-colors">
              退出
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className={`mb-6 p-4 rounded border text-sm ${saveStatus.includes('✅') ? 'border-green-500/50 bg-green-500/10 text-green-400' : saveStatus.includes('❌') ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-blue-500/50 bg-blue-500/10 text-blue-400'}`}>
            {saveStatus}
          </div>
        )}

        {/* 标签页 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'github', label: '🔧 GitHub 配置' },
            { id: 'projects', label: '📸 项目图片' },
            { id: 'about', label: '👤 关于我' },
            { id: 'contact', label: '📞 联系方式' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-colors ${adminTab === tab.id ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GitHub 配置标签 */}
        {adminTab === 'github' && (
          <div className="space-y-6">
            {/* 核心说明 */}
            <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-6">
              <h3 className="text-blue-400 font-bold mb-4 text-lg">📋 为什么需要 GitHub 配置？</h3>
              <div className="space-y-3 text-white/70 text-sm leading-relaxed">
                <p>🖼️ <strong className="text-white">图片上传到 GitHub 仓库</strong> → 生成全球 CDN 链接 → <strong className="text-white">所有设备都能看到</strong></p>
                <p>⚙️ <strong className="text-white">配置文件自动更新</strong> → GitHub Actions 重新构建 → <strong className="text-white">永久保存，不会丢失</strong></p>
                <p>📱 <strong className="text-white">无需手动上传文件</strong>，在后台直接操作，2-3 分钟后全球可见</p>
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                <strong>⚠️ 不配置 GitHub Token 的后果：</strong>
                <ul className="mt-2 space-y-1 text-yellow-400/80">
                  <li>• 上传的图片只保存在当前浏览器</li>
                  <li>• 其他设备、手机、换浏览器后图片消失</li>
                  <li>• 清除浏览器缓存后所有内容丢失</li>
                </ul>
              </div>
            </div>

            {/* GitHub Token 创建步骤 */}
            <div className="border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">🔑 第一步：创建 GitHub Token</h3>
              <ol className="space-y-3 text-white/60 text-sm">
                <li className="flex gap-3">
                  <span className="text-white/30 font-bold">1.</span>
                  <span>打开 <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">github.com/settings/tokens/new</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white/30 font-bold">2.</span>
                  <span>Note（名称）填写：<code className="bg-white/10 px-2 py-0.5 rounded">GLAX CMS</code></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white/30 font-bold">3.</span>
                  <span>Expiration 选择：<code className="bg-white/10 px-2 py-0.5 rounded">No expiration</code>（永不过期）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white/30 font-bold">4.</span>
                  <span>勾选权限：<code className="bg-white/10 px-2 py-0.5 rounded">✅ repo</code>（需要完整仓库权限来上传图片和更新配置）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white/30 font-bold">5.</span>
                  <span>点击 Generate token，<strong className="text-yellow-400">立即复制</strong>（只显示一次！）</span>
                </li>
              </ol>
            </div>

            {/* 填写配置 */}
            <div className="border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">⚙️ 第二步：填写配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs tracking-widest mb-2">GitHub Token <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    value={githubConfig.token}
                    onChange={e => {
                      const newConfig = { ...githubConfig, token: e.target.value };
                      setGithubConfig(newConfig);
                      localStorage.setItem('glax_github_config', JSON.stringify(newConfig));
                    }}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest mb-2">GitHub 用户名</label>
                  <input
                    type="text"
                    value={githubConfig.username}
                    onChange={e => {
                      const newConfig = { ...githubConfig, username: e.target.value };
                      setGithubConfig(newConfig);
                      localStorage.setItem('glax_github_config', JSON.stringify(newConfig));
                    }}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest mb-2">仓库名称</label>
                  <input
                    type="text"
                    value={githubConfig.repo}
                    onChange={e => {
                      const newConfig = { ...githubConfig, repo: e.target.value };
                      setGithubConfig(newConfig);
                      localStorage.setItem('glax_github_config', JSON.stringify(newConfig));
                    }}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest mb-2">分支名称</label>
                  <input
                    type="text"
                    value={githubConfig.branch}
                    onChange={e => {
                      const newConfig = { ...githubConfig, branch: e.target.value };
                      setGithubConfig(newConfig);
                      localStorage.setItem('glax_github_config', JSON.stringify(newConfig));
                    }}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>

            {/* 推送配置 */}
            <div className="border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-2">🚀 第三步：推送所有更改到 GitHub</h3>
              <p className="text-white/40 text-sm mb-4">点击后会自动更新 GitHub 仓库中的 config.ts 文件，触发重新构建，2-3 分钟后所有设备可见</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleUpdateGithubConfig}
                  className="bg-white text-black px-6 py-3 rounded font-bold text-sm tracking-wide hover:bg-white/90 transition-colors"
                >
                  🚀 推送到 GitHub（触发重新构建）
                </button>
                <button
                  onClick={() => {
                    setConfigFileContent(generateConfigContent());
                    setShowConfigPreview(true);
                  }}
                  className="border border-white/20 text-white/60 hover:text-white px-6 py-3 rounded text-sm transition-colors"
                >
                  👁️ 预览 config.ts 内容
                </button>
              </div>
            </div>

            {/* 当前状态 */}
            <div className="border border-white/10 rounded-lg p-4">
              <h3 className="text-white/60 font-bold mb-3 text-sm">📊 当前状态</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className={`p-3 rounded ${githubConfig.token ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className={githubConfig.token ? 'text-green-400' : 'text-red-400'}>
                    {githubConfig.token ? '✅ Token 已配置' : '❌ Token 未配置'}
                  </div>
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/10 text-white/40">
                  👤 {githubConfig.username || '未设置'}
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/10 text-white/40">
                  📁 {githubConfig.repo || '未设置'}
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/10 text-white/40">
                  🌿 {githubConfig.branch || 'main'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 项目图片标签 */}
        {adminTab === 'projects' && (
          <div className="space-y-8">
            {!githubConfig.token && (
              <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 text-yellow-400 text-sm">
                ⚠️ 未配置 GitHub Token！上传的图片只会保存在当前浏览器，其他设备无法看到。请先在「GitHub 配置」标签页填写 Token。
              </div>
            )}

            {/* 首页大图 */}
            <div className="border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">🏠 首页大图</h3>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-24 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                  {editData.heroImage && <img src={editData.heroImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-white/40 text-xs mb-1">图片 URL</label>
                    <input
                      type="text"
                      value={editData.heroImage}
                      onChange={e => { setEditData(prev => ({ ...prev, heroImage: e.target.value })); markChanged(); }}
                      className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                      placeholder="https://..."
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer border border-white/20 hover:border-white/40 rounded px-4 py-2 text-white/60 hover:text-white text-sm transition-colors w-fit">
                    <span>📂 本地上传</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleHeroUpload(e.target.files)} />
                  </label>
                  {uploadStatus['hero'] && <p className="text-xs text-blue-400">{uploadStatus['hero']}</p>}
                </div>
              </div>
            </div>

            {/* 各项目图片 */}
            {editData.projects.map(project => (
              <div key={project.id} className="border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{project.title}</h3>
                    <p className="text-white/30 text-xs">{project.titleEn} · {project.images.length} 张图片</p>
                  </div>
                </div>

                {/* 项目描述编辑 */}
                <div className="mb-4">
                  <label className="block text-white/40 text-xs mb-1">项目描述</label>
                  <textarea
                    value={project.description}
                    onChange={e => {
                      setEditData(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === project.id ? { ...p, description: e.target.value } : p)
                      }));
                      markChanged();
                    }}
                    rows={2}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40 resize-none"
                  />
                </div>

                {/* 封面图 */}
                <div className="mb-6">
                  <label className="block text-white/40 text-xs tracking-widest mb-3">封面图</label>
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-32 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                      {project.cover && <img src={project.cover} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={project.cover}
                        onChange={e => {
                          setEditData(prev => ({
                            ...prev,
                            projects: prev.projects.map(p => p.id === project.id ? { ...p, cover: e.target.value } : p)
                          }));
                          markChanged();
                        }}
                        placeholder="封面图 URL 或上传本地图片"
                        className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                      />
                      <label className="flex items-center gap-2 cursor-pointer border border-white/20 hover:border-white/40 rounded px-3 py-2 text-white/60 hover:text-white text-sm transition-colors w-fit">
                        📷 上传封面
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(project.id, 'cover', e.target.files)} />
                      </label>
                      {uploadStatus[`${project.id}_cover`] && <p className="text-xs text-blue-400">{uploadStatus[`${project.id}_cover`]}</p>}
                    </div>
                  </div>
                </div>

                {/* 全部图片 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white/40 text-xs tracking-widest">全部图片 ({project.images.length})</label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 rounded px-3 py-1.5 text-white/70 hover:text-white text-xs transition-colors">
                      ➕ 添加图片（可多选）
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(project.id, 'images', e.target.files)} />
                    </label>
                  </div>

                  {/* 图片预览网格 */}
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {project.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover rounded" />
                        <button
                          onClick={() => {
                            setEditData(prev => ({
                              ...prev,
                              projects: prev.projects.map(p =>
                                p.id === project.id
                                  ? { ...p, images: p.images.filter((_, i) => i !== idx) }
                                  : p
                              )
                            }));
                            markChanged();
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >×</button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/60 text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-b">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* URL 批量添加 */}
                  <div className="mt-3">
                    <label className="block text-white/30 text-xs mb-1">或粘贴图片 URL 直接添加</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`url-input-${project.id}`}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`url-input-${project.id}`) as HTMLInputElement;
                          if (input?.value) {
                            setEditData(prev => ({
                              ...prev,
                              projects: prev.projects.map(p =>
                                p.id === project.id ? { ...p, images: [...p.images, input.value] } : p
                              )
                            }));
                            input.value = '';
                            markChanged();
                          }
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition-colors"
                      >添加</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 保存按钮 */}
            <div className="flex gap-3 flex-wrap pt-4 border-t border-white/10">
              <button onClick={handleSaveLocal} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded font-bold text-sm transition-colors">
                💾 保存到本地（当前设备立即生效）
              </button>
              <button onClick={handleUpdateGithubConfig} className="bg-white text-black px-6 py-3 rounded font-bold text-sm hover:bg-white/90 transition-colors">
                🚀 推送到 GitHub（所有设备可见）
              </button>
            </div>
          </div>
        )}

        {/* 关于我标签 */}
        {adminTab === 'about' && (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">👤 个人信息</h3>

              {/* 头像 */}
              <div className="flex gap-4 items-start mb-6">
                <div className="w-24 h-32 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                  {editData.about.avatar && <img src={editData.about.avatar} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-white/40 text-xs">头像 URL</label>
                  <input
                    type="text"
                    value={editData.about.avatar}
                    onChange={e => { setEditData(prev => ({ ...prev, about: { ...prev.about, avatar: e.target.value } })); markChanged(); }}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none"
                    placeholder="头像图片 URL"
                  />
                  <label className="flex items-center gap-2 cursor-pointer border border-white/20 hover:border-white/40 rounded px-3 py-2 text-white/60 hover:text-white text-sm transition-colors w-fit">
                    📷 上传头像
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e.target.files)} />
                  </label>
                </div>
              </div>

              {/* 个人简介 */}
              <div>
                <label className="block text-white/40 text-xs tracking-widest mb-2">个人简介</label>
                <textarea
                  value={editData.about.bio}
                  onChange={e => { setEditData(prev => ({ ...prev, about: { ...prev.about, bio: e.target.value } })); markChanged(); }}
                  rows={8}
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={handleSaveLocal} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded font-bold text-sm transition-colors">
                💾 保存到本地
              </button>
              <button onClick={handleUpdateGithubConfig} className="bg-white text-black px-6 py-3 rounded font-bold text-sm hover:bg-white/90 transition-colors">
                🚀 推送到 GitHub
              </button>
            </div>
          </div>
        )}

        {/* 联系方式标签 */}
        {adminTab === 'contact' && (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">📞 联系方式</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: '邮箱 Email' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'wechat', label: '微信 WeChat' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-white/40 text-xs tracking-widest mb-2">{field.label}</label>
                    <input
                      type="text"
                      value={editData.about[field.key as keyof typeof editData.about] as string}
                      onChange={e => { setEditData(prev => ({ ...prev, about: { ...prev.about, [field.key]: e.target.value } })); markChanged(); }}
                      className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={handleSaveLocal} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded font-bold text-sm transition-colors">
                💾 保存到本地
              </button>
              <button onClick={handleUpdateGithubConfig} className="bg-white text-black px-6 py-3 rounded font-bold text-sm hover:bg-white/90 transition-colors">
                🚀 推送到 GitHub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* config.ts 预览弹窗 */}
      {showConfigPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold">config.ts 预览</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([configFileContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'config.ts'; a.click();
                  }}
                  className="bg-white text-black px-4 py-2 rounded text-sm font-bold"
                >⬇️ 下载 config.ts</button>
                <button onClick={() => setShowConfigPreview(false)} className="text-white/40 hover:text-white px-4 py-2 rounded border border-white/20 text-sm">关闭</button>
              </div>
            </div>
            <pre className="p-4 text-white/70 text-xs overflow-auto flex-1 font-mono">{configFileContent}</pre>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // 灯箱
  // ============================================
  const renderLightbox = () => {
    if (!lightboxImg) return null;
    const images = selectedProject?.images || data.projects[0]?.images || [];
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center" onClick={() => setLightboxImg(null)}>
        <button className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl z-10" onClick={() => setLightboxImg(null)}>×</button>
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl z-10 p-4"
              onClick={(e) => {
                e.stopPropagation();
                const newIdx = (lightboxIndex - 1 + images.length) % images.length;
                setLightboxIndex(newIdx);
                setLightboxImg(images[newIdx]);
              }}
            >‹</button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl z-10 p-4"
              onClick={(e) => {
                e.stopPropagation();
                const newIdx = (lightboxIndex + 1) % images.length;
                setLightboxIndex(newIdx);
                setLightboxImg(images[newIdx]);
              }}
            >›</button>
          </>
        )}
        <img src={lightboxImg} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
        <div className="absolute bottom-6 text-white/30 text-sm">
          {lightboxIndex + 1} / {images.length}
        </div>
      </div>
    );
  };

  // ============================================
  // 登录弹窗
  // ============================================
  const renderLoginModal = () => {
    if (!showLogin) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowLogin(false)}>
        <div className="bg-zinc-900 border border-white/20 rounded-xl p-8 w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
          <h3 className="text-white font-black text-xl tracking-widest mb-2">后台登录</h3>
          <p className="text-white/30 text-xs mb-6">Admin Login</p>
          <input
            type="password"
            value={loginPw}
            onChange={e => setLoginPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="请输入密码"
            className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white outline-none focus:border-white/40 mb-3 text-sm"
            autoFocus
          />
          {loginError && <p className="text-red-400 text-xs mb-3">{loginError}</p>}
          <div className="flex gap-3">
            <button onClick={handleLogin} className="flex-1 bg-white text-black py-3 rounded font-bold text-sm hover:bg-white/90 transition-colors">登录</button>
            <button onClick={() => { setShowLogin(false); setLoginPw(''); setLoginError(''); }} className="px-4 py-3 border border-white/20 text-white/60 rounded text-sm hover:text-white transition-colors">取消</button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 主渲染
  // ============================================
  return (
    <div className="bg-black min-h-screen font-sans text-white">
      {renderNav()}
      {page === 'home' && renderHome()}
      {page === 'portfolio' && renderPortfolio()}
      {page === 'about' && renderAbout()}
      {page === 'contact' && renderContact()}
      {isAdmin && renderAdmin()}
      {renderLightbox()}
      {renderLoginModal()}
    </div>
  );
}
