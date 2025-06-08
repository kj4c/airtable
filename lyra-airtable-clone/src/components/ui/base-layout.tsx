"use client";

import Link from "next/link";
import { AuthButton } from "~/components/ui/auth-button";
import Image from "next/image";

export default function BaseLayout({
  children,
  baseName,
}: {
  children: React.ReactNode;
  baseName: string;
}) {

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 flex min-h-[56px] items-center justify-between bg-green-700 px-1">
        <div className="flex min-w-[60px] items-center">
          <Link href="/home">
            <Image
              className="mr-4 ml-5 h-[22px]"
              src="/airtable-transparent.png"
              alt="Airtable Logo"
            />
          </Link>
          <h1 className="text-lg font-semibold text-white">{baseName}</h1>
        </div>
        <AuthButton />
      </header>

      <div className="flex flex-1">
        <main className="flex-1 overflow-hidden bg-white">{children}</main>
      </div>
    </div>
  );
}
