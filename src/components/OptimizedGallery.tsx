import React, { useState, useEffect, useCallback } from 'react';
import { OptimizedImage } from './OptimizedImage';

interface OptimizedGalleryProps {
  images: string[];
  itemsPerPage?: number;
  onImageClick?: (index: number) => void;
}

export const OptimizedGallery: React.FC<OptimizedGalleryProps> = ({
  images,
  itemsPerPage = 10,
  onImageClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [preloadedPages, setPreloadedPages] = useState<Set<number>>(new Set([1]));

  const totalPages = Math.ceil(images.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = images.slice(startIndex, endIndex);

  // 预加载下一页图片
  useEffect(() => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages && !preloadedPages.has(nextPage)) {
      const nextStartIndex = (nextPage - 1) * itemsPerPage;
      const nextImages = images.slice(nextStartIndex, nextStartIndex + itemsPerPage);
      
      nextImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
      
      setPreloadedPages((prev) => new Set(prev).add(nextPage));
    }
  }, [currentPage, images, itemsPerPage, totalPages, preloadedPages]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return (
    <div className="space-y-6">
      {/* 图片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentImages.map((src, index) => (
          <div
            key={`${currentPage}-${index}`}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => onImageClick?.(startIndex + index)}
          >
            <OptimizedImage
              src={src}
              alt={`作品 ${startIndex + index + 1}`}
              className="aspect-square"
              lazy={true}
            />
          </div>
        ))}
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-white/20 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            上一页
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-full text-sm transition-all ${
                  page === currentPage
                    ? 'bg-white text-black'
                    : 'border border-white/20 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-white/20 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            下一页
          </button>
        </div>
      )}

      {/* 页码信息 */}
      <div className="text-center text-sm text-white/50">
        第 {currentPage} 页 / 共 {totalPages} 页 | 共 {images.length} 张作品
      </div>
    </div>
  );
};

export default OptimizedGallery;
