"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthButton } from "~/components/ui/auth-button";
import ViewSidebar from "~/app/_components/table-sidebar";

export default function BaseLayout({
  children,
  baseName,
}: {
  children: React.ReactNode;
  baseName: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 flex h-14 items-center justify-between bg-green-700 px-1">
        <div className="flex min-w-[60px] items-center">
          <Link href="/home">
            <img
              className="mr-4 ml-5 h-[22px]"
              src="/airtable-transparent.png"
            ></img>
          </Link>
          <h1 className="text-lg font-semibold text-white">{baseName}</h1>
        </div>
        <AuthButton />
      </header>

      <div className="flex flex-1">
        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
