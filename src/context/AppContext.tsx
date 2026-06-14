"use client";
import { createContext, useContext, useState, ReactNode} from "react";

interface AppContextType {
    audioEnabled: boolean;
    setAudioEnabled: (v: boolean) => void;
    likes: Record<string, {isLiked: boolean; count: number}>;
    toggleLike: (videoId: string, initialCount: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider ({ children}: {children : ReactNode}) {
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [likes, setLikes] = useState<AppContextType["likes"]>({});

    const toggleLike = (videoId: string, initialCount: number) => {
        setLikes((prev) => {
            const current = prev[videoId] || { isLiked: false, count: initialCount};
            return {
                ...prev,
                [videoId]: {
                    isLiked: !current.isLiked,
                    count: current.isLiked ? current.count - 1 : current.count + 1,
                },
            }
        })
    }
    return (
    <AppContext.Provider value={{ audioEnabled, setAudioEnabled, likes, toggleLike }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
