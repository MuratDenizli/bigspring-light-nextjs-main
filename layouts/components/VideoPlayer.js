import React, { useEffect, useImperativeHandle, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// CSS stilini client-side'da ekleyeceğiz, global tanımdan kaldırıp useEffect içine taşıyoruz

const VideoPlayer = React.forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, onPlay, onPause, onTimeUpdate } = props;

  // Client-side'da CSS stillerini eklemek için useEffect
  useEffect(() => {
    // Server-side rendering sırasında bu kodu çalıştırma
    if (typeof document === 'undefined') return;
    
    // CSS stilini ekle (fullscreen modundaki modal için)
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
      .video-js.vjs-fullscreen {
        position: fixed;
        z-index: 9000;
      }
      .video-js.vjs-fullscreen .vjs-tech {
        z-index: 9001;
      }
      .player-overlay-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9005 !important;
        pointer-events: none;
      }
      .question-modal {
        position: absolute;
        z-index: 9010 !important;
        pointer-events: auto !important;
      }
      .vjs-fullscreen .question-modal {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 80% !important;
        max-width: 500px !important;
      }
    `;
    document.head.appendChild(modalStyle);

    // Cleanup function
    return () => {
      if (document.head.contains(modalStyle)) {
        document.head.removeChild(modalStyle);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => {
      console.log("Play çağrıldı");
      return playerRef.current.play();
    },
    pause: () => {
      console.log("Pause çağrıldı");
      return playerRef.current.pause();
    },
    getCurrentTime: () => playerRef.current.currentTime(),
    getDuration: () => playerRef.current.duration(),
    setCurrentTime: (time) => {
      console.log("Yeni zaman ayarlanıyor:", time);
      if (playerRef.current) {
        playerRef.current.currentTime(time);
        // Zaman ayarlandıktan sonra oynatmayı dene
        playerRef.current.one('seeked', () => {
          console.log("Seek tamamlandı, video devam ediyor");
          playerRef.current.play();
        });
      }
    },
    isFullscreen: () => {
      return playerRef.current && playerRef.current.isFullscreen();
    },
    getPlayer: () => playerRef.current,
    appendChildToPlayer: (element) => {
      // Server-side rendering kontrolü
      if (typeof document === 'undefined') return false;
      
      if (playerRef.current) {
        try {
          const playerEl = playerRef.current.el();
          console.log("Player element'e child eklenecek:", playerEl);
          
          // Önce player'a bir konteyner ekleyelim
          let container = playerEl.querySelector('.player-overlay-container');
          if (!container) {
            container = document.createElement('div');
            container.className = 'player-overlay-container';
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '9005';
            container.style.pointerEvents = 'none'; // Mouse olaylarını geçir
            playerEl.appendChild(container);
          }
          
          // Element'e özel stiller ekleyerek modal görünürlüğünü sağla
          element.style.pointerEvents = 'auto'; // Mouse olaylarını yakala
          element.style.zIndex = '9010'; // Üstte görün
          
          // Element'i konteyner'a ekleyelim
          container.appendChild(element);
          console.log("Modal başarıyla player'a eklendi");
          return true;
        } catch (error) {
          console.error("Modal player'a eklenirken hata:", error);
          return false;
        }
      }
      return false;
    }
  }));

  useEffect(() => {
    // Server-side rendering sırasında document olmayacak
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        ...options,
        controlBar: {
          // Sadece oynat/duraklat ve ses kontrollerini göster
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
          ],
          // Diğer kontrolleri gizle
          progressControl: false,
          remainingTimeDisplay: false,
          playbackRateMenuButton: false,
          fullscreenToggle: true
        }
      }, () => {
        console.log("Video.js player hazır");
        onReady && onReady(player);
      }));

      // İleri-geri alma işlemlerini engelle
      player.on('seeking', () => {
        const currentTime = player.currentTime();
        const lastTime = player.cache_.currentTime || 0;
        
        // Eğer kullanıcı ileri-geri almaya çalışırsa engelle
        if (Math.abs(currentTime - lastTime) > 1) {
          player.currentTime(lastTime);
        }
      });

      player.on("play", () => {
        console.log("Video oynatılıyor");
        onPlay && onPlay();
      });

      player.on("pause", () => {
        console.log("Video duraklatıldı, süre:", player.currentTime());
        onPause && onPause(player.currentTime(), player.duration());
      });

      player.on("timeupdate", () => {
        onTimeUpdate && onTimeUpdate(player.currentTime(), player);
      });
      
      // Fullscreen değişikliğini izle
      player.on("fullscreenchange", () => {
        const isFullscreen = player.isFullscreen();
        console.log("Fullscreen değişti, yeni durum:", isFullscreen);
        
        // Fullscreen değiştiğinde Event tetikle
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('video-fullscreen-change', {
            detail: { isFullscreen: isFullscreen }
          });
          window.dispatchEvent(event);
        }
        
        try {
          // Fullscreen değiştiğinde bir overlay container oluştur
          // Bu fullscreen modunda modalların görünür olmasını sağlar
          const playerEl = player.el();
          
          if (isFullscreen) {
            let container = playerEl.querySelector('.player-overlay-container');
            if (!container) {
              container = document.createElement('div');
              container.className = 'player-overlay-container';
              container.style.position = 'absolute';
              container.style.top = '0';
              container.style.left = '0';
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.zIndex = '9005';
              container.style.pointerEvents = 'none';
              playerEl.appendChild(container);
            }
            
            // Eğer soru modalı varsa, konteyner'a taşı
            setTimeout(() => {
              const questionModal = document.querySelector('.question-modal');
              if (questionModal) {
                console.log("Fullscreen modunda soru modalı konteyner'a taşınıyor");
                
                // Modal stili güncelle
                questionModal.style.position = 'absolute';
                questionModal.style.top = '50%';
                questionModal.style.left = '50%';
                questionModal.style.transform = 'translate(-50%, -50%)';
                questionModal.style.zIndex = '9010';
                questionModal.style.pointerEvents = 'auto';
                
                container.appendChild(questionModal);
                console.log("Modal fullscreen konteyner'a taşındı");
              } else {
                console.log("Soru modalı bulunamadı");
              }
            }, 300); // Biraz bekleyerek DOM'un hazır olmasını sağla
          }
        } catch (error) {
          console.error("Fullscreen değişikliği sırasında hata:", error);
        }
      });

      const controls = document.querySelectorAll(".vjs-control.vjs-hidden");
      controls.forEach((control) => {
        control.classList.remove("vjs-hidden");
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, onReady, onPlay, onPause, onTimeUpdate]);
  
  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
});

// displayName ekleyerek linter uyarısını giderelim
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
