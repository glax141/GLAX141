import { useState, useEffect, useRef } from 'react';
import { 
  loadData, 
  saveData, 
  getSyncStatus, 
  isGitHubConfigured,
  SiteData 
} from './services/gistService';
import { 
  uploadImage, 
  validateImage
} from './services/imageService';
import { PROJECTS } from './config';

// ============================================
// 图标组件
// ============================================

const Icons = {
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
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Arrow: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Sync: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Image: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Wechat: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm4.908 5.083c-1.646 0-3.765.771-5.405 2.639a10.443 10.443 0 00-2.538-1.467 8.469 8.469 0 00-.633-.23l-.14-.04a3.892 3.892 0 01-.32-.112 4.085 4.085 0 01-.276-.127 4.19 4.19 0 01-.252-.153 3.862 3.862 0 01-.232-.185.457.457 0 01-.062-.074.41.41 0 01-.053-.076l-.013-.024a.507.507 0 01-.035-.068.494.494 0 01-.021-.054.49.49 0 01-.006-.068.454.454 0 01.001-.035.45.45 0 01.004-.035.446.446 0 01.012-.037.39.39 0 01.022-.035c.009-.01.019-.021.029-.03a.48.48 0 01.034-.03.497.497 0 01.04-.03.51.51 0 01.046-.027.52.52 0 01.051-.023.51.51 0 01.054-.018.54.54 0 01.057-.013c.02 0 .039-.003.059-.003h.008c.02 0 .039.001.058.003a.55.55 0 01.057.013.504.504 0 01.054.018.506.506 0 01.051.023.5.5 0 01.046.027c.014.01.028.02.041.03a.45.45 0 01.061.066.47.47 0 01.035.06.45.45 0 01.018.066.46.46 0 01.004.069.447.447 0 01-.001.07.457.457 0 01-.005.07.45.45 0 01-.013.07.456.456 0 01-.022.068 4.01 4.01 0 01-.206.432 5.026 5.026 0 01-.26.421 4.94 4.94 0 01-.31.401 5.172 5.172 0 01-.36.377 4.96 4.96 0 01-.407.347 5.028 5.028 0 01-.452.314 5.055 5.055 0 01-.493.28 5.012 5.012 0 01-.53.242 4.96 4.96 0 01-.562.205 4.98 4.98 0 01-.589.167 5.01 5.01 0 01-.607.128 4.98 4.98 0 01-.618.09 5.037 5.037 0 01-.626.052 5.046 5.046 0 01-.629-.013 4.997 4.997 0 01-.623-.076 4.971 4.971 0 01-.607-.137 4.92 4.92 0 01-.583-.198 4.86 4.86 0 01-.553-.254 4.863 4.863 0 01-.519-.309 4.87 4.87 0 01-.479-.36 4.93 4.93 0 01-.434-.406 4.95 4.95 0 01-.384-.45 4.88 4.88 0 01-.332-.488 4.95 4.95 0 01-.277-.521 4.94 4.94 0 01-.22-.549 4.97 4.97 0 01-.16-.57 4.98 4.98 0 01-.1-.585 4.98 4.98 0 01-.04-.594 4.97 4.97 0 01.02-.598c.02-.198.05-.39.09-.586a4.97 4.97 0 01.161-.569c.066-.185.14-.366.225-.544.084-.177.177-.349.277-.518a4.92 4.92 0 01.335-.487c.122-.157.25-.31.384-.45a4.96 4.96 0 01.434-.407 4.87 4.87 0 01.479-.36 4.863 4.863 0 01.519-.31 4.88 4.88 0 01.553-.254 4.92 4.92 0 01.583-.198 4.95 4.95 0 01.607-.137 4.95 4.95 0 01.623-.076 4.95 4.95 0 01.629-.013c.208.01.414.03.62.052.206.024.41.05.612.09.202.038.402.084.6.128.197.046.392.098.585.167.193.07.383.145.57.205a5.02 5.02 0 01.53.242c.172.09.34.184.493.28a5.02 5.02 0 01.452.314c.14.11.276.226.407.347a4.96 4.96 0 01.36.377c.115.13.225.263.31.401.088.137.172.277.26.421a4.95 4.95 0 01.225.544c.065.186.12.374.161.569.04.196.07.388.09.586.02.197.027.395.02.598-.01.2-.03.398-.052.594a5.01 5.01 0 01-.1.585 4.97 4.97 0 01-.16.57 4.94 4.94 0 01-.22.549 4.94 4.94 0 01-.277.521 4.92 4.92 0 01-.335.487c-.122.157-.25.31-.384.45a4.96 4.96 0 01-.434.407 4.87 4.87 0 01-.479.36 4.863 4.863 0 01-.519.31 4.86 4.86 0 01-.553.254 4.92 4.92 0 01-.583.198 4.95 4.95 0 01-.607.137 4.95 4.95 0 01-.623.076 4.95 4.95 0 01-.629.013c-.096-.003-.19-.013-.286-.022a3.93 3.93 0 01-.28-.04 4.03 4.03 0 01-.274-.06 4.07 4.07 0 01-.267-.08 4.09 4.09 0 01-.255-.097 3.97 3.97 0 01-.243-.112 4.01 4.01 0 01-.231-.127 4.1 4.1 0 01-.215-.142 4.08 4.08 0 01-.197-.153 4.14 4.14 0 01-.178-.163 4.13 4.13 0 01-.158-.172 4.07 4.07 0 01-.137-.18 4.04 4.04 0 01-.115-.186 4.05 4.05 0 01-.092-.191 4.05 4.05 0 01-.068-.195 4.05 4.05 0 01-.044-.198 4.06 4.06 0 01-.02-.199 4.05 4.05 0 01.004-.2 4.06 4.06 0 01.028-.198 4.06 4.06 0 01.052-.194 4.06 4.06 0 01.075-.187 4.06 4.06 0 01.098-.179 4.06 4.06 0 01.119-.168 4.07 4.07 0 01.138-.157 4.08 4.08 0 01.156-.145 4.08 4.08 0 01.172-.132 4.08 4.08 0 01.188-.117 4.08 4.08 0 01.201-.102 4.08 4.08 0 01.212-.087 4.08 4.08 0 01.223-.07 4.08 4.08 0 01.231-.053 4.08 4.08 0 01.238-.035c.08-.008.158-.012.237-.012s.158.004.237.012c.08.008.158.02.237.035a4 4 0 01.231.053c.075.021.149.045.223.07a4 4 0 01.212.087c.069.032.137.067.201.102a4 4 0 01.188.117 4 4 0 01.172.132c.055.047.108.096.156.145.05.05.096.103.138.157a4 4 0 01.119.168c.037.058.072.117.098.179a4 4 0 01.075.187c.023.063.044.128.052.194.01.065.018.13.028.198a4 4 0 01.004.2 4 4 0 01-.02.199 4 4 0 01-.044.198 4 4 0 01-.068.195 4 4 0 01-.092.191 4 4 0 01-.115.186 4 4 0 01-.137.18 4 4 0 01-.158.172 4 4 0 01-.178.163 4 4 0 01-.197.153 4 4 0 01-.215.142 4 4 0 01-.231.127 4 4 0 01-.243.112 4 4 0 01-.255.097 4 4 0 01-.267.08 4 4 0 01-.274.06 4 4 0 01-.28.04 4 4 0 01-.286.022c-.04-.002-.079-.006-.119-.006zm-1.324 1.18a.57.57 0 00-.488.063.575.575 0 00-.314.452.564.564 0 00.068.416.574.574 0 00.36.288.564.564 0 00.447-.057.569.569 0 00.275-.698.571.571 0 00-.348-.464zm-5.293.007a.57.57 0 00-.491.063.575.575 0 00-.313.452.564.564 0 00.067.416.574.574 0 00.36.288.564.564 0 00.447-.057.569.569 0 00.275-.698.571.571 0 00-.345-.464zm-4.783 3.568a2.94 2.94 0 00-.24 1.23c.001.12.012.238.024.357l.022.168c.01.057.023.113.037.169.015.055.03.11.048.164a2.96 2.96 0 00.308.693c.014.023.03.045.045.067.016.022.032.044.049.065.017.021.035.042.053.062l.054.058c.02.018.04.036.06.053a2.94 2.94 0 00.372.273c.023.014.046.028.07.04a2.96 2.96 0 00.377.175l.07.025c.024.008.048.016.072.023a2.94 2.94 0 001.28.005l.074-.023.068-.025a2.96 2.96 0 00.377-.175l.07-.04a2.96 2.96 0 00.372-.273l.06-.053.054-.058a2.8 2.8 0 00.053-.062c.017-.021.033-.043.049-.065l.045-.067a2.96 2.96 0 00.308-.693c.018-.054.033-.109.048-.164.014-.056.027-.112.037-.169l.022-.168c.012-.119.023-.237.024-.357 0-.413-.08-.82-.24-1.197a2.9 2.9 0 00-.083-.176 3.1 3.1 0 00-.053-.1 3.05 3.05 0 00-.066-.116l-.037-.06a3.1 3.1 0 00-.085-.127 3.03 3.03 0 00-.106-.14 2.98 2.98 0 00-.128-.152 3.02 3.02 0 00-.15-.158 2.96 2.96 0 00-.172-.164 3.03 3.03 0 00-.194-.163 2.96 2.96 0 00-.213-.156 3.03 3.03 0 00-.23-.144 3.04 3.04 0 00-.246-.13 3.02 3.02 0 00-.258-.112 3.02 3.02 0 00-.27-.093 2.96 2.96 0 00-.28-.073 2.98 2.98 0 00-.288-.052 2.97 2.97 0 00-.294-.031 2.97 2.97 0 00-.296-.01 2.97 2.97 0 00-.296.01c-.098.008-.195.02-.291.031-.097.013-.193.03-.288.052a2.96 2.96 0 00-.28.073c-.092.027-.183.058-.272.093a3.02 3.02 0 00-.258.112 3.04 3.04 0 00-.246.13 3.03 3.03 0 00-.23.144 2.96 2.96 0 00-.213.156 3.03 3.03 0 00-.194.163 2.96 2.96 0 00-.172.164 2.98 2.98 0 00-.15.158 2.98 2.98 0 00-.128.152 3.03 3.03 0 00-.106.14 3.1 3.1 0 00-.085.127l-.037.06a3.05 3.05 0 00-.066.116c-.02.036-.038.072-.053.1a3.1 3.1 0 00-.083.176 2.9 2.9 0 00-.24 1.197zm8.514 2.453l2.048-1.199a.506.506 0 01.507-.004l1.89 1.107c.11.064.144.21.066.313l-1.889 2.242a.182.182 0 01-.144.06.184.184 0 01-.14-.066l-2.048-2.286a.184.184 0 01-.03-.2.18.18 0 01.14-.126l2.048-.42a.18.18 0 00.14-.165v-2.618c0-.073-.044-.14-.11-.167a.18.18 0 00-.178.013l-1.94 1.048a.51.51 0 01-.282.043l-2.048-.35a.18.18 0 00-.146.04.18.18 0 00-.069.138v2.726c0 .075.046.143.115.17l2.048.798c.093.036.193.022.274-.04l1.94-1.484a.51.51 0 01.283-.093l2.048.163a.18.18 0 00.153-.066.18.18 0 00.052-.15v-2.618c0-.094-.058-.18-.145-.216l-2.048-.654a.513.513 0 01-.357-.488v-2.618c0-.082-.054-.156-.131-.183a.18.18 0 00-.177.02l-1.94 1.203a.51.51 0 01-.288.07z"/>
    </svg>
  ),
};

