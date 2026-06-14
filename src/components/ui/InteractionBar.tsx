"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Plus, Check } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { VideoItem } from "@/data/mockVideos";

export default function InteractionBar({ video }: { video: VideoItem }) {
  const { likes, toggleLike } = useAppContext();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const currentLike = likes[video.id] || { isLiked: false, count: video.likesCount };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(video.id, video.likesCount);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowed((prev) => !prev);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Sao chép link giả lập vào clipboard
    const dummyUrl = typeof window !== "undefined" ? window.location.href : "https://netviet.verticalvideo.feed";
    navigator.clipboard.writeText(`${dummyUrl}?video=${video.id}`)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      })
      .catch((err) => console.error("Không thể copy link: ", err));
  };

  return (
    <div className="flex flex-col items-center gap-4 text-white relative">
      {/* Avatar Tác giả & Nút Follow */}
      <div className="relative mb-3 flex flex-col items-center">
        <div className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-sm text-white shadow-lg select-none">
          {video.authorName.replace("@", "").substring(0, 2).toUpperCase()}
        </div>
        <button
          onClick={handleFollow}
          className={`absolute -bottom-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFollowed
              ? "bg-green-500 scale-100 rotate-360 text-white"
              : "bg-red-500 hover:bg-red-600 scale-100 text-white"
          }`}
          aria-label={isFollowed ? "Đang theo dõi" : "Theo dõi"}
        >
          {isFollowed ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
        </button>
      </div>

      {/* Nút Like (Thả tim) */}
      <button
        onClick={handleLike}
        className="flex flex-col items-center group cursor-pointer"
        aria-label="Thích"
      >
        <div
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-75 transition-all duration-200 ${
            currentLike.isLiked ? "text-red-500" : "text-white"
          }`}
        >
          <Heart size={24} fill={currentLike.isLiked ? "currentColor" : "none"} className="transition-transform group-hover:scale-110" />
        </div>
        <span className="text-xs font-medium mt-1 drop-shadow-md text-gray-200">
          {currentLike.count.toLocaleString()}
        </span>
      </button>

      {/* Nút Bình luận */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert("Mock Comment: Tính năng bình luận đang được phát triển!");
        }}
        className="flex flex-col items-center group cursor-pointer"
        aria-label="Bình luận"
      >
        <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-75 transition-all duration-200">
          <MessageCircle size={24} className="transition-transform group-hover:scale-110" />
        </div>
        <span className="text-xs font-medium mt-1 drop-shadow-md text-gray-200">
          {Math.floor(currentLike.count / 8).toLocaleString()}
        </span>
      </button>

      {/* Nút Bookmark (Lưu trữ) */}
      <button
        onClick={handleBookmark}
        className="flex flex-col items-center group cursor-pointer"
        aria-label="Lưu trữ"
      >
        <div
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-75 transition-all duration-200 ${
            isBookmarked ? "text-yellow-400" : "text-white"
          }`}
        >
          <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} className="transition-transform group-hover:scale-110" />
        </div>
        <span className="text-xs font-medium mt-1 drop-shadow-md text-gray-200">
          {isBookmarked ? "Đã lưu" : "Lưu"}
        </span>
      </button>

      {/* Nút Chia sẻ */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center group cursor-pointer"
        aria-label="Chia sẻ"
      >
        <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-75 transition-all duration-200">
          <Share2 size={24} className="transition-transform group-hover:scale-110" />
        </div>
        <span className="text-xs font-medium mt-1 drop-shadow-md text-gray-200">
          Chia sẻ
        </span>
      </button>

      {/* Toast thông báo copy link thành công */}
      {showShareToast && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/90 border border-gray-700 text-green-400 text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl pointer-events-none transition-opacity duration-300">
          Đã sao chép link! 🔗
        </div>
      )}
    </div>
  );
}