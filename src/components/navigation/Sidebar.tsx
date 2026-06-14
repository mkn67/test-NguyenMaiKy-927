import { Home, Compass, User } from "lucide-react";

export default function Sidebar({ className = "" }: { className?: string }) {
  return (
    <aside className={`flex-col py-8 bg-black border-r border-gray-800 ${className}`}>
      <div className="flex flex-col gap-8 w-full px-6">
        <button className="flex items-center gap-4 text-white hover:text-gray-300 font-bold text-lg transition-colors">
          <Home size={28} /> <span className="hidden xl:block">Trang chủ</span>
        </button>
        <button className="flex items-center gap-4 text-gray-400 hover:text-white font-bold text-lg transition-colors">
          <Compass size={28} /> <span className="hidden xl:block">Khám phá</span>
        </button>
        <button className="flex items-center gap-4 text-gray-400 hover:text-white font-bold text-lg transition-colors">
          <User size={28} /> <span className="hidden xl:block">Hồ sơ</span>
        </button>
      </div>
    </aside>
  );
}