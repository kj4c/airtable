"use client";

import Link from "next/link";
import { AuthButton } from "~/components/ui/auth-button";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { TabButton } from "~/app/_components/header-text";

export default function BaseLayout({
  children,
  baseName,
}: {
  children: React.ReactNode;
  baseName: string;
}) {
  return (
    <div className="flex h-screen flex-col">
      <header className="top-0 flex min-h-[56px] items-center justify-between bg-[#048a0e] px-1 flex-auto">
        <div className="flex flex-auto relative min-w-[400px] items-center">
          <Link href="/home">
            <Image
              className="mr-4 ml-5 h-[22px]"
              src="/airtable-transparent.png"
              width={22}
              height={22}
              alt="Airtable Logo"
            />
          </Link>
          <h1 className="text-lg font-semibold text-white">{baseName}</h1>
          <ChevronDown className="h-[16px] ml-1 w-[16px] text-white stroke-[1.5px]" />
          <TabButton active={true}>
            Data
          </TabButton>
          <TabButton active={false}>
            Automations
          </TabButton>
          <TabButton active={false}>
            Interfaces
          </TabButton>
          
          <TabButton active={false}>
            Forms
          </TabButton>
        </div>
        <div className="flex items-center z1 flex-none flex-row gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-white cursor-pointer  " fill="currentColor"><use href="/icons/icon_definitions.svg#ClockCounterClockwise"></use></svg>
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-white" fill="currentColor"><use href="/icons/icon_definitions.svg#Question"></use></svg>
            <span className="text-white text-[13px] font-[400]">Help</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0c680d] rounded-full p-2 h-8">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-black" fill="white"><use href="/icons/icon_definitions.svg#AirtablePlusFill"></use></svg>
            <span className="text-white text-[13px] font-[400]">Upgrade</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-black" fill="#048a0e"><use href="/icons/icon_definitions.svg#Users"></use></svg>
            <span className="text-[#048a0e] text-[13px] font-[400]">Share</span>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-full pl-2 pr-3 justify-center h-7 whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#048a0e]" fill="currentColor"><use href="/icons/icon_definitions.svg#AiFeature"></use></svg>
            <span className="text-[#048a0e] text-[13px] font-[400] w-fit">Ai Assistant</span>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="flex flex-1">
        <main className="flex-1 overflow-hidden bg-white">{children}</main>
      </div>
    </div>
  );
}