// ============================================
// 全屏图片查看器
// ============================================

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
      >
        <Icons.Close />
      </button>
      
      <button
        onClick={onPrev}
        className="absolute left-4 p-2 text-white/60 hover:text-white transition-colors"
      >
        <Icons.ChevronLeft />
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-4 p-2 text-white/60 hover:text-white transition-colors"
      >
        <Icons.ChevronRight />
      </button>
      
      <div className="max-w-6xl max-h-[90vh] px-4">
        {!isLoaded && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <img
          src={images[currentIndex]}
          alt=""
          className={`max-w-full max-h-[85vh] object-contain transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

// ============================================
// 后台管理面板
// ============================================

interface AdminPanelProps {
  data: SiteData;
  onClose: () => void;
  onSave: (data: SiteData) => void;
}

function AdminPanel({ data, onClose, onSave }: AdminPanelProps) {
  const [localData, setLocalData] = useState<SiteData>(data);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingProject, setUploadingProject] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = async () => {
    setSaving(true);
    localData.lastUpdated = new Date().toISOString();
    await saveData(localData);
    onSave(localData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = async (projectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setUploadingProject(projectId);
    setUploadProgress({ current: 0, total: fileArray.length });
    
    const newImages: string[] = [];
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const validation = validateImage(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }
      
      try {
        const result = await uploadImage(file);
        newImages.push(result.base64);
        setUploadProgress({ current: i + 1, total: fileArray.length });
      } catch (error) {
        console.error('上传失败:', error);
      }
    }
    
    if (newImages.length > 0) {
      setLocalData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? { ...p, images: [...p.images, ...newImages] } : p
        ),
      }));
    }
    
    setUploadingProject(null);
  };

  const handleCoverUpload = async (projectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    try {
      const result = await uploadImage(file);
      setLocalData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? { ...p, cover: result.base64 } : p
        ),
      }));
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  const handleDeleteImage = (projectId: string, imageIndex: number) => {
    setLocalData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, images: p.images.filter((_, i) => i !== imageIndex) }
          : p
      ),
    }));
  };

  const syncStatus = getSyncStatus();

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-black to-transparent z-10 p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h2 className="text-white text-xl font-light tracking-wider">
            后台管理 <span className="text-white/50 text-sm ml-2">Admin Panel</span>
          </h2>
          <div className="flex items-center gap-4">
            {/* 同步状态 */}
            <div className="flex items-center gap-2 text-sm">
              <Icons.Sync />
              <span className="text-white/50">
                {isGitHubConfigured() ? (
                  syncStatus.gistId ? '已同步到 GitHub' : '未同步'
                ) : (
                  '本地存储模式'
                )}
              </span>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
                saved
                  ? 'bg-green-500/20 text-green-400'
                  : saving
                  ? 'bg-white/10 text-white/50'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {saved ? <Icons.Check /> : saving ? (
                <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {saved ? '已保存' : saving ? '保存中...' : '保存更改'}
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              <Icons.Logout />
              退出
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-12 overflow-y-auto max-h-[calc(100vh-80px)]">
        
        {/* 首页设置 */}
        <section className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-white text-lg font-light mb-6">
            首页设置 <span className="text-white/40 text-sm">Home Settings</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">主页大图链接</label>
              <input
                type="text"
                value={localData.home.heroImage}
                onChange={(e) => setLocalData((prev) => ({ ...prev, home: { ...prev.home, heroImage: e.target.value } }))}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
                placeholder="输入图片URL"
              />
            </div>
          </div>
        </section>

        {/* 关于我设置 */}
        <section className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-white text-lg font-light mb-6">
            关于我 <span className="text-white/40 text-sm">About Me</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">头像链接</label>
              <input
                type="text"
                value={localData.about.avatar}
                onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, avatar: e.target.value } }))}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
                placeholder="头像图片URL"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">姓名</label>
                <input
                  type="text"
                  value={localData.about.name}
                  onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, name: e.target.value } }))}
                  className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">身份</label>
                <input
                  type="text"
                  value={localData.about.title}
                  onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, title: e.target.value } }))}
                  className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-white/60 text-sm mb-2">个人简介</label>
            <textarea
              value={localData.about.bio}
              onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, bio: e.target.value } }))}
              rows={6}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors resize-none"
            />
          </div>
        </section>

        {/* 联系方式设置 */}
        <section className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-white text-lg font-light mb-6">
            联系方式 <span className="text-white/40 text-sm">Contact</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">邮箱</label>
              <input
                type="email"
                value={localData.about.email}
                onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, email: e.target.value } }))}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Instagram</label>
              <input
                type="text"
                value={localData.about.instagram}
                onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, instagram: e.target.value } }))}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">微信</label>
              <input
                type="text"
                value={localData.about.wechat}
                onChange={(e) => setLocalData((prev) => ({ ...prev, about: { ...prev.about, wechat: e.target.value } }))}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* 项目管理 */}
        {localData.projects.map((project) => (
          <section key={project.id} className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white text-lg font-light">
                  {project.title} <span className="text-white/40 text-sm">{project.titleEn}</span>
                </h3>
                <p className="text-white/40 text-sm mt-1">ID: {project.id}</p>
              </div>
              <span className="text-white/40 text-sm">{project.images.length} 张图片</span>
            </div>
            
            {/* 项目信息 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/60 text-sm mb-2">项目标题</label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => setLocalData((prev) => ({
                    ...prev,
                    projects: prev.projects.map((p) =>
                      p.id === project.id ? { ...p, title: e.target.value } : p
                    ),
                  }))}
                  className="w-full bg-black/50 border border-white/20 rounded px-4 py-2 text-white focus:border-white/40 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">项目描述</label>
                <textarea
                  value={project.description}
                  onChange={(e) => setLocalData((prev) => ({
                    ...prev,
                    projects: prev.projects.map((p) =>
                      p.id === project.id ? { ...p, description: e.target.value } : p
                    ),
                  }))}
                  rows={3}
                  className="w-full bg-black/50 border border-white/20 rounded px-4 py-2 text-white focus:border-white/40 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
            
            {/* 封面图 */}
            <div className="mb-6">
              <label className="block text-white/60 text-sm mb-2">封面图片</label>
              <div className="flex items-start gap-4">
                <img
                  src={project.cover}
                  alt=""
                  className="w-32 h-24 object-cover rounded"
                />
                <div>
                  <input
                    ref={(el) => { coverInputRef.current = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCoverUpload(project.id, e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                  >
                    <Icons.Upload />
                    上传新封面
                  </button>
                </div>
              </div>
            </div>
            
            {/* 图片列表 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/60 text-sm">项目图片 ({project.images.length})</label>
                <div className="flex items-center gap-2">
                  {uploadingProject === project.id && (
                    <span className="text-white/50 text-sm">
                      上传中... {uploadProgress.current}/{uploadProgress.total}
                    </span>
                  )}
                  <input
                    ref={(el) => { fileInputRefs.current[project.id] = el; }}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(project.id, e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRefs.current[project.id]?.click()}
                    disabled={uploadingProject === project.id}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded transition-colors"
                  >
                    <Icons.Upload />
                    上传图片
                  </button>
                </div>
              </div>
              
              {/* 缩略图网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {project.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-white/5 rounded overflow-hidden"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDeleteImage(project.id, index)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icons.Trash />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1}
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
// 登录页面
// ============================================

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'glax141') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  // 磁吸效果
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    };

    const handleMouseLeave = () => {
      button.style.transform = 'translate(0, 0)';
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-wider mb-2">GLAX</h1>
          <p className="text-white/50 text-sm">后台管理系统</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <Icons.Lock />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入访问密码"
              className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none transition-colors`}
            />
          </div>
          
          <button
            ref={buttonRef}
            type="submit"
            className="w-full bg-white text-black py-4 rounded-lg font-medium hover:bg-white/90 transition-colors"
            style={{ transition: 'transform 0.1s ease-out' }}
          >
            进入后台
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// 项目卡片
// ============================================

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    cover: string;
    images: string[];
  };
  onView: () => void;
}

