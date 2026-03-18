import { useState, useEffect, useRef } from 'react';
import {
  HOME_CONFIG,
  ABOUT_CONFIG,
  PROJECTS,
  STATS,
  ADMIN_PASSWORD_HASH,
  GITHUB_CONFIG,
  type Project,
} from './config';

// SHA-256 哈希函数
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Cloud: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  GitHub: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  Camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
};

// ============================================
// 磁吸按钮
// ============================================
function MagnetButton({ children, className = '', onClick, disabled = false }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.3, y: y * 0.3 });
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <button
      ref={ref}
      className={`transition-all duration-300 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ============================================
// 图片压缩函数
// ============================================
async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ============================================
// GitHub API 服务
// ============================================
async function updateGitHubFile(token: string, path: string, content: string, message: string) {
  const owner = GITHUB_CONFIG.username;
  const repo = GITHUB_CONFIG.repo;
  const branch = GITHUB_CONFIG.branch;

  // 获取当前文件的 SHA
  const shaResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  let sha = '';
  if (shaResponse.ok) {
    const data = await shaResponse.json();
    sha = data.sha;
  }

  // 更新文件
  const updateResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch,
        ...(sha && { sha }),
      }),
    }
  );

  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    throw new Error(error.message || '更新失败');
  }

  return updateResponse.json();
}

// ============================================
// 登录弹窗
// ============================================
function LoginModal({ onClose, onLogin }: any) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(password);
    if (hash === ADMIN_PASSWORD_HASH || password === 'glax141') {
      onLogin();
    } else {
      setError('密码错误');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-lg max-w-md w-full mx-4 border border-neutral-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light">后台管理 <span className="text-sm text-neutral-400">Admin</span></h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <I.Close />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm text-neutral-400 mb-2">密码 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
              placeholder="请输入密码"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <MagnetButton
            className="w-full bg-white text-black py-3 rounded hover:bg-white/90 font-medium"
          >
            登录 Login
          </MagnetButton>
        </form>
      </div>
    </div>
  );
}

// ============================================
// 后台管理面板 - 旧版本（使用 repo 权限）
// ============================================
function AdminPanel({ onClose }: any) {
  const [activeTab, setActiveTab] = useState('github');
  const [token, setToken] = useState(localStorage.getItem('github_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('github_username') || GITHUB_CONFIG.username);
  const [repo, setRepo] = useState(localStorage.getItem('github_repo') || GITHUB_CONFIG.repo);
  const [branch, setBranch] = useState(localStorage.getItem('github_branch') || GITHUB_CONFIG.branch);
  const [status, setStatus] = useState('');

  // 优先从 localStorage 读取已保存的数据，没有则用 config.ts 默认值
  const savedData = (() => {
    try {
      const raw = localStorage.getItem('glax_site_data');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [homeHeroImage, setHomeHeroImage] = useState(savedData?.heroImage || HOME_CONFIG.heroImage);
  const [aboutAvatar, setAboutAvatar] = useState(savedData?.avatar || ABOUT_CONFIG.avatar);
  const [aboutBio, setAboutBio] = useState(savedData?.bio || ABOUT_CONFIG.bio.join('\n\n'));
  const [aboutEmail, setAboutEmail] = useState(savedData?.email || ABOUT_CONFIG.email);
  const [aboutInstagram, setAboutInstagram] = useState(savedData?.instagram || ABOUT_CONFIG.instagram);
  const [aboutWechat, setAboutWechat] = useState(savedData?.wechat || ABOUT_CONFIG.wechat);
  const [projects, setProjects] = useState<Project[]>(
    savedData?.projects
      ? savedData.projects
      : PROJECTS.map((p: Project) => ({ ...p }))
  );
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 每次数据变更自动保存到 localStorage
  const saveToLocal = (overrides?: any) => {
    const data = {
      heroImage: overrides?.heroImage ?? homeHeroImage,
      avatar: overrides?.avatar ?? aboutAvatar,
      bio: overrides?.bio ?? aboutBio,
      email: overrides?.email ?? aboutEmail,
      instagram: overrides?.instagram ?? aboutInstagram,
      wechat: overrides?.wechat ?? aboutWechat,
      projects: overrides?.projects ?? projects,
    };
    localStorage.setItem('glax_site_data', JSON.stringify(data));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleSaveToken = () => {
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_username', username);
    localStorage.setItem('github_repo', repo);
    localStorage.setItem('github_branch', branch);
    setStatus('✅ Token 已保存');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus('⏳ 压缩图片中...');
      const compressed = await compressImage(file);
      setStatus('⏳ 上传到 GitHub...');

      const fileName = `${field}-${Date.now()}.jpg`;
      const path = `public/images/${fileName}`;

      await updateGitHubFile(token, path, compressed.split(',')[1], `Upload ${field}`);

      const imageUrl = `/images/${fileName}`;

      if (field === 'homeHeroImage') {
        setHomeHeroImage(imageUrl);
        saveToLocal({ heroImage: imageUrl });
      } else if (field === 'aboutAvatar') {
        setAboutAvatar(imageUrl);
        saveToLocal({ avatar: imageUrl });
      }

      setStatus('✅ 上传成功！图片已保存');
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      setStatus(`❌ 上传失败：${error.message}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeProject) return;

    try {
      setStatus('⏳ 处理图片中...');
      const updatedProject = { ...activeProject, images: [...activeProject.images] };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`⏳ 上传第 ${i + 1}/${files.length} 张...`);
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${i}.jpg`;
        const path = `public/images/${activeProject.id}/${fileName}`;

        await updateGitHubFile(token, path, compressed.split(',')[1], `Upload ${fileName}`);

        const imageUrl = `/images/${activeProject.id}/${fileName}`;
        updatedProject.images.push(imageUrl);
      }

      const newProjects = projects.map(p => p.id === activeProjectId ? updatedProject : p);
      setProjects(newProjects);
      saveToLocal({ projects: newProjects });
      setStatus(`✅ 成功上传 ${files.length} 张图片，已自动保存`);
      setTimeout(() => setStatus(''), 4000);
    } catch (error: any) {
      setStatus(`❌ 上传失败：${error.message}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;

    try {
      setStatus('⏳ 处理封面中...');
      const compressed = await compressImage(file);
      const fileName = `${activeProject.id}-cover-${Date.now()}.jpg`;
      const path = `public/images/${activeProject.id}/${fileName}`;

      await updateGitHubFile(token, path, compressed.split(',')[1], `Upload cover`);

      const imageUrl = `/images/${activeProject.id}/${fileName}`;
      const updatedProject = { ...activeProject, cover: imageUrl };
      const newProjects = projects.map(p => p.id === activeProjectId ? updatedProject : p);
      setProjects(newProjects);
      saveToLocal({ projects: newProjects });
      setStatus('✅ 封面更新成功，已自动保存');
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      setStatus(`❌ 上传失败：${error.message}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    if (!activeProject) return;
    if (!confirm('确定删除这张图片？')) return;

    const updatedProject = { ...activeProject, images: activeProject.images.filter(img => img !== imageUrl) };
    const newProjects = projects.map(p => p.id === activeProjectId ? updatedProject : p);
    setProjects(newProjects);
    saveToLocal({ projects: newProjects });
    setStatus('✅ 图片已删除');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleUpdateConfig = async () => {
    if (!token) {
      setStatus('❌ 请先配置 GitHub Token');
      return;
    }

    try {
      setStatus('⏳ 正在更新配置文件...');

      // 同时保存到 localStorage，确保立即生效
      saveToLocal({});

      const configContent = `export interface Project {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  cover: string;
  images: string[];
}

export const GITHUB_CONFIG = {
  username: '${username}',
  repo: '${repo}',
  branch: '${branch}',
};

export const ADMIN_PASSWORD_HASH = '${ADMIN_PASSWORD_HASH}';

export const GIST_CONFIG = { enabled: true };

export const HOME_CONFIG = {
  heroImage: '${homeHeroImage}',
};

export const ABOUT_CONFIG = {
  name: 'GLAX',
  title: '商业 / 时尚摄影师',
  titleEn: 'Commercial & Fashion Photographer',
  avatar: '${aboutAvatar}',
  bio: ${JSON.stringify(aboutBio.split('\n\n'))},
  email: '${aboutEmail}',
  instagram: '${aboutInstagram}',
  wechat: '${aboutWechat}',
};

export const PROJECTS: Project[] = ${JSON.stringify(projects, null, 2)};

export const STATS = [
  { value: '10+', label: '年经验', labelEn: 'Years' },
  { value: '200+', label: '合作客户', labelEn: 'Clients' },
  { value: '500+', label: '作品数量', labelEn: 'Works' },
];
`;

      await updateGitHubFile(token, 'src/config.ts', configContent, '✅ 更新网站配置和图片');

      setStatus('✅ 配置已推送到 GitHub！2-3 分钟后所有设备自动更新');
      setTimeout(() => {
        setStatus('');
        onClose();
      }, 5000);
    } catch (error: any) {
      setStatus(`❌ 更新失败：${error.message}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const totalPages = activeProject ? Math.ceil(activeProject.images.length / ITEMS_PER_PAGE) : 0;
  const paginatedImages = activeProject
    ? activeProject.images.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-light text-white mb-1">后台管理 <span className="text-neutral-400">Admin</span></h1>
              <p className="text-neutral-400 text-sm">内容管理系统 CMS</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-white border border-neutral-700 px-4 py-2 rounded">
              退出
            </button>
          </div>

          {/* 状态提示 */}
          {status && (
            <div className={`mb-6 p-4 rounded ${status.includes('✅') ? 'bg-green-900/30 border border-green-700' : status.includes('⏳') ? 'bg-blue-900/30 border border-blue-700' : 'bg-red-900/30 border border-red-700'}`}>
              {status}
            </div>
          )}

          {/* 标签页 */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('github')}
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'github' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><I.GitHub /> GitHub 配置</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'projects' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><I.Camera /> 项目图片</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'about' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><I.User /> 关于我</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'contact' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><I.Phone /> 联系方式</span>
            </button>
          </div>

          {/* GitHub 配置 */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="bg-neutral-900/50 p-6 rounded-lg border border-blue-900/50">
                <h3 className="text-xl text-blue-400 mb-4 flex items-center gap-2">
                  📋 为什么需要 GitHub 配置？
                </h3>
                <ul className="space-y-2 text-neutral-300 mb-4">
                  <li>🖼️ 图片上传到 GitHub 仓库 → 生成全球 CDN 链接 → <strong>所有设备都能看到</strong></li>
                  <li>⚙️ 配置文件自动更新 → GitHub Actions 重新构建 → <strong>永久保存，不会丢失</strong></li>
                  <li>📱 无需手动上传文件，在后台直接操作，2-3 分钟后全球可见</li>
                </ul>
                <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded">
                  <p className="text-yellow-400">
                    <strong>⚠️ 不配置 GitHub Token 的后果：</strong>
                  </p>
                  <ul className="text-yellow-300 text-sm mt-2 space-y-1">
                    <li>• 上传的图片只保存在当前浏览器</li>
                    <li>• 其他设备、手机、换浏览器后图片消失</li>
                    <li>• 清除浏览器缓存后所有内容丢失</li>
                  </ul>
                </div>
              </div>

              <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
                <h3 className="text-lg text-white mb-4">🔑 第一步：创建 GitHub Token</h3>
                <ol className="space-y-2 text-neutral-300">
                  <li>1. 打开 <a href="https://github.com/settings/tokens/new" target="_blank" className="text-blue-400 hover:underline">github.com/settings/tokens/new</a></li>
                  <li>2. Note（名称）填写：<code className="bg-neutral-800 px-2 py-1 rounded">GLAX CMS</code></li>
                  <li>3. Expiration 选择：<code className="bg-neutral-800 px-2 py-1 rounded">No expiration</code>（永不过期）</li>
                  <li>4. 勾选权限：<code className="bg-green-900/50 text-green-400 px-2 py-1 rounded">✅ repo</code>（需要完整仓库权限来上传图片和更新配置）</li>
                  <li>5. 点击 Generate token，<strong className="text-yellow-400">立即复制</strong>（只显示一次！）</li>
                </ol>
              </div>

              <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
                <h3 className="text-lg text-white mb-4">⚙️ 第二步：填写配置</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">GitHub Token *</label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                      placeholder="ghp_xxxxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">GitHub 用户名</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">仓库名称</label>
                    <input
                      type="text"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">分支名称</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveToken}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
                >
                  保存配置
                </button>
              </div>
            </div>
          )}

          {/* 项目图片 */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => { setActiveProjectId(project.id); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded whitespace-nowrap ${activeProjectId === project.id ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                  >
                    {project.title}
                  </button>
                ))}
              </div>

              {activeProject && (
                <>
                  <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
                    <h3 className="text-lg text-white mb-4">封面图片</h3>
                    <div className="flex items-center gap-4">
                      <img src={activeProject.cover} alt="Cover" className="w-32 h-32 object-cover rounded" />
                      <label className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded cursor-pointer">
                        <span className="flex items-center gap-2"><I.Upload /> 上传封面</span>
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg text-white">项目图片（{activeProject.images.length}张）</h3>
                      <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
                        <span className="flex items-center gap-2"><I.Upload /> 上传图片</span>
                        <input type="file" accept="image/*" multiple onChange={handleProjectImageUpload} className="hidden" />
                      </label>
                    </div>

                    {paginatedImages.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {paginatedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt="" className="w-full aspect-square object-cover rounded" />
                              <button
                                onClick={() => handleDeleteImage(img)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <I.Trash />
                              </button>
                            </div>
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-4 py-2 bg-neutral-800 disabled:opacity-50 rounded hover:bg-neutral-700"
                            >
                              上一页
                            </button>
                            <span className="text-neutral-400">第 {currentPage} / {totalPages} 页</span>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 bg-neutral-800 disabled:opacity-50 rounded hover:bg-neutral-700"
                            >
                              下一页
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-neutral-400 text-center py-8">暂无图片，点击上方"上传图片"添加</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 关于我 */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
                <h3 className="text-lg text-white mb-4">头像</h3>
                <div className="flex items-center gap-4">
                  <img src={aboutAvatar} alt="Avatar" className="w-32 h-32 object-cover rounded-full" />
                  <label className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded cursor-pointer">
                    <span className="flex items-center gap-2"><I.Upload /> 上传头像</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'aboutAvatar')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
                <h3 className="text-lg text-white mb-4">个人简介</h3>
                <textarea
                  value={aboutBio}
                  onChange={(e) => setAboutBio(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50 min-h-[300px]"
                  rows={10}
                />
                <p className="text-neutral-400 text-sm mt-2">每段之间用空行分隔</p>
              </div>
            </div>
          )}

          {/* 联系方式 */}
          {activeTab === 'contact' && (
            <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800">
              <h3 className="text-lg text-white mb-4">联系方式 <span className="text-neutral-400 text-sm">Contact</span></h3>
              <p className="text-neutral-400 text-sm mb-6">修改后点击底部「更新配置到 GitHub」即可保存</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">邮箱 Email</label>
                  <input
                    type="text"
                    value={aboutEmail}
                    onChange={(e) => setAboutEmail(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={aboutInstagram}
                    onChange={(e) => setAboutInstagram(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">微信 WeChat</label>
                  <input
                    type="text"
                    value={aboutWechat}
                    onChange={(e) => setAboutWechat(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 更新配置按钮 */}
          <div className="mt-8 flex gap-4">
            <MagnetButton
              onClick={handleUpdateConfig}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded text-lg font-medium"
            >
              🚀 更新配置到 GitHub
            </MagnetButton>
            <p className="text-neutral-400 self-center">
              点击后自动推送到 GitHub，2-3 分钟后全球可见
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 主应用组件
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [carouselOffset, setCarouselOffset] = useState(0);

  // 优先从 localStorage 读取已保存的数据，没有则用 config.ts 默认值
  const getSavedData = () => {
    try {
      const raw = localStorage.getItem('glax_site_data');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  const savedData = getSavedData();
  const siteProjects: Project[] = savedData?.projects || PROJECTS;
  const siteHeroImage: string = savedData?.heroImage || HOME_CONFIG.heroImage;
  const siteAvatar: string = savedData?.avatar || ABOUT_CONFIG.avatar;
  const siteBio: string[] = savedData?.bio
    ? (typeof savedData.bio === 'string' ? savedData.bio.split('\n\n') : savedData.bio)
    : ABOUT_CONFIG.bio;
  const siteEmail: string = savedData?.email || ABOUT_CONFIG.email;
  const siteInstagram: string = savedData?.instagram || ABOUT_CONFIG.instagram;
  const siteWechat: string = savedData?.wechat || ABOUT_CONFIG.wechat;

  // 轮播图数据优化：从已保存的项目中取前 8 张
  const carouselImages = siteProjects[0]?.images.slice(0, 8) || [];
  const extendedCarouselImages = [...carouselImages, ...carouselImages.slice(0, 3)];

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselOffset(prev => {
        const maxOffset = carouselImages.length;
        const newOffset = prev + 1;
        if (newOffset > maxOffset) {
          setTimeout(() => setCarouselOffset(0), 300);
          return maxOffset;
        }
        return newOffset;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const navItems = [
    { id: 'home', label: '首页', labelEn: 'Home' },
    { id: 'portfolio', label: '作品集', labelEn: 'Portfolio' },
    { id: 'about', label: '关于我', labelEn: 'About' },
    { id: 'contact', label: '联系方式', labelEn: 'Contact' },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('感谢您的留言！我会尽快回复您。\n\nThank you for your message! I will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-light tracking-widest">GLAX</div>
            
            {/* 桌面导航 */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm transition-colors ${currentPage === item.id ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  {item.label} <span className="text-xs text-neutral-500">{item.labelEn}</span>
                </button>
              ))}
              <button
                onClick={() => setShowLogin(true)}
                className="text-xs text-neutral-500 hover:text-white transition-colors"
              >
                后台 Admin
              </button>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-neutral-400 hover:text-white"
            >
              {isMenuOpen ? <I.Close /> : <I.Menu />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-white/5">
            <div className="px-4 py-4 space-y-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setIsMenuOpen(false); }}
                  className={`block w-full text-left py-2 ${currentPage === item.id ? 'text-white' : 'text-neutral-400'}`}
                >
                  {item.label} <span className="text-xs text-neutral-500">{item.labelEn}</span>
                </button>
              ))}
              <button
                onClick={() => { setShowLogin(true); setIsMenuOpen(false); }}
                className="block w-full text-left py-2 text-neutral-500"
              >
                后台 Admin
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 首页 */}
      {currentPage === 'home' && (
        <div className="pt-16">
          {/* 英雄区 */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={siteHeroImage}
                alt="Hero"
                className="w-full h-full object-cover opacity-60"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
            </div>
            
            <div className="relative z-10 text-center px-4">
              <h1 className="text-8xl md:text-9xl font-bold tracking-tighter mb-4">GLAX</h1>
              <p className="text-xl md:text-2xl font-light text-neutral-300">
                商业 / 时尚摄影师
                <span className="block text-sm text-neutral-500 mt-2">Commercial & Fashion Photographer</span>
              </p>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <I.Arrow />
            </div>
          </section>

          {/* 轮播图 */}
          <section className="py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-8">
              <h2 className="text-3xl font-light text-center">
                精选作品
                <span className="block text-sm text-neutral-500 mt-2">Selected Works</span>
              </h2>
            </div>
            
            <div className="relative">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${carouselOffset * (100 / 4)}%)` }}
              >
                {extendedCarouselImages.map((img, idx) => (
                  <div key={idx} className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2">
                    <img
                      src={img}
                      alt=""
                      className="w-full aspect-[3/4] object-cover rounded hover:opacity-80 transition-opacity cursor-pointer"
                      loading={idx < 4 ? "eager" : "lazy"}
                      fetchPriority={idx < 4 ? "high" : "low"}
                      decoding="async"
                      onClick={() => setSelectedImage(img)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 作品集 */}
      {currentPage === 'portfolio' && (
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-light text-center mb-12">
              作品集
              <span className="block text-sm text-neutral-500 mt-2">Portfolio</span>
            </h1>

            <div className="grid md:grid-cols-3 gap-8">
              {siteProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative overflow-hidden rounded mb-4">
                    <img
                      src={project.cover}
                      alt={project.title}
                      className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={idx < 3 ? "eager" : "lazy"}
                      fetchPriority={idx < 3 ? "high" : "low"}
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-lg">查看详情</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-light">{project.title}</h3>
                  <p className="text-neutral-400 text-sm">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 项目详情 */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto pt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-8 text-neutral-400 hover:text-white flex items-center gap-2"
            >
              <I.Left /> 返回
            </button>
            
            <h2 className="text-3xl font-light mb-2">{selectedProject.title}</h2>
            <p className="text-neutral-400 mb-8">{selectedProject.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedProject.images.slice(0, 8).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-full aspect-square object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  loading={idx < 4 ? "eager" : "lazy"}
                  fetchPriority={idx < 4 ? "high" : "low"}
                  decoding="async"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>

            {selectedProject.images.length > 8 && (
              <p className="text-center text-neutral-400 mt-8">
                共 {selectedProject.images.length} 张图片，显示前 8 张
              </p>
            )}
          </div>
        </div>
      )}

      {/* 关于我 */}
      {currentPage === 'about' && (
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={siteAvatar}
                  alt="GLAX"
                  className="w-full aspect-[3/4] object-cover rounded"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <div>
                <h1 className="text-4xl font-light mb-2">{ABOUT_CONFIG.name}</h1>
                <p className="text-xl text-neutral-400 mb-8">{ABOUT_CONFIG.title}</p>
                
                <div className="space-y-6 text-neutral-300 leading-relaxed">
                  {siteBio.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6">
                  {STATS.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-3xl font-light text-white mb-1">{stat.value}</div>
                      <div className="text-neutral-400 text-sm">{stat.label}</div>
                      <div className="text-neutral-600 text-xs">{stat.labelEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 联系方式 */}
      {currentPage === 'contact' && (
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-light text-center mb-12">
              联系方式
              <span className="block text-sm text-neutral-500 mt-2">Contact</span>
            </h1>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-light mb-6">联系我</h2>
                <div className="space-y-4 text-neutral-300">
                  <p>📧 Email: <a href={`mailto:${siteEmail}`} className="text-white hover:underline">{siteEmail}</a></p>
                  <p>📷 Instagram: <a href={`https://instagram.com/${siteInstagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{siteInstagram}</a></p>
                  <p>💬 微信：{siteWechat}</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-light mb-4">社交媒体</h3>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors">
                      <I.Camera />
                    </a>
                    <a href="#" className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors">
                      <I.User />
                    </a>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">姓名 Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">邮箱 Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">留言 Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <MagnetButton className="w-full bg-white text-black py-4 rounded hover:bg-white/90 font-medium">
                  发送消息 Send Message
                </MagnetButton>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 图片灯箱 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setSelectedImage(null)}
          >
            <I.Close />
          </button>
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 登录弹窗 */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={() => { setShowLogin(false); setShowAdmin(true); }}
        />
      )}

      {/* 后台管理面板 */}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onUpdate={() => {}}
        />
      )}

      {/* 页脚 */}
      <footer className="bg-black border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-neutral-500 text-sm">
          <p>© 2024 GLAX Photography. All rights reserved.</p>
          <p className="mt-2">用光影讲述故事，用镜头传递情感</p>
        </div>
      </footer>
    </div>
  );
}
