"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { VideoItem } from "@/data/mockVideos";
import VideoCard from "./VideoCard";

export default function VideoCardWrapper({ video }: { video: VideoItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { containerRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.6 }); // Active when 60% visible
  const { playVideo, pauseVideo, resetVideo } = useVideoPlayback(videoRef);

  // 1. Play/Pause based on visibility
  useEffect(() => {
    if (isInView) {
      playVideo();
    } else {
      resetVideo();
    }
  }, [isInView]);

  // 2. Keyboard Navigation (Space for play/pause, Arrows for scrolling)
  useEffect(() => {
    if (!isInView) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (videoEl.paused) {
          playVideo();
        } else {
          pauseVideo();
        }
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        const container = containerRef.current;
        if (container && container.nextElementSibling) {
          container.nextElementSibling.scrollIntoView({ behavior: "smooth" });
        }
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        const container = containerRef.current;
        if (container && container.previousElementSibling) {
          container.previousElementSibling.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInView, containerRef, playVideo, pauseVideo]);

  // 3. Pause video when user changes browser tab
  useEffect(() => {
    if (!isInView) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseVideo();
      } else {
        playVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInView, playVideo, pauseVideo]);

  return (
    <div ref={containerRef} className="w-full h-[100dvh] lg:h-full snap-start relative">
      <VideoCard video={video} videoRef={videoRef} />
    </div>
  );
}
