import { Home, Compass, User } from "lucide-react";

export default function BottomNav({ className = "" }: { className?: string }) {
  return (
    <nav className={`fixed bottom-0 left-0 w-full h-16 bg-black/95 border-t border-gray-800 z-50 flex justify-around items-center backdrop-blur-md ${className}`}>
      <button className="flex flex-col items-center text-white">
        <Home size={24} />
        <span className="text-[10px] mt-1 font-semibold">Trang chủ</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <Compass size={24} />
        <span className="text-[10px] mt-1">Khám phá</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <User size={24} />
        <span className="text-[10px] mt-1">Hồ sơ</span>
      </button>
    </nav>
  );
}