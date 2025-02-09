import React, { useEffect, useImperativeHandle, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = React.forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, onPlay, onPause, onTimeUpdate } = props;

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
  }));

  useEffect(() => {
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

      const controls = document.querySelectorAll(".vjs-control.vjs-hidden");
      controls.forEach((control) => {
        control.classList.remove("vjs-hidden");
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, onReady, onPlay, onPause]);
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

export default VideoPlayer;
