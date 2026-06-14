"use client";

import { RefObject } from "react";

export function useVideoPlayback(videoRef: RefObject<HTMLVideoElement | null>) {
  const playVideo = async (): Promise<boolean> => {
    const video = videoRef.current;
    if (!video) return false;

    try {
      await video.play();
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        video.muted = true;
        try {
          await video.play();
          return true;
        } catch (playErr) {
          console.error("Retry playback failed:", playErr);
        }
      }
      return false;
    }
  };

  const pauseVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  };

  const resetVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return { playVideo, pauseVideo, resetVideo };
}
