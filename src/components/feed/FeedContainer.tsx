"use client";
import { VideoItem } from "@/data/mockVideos";
import VideoCardWrapper from "./VideoCardWrapper";
import BottomNav from "../navigation/BottomNav";

export default function FeedContainer({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none pb-16 lg:pb-0 relative bg-black">
      {videos.map((video) => (
        <VideoCardWrapper key={video.id} video={video} />
      ))}
      {/* Menu bottom xuất hiện linh hoạt trên Mobile dưới luồng layer */}
      <BottomNav className="block lg:hidden" />
    </div>
  );
}