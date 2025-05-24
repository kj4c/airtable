"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthButton } from "~/components/ui/auth-button";

export default function BaseLayout({ children, baseName }: { children: React.ReactNode, baseName: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-green-700 px-1">
        <div className="flex items-center min-w-[60px]">
          <Link href="/home">
            <img className="h-[22px] ml-5 mr-4" src="/airtable-transparent.png"></img>
          </Link>
          <h1 className="text-lg font-semibold text-white">{baseName}</h1>
        </div>
        <AuthButton />
      </header>

      <div className="flex flex-1">
        {/* Main content */}
        <main className="bg-white flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
