// 图片加载优化服务
// 不改变图片路径，只优化加载方式

/**
 * 图片懒加载 Hook
 * 只加载可见区域的图片
 */
export const useLazyLoad = () => {
  const loadImage = (img: HTMLImageElement) => {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '200px', // 提前 200px 开始加载
      threshold: 0.01,
    }
  );

  return { observer, loadImage };
};

/**
 * 图片预加载
 * 提前加载下一页的图片
 */
export const preloadImages = (urls: string[]) => {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * 图片渐进式加载
 * 先显示模糊缩略图，再加载清晰大图
 */
export const loadProgressiveImage = (
  imgUrl: string,
  thumbnailUrl?: string
): Promise<string> => {
  return new Promise((resolve) => {
    if (thumbnailUrl) {
      // 先加载缩略图
      const thumb = new Image();
      thumb.src = thumbnailUrl;
      thumb.onload = () => {
        // 缩略图加载完成后，加载大图
        const full = new Image();
        full.src = imgUrl;
        full.onload = () => resolve(imgUrl);
      };
    } else {
      resolve(imgUrl);
    }
  });
};

/**
 * 图片缓存管理
 * 缓存已加载的图片 URL
 */
class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  private maxSize = 50; // 最多缓存 50 张图片

  get(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }

  set(url: string, img: HTMLImageElement) {
    if (this.cache.size >= this.maxSize) {
      // 删除最早的缓存
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(url, img);
  }

  clear() {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

/**
 * 优化图片 URL
 * 添加缓存控制参数
 */
export const optimizeImageUrl = (url: string): string => {
  // 如果是本地图片，添加版本号防止缓存过期
  if (url.startsWith('/images/')) {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}v=${process.env.VITE_APP_VERSION || '1'}`;
  }
  return url;
};
