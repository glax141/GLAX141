/**
 * 图片上传服务
 * 支持本地上传、压缩、生成 CDN 链接
 */

import { GITHUB_CONFIG } from '../config';

// 图片压缩配置
const IMAGE_CONFIG = {
  maxWidth: 1920,      // 最大宽度
  maxHeight: 1920,    // 最大高度
  quality: 0.85,      // 压缩质量 (0-1)
  thumbnailWidth: 400, // 缩略图宽度
};

// ============================================
// 图片压缩工具
// ============================================

/**
 * 压缩图片
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<Blob> {
  const config = { ...IMAGE_CONFIG, ...options };
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // 计算缩放比例
        if (width > config.maxWidth!) {
          height = (height * config.maxWidth!) / width;
          width = config.maxWidth!;
        }
        if (height > config.maxHeight!) {
          width = (width * config.maxHeight!) / height;
          height = config.maxHeight!;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          'image/jpeg',
          config.quality
        );
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(file: File): Promise<string> {
  const blob = await compressImage(file, {
    maxWidth: IMAGE_CONFIG.thumbnailWidth,
    quality: 0.7,
  });
  
  return blobToBase64(blob);
}

/**
 * Blob 转 Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============================================
// CDN 链接工具
// ============================================

/**
 * 生成 jsDelivr CDN 链接
 */
export function generateCDNUrl(fileName: string, folder: string = 'images'): string {
  const { username, repo, branch } = GITHUB_CONFIG;
  return `https://cdn.jsdelivr.net/gh/${username}/${repo}@${branch}/${folder}/${fileName}`;
}

/**
 * 将 Base64 转换为可用于显示的 URL
 * 注意：Base64 图片会占用较多存储空间，建议上传到云存储
 */
export function base64ToDataUrl(base64: string, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${base64.split(',')[1]}`;
}

// ============================================
// GitHub 图片上传
// ============================================

/**
 * 上传图片并返回 CDN 链接
 * 由于 GitHub API 上传需要后端，这里返回 Base64 Data URL
 * 实际部署时可以配合 Vercel Serverless Functions 或其他方案
 */
export async function uploadImage(file: File): Promise<{
  cdnUrl: string;
  base64: string;
  fileName: string;
}> {
  // 1. 压缩图片
  const compressedBlob = await compressImage(file);
  
  // 2. 转换为 Base64
  const base64 = await blobToBase64(compressedBlob);
  
  // 3. 生成文件名
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${timestamp}-${randomStr}.${ext}`;
  
  // 4. 生成 CDN 链接（用户需要手动上传到 GitHub）
  const cdnUrl = generateCDNUrl(fileName, 'images');
  
  return {
    cdnUrl,
    base64,
    fileName,
  };
}

/**
 * 批量上传图片
 */
export async function uploadImages(
  files: File[],
  onProgress?: (index: number, total: number) => void
): Promise<Array<{ cdnUrl: string; base64: string; fileName: string }>> {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i]);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}

// ============================================
// 图片验证
// ============================================

/**
 * 验证图片文件
 */
export function validateImage(file: File): {
  valid: boolean;
  error?: string;
} {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '仅支持 JPG、PNG、WebP 格式图片',
    };
  }
  
  // 检查文件大小（最大 20MB）
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片大小不能超过 20MB',
    };
  }
  
  return { valid: true };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
