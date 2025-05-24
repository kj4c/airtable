"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { AuthButton } from "~/components/ui/auth-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-white px-1 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size={"icon"}
            className="group cursor-pointer hover:bg-white/10"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <Menu className="!h-5 !w-5 text-gray-500 transition-colors group-hover:text-black" />
          </Button>
          <Link href="/">
            <img className="h-16" src="logo-side.png"></img>
          </Link>
        </div>
        <AuthButton />
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`border-r bg-white transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-0 overflow-hidden"
          }`}
        >
          <nav className="flex flex-col gap-3 p-4 text-sm">
            <Button className="w-full cursor-pointer justify-start bg-transparent text-lg text-black hover:bg-gray-300">
              Home
            </Button>
            <Button className="w-full cursor-pointer justify-start bg-transparent text-lg text-black hover:bg-gray-300">
              All Workspaces
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="bg-muted/40 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
