"use client";

import { useAppContext } from "@/context/AppContext";
import { RefObject, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MuteButton({
    videoRef,
}: {
    videoRef: RefObject<HTMLVideoElement | null>;
}) 
{
    const { audioEnabled,setAudioEnabled} = useAppContext();
    const [isMuted,setIsMuted] = useState(!audioEnabled);
    useEffect(()=> {
        const video = videoRef.current;
        if (!video) return;
        const targetMuted = !audioEnabled;
        if (video.muted !== targetMuted) {
            video.muted = targetMuted;
            setIsMuted(targetMuted);
        }
    }, [audioEnabled, videoRef]);
    const handleToggle = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const video = videoRef.current;
            if (!video) return;
            const newMuted = !video.muted;
            video.muted = newMuted;
            setIsMuted(newMuted);
            setAudioEnabled(!newMuted);
        }, [videoRef, setAudioEnabled]
    );
    return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
      aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
    );
}