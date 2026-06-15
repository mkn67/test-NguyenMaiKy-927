"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

interface Account {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowed: boolean;
}

export default function SuggestedAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "1", name: "Sarah Jenkins", username: "@sarah.unbox", avatar: "SJ", isFollowed: false },
    { id: "2", name: "David Atten", username: "@nature.explorer", avatar: "DE", isFollowed: true },
    { id: "3", name: "Gordon Ramsey", username: "@kitchen.master", avatar: "GR", isFollowed: false },
    { id: "4", name: "Zach King", username: "@magic.shorts", avatar: "ZK", isFollowed: false },
  ]);

  const toggleFollow = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, isFollowed: !acc.isFollowed } : acc))
    );
  };

  return (
    <div className="flex flex-col gap-6 text-white h-full overflow-y-auto scrollbar-none pr-1">
      {/* Recommended accounts */}
      <div>
        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 select-none">
          Tài khoản đề xuất
        </h4>
        <div className="flex flex-col gap-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white select-none">
                  {acc.avatar}
                </div>
                <div className="flex flex-col max-w-[120px]">
                  <span className="text-sm font-semibold truncate group-hover:underline cursor-pointer">
                    {acc.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{acc.username}</span>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(acc.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  acc.isFollowed
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    : "bg-red-500 text-white hover:bg-red-600 active:scale-95"
                }`}
              >
                {acc.isFollowed ? (
                  <>
                    <UserCheck size={12} />
                    <span>Đang fl</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={12} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-6 text-[11px] text-gray-500 flex flex-col gap-2 select-none">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <a href="#" className="hover:underline">Giới thiệu</a>
          <a href="#" className="hover:underline">Báo chí</a>
          <a href="#" className="hover:underline">Bản quyền</a>
          <a href="#" className="hover:underline">Liên hệ</a>
        </div>
        <p>© 2026 NetViet Video Feed</p>
      </div>
    </div>
  );
}
