"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import InteractionBar from "../ui/InteractionBar";
import MuteButton from "../ui/MuteButton";
import { Heart as HeartIcon, X, Send } from "lucide-react";
import { VideoItem } from "@/data/mockVideos";

interface VideoCardProps {
  video: VideoItem;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoCard({ video, videoRef }: VideoCardProps) {
  const { audioEnabled, setAudioEnabled, volume, likes, toggleLike, comments, addComment } = useAppContext();
  const [progress, setProgress] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPausedOverlay, setIsPausedOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aspectRatioMode, setAspectRatioMode] = useState<"cover" | "contain">("cover");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const commentListRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state when changed by browser/user keyboard ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = cardRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Auto-scroll to bottom of local comments container only, avoiding scrolling parent snap containers
  useEffect(() => {
    if (isCommentsOpen && commentListRef.current) {
      const timer = setTimeout(() => {
        if (commentListRef.current) {
          commentListRef.current.scrollTo({
            top: commentListRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCommentsOpen, comments, video.id]);

  const lastClickTimeRef = useRef<number>(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic aspect ratio mode based on video metadata dimensions
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.currentTarget;
    if (!videoEl) return;
    const { videoWidth, videoHeight } = videoEl;
    if (videoWidth && videoHeight) {
      const ratio = videoWidth / videoHeight;
      // ratio >= 1.1 means landscape/horizontal, < 1.1 means vertical (portrait)
      if (ratio >= 1.1) {
        setAspectRatioMode("contain");
      } else {
        setAspectRatioMode("cover");
      }
    }
  };

  // Sync mute and volume state with global context
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const targetMuted = !audioEnabled;
    if (videoEl.muted !== targetMuted) {
      videoEl.muted = targetMuted;
    }
    if (videoEl.volume !== volume) {
      videoEl.volume = volume;
    }
  }, [audioEnabled, volume, videoRef]);

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
    <div ref={cardRef} className="relative w-full h-full bg-black select-none overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className={`absolute inset-0 w-full h-full cursor-pointer transition-all duration-300 ${
          aspectRatioMode === "cover" ? "object-cover" : "object-contain"
        }`}
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
        onLoadedMetadata={handleLoadedMetadata}
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
          <InteractionBar video={video} onOpenComments={() => setIsCommentsOpen(true)} />
        </div>

        {/* Top right buttons: Fullscreen & Mute/Volume */}
        <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto z-10">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/60 active:scale-90 transition-all border border-white/5 flex items-center justify-center cursor-pointer select-none h-9 w-9"
            aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3M10 21v-6H4M14 3v6h6"/></svg>
            )}
          </button>
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

      {/* Slide-up Comment Drawer */}
      {isCommentsOpen && (
        <div 
          onClick={() => setIsCommentsOpen(false)}
          className="absolute inset-0 bg-black/40 z-40 transition-opacity duration-300 pointer-events-auto cursor-default"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 h-[65%] bg-zinc-900 rounded-t-2xl border-t border-gray-800 flex flex-col p-4 z-50 transform translate-y-0 transition-transform duration-300 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-sm font-bold text-gray-300">
                Bình luận ({(comments[video.id]?.length || 0)})
              </span>
              <button 
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comment List */}
            <div 
              ref={commentListRef}
              className="flex-1 overflow-y-auto scrollbar-none py-3 flex flex-col gap-4"
            >
              {comments[video.id]?.length > 0 ? (
                comments[video.id].map((comment) => (
                  <div key={comment.id} className="flex gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {comment.avatar}
                    </div>
                    <div className="flex flex-col gap-0.5 max-w-[85%] text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300 hover:underline cursor-pointer">{comment.username}</span>
                        <span className="text-[10px] text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-100 break-words leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 select-none gap-2">
                  <span className="text-2xl">💬</span>
                  <span className="text-xs">Chưa có bình luận nào. Hãy là người đầu tiên!</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCommentText.trim()) return;
                addComment(video.id, "@me", newCommentText.trim());
                setNewCommentText("");
              }}
              className="flex gap-2 items-center pt-3 border-t border-gray-800"
            >
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()} // Prevent space from playing/pausing video
                placeholder="Thêm bình luận..."
                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm border border-gray-700/50 focus:border-gray-500 focus:outline-none"
              />
              <button 
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 bg-red-500 disabled:bg-gray-800 text-white rounded-full transition hover:bg-red-600 disabled:text-gray-500 cursor-pointer flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}