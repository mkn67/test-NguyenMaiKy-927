"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface CommentItem {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface AppContextType {
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  likes: Record<string, { isLiked: boolean; count: number }>;
  toggleLike: (videoId: string, initialCount: number) => void;
  comments: Record<string, CommentItem[]>;
  addComment: (videoId: string, username: string, text: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Initial mock comments for realistic visual demo
const initialComments: Record<string, CommentItem[]> = {
  "1": [
    { id: "c1", username: "@linda_99", avatar: "L", text: "Dễ thương quá trời ơi! 🐰", timestamp: "2 giờ trước" },
    { id: "c2", username: "@tech_enthusiast", avatar: "T", text: "Chất lượng video tốt thật.", timestamp: "1 giờ trước" },
  ],
  "2": [
    { id: "c3", username: "@alex_developer", avatar: "A", text: "Dorothy nhảy đẹp phết! 💃", timestamp: "5 giờ trước" },
    { id: "c4", username: "@music_lover", avatar: "M", text: "Nhạc cuốn thế nhỉ.", timestamp: "3 giờ trước" },
  ],
  "3": [
    { id: "c5", username: "@movie_buff", avatar: "M", text: "Trailer Elsa phần mới đỉnh cao! ❄️", timestamp: "1 ngày trước" },
    { id: "c6", username: "@frozen_fan", avatar: "F", text: "Hóng phim quá đi mất thôi.", timestamp: "12 giờ trước" },
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.8); // Default volume is 80%
  const [likes, setLikes] = useState<AppContextType["likes"]>({});
  const [comments, setComments] = useState<Record<string, CommentItem[]>>(initialComments);

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (v === 0) {
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
    }
  };

  const toggleLike = (videoId: string, initialCount: number) => {
    setLikes((prev) => {
      const current = prev[videoId] || { isLiked: false, count: initialCount };
      return {
        ...prev,
        [videoId]: {
          isLiked: !current.isLiked,
          count: current.isLiked ? current.count - 1 : current.count + 1,
        },
      };
    });
  };

  const addComment = (videoId: string, username: string, text: string) => {
    setComments((prev) => {
      const videoComments = prev[videoId] || [];
      const newComment: CommentItem = {
        id: `c_${Date.now()}`,
        username,
        avatar: username.replace("@", "").substring(0, 1).toUpperCase(),
        text,
        timestamp: "Vừa xong",
      };
      return {
        ...prev,
        [videoId]: [...videoComments, newComment],
      };
    });
  };

  return (
    <AppContext.Provider value={{ audioEnabled, setAudioEnabled, volume, setVolume, likes, toggleLike, comments, addComment }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
