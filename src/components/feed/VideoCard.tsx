"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import InteractionBar from "../ui/InteractionBar";
import MuteButton from "../ui/MuteButton";
import { Heart as HeartIcon } from "lucide-react";
import { VideoItem } from "@/data/mockVideos";

interface VideoCardProps {
  video: VideoItem;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoCard({ video, videoRef }: VideoCardProps) {
  const { audioEnabled, setAudioEnabled, likes, toggleLike } = useAppContext();
  const [progress, setProgress] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPausedOverlay, setIsPausedOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const lastClickTimeRef = useRef<number>(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mute state with global context
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const targetMuted = !audioEnabled;
    if (videoEl.muted !== targetMuted) {
      videoEl.muted = targetMuted;
    }
  }, [audioEnabled, videoRef]);

  // Track video progress bar
  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration) return;
    setProgress((videoEl.currentTime / videoEl.duration) * 100);
  };

  // Scrub progress bar
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * videoEl.duration;
    videoEl.currentTime = newTime;
    setProgress((clickX / width) * 100);
  };

  // Click handler: distinguishes single tap (pause/play) and double tap (like + heart animation)
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;

    if (timeDiff < 300) {
      // Double click => Like
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      // Calculate relative coordinates
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add a floating heart
      const newHeart = { id: Date.now(), x, y };
      setHearts((prev) => [...prev, newHeart]);

      // Remove the heart after animation finishes
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 800);

      // Trigger like state
      if (!likes[video.id]?.isLiked) {
        toggleLike(video.id, video.likesCount);
      }
    } else {
      // Single click => Pause / Play
      clickTimeoutRef.current = setTimeout(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (videoEl.paused) {
          videoEl.play().then(() => {
            setIsPausedOverlay(false);
          }).catch((err) => {
            if (err.name === "NotAllowedError") {
              videoEl.muted = true;
              setAudioEnabled(false);
              videoEl.play().then(() => setIsPausedOverlay(false));
            }
          });
        } else {
          videoEl.pause();
          setIsPausedOverlay(true);
        }
        clickTimeoutRef.current = null;
      }, 300);
    }

    lastClickTimeRef.current = currentTime;
  };

  // Sync isPausedOverlay state when play/pause is triggered by outside actions (like keyboard)
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const onPlay = () => setIsPausedOverlay(false);
    const onPause = () => setIsPausedOverlay(true);

    videoEl.addEventListener("play", onPlay);
    videoEl.addEventListener("pause", onPause);

    return () => {
      videoEl.removeEventListener("play", onPlay);
      videoEl.removeEventListener("pause", onPause);
    };
  }, [videoRef]);

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={!audioEnabled}
        preload="auto"
        onClick={handleVideoClick}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        aria-label={`Video by ${video.authorName}: ${video.description}`}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Floating hearts (Double-click animation) */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute z-30 pointer-events-none text-red-500 heart-pop"
          style={{ left: heart.x, top: heart.y }}
        >
          <HeartIcon size={64} fill="currentColor" className="filter drop-shadow-lg" />
        </div>
      ))}

      {/* Play Icon Overlay (visible when paused) */}
      {isPausedOverlay && (
        <div 
          onClick={() => {
            videoRef.current?.play().then(() => setIsPausedOverlay(false));
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 cursor-pointer pointer-events-auto"
        >
          <div className="p-5 rounded-full bg-black/50 text-white transform scale-100 hover:scale-110 active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Overlay UI Layout */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end p-4">
        {/* Shadow Overlay Gradient at Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Footer info (Author & Description) */}
        <div className="pointer-events-auto mb-20 lg:mb-8 max-w-[80%] z-10">
          <h3 className="text-white font-bold text-base drop-shadow-md flex items-center gap-2">
            <span>{video.authorName}</span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
          </h3>
          <p className="text-gray-200 text-sm mt-1 whitespace-normal break-words drop-shadow-md leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Interaction items on the right side */}
        <div className="absolute bottom-24 lg:bottom-10 right-4 pointer-events-auto z-10">
          <InteractionBar video={video} />
        </div>

        {/* Mute Button on top right */}
        <div className="absolute top-4 right-4 pointer-events-auto z-10">
          <MuteButton videoRef={videoRef} />
        </div>
      </div>

      {/* Scrubbable progress bar at the bottom */}
      <div
        onClick={handleScrub}
        className="absolute bottom-0 left-0 w-full h-[4px] hover:h-[8px] bg-white/20 z-20 cursor-pointer pointer-events-auto transition-all"
        title="Tua video"
      >
        <div
          className="h-full bg-red-600 relative transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Knob helper on hover */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}