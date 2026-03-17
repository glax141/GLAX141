import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HOME_CONFIG,
  ABOUT_CONFIG,
  PROJECTS,
  STATS,
  ADMIN_PASSWORD_HASH,
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

// 从 localStorage 读取数据（带默认值）
function loadLocalData() {
  try {
    const about = JSON.parse(localStorage.getItem('site_about') || 'null') || ABOUT_CONFIG;
    const home = JSON.parse(localStorage.getItem('site_home') || 'null') || HOME_CONFIG;
    const projects = JSON.parse(localStorage.getItem('site_projects') || 'null') || PROJECTS;
    return { about, home, projects };
  } catch {
    return { about: ABOUT_CONFIG, home: HOME_CONFIG, projects: PROJECTS };
  }
}

// 保存到 localStorage
function saveLocalData(about: any, home: any, projects: any) {
  localStorage.setItem('site_about', JSON.stringify(about));
  localStorage.setItem('site_home', JSON.stringify(home));
  localStorage.setItem('site_projects', JSON.stringify(projects));
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
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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
function MagnetButton({ children, className = '', onClick, disabled = false, type = 'button' }: any) {
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
      type={type}
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
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-6 text-white/60 hover:text-white transition-colors z-10 p-3 hover:bg-white/10 rounded-full"
      >
        <I.Left />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
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
// 压缩图片
// ============================================
function compressImage(file: File, maxWidth = 1920, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ============================================
// 后台管理面板
// ============================================
function AdminPanel({
  onClose,
  onDataSaved,
}: {
  onClose: () => void;
  onDataSaved: (about: any, home: any, projects: any) => void;
}) {
  const localData = loadLocalData();
  const [about, setAbout] = useState({ ...localData.about });
  const [home, setHome] = useState({ ...localData.home });
  const [projects, setProjects] = useState<Project[]>(
    localData.projects.map((p: Project) => ({ ...p, images: [...p.images] }))
  );
  const [gistToken, setGistToken] = useState(localStorage.getItem('gist_token') || '');
  const [gistId, setGistId] = useState(localStorage.getItem('gist_id') || '');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 标记有改动
  const markChanged = () => setHasChanges(true);

  // ✅ 保存到本地（立即生效，所有设备通过 Gist 同步后也能看到）
  const handleSaveLocal = () => {
    saveLocalData(about, home, projects);
    onDataSaved(about, home, projects);
    setHasChanges(false);
    setSaveStatus('✅ 已保存！页面已实时更新');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // 保存 Token
  const handleSaveToken = () => {
    if (!gistToken.trim()) {
      setSyncStatus('❌ 请输入 Token');
      return;
    }
    localStorage.setItem('gist_token', gistToken.trim());
    setSyncStatus('✅ Token 已保存');
    setTimeout(() => setSyncStatus(''), 2000);
  };

  // ☁️ 同步到 Gist
  const handleSyncToGist = async () => {
    const token = gistToken.trim() || localStorage.getItem('gist_token') || '';
    if (!token) {
      setSyncStatus('❌ 请先输入并保存 GitHub Token');
      return;
    }

    // 先保存本地
    saveLocalData(about, home, projects);
    onDataSaved(about, home, projects);
    setHasChanges(false);

    setSyncing(true);
    setSyncStatus('⏳ 正在同步到云端...');

    try {
      const payload = {
        about,
        home,
        projects,
        updatedAt: new Date().toISOString(),
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const sizeKB = (jsonStr.length / 1024).toFixed(1);
      console.log(`📤 同步数据大小: ${sizeKB} KB`);

      if (jsonStr.length > 10 * 1024 * 1024) {
        setSyncStatus('❌ 数据超过10MB，请减少本地上传图片，改用图片URL链接');
        setSyncing(false);
        return;
      }

      const gistBody = {
        description: 'GLAX Photography Website Data',
        public: false,
        files: {
          'website-data.json': { content: jsonStr },
        },
      };

      const currentGistId = gistId || localStorage.getItem('gist_id') || '';
      let response: Response;

      if (currentGistId) {
        console.log('📝 更新 Gist:', currentGistId);
        response = await fetch(`https://api.github.com/gists/${currentGistId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify(gistBody),
        });
      } else {
        console.log('🆕 创建新 Gist');
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify(gistBody),
        });
      }

      console.log('📡 GitHub API 响应:', response.status);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = (err as any).message || `HTTP ${response.status}`;
        if (response.status === 401) throw new Error('Token 无效或已过期，请重新生成');
        if (response.status === 403) throw new Error('Token 没有 gist 权限，请勾选 gist 权限');
        if (response.status === 422) throw new Error('数据格式错误');
        throw new Error(msg);
      }

      const result = await response.json();
      const newGistId = result.id;
      console.log('✅ Gist ID:', newGistId);

      setGistId(newGistId);
      localStorage.setItem('gist_id', newGistId);
      localStorage.setItem('gist_token', token);

      setSyncStatus(`✅ 云端同步成功！其他设备刷新页面即可看到更新（数据: ${sizeKB}KB）`);
      setTimeout(() => setSyncStatus(''), 6000);
    } catch (error: any) {
      console.error('❌ Gist 同步错误:', error);
      let msg = error.message || '未知错误';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        msg = '网络错误：无法连接 GitHub，请检查网络或开启 VPN';
      }
      setSyncStatus(`❌ 同步失败：${msg}`);
      setTimeout(() => setSyncStatus(''), 8000);
    } finally {
      setSyncing(false);
    }
  };

  // 从 Gist 加载
  const handleLoadFromGist = async () => {
    const token = gistToken.trim() || localStorage.getItem('gist_token') || '';
    const id = gistId || localStorage.getItem('gist_id') || '';
    if (!token || !id) {
      setSyncStatus('❌ 请先配置 Token 并同步过数据');
      return;
    }

    setSyncing(true);
    setSyncStatus('⏳ 从云端加载中...');

    try {
      const response = await fetch(`https://api.github.com/gists/${id}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const gist = await response.json();
      const content = gist.files['website-data.json']?.content;
      if (!content) throw new Error('Gist 中没有数据文件');

      const data = JSON.parse(content);
      if (data.about) setAbout(data.about);
      if (data.home) setHome(data.home);
      if (data.projects) setProjects(data.projects);

      saveLocalData(data.about, data.home, data.projects);
      onDataSaved(data.about, data.home, data.projects);

      setSyncStatus('✅ 从云端加载成功！页面已更新');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (error: any) {
      setSyncStatus(`❌ 加载失败：${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  // 上传图片（压缩）
  const handleImageUpload = useCallback(
    async (projectIdx: number, isCover: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const fileArr = Array.from(files);
      const compressed = await Promise.all(fileArr.map((f) => compressImage(f)));
      setProjects((prev) => {
        const next = prev.map((p) => ({ ...p, images: [...p.images] }));
        if (isCover) {
          next[projectIdx].cover = compressed[0];
        } else {
          next[projectIdx].images = [...next[projectIdx].images, ...compressed];
        }
        return next;
      });
      markChanged();
      e.target.value = '';
    },
    []
  );

  // 上传头像
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 800, 0.88);
    setAbout((prev: any) => ({ ...prev, avatar: compressed }));
    markChanged();
    e.target.value = '';
  };

  const handleDeleteImage = (projectIdx: number, imageIdx: number) => {
    setProjects((prev) => {
      const next = prev.map((p) => ({ ...p, images: [...p.images] }));
      next[projectIdx].images = next[projectIdx].images.filter((_, i) => i !== imageIdx);
      return next;
    });
    markChanged();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white text-lg font-light tracking-[0.15em]">
              后台管理 <span className="text-white/30 text-xs ml-2">Admin Panel</span>
            </h2>
            {hasChanges && (
              <p className="text-yellow-400 text-xs mt-0.5 animate-pulse">● 有未保存的修改</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* 保存按钮 */}
            <MagnetButton
              onClick={handleSaveLocal}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                hasChanges
                  ? 'bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/30'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <I.Save />
              {hasChanges ? '保存更改' : '已保存'}
            </MagnetButton>
            <MagnetButton
              onClick={handleSyncToGist}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              <I.Cloud />
              {syncing ? '同步中...' : '同步云端'}
            </MagnetButton>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
              <I.Close />
            </button>
          </div>
        </div>
        {/* 状态提示 */}
        {(syncStatus || saveStatus) && (
          <div className="max-w-6xl mx-auto mt-2">
            <div className={`text-sm px-4 py-2 rounded-lg ${
              (syncStatus || saveStatus).includes('✅')
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : (syncStatus || saveStatus).includes('❌')
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {syncStatus || saveStatus}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">

        {/* 流程说明 */}
        <section className="border border-yellow-500/30 rounded-xl p-5 bg-yellow-500/5">
          <h3 className="text-yellow-400 text-base font-medium mb-3">📋 使用流程</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold text-lg leading-none">1</span>
              <div>
                <p className="font-medium text-white mb-1">修改内容</p>
                <p className="text-white/50 text-xs">修改下方任意内容（图片、文字、联系方式等）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold text-lg leading-none">2</span>
              <div>
                <p className="font-medium text-white mb-1">点击「保存更改」</p>
                <p className="text-white/50 text-xs">顶部绿色按钮，立即在当前页面生效</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold text-lg leading-none">3</span>
              <div>
                <p className="font-medium text-white mb-1">点击「同步云端」</p>
                <p className="text-white/50 text-xs">需要 GitHub Token，同步后其他设备刷新可见</p>
              </div>
            </div>
          </div>
        </section>

        {/* 云端同步 */}
        <section className="border border-blue-500/30 rounded-xl p-5 bg-blue-500/5">
          <h3 className="text-white text-base font-light mb-1 flex items-center gap-2">
            <I.Cloud />
            云端同步设置
            <span className="text-white/30 text-xs">GitHub Gist Sync</span>
          </h3>
          <p className="text-white/40 text-xs mb-4">
            配置后可跨设备同步。需要 GitHub Token（只需勾选 gist 权限）—
            <a
              href="https://github.com/settings/tokens/new?description=GLAX+Website&scopes=gist"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline ml-1"
            >
              点击直接创建 Token →
            </a>
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="password"
                value={gistToken}
                onChange={(e) => setGistToken(e.target.value)}
                placeholder="粘贴 GitHub Token (ghp_xxxxxxxxxxxx)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/30"
              />
              <MagnetButton
                onClick={handleSaveToken}
                className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all whitespace-nowrap"
              >
                保存 Token
              </MagnetButton>
              <MagnetButton
                onClick={handleLoadFromGist}
                disabled={syncing || !gistToken || !gistId}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all disabled:opacity-40 whitespace-nowrap"
              >
                <I.Refresh />
                从云端加载
              </MagnetButton>
            </div>

            {gistId && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-green-400 text-xs">✅ 已连接 Gist：</span>
                <span className="text-white/50 text-xs font-mono">{gistId}</span>
              </div>
            )}
          </div>
        </section>

        {/* 首页设置 */}
        <section className="border border-white/10 rounded-xl p-5">
          <h3 className="text-white text-base font-light mb-4 tracking-wider">
            🏠 首页设置 <span className="text-white/30 text-xs">Home</span>
          </h3>
          <div>
            <label className="block text-white/60 text-sm mb-2">首页大图 URL（或上传图片）</label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={home.heroImage.startsWith('data:') ? '（已上传本地图片）' : home.heroImage}
                onChange={(e) => {
                  setHome({ ...home, heroImage: e.target.value });
                  markChanged();
                }}
                placeholder="https://..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30"
              />
              <label className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all text-sm whitespace-nowrap">
                <I.Upload />
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const compressed = await compressImage(file, 1920, 0.85);
                    setHome({ ...home, heroImage: compressed });
                    markChanged();
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {home.heroImage && (
              <div className="w-full h-32 rounded-lg overflow-hidden border border-white/10">
                <img src={home.heroImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>

        {/* 关于我 */}
        <section className="border border-white/10 rounded-xl p-5">
          <h3 className="text-white text-base font-light mb-4 tracking-wider">
            👤 关于我 <span className="text-white/30 text-xs">About</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">头像</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={about.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all text-sm">
                    <I.Upload />
                    上传头像
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  <input
                    type="text"
                    value={about.avatar.startsWith('data:') ? '' : about.avatar}
                    onChange={(e) => { setAbout({ ...about, avatar: e.target.value }); markChanged(); }}
                    placeholder="或输入头像 URL"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">邮箱</label>
                <input
                  type="text"
                  value={about.email}
                  onChange={(e) => { setAbout({ ...about, email: e.target.value }); markChanged(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Instagram</label>
                <input
                  type="text"
                  value={about.instagram}
                  onChange={(e) => { setAbout({ ...about, instagram: e.target.value }); markChanged(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">微信</label>
                <input
                  type="text"
                  value={about.wechat}
                  onChange={(e) => { setAbout({ ...about, wechat: e.target.value }); markChanged(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">个人简介</label>
              <textarea
                value={about.bio}
                onChange={(e) => { setAbout({ ...about, bio: e.target.value }); markChanged(); }}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
          </div>
        </section>

        {/* 项目管理 */}
        <section className="border border-white/10 rounded-xl p-5">
          <h3 className="text-white text-base font-light mb-6 tracking-wider">
            🖼️ 项目管理 <span className="text-white/30 text-xs">Projects</span>
          </h3>
          <div className="space-y-8">
            {projects.map((project, pIdx) => (
              <div key={project.id} className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                <h4 className="text-white font-medium mb-4 text-lg">{project.title}</h4>
                <div className="space-y-4">
                  {/* 标题和描述 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-xs mb-1.5">项目标题（中文）</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => {
                          const next = projects.map((p, i) => i === pIdx ? { ...p, title: e.target.value } : p);
                          setProjects(next);
                          markChanged();
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs mb-1.5">项目标题（英文）</label>
                      <input
                        type="text"
                        value={project.titleEn}
                        onChange={(e) => {
                          const next = projects.map((p, i) => i === pIdx ? { ...p, titleEn: e.target.value } : p);
                          setProjects(next);
                          markChanged();
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">项目描述</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const next = projects.map((p, i) => i === pIdx ? { ...p, description: e.target.value } : p);
                        setProjects(next);
                        markChanged();
                      }}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                    />
                  </div>

                  {/* 封面图 */}
                  <div>
                    <label className="block text-white/50 text-xs mb-2">封面图片</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-28 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={project.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all text-sm">
                          <I.Upload />
                          上传封面
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(pIdx, true, e)}
                          />
                        </label>
                        <input
                          type="text"
                          value={project.cover.startsWith('data:') ? '' : project.cover}
                          onChange={(e) => {
                            const next = projects.map((p, i) => i === pIdx ? { ...p, cover: e.target.value } : p);
                            setProjects(next);
                            markChanged();
                          }}
                          placeholder="或输入封面图片 URL"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 项目图片 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white/50 text-xs">
                        项目图片（共 {project.images.length} 张）
                      </label>
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all text-xs">
                        <I.Upload />
                        批量上传
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(pIdx, false, e)}
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {project.images.map((img, iIdx) => (
                        <div key={iIdx} className="relative group aspect-square">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => handleDeleteImage(pIdx, iIdx)}
                            className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <I.Trash />
                          </button>
                        </div>
                      ))}
                      {project.images.length === 0 && (
                        <div className="col-span-full text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-lg">
                          暂无图片，点击「批量上传」添加
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 底部保存 */}
        <div className="sticky bottom-6 flex justify-center">
          <MagnetButton
            onClick={hasChanges ? handleSaveLocal : handleSyncToGist}
            disabled={syncing}
            className={`flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium shadow-2xl transition-all ${
              hasChanges
                ? 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/40'
                : 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/40 shadow-blue-500/20 disabled:opacity-50'
            }`}
          >
            {hasChanges ? (
              <><I.Save /> 保存所有更改</>
            ) : (
              <><I.Cloud /> {syncing ? '同步中...' : '同步到云端（跨设备）'}</>
            )}
          </MagnetButton>
        </div>

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
  const [projectPage, setProjectPage] = useState(0);
  const IMGS_PER_PAGE = 10;

  // 动态数据
  const [siteData, setSiteData] = useState(() => loadLocalData());

  // 启动时从 Gist 加载（如果已配置）
  useEffect(() => {
    const token = localStorage.getItem('gist_token');
    const gistId = localStorage.getItem('gist_id');
    if (!token || !gistId) return;

    fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((gist) => {
        if (!gist) return;
        const content = gist.files['website-data.json']?.content;
        if (!content) return;
        const data = JSON.parse(content);
        const newData = {
          about: data.about || ABOUT_CONFIG,
          home: data.home || HOME_CONFIG,
          projects: data.projects || PROJECTS,
        };
        setSiteData(newData);
        saveLocalData(newData.about, newData.home, newData.projects);
        console.log('✅ 已从 Gist 加载最新数据');
      })
      .catch((err) => console.warn('⚠️ Gist 加载失败（使用本地缓存）:', err));
  }, []);

  // 后台保存回调
  const handleDataSaved = useCallback((about: any, home: any, projects: any) => {
    setSiteData({ about, home, projects });
  }, []);

  // 轮播
  useEffect(() => {
    if (page !== 'home') return;
    const imgs = siteData.projects[0]?.images || [];
    if (imgs.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % imgs.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [page, siteData.projects]);

  // 登录
  const handleLogin = async () => {
    const inputHash = await sha256(loginPw);
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

  // 表单
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const navigate = (p: string) => {
    setPage(p);
    setViewProject(null);
    setProjectPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showAdmin)
    return (
      <AdminPanel
        onClose={() => setShowAdmin(false)}
        onDataSaved={handleDataSaved}
      />
    );

  const navItems = [
    { id: 'home', zh: '首页', en: 'Home' },
    { id: 'portfolio', zh: '作品集', en: 'Portfolio' },
    { id: 'about', zh: '关于', en: 'About' },
    { id: 'contact', zh: '联系', en: 'Contact' },
  ];

  const carouselImages = siteData.projects[0]?.images || [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">

      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => navigate('home')}
              className="text-2xl font-extralight tracking-[0.3em] hover:opacity-60 transition-opacity"
            >
              GLAX
            </button>

            <div className="hidden md:flex items-center gap-12">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className="group relative"
                >
                  <span className={`text-sm tracking-wider transition-colors ${page === item.id ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                    {item.zh}
                  </span>
                  <span className="block text-[9px] text-white/30 tracking-widest uppercase">{item.en}</span>
                  {page === item.id && <div className="absolute -bottom-2 left-0 right-0 h-px bg-white" />}
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

        {mobileMenu && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl">
            <div className="px-6 py-6 space-y-5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setMobileMenu(false); }}
                  className="block w-full text-left"
                >
                  <span className={`text-base ${page === item.id ? 'text-white' : 'text-white/50'}`}>{item.zh}</span>
                  <span className="block text-[10px] text-white/30 uppercase tracking-widest">{item.en}</span>
                </button>
              ))}
              <button
                onClick={() => { setShowLogin(true); setMobileMenu(false); }}
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
              className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${loginErr ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'}`}
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
              <button onClick={() => setShowLogin(false)} className="px-6 py-3 text-white/60 hover:text-white transition-colors">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 首页 */}
      {page === 'home' && (
        <div>
          {/* Hero */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={siteData.home.heroImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
            </div>
            <div className="relative z-10 text-center px-6">
              <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter mb-6 leading-none">
                GLAX
              </h1>
              <p className="text-xl md:text-2xl font-extralight tracking-[0.3em] text-white/80">
                {siteData.about.title}
              </p>
              <p className="text-xs text-white/40 tracking-[0.4em] uppercase mt-2">
                Commercial / Fashion Photographer
              </p>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-white/60">
              <I.Arrow />
            </div>
          </section>

          {/* 轮播 */}
          {carouselImages.length > 0 && (
            <section className="py-32 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-extralight tracking-wider mb-3">精选作品</h2>
                  <p className="text-white/40 text-sm tracking-[0.3em] uppercase">Featured Works</p>
                </div>
              </div>
              <div className="relative h-[480px] flex items-center overflow-hidden">
                <div
                  className="flex gap-5 transition-transform duration-1000 ease-out pl-6"
                  style={{ transform: `translateX(-${carouselIdx * 310}px)` }}
                >
                  {[...carouselImages, ...carouselImages, ...carouselImages].map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-72 h-[420px] relative group cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() =>
                        setLightbox({
                          images: carouselImages,
                          index: idx % carouselImages.length,
                        })
                      }
                    >
                      <img
                        src={img}
                        alt=""
                        className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${
                          hoveredIdx !== null && hoveredIdx !== idx
                            ? 'blur-sm scale-95 opacity-40'
                            : 'blur-0 scale-100 opacity-100'
                        } group-hover:scale-105 group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-white/10`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
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
                  onClick={() => { setViewProject(null); setProjectPage(0); }}
                  className="flex items-center gap-2 text-white/60 hover:text-white mb-10 transition-colors"
                >
                  <I.Left />
                  <span>返回 Back</span>
                </button>
                <div className="mb-12">
                  <h2 className="text-4xl font-light mb-2">{viewProject.title}</h2>
                  <p className="text-white/40 text-sm tracking-wider uppercase mb-4">{viewProject.titleEn}</p>
                  <p className="text-white/60 max-w-2xl leading-relaxed">{viewProject.description}</p>
                </div>

                {/* 分页图片 */}
                {(() => {
                  const totalPages = Math.ceil(viewProject.images.length / IMGS_PER_PAGE);
                  const pageImgs = viewProject.images.slice(
                    projectPage * IMGS_PER_PAGE,
                    (projectPage + 1) * IMGS_PER_PAGE
                  );
                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {pageImgs.map((img, idx) => {
                          const globalIdx = projectPage * IMGS_PER_PAGE + idx;
                          return (
                            <div
                              key={globalIdx}
                              className="relative aspect-[3/4] group cursor-pointer overflow-hidden rounded-lg"
                              onMouseEnter={() => setHoveredIdx(globalIdx)}
                              onMouseLeave={() => setHoveredIdx(null)}
                              onClick={() => setLightbox({ images: viewProject.images, index: globalIdx })}
                            >
                              <img
                                src={img}
                                alt=""
                                className={`w-full h-full object-cover transition-all duration-500 ${
                                  hoveredIdx !== null && hoveredIdx !== globalIdx
                                    ? 'blur-sm scale-95 opacity-40'
                                    : 'blur-0 scale-100 opacity-100'
                                } group-hover:scale-110`}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          );
                        })}
                      </div>

                      {/* 翻页 */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12">
                          <button
                            onClick={() => { setProjectPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={projectPage === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <I.Left />
                            上一页
                          </button>
                          <span className="text-white/50 text-sm">
                            {projectPage + 1} / {totalPages}
                            <span className="text-white/30 ml-2 text-xs">（共 {viewProject.images.length} 张）</span>
                          </span>
                          <button
                            onClick={() => { setProjectPage((p) => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={projectPage >= totalPages - 1}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            下一页
                            <I.Right />
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {siteData.projects.map((project: Project, idx: number) => (
                  <div
                    key={project.id}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => { setViewProject(project); setProjectPage(0); }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4">
                      <img
                        src={project.cover}
                        alt={project.title}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          hoveredIdx !== null && hoveredIdx !== idx
                            ? 'blur-sm scale-95 opacity-40'
                            : 'blur-0 scale-100 opacity-100'
                        } group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <p className="text-white/80 text-sm">{project.images.length} 张作品</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-light mb-1 group-hover:text-white/80 transition-colors">{project.title}</h3>
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
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden sticky top-28">
                <img src={siteData.about.avatar} alt="GLAX" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div>
                <h2 className="text-4xl font-light mb-2">{siteData.about.name}</h2>
                <p className="text-white/60 text-lg mb-8 tracking-wide">{siteData.about.title}</p>
                <div className="text-white/70 leading-relaxed space-y-4 whitespace-pre-line text-[15px]">
                  {siteData.about.bio}
                </div>
                <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10">
                  {STATS.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-3xl font-extralight mb-1">{stat.value}</div>
                      <div className="text-white/40 text-xs tracking-wider uppercase">{stat.label}</div>
                      <div className="text-white/25 text-[10px] tracking-widest uppercase">{stat.labelEn}</div>
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
                <h3 className="text-2xl font-light mb-6">发送消息 <span className="text-white/30 text-sm">Send Message</span></h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="姓名 Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="邮箱 Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <textarea
                    placeholder="留言 Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                  <MagnetButton
                    type="submit"
                    disabled={formSent}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      formSent ? 'bg-green-500/20 text-green-400' : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {formSent ? '✅ 已发送 Sent!' : '发送 Send'}
                  </MagnetButton>
                </form>
              </div>
              <div>
                <h3 className="text-2xl font-light mb-6">联系方式 <span className="text-white/30 text-sm">Contact Info</span></h3>
                <div className="space-y-8">
                  <div className="group">
                    <div className="text-white/30 text-xs tracking-[0.2em] uppercase mb-2">Email</div>
                    <a
                      href={`mailto:${siteData.about.email}`}
                      className="text-white text-lg hover:text-white/70 transition-colors group-hover:translate-x-1 inline-block transition-transform"
                    >
                      {siteData.about.email}
                    </a>
                  </div>
                  <div className="group">
                    <div className="text-white/30 text-xs tracking-[0.2em] uppercase mb-2">Instagram</div>
                    <a
                      href={`https://instagram.com/${siteData.about.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-lg hover:text-white/70 transition-colors inline-block"
                    >
                      {siteData.about.instagram}
                    </a>
                  </div>
                  <div className="group">
                    <div className="text-white/30 text-xs tracking-[0.2em] uppercase mb-2">WeChat 微信</div>
                    <div className="text-white text-lg">{siteData.about.wechat}</div>
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
          <p className="text-white/30 text-xs tracking-wider">
            © {new Date().getFullYear()} GLAX Photography · All rights reserved
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
          onPrev={() => setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length })}
        />
      )}
    </div>
  );
}
