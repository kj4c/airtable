"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { AuthButton } from "~/components/ui/auth-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-14 flex items-center justify-between px-1 bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size={"icon"}
            className="hover:bg-white/10 group"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <Menu className="!w-5 !h-5 text-gray-500 group-hover:text-black transition-colors" />
          </Button>
          <img className="h-16" src="logo-side.png"></img>
        </div>
        <AuthButton />
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-0 overflow-hidden"
          }`}
        >
          <nav className="p-4 flex flex-col gap-3 text-sm">
            <Button className="cursor-pointer bg-transparent text-black w-full justify-start text-lg hover:bg-gray-300">Home</Button>
            <Button className="cursor-pointer bg-transparent text-black w-full justify-start text-lg hover:bg-gray-300">All Workspaces</Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 bg-muted/40 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
