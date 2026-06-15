import FeedContainer from "@/components/feed/FeedContainer";
import Sidebar from "@/components/navigation/Sidebar";
import BottomNav from "@/components/navigation/BottomNav";
import SuggestedAccounts from "@/components/ui/SuggestedAccounts";
import { mockVideo } from "@/data/mockVideos";

export default function HomePage() {
  return (
    <div className="flex h-[100dvh] bg-[#0f0f0f] text-white overflow-hidden relative">
      <header className="absolute top-0 left-0 w-full z-50 flex justify-center py-6 font-semibold lg:hidden pointer-events-none">
        <div className="flex gap-5 drop-shadow-lg pointer-events-auto text-[17px]">
          <span className="text-white/60 cursor-pointer">Đang theo dõi</span>
          <span className="text-white border-b-[3px] border-white pb-1 cursor-pointer">Dành cho bạn</span>
        </div>
      </header>

      <Sidebar className="hidden lg:flex w-20 xl:w-[250px]" />

      <main className="flex-1 flex justify-center bg-black relative">
        <header className="absolute top-6 z-50 hidden lg:flex justify-center w-full font-bold pointer-events-none">
          <div className="flex gap-6 drop-shadow-2xl pointer-events-auto text-lg">
            <span className="text-white/60 cursor-pointer hover:text-white transition">Đang theo dõi</span>
            <span className="text-white cursor-pointer border-b-[3px] border-white pb-1">Dành cho bạn</span>
          </div>
        </header>

        <div className="relative w-full h-[100dvh] lg:h-[90vh] lg:max-w-[calc(90vh*9/16)] lg:aspect-[9/16] lg:my-auto bg-gray-900 lg:border border-gray-800 lg:rounded-xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)]">
          <FeedContainer videos={mockVideo} />
        </div>
      </main>

      <aside className="hidden xl:flex w-80 p-6 border-l border-gray-800 bg-[#0f0f0f] flex-col">
        <SuggestedAccounts />
      </aside>
      <BottomNav className="lg:hidden" />
    </div>
  );
}