function ProjectCard({ project, onView }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        filter: isHovered ? 'blur(0)' : 'blur(0)',
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4">
        <img
          src={project.cover}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white/80 text-sm line-clamp-2">{project.description}</p>
        </div>
      </div>
      <h3 className="text-white text-2xl font-extralight tracking-wider group-hover:text-white/80 transition-colors">
        {project.title}
      </h3>
      <p className="text-white/40 text-sm font-light mt-1">{project.titleEn}</p>
    </div>
  );
}

// ============================================
// 项目详情弹窗
// ============================================

interface ProjectModalProps {
  project: {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    cover: string;
    images: string[];
  };
  onClose: () => void;
}

function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'gallery'>('info');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 10;
  
  const totalPages = Math.ceil(project.images.length / imagesPerPage);
  const currentImages = project.images.slice(
    (currentPage - 1) * imagesPerPage,
    currentPage * imagesPerPage
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/95 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm z-10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-extralight tracking-wider">{project.title}</h2>
              <p className="text-white/40 text-sm">{project.titleEn}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <Icons.Close />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 text-sm transition-colors ${
                activeTab === 'info' ? 'text-white border-b border-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              项目介绍
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-3 text-sm transition-colors ${
                activeTab === 'gallery' ? 'text-white border-b border-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              全部作品 ({project.images.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'info' ? (
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <img
                  src={project.cover}
                  alt={project.title}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-white/40 text-sm">
                    共 {project.images.length} 张作品
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 画廊网格 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {currentImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded"
                    onClick={() => setLightboxIndex((currentPage - 1) * imagesPerPage + index)}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icons.Image />
                    </div>
                  </div>
                ))}
              </div>

              {/* 翻页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Icons.ChevronLeft />
                  </button>
                  <span className="text-white/60 text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Icons.ChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 灯箱 */}
      {lightboxIndex !== null && (
        <Lightbox
          images={project.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i === null ? 0 : i === 0 ? project.images.length - 1 : i - 1))}
          onNext={() => setLightboxIndex((i) => (i === null ? 0 : i === project.images.length - 1 ? 0 : i + 1))}
        />
      )}
    </>
  );
}

