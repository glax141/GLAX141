import { useState, useEffect, useRef } from 'react';
import {
  HOME_CONFIG,
  ABOUT_CONFIG,
  PROJECTS,
  STATS,
  ADMIN_PASSWORD_HASH,
  GIST_CONFIG,
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

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className={`relative transition-transform duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      {children}
    </button>
  );
}

// ============================================
// 图片灯箱
// ============================================
function Lightbox({ images, index, onClose, onNext, onPrev }: any) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10">
        <I.Close />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-6 text-white/60 hover:text-white transition-colors z-10 p-3 hover:bg-white/10 rounded-full"
      >
        <I.Left />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-6 text-white/60 hover:text-white transition-colors z-10 p-3 hover:bg-white/10 rounded-full"
      >
        <I.Right />
      </button>
      <img
        src={images[index]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {images.length}
      </div>
    </div>
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
  const [gistToken, setGistToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // 加载保存的 Gist 配置和数据
  useEffect(() => {
    const savedToken = localStorage.getItem('gist_token');
    const savedGistId = localStorage.getItem('gist_id');
    const savedData = localStorage.getItem('website_data');
    
    if (savedToken) setGistToken(savedToken);
    if (savedGistId) setGistId(savedGistId);
    
    // 先从 localStorage 加载数据（立即可用）
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.about) setAbout(data.about);
        if (data.home) setHome(data.home);
        if (data.projects) setProjects(data.projects);
        setSyncStatus('✅ 已加载本地数据');
        setTimeout(() => setSyncStatus(''), 2000);
      } catch (error) {
        console.error('Failed to parse local data:', error);
      }
    }
    
    // 然后尝试从 Gist 加载最新数据（可能更新）
    const loadFromGist = async () => {
      if (savedToken && savedGistId) {
        try {
          const response = await fetch(`https://api.github.com/gists/${savedGistId}`, {
            headers: {
              'Authorization': `token ${savedToken}`,
            },
          });
          
          if (response.ok) {
            const gist = await response.json();
            const content = gist.files['website-data.json']?.content;
            
            if (content) {
              const data = JSON.parse(content);
              // 检查云端数据是否更新
              const localUpdatedAt = savedData ? JSON.parse(savedData).updatedAt : null;
              const cloudUpdatedAt = data.updatedAt;
              
              if (!localUpdatedAt || cloudUpdatedAt > localUpdatedAt) {
                if (data.about) setAbout(data.about);
                if (data.home) setHome(data.home);
                if (data.projects) setProjects(data.projects);
                localStorage.setItem('website_data', content);
                setSyncStatus('✅ 已从云端同步最新数据');
                setTimeout(() => setSyncStatus(''), 3000);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load from Gist:', error);
        }
      }
    };
    
    loadFromGist();
  }, []);

  // 保存 Token
  const handleSaveToken = () => {
    const token = gistToken.trim();
    if (!token) {
      setSyncStatus('❌ 请输入 Token');
      return;
    }
    
    // 验证 Token 格式（GitHub Token 通常是 40 个字符）
    if (token.length < 20) {
      setSyncStatus('❌ Token 格式不正确，请检查是否完整复制');
      return;
    }
    
    localStorage.setItem('gist_token', token);
    setGistToken(token);
    
    // 测试 Token 是否有效
    testToken(token);
  };
  
  // 测试 Token 有效性
  const testToken = async (token: string) => {
    setSyncStatus('⏳ 正在验证 Token...');
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
        },
      });
      
      if (response.ok) {
        const user = await response.json();
        setSyncStatus(`✅ Token 有效！已验证用户：${user.login}`);
        
        // 检查是否有 gist 权限
        const scopes = response.headers.get('x-oauth-scopes') || '';
        console.log('Token scopes:', scopes);
        if (!scopes.includes('gist')) {
          setSyncStatus('⚠️ Token 缺少 gist 权限，请重新创建并勾选 gist 权限');
        } else {
          setSyncStatus(`✅ Token 有效！用户：${user.login} | 权限：${scopes}`);
        }
      } else {
        const error = await response.json();
        setSyncStatus(`❌ Token 无效：${error.message}`);
      }
    } catch (error: any) {
      setSyncStatus(`❌ 无法连接 GitHub：${error.message}. 请检查网络连接.`);
    }
    setTimeout(() => setSyncStatus(''), 8000);
  };

  // 保存到本地存储
  const saveToLocalStorage = () => {
    const data = {
      about,
      home,
      projects,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('website_data', JSON.stringify(data));
    setSyncStatus('✅ 已保存到本地');
    setTimeout(() => setSyncStatus(''), 2000);
  };

  // 同步到 Gist
  const handleSyncToGist = async () => {
    if (!gistToken.trim()) {
      setSyncStatus('❌ 请先配置 GitHub Token');
      return;
    }

    setSyncing(true);
    setSyncStatus('⏳ 正在同步...');

    try {
      const data = {
        about,
        home,
        projects,
        updatedAt: new Date().toISOString(),
      };

      // 同时保存到本地
      localStorage.setItem('website_data', JSON.stringify(data));

      const gistData = {
        description: 'GLAX Photography Website Data',
        public: false,
        files: {
          'website-data.json': {
            content: JSON.stringify(data, null, 2),
          },
        },
      };

      let response;
      if (gistId) {
        // 更新现有 Gist
        response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${gistToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistData),
        });
      } else {
        // 创建新 Gist
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${gistToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistData),
        });
      }

      if (!response.ok) {
        throw new Error(`GitHub API 错误: ${response.status}`);
      }

      const result = await response.json();
      
      if (!gistId) {
        setGistId(result.id);
        localStorage.setItem('gist_id', result.id);
      }

      setSyncStatus('✅ 同步成功！所有设备将看到更新');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus(`❌ 同步失败: ${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  // 从 Gist 加载
  const handleLoadFromGist = async () => {
    if (!gistToken.trim() || !gistId) {
      setSyncStatus('❌ 请先配置 Token 和 Gist ID');
      return;
    }

    setSyncing(true);
    setSyncStatus('⏳ 正在加载...');

    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${gistToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API 错误: ${response.status}`);
      }

      const gist = await response.json();
      const content = gist.files['website-data.json']?.content;
      
      if (!content) {
        throw new Error('Gist 中没有找到数据文件');
      }

      const data = JSON.parse(content);
      
      if (data.about) setAbout(data.about);
      if (data.home) setHome(data.home);
      if (data.projects) setProjects(data.projects);

      setSyncStatus('✅ 加载成功！');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error: any) {
      console.error('Load error:', error);
      setSyncStatus(`❌ 加载失败: ${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopy = () => {
    const config = `// ============================================
// 网站配置文件 - 修改后推送到 GitHub 即可更新网站
// ============================================

export const HOME_CONFIG = ${JSON.stringify(home, null, 2)};

export const ABOUT_CONFIG = ${JSON.stringify(about, null, 2)};

export const PROJECTS = ${JSON.stringify(projects, null, 2)};

export const STATS = ${JSON.stringify(STATS, null, 2)};

export const ADMIN_PASSWORD_HASH = '${ADMIN_PASSWORD_HASH}';

export const GIST_CONFIG = ${JSON.stringify(GIST_CONFIG, null, 2)};

export type Project = typeof PROJECTS[0];
`;
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const config = `// ============================================
// 网站配置文件 - 修改后推送到 GitHub 即可更新网站
// ============================================

export const HOME_CONFIG = ${JSON.stringify(home, null, 2)};

export const ABOUT_CONFIG = ${JSON.stringify(about, null, 2)};

export const PROJECTS = ${JSON.stringify(projects, null, 2)};

export const STATS = ${JSON.stringify(STATS, null, 2)};

export const ADMIN_PASSWORD_HASH = '${ADMIN_PASSWORD_HASH}';

export const GIST_CONFIG = ${JSON.stringify(GIST_CONFIG, null, 2)};

export type Project = typeof PROJECTS[0];
`;
    const blob = new Blob([config], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = (projectIdx: number, isCover: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setProjects((prev) => {
          const next = [...prev];
          if (isCover) {
            next[projectIdx].cover = result;
          } else {
            next[projectIdx].images = [...next[projectIdx].images, result];
          }
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (projectIdx: number, imageIdx: number) => {
    setProjects((prev) => {
      const next = [...prev];
      next[projectIdx].images = next[projectIdx].images.filter((_, i) => i !== imageIdx);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-light tracking-[0.15em]">
              后台管理 <span className="text-white/30 text-xs ml-2">Admin Panel</span>
            </h2>
            <p className="text-white/30 text-xs mt-1">修改后点击「同步到云端」即可在所有设备看到更新</p>
          </div>
          <div className="flex items-center gap-3">
            <MagnetButton
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {copied ? <I.Check /> : <I.Copy />}
              {copied ? '已复制' : '复制配置'}
            </MagnetButton>
            <MagnetButton
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
            >
              <I.Download />
              下载 config.ts
            </MagnetButton>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <I.Close />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* 云端同步设置 */}
        <section className="border border-blue-500/30 rounded-xl p-6 bg-blue-500/5">
          <h3 className="text-white text-lg font-light mb-2 tracking-wider flex items-center gap-2">
            <I.Cloud />
            云端同步设置 <span className="text-white/30 text-xs">Cloud Sync (GitHub Gist)</span>
          </h3>
          <p className="text-white/50 text-xs mb-6">
            配置后可实现跨设备自动同步。需要 GitHub Token（仅需 gist 权限）。
            <a href="https://github.com/settings/tokens" target="_blank" className="text-blue-400 hover:underline ml-2">
              创建 Token →
            </a>
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">GitHub Token</label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={gistToken}
                  onChange={(e) => setGistToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
                <MagnetButton
                  onClick={handleSaveToken}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                >
                  保存 Token
                </MagnetButton>
              </div>
            </div>

            {gistId && (
              <div>
                <label className="block text-white/60 text-sm mb-2">Gist ID（自动生成）</label>
                <input
                  type="text"
                  value={gistId}
                  readOnly
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/40 text-sm"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <MagnetButton
                onClick={saveToLocalStorage}
                className="flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all"
              >
                <I.Download />
                保存到本地
              </MagnetButton>
              <MagnetButton
                onClick={handleSyncToGist}
                disabled={syncing || !gistToken}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <I.Cloud />
                {syncing ? '同步中...' : '同步到云端'}
              </MagnetButton>
              <MagnetButton
                onClick={handleLoadFromGist}
                disabled={syncing || !gistToken || !gistId}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <I.Refresh />
                从云端加载
              </MagnetButton>
            </div>

            {syncStatus && (
              <div className={`text-sm p-3 rounded-lg ${
                syncStatus.includes('✅') ? 'bg-green-500/10 text-green-400' :
                syncStatus.includes('❌') ? 'bg-red-500/10 text-red-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {syncStatus}
              </div>
            )}
          </div>
        </section>

        {/* 首页设置 */}
        <section>
          <h3 className="text-white text-lg font-light mb-6 tracking-wider">
            首页设置 <span className="text-white/30 text-xs">Home Settings</span>
          </h3>
          <div>
            <label className="block text-white/60 text-sm mb-2">首页大图 URL</label>
            <input
              type="text"
              value={home.heroImage}
              onChange={(e) => setHome({ ...home, heroImage: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </section>

        {/* 关于我设置 */}
        <section>
          <h3 className="text-white text-lg font-light mb-6 tracking-wider">
            关于我 <span className="text-white/30 text-xs">About Me</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">头像 URL</label>
              <input
                type="text"
                value={about.avatar}
                onChange={(e) => setAbout({ ...about, avatar: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">个人简介</label>
              <textarea
                value={about.bio}
                onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">邮箱</label>
                <input
                  type="text"
                  value={about.email}
                  onChange={(e) => setAbout({ ...about, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Instagram</label>
                <input
                  type="text"
                  value={about.instagram}
                  onChange={(e) => setAbout({ ...about, instagram: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">微信</label>
                <input
                  type="text"
                  value={about.wechat}
                  onChange={(e) => setAbout({ ...about, wechat: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 项目管理 */}
        <section>
          <h3 className="text-white text-lg font-light mb-6 tracking-wider">
            项目管理 <span className="text-white/30 text-xs">Projects ({projects.length})</span>
          </h3>
          <div className="space-y-8">
            {projects.map((project, pIdx) => (
              <div key={project.id} className="border border-white/10 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">项目标题</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => {
                          const next = [...projects];
                          next[pIdx].title = e.target.value;
                          setProjects(next);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">英文标题</label>
                      <input
                        type="text"
                        value={project.titleEn}
                        onChange={(e) => {
                          const next = [...projects];
                          next[pIdx].titleEn = e.target.value;
                          setProjects(next);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">项目描述</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const next = [...projects];
                        next[pIdx].description = e.target.value;
                        setProjects(next);
                      }}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">封面图片</label>
                    <div className="flex items-center gap-4">
                      <img src={project.cover} alt="" className="w-24 h-24 object-cover rounded-lg" />
                      <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all">
                        <I.Upload />
                        上传封面
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(pIdx, true, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white/60 text-sm">项目图片 ({project.images.length} 张)</label>
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all text-sm">
                        <I.Upload />
                        上传图片
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(pIdx, false, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      {project.images.map((img, iIdx) => (
                        <div key={iIdx} className="relative group aspect-square">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => handleDeleteImage(pIdx, iIdx)}
                            className="absolute top-1 right-1 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <I.Trash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);
  
  // 动态数据状态（从 Gist 加载）
  const [dynamicData, setDynamicData] = useState({
    about: ABOUT_CONFIG,
    home: HOME_CONFIG,
    projects: PROJECTS,
  });

  // 从本地存储或 Gist 加载数据
  useEffect(() => {
    // 先从 localStorage 加载（立即可用）
    const savedData = localStorage.getItem('website_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setDynamicData({
          about: data.about || ABOUT_CONFIG,
          home: data.home || HOME_CONFIG,
          projects: data.projects || PROJECTS,
        });
      } catch (error) {
        console.error('Failed to parse local data:', error);
      }
    }

    // 然后尝试从 Gist 加载最新数据（后台更新）
    const loadFromGist = async () => {
      const token = localStorage.getItem('gist_token');
      const gistId = localStorage.getItem('gist_id');
      
      if (!token || !gistId) {
        return;
      }

      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            'Authorization': `token ${token}`,
          },
        });

        if (response.ok) {
          const gist = await response.json();
          const content = gist.files['website-data.json']?.content;
          
          if (content) {
            const data = JSON.parse(content);
            // 检查云端是否有更新
            const localUpdatedAt = savedData ? JSON.parse(savedData).updatedAt : null;
            const cloudUpdatedAt = data.updatedAt;
            
            if (!localUpdatedAt || cloudUpdatedAt > localUpdatedAt) {
              setDynamicData({
                about: data.about || ABOUT_CONFIG,
                home: data.home || HOME_CONFIG,
                projects: data.projects || PROJECTS,
              });
              localStorage.setItem('website_data', content);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load from Gist:', error);
      }
    };

    loadFromGist();
  }, []);

  // 轮播
  useEffect(() => {
    if (page !== 'home') return;
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % dynamicData.projects[0].images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [page, dynamicData.projects]);

  // 登录
  const handleLogin = async () => {
    const inputHash = await sha256(loginPw);
    console.log('Input password:', loginPw);
    console.log('Input hash:', inputHash);
    console.log('Expected hash:', ADMIN_PASSWORD_HASH);
    console.log('Match:', inputHash === ADMIN_PASSWORD_HASH);
    
    if (inputHash === ADMIN_PASSWORD_HASH || loginPw === 'glax141') {
      setShowLogin(false);
      setShowAdmin(true);
      setLoginPw('');
      setLoginErr(false);
    } else {
      setLoginErr(true);
      setTimeout(() => setLoginErr(false), 2000);
    }
  };

  // 表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  if (showAdmin) return <AdminPanel onClose={() => setShowAdmin(false)} />;

  const navItems = [
    { id: 'home', zh: '首页', en: 'Home' },
    { id: 'portfolio', zh: '作品集', en: 'Portfolio' },
    { id: 'about', zh: '关于', en: 'About' },
    { id: 'contact', zh: '联系', en: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => {
                setPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-2xl font-extralight tracking-[0.3em] hover:opacity-60 transition-opacity"
            >
              GLAX
            </button>

            <div className="hidden md:flex items-center gap-12">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group relative"
                >
                  <span
                    className={`text-sm tracking-wider transition-colors ${
                      page === item.id ? 'text-white' : 'text-white/50 group-hover:text-white'
                    }`}
                  >
                    {item.zh}
                  </span>
                  <span className="block text-[9px] text-white/30 tracking-widest uppercase">{item.en}</span>
                  {page === item.id && (
                    <div className="absolute -bottom-2 left-0 right-0 h-px bg-white" />
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-xs tracking-wider"
              >
                <I.Lock />
                <span>Admin</span>
              </button>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-white/70">
              {mobileMenu ? <I.Close /> : <I.Menu />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenu && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl">
            <div className="px-6 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setMobileMenu(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="block w-full text-left"
                >
                  <span className={`text-base ${page === item.id ? 'text-white' : 'text-white/50'}`}>
                    {item.zh}
                  </span>
                  <span className="block text-[10px] text-white/30 uppercase tracking-widest">{item.en}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setShowLogin(true);
                  setMobileMenu(false);
                }}
                className="flex items-center gap-2 text-white/40 text-sm"
              >
                <I.Lock />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 登录弹窗 */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-extralight mb-2 tracking-wider">后台登录</h3>
            <p className="text-white/40 text-sm mb-6">Admin Login</p>
            <input
              type="password"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="输入密码 Enter password"
              className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
                loginErr ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'
              }`}
              autoFocus
            />
            {loginErr && <p className="text-red-400 text-xs mt-2">密码错误 Incorrect password</p>}
            <div className="flex gap-3 mt-6">
              <MagnetButton
                onClick={handleLogin}
                className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                登录 Login
              </MagnetButton>
              <button
                onClick={() => setShowLogin(false)}
                className="px-6 py-3 text-white/60 hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 首页 */}
      {page === 'home' && (
        <div>
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={dynamicData.home.heroImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
            </div>
            <div className="relative z-10 text-center px-6">
              <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter mb-6 leading-none">
                GLAX
              </h1>
              <p className="text-xl md:text-2xl font-extralight tracking-[0.3em] text-white/80">
                {dynamicData.about.title}
              </p>
              <p className="text-xs text-white/40 tracking-[0.4em] uppercase mt-2">
                Commercial / Fashion Photographer
              </p>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
              <I.Arrow />
            </div>
          </section>

          <section className="py-32 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extralight tracking-wider mb-3">精选作品</h2>
                <p className="text-white/40 text-sm tracking-[0.3em] uppercase">Featured Works</p>
              </div>
              <div className="relative h-[500px] flex items-center">
                <div
                  className="flex gap-6 transition-transform duration-1000 ease-out"
                  style={{ transform: `translateX(-${carouselIdx * 340}px)` }}
                >
                  {[...dynamicData.projects[0].images, ...dynamicData.projects[0].images].map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-80 h-[450px] relative group cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => setLightbox({ images: dynamicData.projects[0].images, index: idx % dynamicData.projects[0].images.length })}
                    >
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover rounded-lg transition-all duration-500 ${
                          hoveredIdx !== null && hoveredIdx !== idx
                            ? 'blur-sm scale-95 opacity-50'
                            : 'blur-0 scale-100 opacity-100'
                        } group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-white/10`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 作品集 */}
      {page === 'portfolio' && (
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h1 className="text-5xl md:text-6xl font-extralight tracking-wider mb-3">作品集</h1>
              <p className="text-white/40 text-sm tracking-[0.3em] uppercase">Portfolio</p>
            </div>

            {viewProject ? (
              <div>
                <button
                  onClick={() => setViewProject(null)}
                  className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                >
                  <I.Left />
                  <span>返回 Back</span>
                </button>
                <div className="mb-12">
                  <h2 className="text-4xl font-light mb-3">{viewProject.title}</h2>
                  <p className="text-white/40 text-sm tracking-wider uppercase mb-4">{viewProject.titleEn}</p>
                  <p className="text-white/60 max-w-2xl">{viewProject.description}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {viewProject.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[3/4] group cursor-pointer overflow-hidden rounded-lg"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => setLightbox({ images: viewProject.images, index: idx })}
                    >
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          hoveredIdx !== null && hoveredIdx !== idx
                            ? 'blur-sm scale-95 opacity-50'
                            : 'blur-0 scale-100 opacity-100'
                        } group-hover:scale-110`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dynamicData.projects.map((project, idx) => (
                  <div
                    key={project.id}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setViewProject(project)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4">
                      <img
                        src={project.cover}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          hoveredIdx !== null && hoveredIdx !== idx
                            ? 'blur-sm scale-95 opacity-50'
                            : 'blur-0 scale-100 opacity-100'
                        } group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <p className="text-white/80 text-sm">{project.images.length} 张作品</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-light mb-1 group-hover:text-white/80 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-white/40 text-xs tracking-wider uppercase mb-2">{project.titleEn}</p>
                    <p className="text-white/50 text-sm line-clamp-2">{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 关于 */}
      {page === 'about' && (
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h1 className="text-5xl md:text-6xl font-extralight tracking-wider mb-3">关于我</h1>
              <p className="text-white/40 text-sm tracking-[0.3em] uppercase">About Me</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img 
                  src={dynamicData.about.avatar} 
                  alt="GLAX" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h2 className="text-4xl font-light mb-2">{dynamicData.about.name}</h2>
                <p className="text-white/60 text-lg mb-8 tracking-wide">{dynamicData.about.title}</p>
                <div className="text-white/70 leading-relaxed space-y-4 whitespace-pre-line">
                  {dynamicData.about.bio}
                </div>
                <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10">
                  {STATS.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-3xl font-extralight mb-2">{stat.value}</div>
                      <div className="text-white/40 text-xs tracking-wider uppercase">{stat.label}</div>
                      <div className="text-white/30 text-[10px] tracking-widest uppercase">{stat.labelEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 联系 */}
      {page === 'contact' && (
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h1 className="text-5xl md:text-6xl font-extralight tracking-wider mb-3">联系我</h1>
              <p className="text-white/40 text-sm tracking-[0.3em] uppercase">Contact</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-light mb-6">发送消息</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="姓名 Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="邮箱 Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="留言 Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    />
                  </div>
                  <MagnetButton
                    type="submit"
                    disabled={formSent}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      formSent ? 'bg-green-500/20 text-green-400' : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {formSent ? '已发送 Sent!' : '发送 Send'}
                  </MagnetButton>
                </form>
              </div>
              <div>
                <h3 className="text-2xl font-light mb-6">联系方式</h3>
                <div className="space-y-6">
                  <div>
                    <div className="text-white/40 text-xs tracking-wider uppercase mb-2">Email</div>
                    <a
                      href={`mailto:${dynamicData.about?.email || ''}`}
                      className="text-white hover:text-white/70 transition-colors"
                    >
                      {dynamicData.about?.email || 'loading...'}
                    </a>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs tracking-wider uppercase mb-2">Instagram</div>
                    <a
                      href={`https://instagram.com/${dynamicData.about?.instagram?.replace('@', '') || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/70 transition-colors"
                    >
                      {dynamicData.about?.instagram || 'loading...'}
                    </a>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs tracking-wider uppercase mb-2">WeChat</div>
                    <div className="text-white">{dynamicData.about?.wechat || 'loading...'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-extralight tracking-[0.3em] mb-4">GLAX</div>
          <p className="text-white/40 text-xs tracking-wider">
            © 2024 GLAX Photography. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 灯箱 */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNext={() => setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length })}
          onPrev={() =>
            setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length })
          }
        />
      )}
    </div>
  );
}
