"use client";

import { useAppContext } from "@/context/AppContext";
import { RefObject, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MuteButton({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const { audioEnabled, setAudioEnabled, volume, setVolume } = useAppContext();
  const [isMuted, setIsMuted] = useState(!audioEnabled);

  // Sync state from global context
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const targetMuted = !audioEnabled;
    if (video.muted !== targetMuted) {
      video.muted = targetMuted;
      setIsMuted(targetMuted);
    }
  }, [audioEnabled, videoRef]);

  // Click speaker icon toggle
  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      const newMuted = !video.muted;
      video.muted = newMuted;
      setIsMuted(newMuted);
      setAudioEnabled(!newMuted);

      // If unmuting and volume was 0, restore to a default audible volume (e.g., 0.5)
      if (!newMuted && volume === 0) {
        setVolume(0.5);
      }
    },
    [videoRef, setAudioEnabled, volume, setVolume]
  );

  // Change volume slider value
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);

      const video = videoRef.current;
      if (video) {
        video.volume = newVolume;
        if (newVolume > 0) {
          video.muted = false;
          setIsMuted(false);
          setAudioEnabled(true);
        } else {
          video.muted = true;
          setIsMuted(true);
          setAudioEnabled(false);
        }
      }
    },
    [videoRef, setVolume, setAudioEnabled]
  );

  return (
    <div
      onClick={handleToggle}
      className="flex items-center gap-2 group p-2 rounded-full bg-black/45 backdrop-blur-md text-white transition-all w-9 hover:w-32 h-9 hover:px-2.5 duration-300 overflow-hidden cursor-pointer select-none border border-white/5"
      title={isMuted ? "Bật âm thanh" : `Tắt âm thanh (Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%)`}
    >
      {/* Icon portion */}
      <div className="shrink-0 w-5 h-5 flex items-center justify-center">
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </div>

      {/* Slider portion (revealed on hover) */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        onClick={(e) => e.stopPropagation()} // Prevent trigger toggle click
        className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all duration-300 accent-red-500 h-1 cursor-pointer"
        aria-label="Điều chỉnh âm lượng"
      />
    </div>
  );
}