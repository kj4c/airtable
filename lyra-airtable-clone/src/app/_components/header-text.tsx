import React from "react";

type TabButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export function TabButton({ active, children }: TabButtonProps) {
  return (
    <button
      className={`mx-2 px-3 py-3 text-[13px] h-7 font-[400] flex items-center justify-center
        ${active
          ? "bg-[#0a7c0e] text-white rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)]"
          : "bg-transparent text-white hover:bg-[#0a7c0e] hover:text-white rounded-full transition-colors cursor-pointer"
        }`}
    >
      {children}
    </button>
  );
}

