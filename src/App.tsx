import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PROJECTS, ABOUT_CONFIG, HOME_CONFIG, GITHUB_CONFIG, ADMIN_PASSWORD_HASH, CAROUSEL_CONFIG } from './config';

// 工具函数
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// 类型定义
interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  images: string[];
}

interface DynamicData {
  home: { heroImage: string };
  about: {
    name: string;
    title: string;
    avatar: string;
    bio: string[];
    stats: { years: string; projects: string; clients: string };
    contact: { email: string; instagram: string; wechat: string };
  };
  projects: Project[];
}

// 密码哈希函数
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 图片压缩函数
const compressImage = async (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
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
    };
  });
};

// GitHub API 服务（仅用于后台）
const GitHubAPI = {
  async uploadFile(path: string, content: string, token: string, message: string) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${path}`;
    
    // 先检查文件是否存在
    let sha = '';
    try {
      const checkResponse = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        sha = data.sha;
      }
    } catch (e) {
      // 文件不存在，继续
    }

    const body: any = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: GITHUB_CONFIG.branch,
    };
    if (sha) body.sha = sha;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '上传失败');
    }

    return response.json();
  },

  async deleteFile(path: string, token: string, message: string) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${path}`;
    
    const checkResponse = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!checkResponse.ok) {
      throw new Error('文件不存在');
    }
    
    const data = await checkResponse.json();
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sha: data.sha,
        branch: GITHUB_CONFIG.branch,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除失败');
    }
  },

  async getConfigContent(token: string) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/src/config.ts`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return atob(data.content);
  },
};

// 优化图片组件
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  sizes?: string;
}> = ({ src, alt, className, priority = false, onClick, sizes }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retrySrc, setRetrySrc] = useState(src);

  useEffect(() => {
    setIsLoaded(false);
    setError(false);
    setRetrySrc(src);
  }, [src]);

  const handleError = () => {
    if (retrySrc.includes('cdn.jsdelivr.net')) {
      const rawSrc = retrySrc.replace('cdn.jsdelivr.net/gh', 'raw.githubusercontent.com').replace('@main', '/main');
      setRetrySrc(rawSrc);
    } else {
      setError(true);
    }
  };

  return (
    <img
      src={retrySrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={sizes}
      className={cn(className, !isLoaded && 'opacity-0', error && 'bg-gray-800')}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      onClick={onClick}
      style={{ transition: 'opacity 0.3s ease' }}
    />
  );
};

// 灯箱组件
const Lightbox: React.FC<{
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ images, currentIndex, onClose, onPrevious, onNext }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300" onClick={onClose}>×</button>
      <button className="absolute left-4 text-white text-4xl hover:text-gray-300" onClick={(e) => { e.stopPropagation(); onPrevious(); }}>‹</button>
      <button className="absolute right-4 text-white text-4xl hover:text-gray-300" onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
        loading="eager"
      />
      <div className="absolute bottom-4 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

// 后台管理面板
const AdminPanel: React.FC<{
  onClose: () => void;
  dynamicData: DynamicData;
  setDynamicData: (data: DynamicData) => void;
}> = ({ onClose, dynamicData, setDynamicData }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'projects' | 'about' | 'contact'>('github');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('githubToken') || '');
  const [githubConfig, setGithubConfig] = useState({
    username: GITHUB_CONFIG.username,
    repo: GITHUB_CONFIG.repo,
    branch: GITHUB_CONFIG.branch,
  });
  const [status, setStatus] = useState('');
  const [selectedProject, setSelectedProject] = useState('lookbook');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 10;

  const [aboutForm, setAboutForm] = useState({
    avatar: dynamicData.about.avatar,
    bio: dynamicData.about.bio.join('\n\n'),
  });

  const [contactForm, setContactForm] = useState({
    email: dynamicData.about.contact.email,
    instagram: dynamicData.about.contact.instagram,
    wechat: dynamicData.about.contact.wechat,
  });

  const handleSaveToken = () => {
    localStorage.setItem('githubToken', githubToken);
    setStatus('✅ Token 已保存');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleUploadCover = async () => {
    if (!coverFile || !githubToken) {
      setStatus('❌ 请先配置 GitHub Token 并选择文件');
      return;
    }

    try {
      setStatus('⏳ 上传中...');
      const base64 = await compressImage(coverFile);
      const fileName = `cover_${Date.now()}.jpg`;
      const path = `public/images/${selectedProject}/${fileName}`;
      
      await GitHubAPI.uploadFile(path, base64.split(',')[1], githubToken, `上传封面：${selectedProject}`);
      
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${githubConfig.username}/${githubConfig.repo}@${githubConfig.branch}/${path}`;
      
      const newProjects = dynamicData.projects.map(p => 
        p.id === selectedProject ? { ...p, cover: cdnUrl } : p
      );
      
      const newData = { ...dynamicData, projects: newProjects };
      setDynamicData(newData);
      setStatus('✅ 封面上传成功');
      setCoverFile(null);
    } catch (error: any) {
      setStatus(`❌ 上传失败：${error.message}`);
    }
    setTimeout(() => setStatus(''), 3000);
  };

  const handleUploadImages = async () => {
    if (imageFiles.length === 0 || !githubToken) {
      setStatus('❌ 请先配置 GitHub Token 并选择文件');
      return;
    }

    try {
      setStatus('⏳ 上传中...');
      const newImages = [...dynamicData.projects.find(p => p.id === selectedProject)?.images || []];

      for (const file of imageFiles) {
        const base64 = await compressImage(file);
        const fileName = `${Date.now()}_${file.name}`;
        const path = `public/images/${selectedProject}/${fileName}`;
        
        await GitHubAPI.uploadFile(path, base64.split(',')[1], githubToken, `上传图片：${selectedProject}`);
        
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${githubConfig.username}/${githubConfig.repo}@${githubConfig.branch}/${path}`;
        newImages.push(cdnUrl);
      }

      const newProjects = dynamicData.projects.map(p =>
        p.id === selectedProject ? { ...p, images: newImages } : p
      );

      const newData = { ...dynamicData, projects: newProjects };
      setDynamicData(newData);
      setStatus(`✅ 成功上传 ${imageFiles.length} 张图片`);
      setImageFiles([]);
    } catch (error: any) {
      setStatus(`❌ 上传失败：${error.message}`);
    }
    setTimeout(() => setStatus(''), 3000);
  };

  const handleDeleteImage = async (imageUrl: string, isCover = false) => {
    if (!githubToken) return;
    if (!confirm('确定删除这张图片吗？')) return;

    try {
      const fileName = imageUrl.split('/').pop() || '';
      const path = `public/images/${selectedProject}/${fileName}`;
      await GitHubAPI.deleteFile(path, githubToken, `删除图片：${selectedProject}`);

      if (isCover) {
        const newProjects = dynamicData.projects.map(p =>
          p.id === selectedProject ? { ...p, cover: '' } : p
        );
        setDynamicData({ ...dynamicData, projects: newProjects });
      } else {
        const newImages = dynamicData.projects
          .find(p => p.id === selectedProject)?.images
          .filter(img => img !== imageUrl) || [];
        const newProjects = dynamicData.projects.map(p =>
          p.id === selectedProject ? { ...p, images: newImages } : p
        );
        setDynamicData({ ...dynamicData, projects: newProjects });
      }
      setStatus('✅ 删除成功');
    } catch (error: any) {
      setStatus(`❌ 删除失败：${error.message}`);
    }
    setTimeout(() => setStatus(''), 3000);
  };

  const handleSaveAbout = () => {
    const bio = aboutForm.bio.split('\n\n').filter(p => p.trim());
    const newData = {
      ...dynamicData,
      about: {
        ...dynamicData.about,
        avatar: aboutForm.avatar,
        bio,
      },
    };
    setDynamicData(newData);
    setStatus('✅ 关于我信息已更新');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleSaveContact = () => {
    const newData = {
      ...dynamicData,
      about: {
        ...dynamicData.about,
        contact: {
          email: contactForm.email,
          instagram: contactForm.instagram,
          wechat: contactForm.wechat,
        },
      },
    };
    setDynamicData(newData);
    setStatus('✅ 联系方式已更新');
    setTimeout(() => setStatus(''), 3000);
  };

  const generateConfigContent = () => {
    const projectsStr = JSON.stringify(dynamicData.projects, null, 2);
    const aboutStr = JSON.stringify(dynamicData.about, null, 2);
    const heroImage = dynamicData.home.heroImage;

    return `// GLAX Photography Website Configuration
export const GITHUB_CONFIG = {
  username: '${githubConfig.username}',
  repo: '${githubConfig.repo}',
  branch: '${githubConfig.branch}',
};

export const ADMIN_PASSWORD_HASH = '${ADMIN_PASSWORD_HASH}';

export const HOME_CONFIG = {
  heroImage: '${heroImage}',
};

export const ABOUT_CONFIG = ${aboutStr};

export const PROJECTS: Project[] = ${projectsStr};

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  images: string[];
}

export const CAROUSEL_CONFIG = {
  priorityProject: 'inside',
  desktopCount: 8,
  mobileCount: 6,
};
`;
  };

  const handleUpdateConfig = async () => {
    if (!githubToken) {
      setStatus('❌ 请先配置 GitHub Token');
      return;
    }

    try {
      setStatus('⏳ 更新配置中...');
      const content = generateConfigContent();
      await GitHubAPI.uploadFile('src/config.ts', content, githubToken, '更新网站配置');
      setStatus('✅ 配置已更新到 GitHub，等待自动构建');
    } catch (error: any) {
      setStatus(`❌ 更新失败：${error.message}`);
    }
    setTimeout(() => setStatus(''), 5000);
  };

  const handleDownloadConfig = () => {
    const content = generateConfigContent();
    const blob = new Blob([content], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentProject = dynamicData.projects.find(p => p.id === selectedProject);
  const totalPages = currentProject ? Math.ceil(currentProject.images.length / imagesPerPage) : 1;
  const paginatedImages = currentProject?.images.slice(
    (currentPage - 1) * imagesPerPage,
    currentPage * imagesPerPage
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">后台管理 Admin</h2>
              <p className="text-gray-400 text-sm mt-1">内容管理系统 CMS</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadConfig}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载 config.ts
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('github')}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2',
                activeTab === 'github' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub 配置
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2',
                activeTab === 'projects' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              项目图片
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2',
                activeTab === 'about' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              关于我
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2',
                activeTab === 'contact' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              联系方式
            </button>
          </div>

          {status && (
            <div className={cn(
              'p-4 rounded-lg mb-6',
              status.includes('✅') ? 'bg-green-900/50 text-green-300' :
              status.includes('⏳') ? 'bg-blue-900/50 text-blue-300' :
              'bg-red-900/50 text-red-300'
            )}>
              {status}
            </div>
          )}

          {activeTab === 'github' && (
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">GitHub 配置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">GitHub Token *</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={handleSaveToken}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    保存 Token
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">GitHub 用户名</label>
                    <input
                      type="text"
                      value={githubConfig.username}
                      onChange={(e) => setGithubConfig({ ...githubConfig, username: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">仓库名称</label>
                    <input
                      type="text"
                      value={githubConfig.repo}
                      onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">分支名称</label>
                    <input
                      type="text"
                      value={githubConfig.branch}
                      onChange={(e) => setGithubConfig({ ...githubConfig, branch: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <h4 className="text-yellow-300 font-bold mb-2">⚠️ 配置 Token 后您可以：</h4>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• 直接上传封面和项目图片到 GitHub 仓库</li>
                    <li>• 一键更新网站配置文件</li>
                    <li>• 所有设备自动同步最新内容</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {dynamicData.projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => { setSelectedProject(project.id); setCurrentPage(1); }}
                    className={cn(
                      'px-4 py-2 rounded-lg',
                      selectedProject === project.id
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    )}
                  >
                    {project.title}
                  </button>
                ))}
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">封面图片</h3>
                {currentProject?.cover && (
                  <div className="relative mb-4 group">
                    <OptimizedImage
                      src={currentProject.cover}
                      alt="Cover"
                      className="w-full h-64 object-cover rounded-lg"
                      priority
                    />
                    <button
                      onClick={() => handleDeleteImage(currentProject.cover, true)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer"
                  >
                    选择封面文件
                  </label>
                  {coverFile && <span className="text-gray-400 ml-2">{coverFile.name}</span>}
                  <button
                    onClick={handleUploadCover}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    上传封面
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">项目图片 ({currentProject?.images.length || 0}张)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {paginatedImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <OptimizedImage
                        src={img}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteImage(img)}
                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mb-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 disabled:opacity-50 text-white rounded-lg"
                    >
                      上一页
                    </button>
                    <span className="text-gray-400">第 {currentPage} / {totalPages} 页</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-700 disabled:opacity-50 text-white rounded-lg"
                    >
                      下一页
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="images-upload"
                  />
                  <label
                    htmlFor="images-upload"
                    className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer"
                  >
                    选择图片文件
                  </label>
                  {imageFiles.length > 0 && <span className="text-gray-400 ml-2">{imageFiles.length} 个文件</span>}
                  <button
                    onClick={handleUploadImages}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    上传图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">头像设置</h3>
                <div className="mb-4">
                  <OptimizedImage
                    src={aboutForm.avatar}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                    priority
                  />
                </div>
                <input
                  type="text"
                  value={aboutForm.avatar}
                  onChange={(e) => setAboutForm({ ...aboutForm, avatar: e.target.value })}
                  placeholder="头像 URL"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4"
                />
                <button
                  onClick={handleSaveAbout}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  保存关于我信息
                </button>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">个人简介</h3>
                <textarea
                  value={aboutForm.bio}
                  onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
                  rows={10}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="每段之间用两个空行分隔"
                />
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">联系方式</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">邮箱</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={contactForm.instagram}
                    onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">微信</label>
                  <input
                    type="text"
                    value={contactForm.wechat}
                    onChange={(e) => setContactForm({ ...contactForm, wechat: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <button
                  onClick={handleSaveContact}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  保存联系方式
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-900 rounded-xl p-6">
            <button
              onClick={handleUpdateConfig}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-bold flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              🚀 更新配置到 GitHub
            </button>
            <p className="text-gray-400 text-sm mt-2 text-center">
              点击后将自动更新 config.ts 文件并触发 GitHub Actions 重新构建
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'portfolio' | 'about' | 'contact'>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const imagesPerPage = 10;

  // 使用静态配置数据（不请求 GitHub API）
  const [dynamicData, setDynamicData] = useState<DynamicData>({
    home: HOME_CONFIG,
    about: ABOUT_CONFIG,
    projects: PROJECTS,
  });

  // 检查登录状态
  useEffect(() => {
    const savedLogin = localStorage.getItem('isLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // 处理登录
  const handleLogin = async () => {
    const hash = await hashPassword(loginPassword);
    if (hash === ADMIN_PASSWORD_HASH) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      setIsAdminOpen(true);
      setLoginError('');
      setLoginPassword('');
    } else {
      setLoginError('密码错误');
    }
  };

  // 处理退出
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setIsAdminOpen(false);
  };

  // 打开灯箱
  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  // 灯箱导航
  const lightboxPrevious = useCallback(() => {
    setLightboxIndex(prev => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
  }, [lightboxImages.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex(prev => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
  }, [lightboxImages.length]);

  // 项目详情分页
  const handleDetailPageChange = useCallback((page: number) => {
    setDetailPage(page);
  }, []);

  // 预加载下一页图片
  useEffect(() => {
    if (selectedProject) {
      const totalPages = Math.ceil(selectedProject.images.length / imagesPerPage);
      if (detailPage < totalPages) {
        const nextPageImages = selectedProject.images.slice(
          detailPage * imagesPerPage,
          (detailPage + 1) * imagesPerPage
        );
        nextPageImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      }
    }
  }, [selectedProject, detailPage]);

  // 首页精选图片（优先 inside 项目）
  const featuredImages = useMemo(() => {
    const priorityProject = dynamicData.projects.find(p => p.id === CAROUSEL_CONFIG.priorityProject);
    const priorityImages = priorityProject?.images || [];
    
    if (priorityImages.length >= CAROUSEL_CONFIG.desktopCount) {
      return priorityImages.slice(0, CAROUSEL_CONFIG.desktopCount);
    }

    const allImages = dynamicData.projects.flatMap(p => p.images);
    const remaining = CAROUSEL_CONFIG.desktopCount - priorityImages.length;
    return [...priorityImages, ...allImages.slice(0, remaining)];
  }, [dynamicData.projects]);

  // 移动端精选图片
  const mobileFeaturedImages = useMemo(() => {
    const priorityProject = dynamicData.projects.find(p => p.id === CAROUSEL_CONFIG.priorityProject);
    const priorityImages = priorityProject?.images || [];
    
    if (priorityImages.length >= CAROUSEL_CONFIG.mobileCount) {
      return priorityImages.slice(0, CAROUSEL_CONFIG.mobileCount);
    }

    const allImages = dynamicData.projects.flatMap(p => p.images);
    const remaining = CAROUSEL_CONFIG.mobileCount - priorityImages.length;
    return [...priorityImages, ...allImages.slice(0, remaining)];
  }, [dynamicData.projects]);

  // 渲染导航
  const renderNav = () => (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white cursor-pointer" onClick={() => setCurrentPage('home')}>
          GLAX
        </div>
        <div className="hidden md:flex gap-8">
          <button onClick={() => setCurrentPage('home')} className={cn('text-gray-300 hover:text-white', currentPage === 'home' && 'text-white')}>首页</button>
          <button onClick={() => setCurrentPage('portfolio')} className={cn('text-gray-300 hover:text-white', currentPage === 'portfolio' && 'text-white')}>作品集</button>
          <button onClick={() => setCurrentPage('about')} className={cn('text-gray-300 hover:text-white', currentPage === 'about' && 'text-white')}>关于我</button>
          <button onClick={() => setCurrentPage('contact')} className={cn('text-gray-300 hover:text-white', currentPage === 'contact' && 'text-white')}>联系方式</button>
        </div>
        <div className="md:hidden">
          <button onClick={() => setCurrentPage('portfolio')} className="text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => isLoggedIn ? setIsAdminOpen(true) : setLoginPassword('')}
          className="text-sm text-gray-400 hover:text-white"
        >
          {isLoggedIn ? '后台 Admin' : 'Admin'}
        </button>
      </div>
    </nav>
  );

  // 渲染首页
  const renderHome = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <OptimizedImage
            src={dynamicData.home.heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-8xl md:text-9xl font-bold text-white mb-4 tracking-tighter">GLAX</h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            {dynamicData.about.title}
            <br />
            <span className="text-sm text-gray-500">Commercial / Fashion Photographer</span>
          </p>
        </div>
      </section>

      {/* Featured Works - Mobile */}
      <section className="md:hidden py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-2">精选作品</h2>
          <p className="text-gray-400 mb-8">Featured Works</p>
          <div className="grid grid-cols-3 gap-2">
            {mobileFeaturedImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square relative overflow-hidden rounded-lg cursor-pointer"
                onClick={() => openLightbox(mobileFeaturedImages, idx)}
              >
                <OptimizedImage
                  src={img}
                  alt={`Featured ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Works - Desktop */}
      <section className="hidden md:block py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-2">精选作品</h2>
          <p className="text-gray-400 mb-8">Featured Works</p>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {featuredImages.map((img, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-80 h-96 relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(featuredImages, idx)}
              >
                <OptimizedImage
                  src={img}
                  alt={`Featured ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  priority={idx < 2}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Preview */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-2">作品集</h2>
          <p className="text-gray-400 mb-12">Portfolio</p>
          <div className="grid md:grid-cols-3 gap-8">
            {dynamicData.projects.map(project => (
              <div
                key={project.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <OptimizedImage
                    src={project.cover}
                    alt={project.title}
                    className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-gray-300">{project.title}</h3>
                <p className="text-gray-400 text-sm">{project.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  // 渲染作品集
  const renderPortfolio = () => (
    <div className="min-h-screen pt-20 pb-20 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-2">作品集</h1>
        <p className="text-gray-400 mb-12">Portfolio</p>
        {!selectedProject ? (
          <div className="grid md:grid-cols-3 gap-8">
            {dynamicData.projects.map(project => (
              <div
                key={project.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <OptimizedImage
                    src={project.cover}
                    alt={project.title}
                    className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-gray-300">{project.title}</h3>
                <p className="text-gray-400 text-sm">{project.subtitle}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setSelectedProject(null); setDetailPage(1); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedProject.title}</h2>
            <p className="text-gray-400 mb-8">{selectedProject.description}</p>
            
            {/* 分页显示图片 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {selectedProject.images
                .slice((detailPage - 1) * imagesPerPage, detailPage * imagesPerPage)
                .map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => openLightbox(selectedProject.images, (detailPage - 1) * imagesPerPage + idx)}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`Work ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      priority={idx < 2}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>
                ))}
            </div>

            {/* 分页控制 */}
            {selectedProject.images.length > imagesPerPage && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => handleDetailPageChange(detailPage - 1)}
                  disabled={detailPage === 1}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg"
                >
                  上一页
                </button>
                <span className="text-gray-400">
                  第 {detailPage} / {Math.ceil(selectedProject.images.length / imagesPerPage)} 页
                </span>
                <button
                  onClick={() => handleDetailPageChange(detailPage + 1)}
                  disabled={detailPage >= Math.ceil(selectedProject.images.length / imagesPerPage)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // 渲染关于我
  const renderAbout = () => (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-2">关于我</h1>
        <p className="text-gray-400 mb-12">About Me</p>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <OptimizedImage
              src={dynamicData.about.avatar}
              alt={dynamicData.about.name}
              className="w-full aspect-[3/4] object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{dynamicData.about.name}</h2>
            <p className="text-gray-400 mb-8">{dynamicData.about.title}</p>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              {dynamicData.about.bio.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div>
                <div className="text-4xl font-bold text-white mb-2">{dynamicData.about.stats.years}</div>
                <div className="text-gray-400">年经验<br /><span className="text-sm">Years Experience</span></div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">{dynamicData.about.stats.projects}</div>
                <div className="text-gray-400">完成项目<br /><span className="text-sm">Projects Completed</span></div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">{dynamicData.about.stats.clients}</div>
                <div className="text-gray-400">满意客户<br /><span className="text-sm">Satisfied Clients</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染联系方式
  const renderContact = () => (
    <div className="min-h-screen pt-20 pb-20 bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-2">联系方式</h1>
        <p className="text-gray-400 mb-12">Contact</p>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">发送邮件</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="您的姓名 Your Name"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <input
                type="email"
                placeholder="您的邮箱 Your Email"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <textarea
                placeholder="留言内容 Your Message"
                rows={5}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 resize-none"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                发送 Send
              </button>
            </form>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6">社交媒体</h3>
            <div className="space-y-6">
              {dynamicData.about.contact.email && (
                <a
                  href={`mailto:${dynamicData.about.contact.email}`}
                  className="flex items-center gap-4 text-gray-300 hover:text-white group"
                >
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">邮箱 Email</div>
                    <div>{dynamicData.about.contact.email}</div>
                  </div>
                </a>
              )}
              {dynamicData.about.contact.instagram && (
                <a
                  href={`https://instagram.com/${dynamicData.about.contact.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-300 hover:text-white group"
                >
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Instagram</div>
                    <div>{dynamicData.about.contact.instagram}</div>
                  </div>
                </a>
              )}
              {dynamicData.about.contact.wechat && (
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6-3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm5.105 9.421c.138-.51.495-1.83.495-1.83a.59.59 0 00-.214-.666C22.38 16.52 21.75 15.4 21.75 14.15c0-2.396-2.537-4.333-5.666-4.333-3.13 0-5.667 1.937-5.667 4.333 0 2.396 2.537 4.334 5.667 4.334.52 0 1.023-.067 1.504-.173a.865.865 0 01.718.097l1.605.935a.327.327 0 00.168.054c.16 0 .29-.132.29-.295 0-.072-.029-.143-.048-.214z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">微信 WeChat</div>
                    <div>{dynamicData.about.contact.wechat}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染登录弹窗
  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">管理员登录</h2>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="请输入密码"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
          autoFocus
        />
        {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
        <div className="flex gap-4">
          <button
            onClick={handleLogin}
            className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200"
          >
            登录
          </button>
          <button
            onClick={() => { setLoginPassword(''); setLoginError(''); }}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen">
      {renderNav()}
      {currentPage === 'home' && renderHome()}
      {currentPage === 'portfolio' && renderPortfolio()}
      {currentPage === 'about' && renderAbout()}
      {currentPage === 'contact' && renderContact()}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrevious={lightboxPrevious}
          onNext={lightboxNext}
        />
      )}
      {loginPassword && !isLoggedIn && renderLoginModal()}
      {isAdminOpen && isLoggedIn && (
        <AdminPanel
          onClose={() => setIsAdminOpen(false)}
          dynamicData={dynamicData}
          setDynamicData={setDynamicData}
        />
      )}
      {isLoggedIn && !isAdminOpen && (
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm z-30"
        >
          退出
        </button>
      )}
    </div>
  );
};

export default App;
