/**
 * GitHub Gist 数据同步服务
 * 实现跨设备数据持久化和同步
 */

import { PROJECTS, ABOUT_CONFIG, HOME_CONFIG, GITHUB_TOKEN, GITHUB_CONFIG } from '../config';

// Gist ID（首次会自动创建）
const GIST_ID_KEY = 'glax_gist_id';

// 数据结构
export interface SiteData {
  version: number;
  lastUpdated: string;
  about: typeof ABOUT_CONFIG;
  home: typeof HOME_CONFIG;
  projects: typeof PROJECTS;
}

// 默认数据
function getDefaultData(): SiteData {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    about: ABOUT_CONFIG,
    home: HOME_CONFIG,
    projects: PROJECTS,
  };
}

// 获取 Gist ID
function getGistId(): string | null {
  return localStorage.getItem(GIST_ID_KEY);
}

// 保存 Gist ID
function saveGistId(id: string): void {
  localStorage.setItem(GIST_ID_KEY, id);
}

// API 请求封装
async function gistRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'GitHub API 请求失败');
  }

  return response.json();
}

// 创建新的 Gist
async function createGist(data: SiteData): Promise<string> {
  const gist = await gistRequest('/gists', {
    method: 'POST',
    body: JSON.stringify({
      description: 'GLAX Portfolio Site Data - 自动同步',
      public: false,
      files: {
        'glax-portfolio-data.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });

  return gist.id;
}

// 更新现有 Gist
async function updateGist(gistId: string, data: SiteData): Promise<void> {
  await gistRequest(`/gists/${gistId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      description: 'GLAX Portfolio Site Data - 自动同步',
      files: {
        'glax-portfolio-data.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });
}

// 获取 Gist 内容
async function getGistContent(gistId: string): Promise<SiteData> {
  const gist = await gistRequest(`/gists/${gistId}`);
  const file = gist.files['glax-portfolio-data.json'];
  
  if (!file) {
    throw new Error('Gist 文件不存在');
  }

  // 处理 raw URL
  const response = await fetch(file.raw_url);
  return response.json();
}

// ============================================
// 公开 API
// ============================================

/**
 * 加载数据（优先从 Gist 加载，回退到本地配置）
 */
export async function loadData(): Promise<SiteData> {
  const gistId = getGistId();
  
  // 如果有 Gist ID，尝试从 Gist 加载
  if (gistId) {
    try {
      const data = await getGistContent(gistId);
      console.log('✓ 从 GitHub Gist 加载数据成功');
      return data;
    } catch (error) {
      console.warn('从 Gist 加载失败，使用本地配置:', error);
    }
  }
  
  // 回退到默认配置
  return getDefaultData();
}

/**
 * 保存数据到 Gist
 */
export async function saveData(data: SiteData): Promise<boolean> {
  // 检查是否配置了 Token
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'your-github-token') {
    console.warn('未配置 GitHub Token，数据将仅保存在本地');
    // 保存到本地 localStorage 作为备用
    localStorage.setItem('glax_local_data', JSON.stringify(data));
    return false;
  }

  try {
    const gistId = getGistId();
    
    if (gistId) {
      // 更新现有 Gist
      await updateGist(gistId, data);
      console.log('✓ 数据已同步到 GitHub Gist');
    } else {
      // 创建新 Gist
      const newGistId = await createGist(data);
      saveGistId(newGistId);
      console.log('✓ 已创建新的 GitHub Gist');
    }
    
    // 同时保存到本地作为备份
    localStorage.setItem('glax_local_data', JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('同步到 GitHub 失败:', error);
    // 保存到本地作为备用
    localStorage.setItem('glax_local_data', JSON.stringify(data));
    return false;
  }
}

/**
 * 检查 GitHub 配置是否完整
 */
export function isGitHubConfigured(): boolean {
  return !!(
    GITHUB_TOKEN && 
    GITHUB_TOKEN !== 'your-github-token' &&
    GITHUB_CONFIG.username !== 'your-username' &&
    GITHUB_CONFIG.repo !== 'glax-portfolio'
  );
}

/**
 * 获取同步状态信息
 */
export function getSyncStatus(): {
  configured: boolean;
  gistId: string | null;
  lastSync: string | null;
} {
  const localData = localStorage.getItem('glax_local_data');
  let lastSync: string | null = null;
  
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      lastSync = parsed.lastUpdated;
    } catch {
      lastSync = null;
    }
  }
  
  return {
    configured: isGitHubConfigured(),
    gistId: getGistId(),
    lastSync,
  };
}

/**
 * 清除同步数据（用于重置）
 */
export function clearSyncData(): void {
  localStorage.removeItem(GIST_ID_KEY);
  localStorage.removeItem('glax_local_data');
  console.log('已清除所有同步数据');
}