// ============================================
// 主应用
// ============================================

export default function App() {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState<typeof PROJECTS[0] | null>(null);
  
  // 滚动展示相关
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // 加载数据
  useEffect(() => {
    const init = async () => {
      const data = await loadData();
      setSiteData(data);
      setLoading(false);
    };
    init();
  }, []);

  // 自动滚动
  useEffect(() => {
    if (!siteData || currentPage !== 'home') return;
    
    const carouselTimer = setInterval(() => {
      setCarouselIndex((prev) => {
        const images = siteData.home.carouselImages.length > 0 
          ? siteData.home.carouselImages 
          : siteData.projects[0]?.images || [];
        return (prev + 1) % images.length;
      });
    }, 3000);

    return () => clearInterval(carouselTimer);
  }, [siteData, currentPage]);

  // 滚动动画效果
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const carousel = carouselRef.current;
      if (carousel) {
        const rotateAngle = scrolled * 0.1;
        carousel.style.transform = `perspective(1000px) rotateY(${rotateAngle}deg)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading || !siteData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 登录页面
  if (showLogin && !showAdmin) {
    return <Login onLogin={() => { setShowLogin(false); setShowAdmin(true); }} />;
  }

  // 后台管理
  if (showAdmin) {
    return (
      <AdminPanel
        data={siteData}
        onClose={() => setShowAdmin(false)}
        onSave={(data) => setSiteData(data)}
      />
    );
  }

  const carouselImages = siteData.home.carouselImages.length > 0 
    ? siteData.home.carouselImages 
    : siteData.projects[0]?.images || [];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} transition-colors duration-500`}>
      {/* 导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-30 ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-2xl font-bold tracking-widest hover:opacity-70 transition-opacity"
          >
            GLAX
          </button>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex items-center gap-12">
            {[
              { id: 'home', label: '首页', sub: 'Home' },
              { id: 'portfolio', label: '作品集', sub: 'Portfolio' },
              { id: 'about', label: '关于我', sub: 'About' },
              { id: 'contact', label: '联系方式', sub: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`relative group ${currentPage === item.id ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'text-white/50' : 'text-black/50')} hover:opacity-100 transition-opacity`}
              >
                <span className="text-sm">{item.label}</span>
                <span className={`block text-xs ${isDarkMode ? 'text-white/30' : 'text-black/30'} group-hover:${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{item.sub}</span>
                {currentPage === item.id && (
                  <span className={`absolute -bottom-1 left-0 right-0 h-px ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* 主题切换 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'} transition-colors`}
            >
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            
            {/* 后台入口 */}
            <button
              onClick={() => setShowLogin(true)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 text-xs ${isDarkMode ? 'text-white/30 hover:text-white/50' : 'text-black/30 hover:text-black/50'} transition-colors border ${isDarkMode ? 'border-white/10' : 'border-black/10'} rounded`}
            >
              <Icons.Lock />
              Admin
            </button>

            {/* 移动端菜单 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ${isDarkMode ? 'text-white' : 'text-black'}`}
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${isDarkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-lg`}>
            <div className="px-6 py-4 space-y-4">
              {[
                { id: 'home', label: '首页', sub: 'Home' },
                { id: 'portfolio', label: '作品集', sub: 'Portfolio' },
                { id: 'about', label: '关于我', sub: 'About' },
                { id: 'contact', label: '联系方式', sub: 'Contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                  className={`block w-full text-left ${currentPage === item.id ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'text-white/50' : 'text-black/50')}`}
                >
                  {item.label} <span className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{item.sub}</span>
                </button>
              ))}
              <button
                onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}
              >
                <Icons.Lock />
                后台管理
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 首页 */}
      {currentPage === 'home' && (
        <div>
          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${siteData.home.heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-8xl md:text-9xl font-bold tracking-widest mb-4 transform hover:scale-105 transition-transform duration-700">
                GLAX
              </h1>
              <p className="text-white/60 text-lg tracking-wider">
                {siteData.about.title}
              </p>
              <p className="text-white/30 text-sm mt-2">Commercial & Fashion Photographer</p>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <Icons.Arrow />
            </div>
          </section>

          {/* 滚动展示区 */}
          <section className="py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-12">
              <h2 className="text-3xl font-extralight tracking-wider mb-2">最新作品</h2>
              <p className="text-white/40 text-sm">Latest Works</p>
            </div>
            
            <div 
              ref={carouselRef}
              className="relative transition-transform duration-300"
              style={{ transform: `perspective(1000px) rotateY(${carouselIndex * 15}deg)` }}
            >
              <div 
                className="flex gap-6 px-6"
                style={{ 
                  transform: `translateX(${-carouselIndex * 20}%)`,
                  transition: 'transform 0.8s ease-out'
                }}
              >
                {carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 h-96 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setLightboxImages(carouselImages);
                      setLightboxIndex(index);
                    }}
                    style={{
                      transform: index === carouselIndex ? 'scale(1.1) translateY(-10px)' : 'scale(0.9)',
                      opacity: index === carouselIndex ? 1 : 0.5,
                      filter: index === carouselIndex ? 'blur(0)' : 'blur(2px)',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* 指示器 */}
            <div className="flex justify-center gap-2 mt-8">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === carouselIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 作品集页面 */}
      {currentPage === 'portfolio' && (
        <div className="pt-24 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <header className="mb-16 text-center">
              <h1 className="text-5xl font-extralight tracking-wider mb-2">作品集</h1>
              <p className="text-white/40 text-sm">Portfolio</p>
            </header>
            
            {/* 不对称网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {siteData.projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`
                    ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}
                    ${index === 2 ? 'lg:col-start-2' : ''}
                  `}
                >
                  <ProjectCard
                    project={project}
                    onView={() => setSelectedProjectForView(project)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 关于页面 */}
      {currentPage === 'about' && (
        <div className="pt-24 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <header className="mb-16 text-center">
              <h1 className="text-5xl font-extralight tracking-wider mb-2">关于我</h1>
              <p className="text-white/40 text-sm">About Me</p>
            </header>
            
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* 头像 */}
              <div className="relative">
                <div className="aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={siteData.about.avatar}
                    alt={siteData.about.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white/40">Since</span>
                  <span className="text-lg font-light ml-1">2014</span>
                </div>
              </div>
              
              {/* 简介 */}
              <div>
                <h2 className="text-4xl font-extralight tracking-wider mb-2">{siteData.about.name}</h2>
                <p className="text-white/60 mb-8">{siteData.about.title}</p>
                <div className="space-y-4">
                  {siteData.about.bio.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-white/70 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
                  <div>
                    <p className="text-4xl font-extralight">10+</p>
                    <p className="text-white/40 text-sm mt-1">年经验</p>
                  </div>
                  <div>
                    <p className="text-4xl font-extralight">200+</p>
                    <p className="text-white/40 text-sm mt-1">合作客户</p>
                  </div>
                  <div>
                    <p className="text-4xl font-extralight">500+</p>
                    <p className="text-white/40 text-sm mt-1">作品数量</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 联系页面 */}
      {currentPage === 'contact' && (
        <div className="pt-24 pb-24">
          <div className="max-w-4xl mx-auto px-6">
            <header className="mb-16 text-center">
              <h1 className="text-5xl font-extralight tracking-wider mb-2">联系方式</h1>
              <p className="text-white/40 text-sm">Contact</p>
            </header>
            
            <div className="grid md:grid-cols-2 gap-16">
              {/* 联系表单 */}
              <div>
                <ContactForm />
              </div>
              
              {/* 联系信息 */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-light mb-6">保持联系</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    如有合作意向或咨询，请通过以下方式联系我。我会尽快回复您的邮件。
                  </p>
                </div>
                
                <div className="space-y-4">
                  <a
                    href={`mailto:${siteData.about.email}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                      <Icons.Mail />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">邮箱</p>
                      <p className="text-white">{siteData.about.email}</p>
                    </div>
                  </a>
                  
                  <a
                    href="#"
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                      <Icons.Instagram />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Instagram</p>
                      <p className="text-white">{siteData.about.instagram}</p>
                    </div>
                  </a>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="p-3 bg-white/10 rounded-full">
                      <Icons.Wechat />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">微信</p>
                      <p className="text-white">{siteData.about.wechat}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className={`py-8 border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'} ${currentPage === 'home' ? '' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} GLAX. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 项目详情弹窗 */}
      {selectedProjectForView && (
        <ProjectModal
          project={selectedProjectForView}
          onClose={() => setSelectedProjectForView(null)}
        />
      )}

      {/* 全屏图片查看 */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i === 0 ? lightboxImages.length - 1 : i! - 1))}
          onNext={() => setLightboxIndex((i) => (i === lightboxImages.length - 1 ? 0 : i! + 1))}
        />
      )}
    </div>
  );
}

// ============================================
// 联系表单组件
// ============================================

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [buttonStyle, setButtonStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setButtonStyle({
        transform: `translate(${x * 0.3}px, ${y * 0.3}px)`,
      });
    };

    const handleMouseLeave = () => {
      setButtonStyle({ transform: 'translate(0, 0)' });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white/60 text-sm mb-2">姓名</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors"
          placeholder="您的姓名"
        />
      </div>
      
      <div>
        <label className="block text-white/60 text-sm mb-2">邮箱</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors"
          placeholder="your@email.com"
        />
      </div>
      
      <div>
        <label className="block text-white/60 text-sm mb-2">留言</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors resize-none"
          placeholder="请输入您的留言..."
        />
      </div>
      
      <button
        ref={buttonRef}
        type="submit"
        style={{
          ...buttonStyle,
          transition: 'transform 0.1s ease-out',
        }}
        className={`w-full py-4 rounded font-medium transition-colors ${
          submitted
            ? 'bg-green-500 text-white'
            : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {submitted ? '✓ 发送成功' : '发送消息'}
      </button>
    </form>
  );
}
