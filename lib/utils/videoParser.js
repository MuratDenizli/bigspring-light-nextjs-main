/**
 * Platform algılama fonksiyonu
 * @returns {string} 'android', 'ios' veya 'web'
 */
export const detectPlatform = () => {
  if (typeof window === 'undefined') return 'web'; // Server-side
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    return 'android';
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else {
    return 'web'; // Desktop veya diğer platformlar için varsayılan
  }
};

/**
 * Video URL'lerini platform bazında parse eder
 * @param {Array} videos - Video listesi
 * @param {string} platform - Platform ('android', 'ios', 'web')
 * @returns {Array} Parse edilmiş video listesi
 */
export const parseVideoUrls = (videos, platform = null) => {
  const currentPlatform = platform || detectPlatform();
  
  return videos.map(video => {
    let parsedUrl = video.url;
    
    // Platform bazında URL formatını belirle
    if (currentPlatform === 'android') {
      // Android için .mpd formatı
      if (!parsedUrl.includes('_android/') && !parsedUrl.endsWith('.mpd')) {
        const parts = parsedUrl.split('/');
        const fileName = parts[parts.length - 1];
        const pathWithoutFile = parts.slice(0, -1).join('/');
        parsedUrl = `${pathWithoutFile}_android/${fileName}.mpd`;
      }
    } else if (currentPlatform === 'ios') {
      // iOS için .m3u8 formatı
      if (!parsedUrl.includes('_ios/') && !parsedUrl.endsWith('.m3u8')) {
        const parts = parsedUrl.split('/');
        const fileName = parts[parts.length - 1];
        const pathWithoutFile = parts.slice(0, -1).join('/');
        parsedUrl = `${pathWithoutFile}_ios/${fileName}.m3u8`;
      }
    } else {
      // Web/Desktop için .mpd formatı (varsayılan)
      if (!parsedUrl.includes('_android/') && !parsedUrl.endsWith('.mpd')) {
        const parts = parsedUrl.split('/');
        const fileName = parts[parts.length - 1];
        const pathWithoutFile = parts.slice(0, -1).join('/');
        parsedUrl = `${pathWithoutFile}_android/${fileName}.mpd`;
      }
    }
    
    return {
      ...video,
      url: parsedUrl,
      platform: currentPlatform
    };
  });
};

/**
 * Video URL'sini tam URL'ye çevirir
 * @param {string} baseUrl - Base URL (örn: https://basincyaralanmasinionle.xyz/)
 * @param {string} videoUrl - Video URL'si
 * @param {string} platform - Platform ('android', 'ios', 'web')
 * @returns {string} Tam URL
 */
export const getFullVideoUrl = (baseUrl, videoUrl, platform = null) => {
  const currentPlatform = platform || detectPlatform();
  let parsedUrl = videoUrl;
  
  // Platform bazında URL formatını belirle
  if (currentPlatform === 'android') {
    if (!parsedUrl.includes('_android/') && !parsedUrl.endsWith('.mpd')) {
      const parts = parsedUrl.split('/');
      const fileName = parts[parts.length - 1];
      const pathWithoutFile = parts.slice(0, -1).join('/');
      parsedUrl = `${pathWithoutFile}_android/${fileName}.mpd`;
    }
  } else if (currentPlatform === 'ios') {
    if (!parsedUrl.includes('_ios/') && !parsedUrl.endsWith('.m3u8')) {
      const parts = parsedUrl.split('/');
      const fileName = parts[parts.length - 1];
      const pathWithoutFile = parts.slice(0, -1).join('/');
      parsedUrl = `${pathWithoutFile}_ios/${fileName}.m3u8`;
    }
  } else {
    // Web için Android formatını kullan
    if (!parsedUrl.includes('_android/') && !parsedUrl.endsWith('.mpd')) {
      const parts = parsedUrl.split('/');
      const fileName = parts[parts.length - 1];
      const pathWithoutFile = parts.slice(0, -1).join('/');
      parsedUrl = `${pathWithoutFile}_android/${fileName}.mpd`;
    }
  }
  
  // Base URL ile birleştir
  return `${baseUrl.replace(/\/$/, '')}/${parsedUrl}`;
};

/**
 * Video formatını platform bazında belirler
 * @param {string} platform - Platform ('android', 'ios', 'web')
 * @returns {string} Video formatı
 */
export const getVideoFormat = (platform = null) => {
  const currentPlatform = platform || detectPlatform();
  
  switch (currentPlatform) {
    case 'android':
    case 'web':
      return 'application/dash+xml'; // DASH format
    case 'ios':
      return 'application/x-mpegURL'; // HLS format
    default:
      return 'application/dash+xml';
  }
};

/**
 * Video verilerini API'den alınan formattan kullanılabilir formata çevirir
 * @param {Array} rawVideos - Ham video verileri
 * @param {string} baseUrl - Base URL (opsiyonel)
 * @param {string} platform - Platform (opsiyonel)
 * @returns {Array} İşlenmiş video verileri
 */
export const processVideoData = (rawVideos, baseUrl = 'https://basincyaralanmasinionle.xyz/', platform = null) => {
  const currentPlatform = platform || detectPlatform();
  
  return rawVideos.map(video => {
    let parsedUrl = video.url;
    
    // Platform bazında URL formatını belirle
    if (currentPlatform === 'android') {
      if (!parsedUrl.includes('_android/') && !parsedUrl.endsWith('.mpd')) {
        const parts = parsedUrl.split('/');
        const fileName = parts[parts.length - 1];
        const pathWithoutFile = parts.slice(0, -1).join('/');
        parsedUrl = `${pathWithoutFile}_android/${fileName}.mpd`;
      }
    } else if (currentPlatform === 'ios') {
      if (!parsedUrl.includes('_ios/') && !parsedUrl.endsWith('.m3u8')) {
        const parts = parsedUrl.split('/');
        const fileName = parts[parts.length - 1];
        const pathWithoutFile = parts.slice(0, -1).join('/');
        parsedUrl = `${pathWithoutFile}_ios/${fileName}.m3u8`;
      }
    } else {
      // Web için Android formatını kullan
      if (!parsedUrl.includes('_android/') && !parsedUrl.endsWith('.mpd')) {
        const parts = parsedUrl.split('/');
        const fileName = parts[parts.length - 1];
        const pathWithoutFile = parts.slice(0, -1).join('/');
        parsedUrl = `${pathWithoutFile}_android/${fileName}.mpd`;
      }
    }
    
    return {
      id: video.id,
      videoName: video.videoName,
      url: parsedUrl,
      fullUrl: getFullVideoUrl(baseUrl, video.url, currentPlatform),
      platform: currentPlatform,
      format: getVideoFormat(currentPlatform)
    };
  });
}; 