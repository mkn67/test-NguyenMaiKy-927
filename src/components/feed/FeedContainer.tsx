"use client";

import { useState, useRef } from "react";
import { VideoItem } from "@/data/mockVideos";
import VideoCardWrapper from "./VideoCardWrapper";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function FeedContainer({ videos: initialVideos }: { videos: VideoItem[] }) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const containerRef = useRef<HTMLDivElement>(null);

  // Endless scrolling: when near the bottom of list, append initial videos again in a loop
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const threshold = 300; // px
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    if (isNearBottom) {
      setVideos((prev) => [
        ...prev,
        ...initialVideos.map((v, i) => ({
          ...v,
          id: `${v.id}_loop_${Date.now()}_${i}`,
        })),
      ]);
    }
  };

  const scrollNext = () => {
    const container = containerRef.current;
    if (!container) return;

    const currentScroll = container.scrollTop;
    const itemHeight = container.clientHeight;
    const currentIndex = Math.round(currentScroll / itemHeight);

    if (currentIndex < videos.length - 1) {
      container.scrollTo({
        top: (currentIndex + 1) * itemHeight,
        behavior: "smooth",
      });
    } else {
      // Loop back to the first item (circular scroll)
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollPrev = () => {
    const container = containerRef.current;
    if (!container) return;

    const currentScroll = container.scrollTop;
    const itemHeight = container.clientHeight;
    const currentIndex = Math.round(currentScroll / itemHeight);

    if (currentIndex > 0) {
      container.scrollTo({
        top: (currentIndex - 1) * itemHeight,
        behavior: "smooth",
      });
    } else {
      // Loop to the last item (circular scroll)
      container.scrollTo({
        top: (videos.length - 1) * itemHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Scrollable Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[100dvh] lg:h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-black"
      >
        {videos.map((video) => (
          <VideoCardWrapper key={video.id} video={video} />
        ))}
      </div>

      {/* Floating Navigation Buttons (Left Side) - Hidden on Mobile */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 hidden md:flex pointer-events-auto">
        <button
          onClick={scrollPrev}
          className="p-2.5 rounded-full bg-black/45 hover:bg-red-500 text-white backdrop-blur-md transition-all shadow-xl active:scale-90 border border-white/5 cursor-pointer flex items-center justify-center hover:scale-110 duration-200"
          title="Video trước (Phím Mũi tên Lên)"
          aria-label="Video trước"
        >
          <ChevronUp size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={scrollNext}
          className="p-2.5 rounded-full bg-black/45 hover:bg-red-500 text-white backdrop-blur-md transition-all shadow-xl active:scale-90 border border-white/5 cursor-pointer flex items-center justify-center hover:scale-110 duration-200"
          title="Video tiếp theo (Phím Mũi tên Xuống)"
          aria-label="Video tiếp theo"
        >
          <ChevronDown size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}