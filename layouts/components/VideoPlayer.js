import React, { useEffect, useImperativeHandle, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = React.forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, onPlay, onPause, onTimeUpdate } = props;

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current.play(),
    pause: () => playerRef.current.pause(),
    getCurrentTime: () => playerRef.current.currentTime(),
    getDuration: () => playerRef.current.duration(),
    setCurrentTime: (time) => {
      playerRef.current.currentTime(time);
    },
  }));

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        onReady && onReady(player);
      }));

      player.on("play", () => {
        onPlay && onPlay();
      });

      player.on("pause", () => {
        onPause && onPause(player.currentTime(), player.duration());
      });

      player.on("timeupdate", () => {
        onTimeUpdate && onTimeUpdate(player.currentTime(), player);
      });

      player.on("seeked", () => {
        console.log("Video seek işleminden sonra devam ediyor.");
        player.play();
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
