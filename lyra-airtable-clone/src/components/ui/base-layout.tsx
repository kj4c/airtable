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
      <header className="top-0 flex min-h-[56px] items-center justify-between bg-[#048a0e] pl-5 pr-4 flex-auto">
        <div className="flex flex-auto min-w-[400px] items-center">
          <div className="h-[24px] min-w-[60px] flex flex-none items-center justify-between">
            <div className="w-[40px]">
              <Link href="/home">
                <Image
                  src="/airtable-transparent.png"
                  width={24}
                  height={22.5}
                  alt="Airtable Logo"
                />
              </Link>
            </div>


            <h1 
              className="
                text-lg font-semibold text-white
                max-w-[180px] sm:max-w-[240px] md:max-w-[320px] 
                truncate
                min-w-0
                hidden lg:block
                text-[17px]
              "
            >
              {baseName}</h1>
            <div className="flex items-center ml-1">
              <svg width="16" height="16" className="text-white" fill="currentColor"><use href="/icons/icon_definitions.svg#ChevronDown"></use></svg>
            </div>
          </div>
          
          <div className="mx-4 flex items-center">
            <TabButton active={true}>
              Data
            </TabButton>
            <TabButton active={false}>
              Automations
            </TabButton>
            <TabButton active={false}>
              Interfaces
            </TabButton>
            <div className="h-5  mx-2 w-px bg-white opacity-20 mt-[1px]" />
            {/* <div className="border-lighten2 border-left ml-half "></div> */}
            <TabButton className="" active={false}>
              Forms
            </TabButton>
          </div>

        </div>
        <div className="flex items-center z1 flex-none flex-row gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-white cursor-pointer  " fill="currentColor"><use href="/icons/icon_definitions.svg#ClockCounterClockwise"></use></svg>
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-white" fill="currentColor"><use href="/icons/icon_definitions.svg#Question"></use></svg>
            <span className="text-white text-[13px] font-[400]">Help</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0c680d] rounded-full p-2 h-8">
            <svg width="16" height="16" className="text-black" fill="white"><use href="/icons/icon_definitions.svg#AirtablePlusFill"></use></svg>
            <span className="text-white text-[13px] font-[400]">Upgrade</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1">
            <svg width="16" height="16" className="text-black" fill="#048a0e"><use href="/icons/icon_definitions.svg#Users"></use></svg>
            <span className="text-[#048a0e] text-[13px] font-[400]">Share</span>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-full pl-2 pr-3 justify-center h-7 whitespace-nowrap">
            <svg width="16" height="16" className="text-[#048a0e]" fill="currentColor"><use href="/icons/icon_definitions.svg#AiFeature"></use></svg>
            <span className="text-[#048a0e] text-[13px] font-[400] w-fit">Ai Assistant</span>
          </div>

          <div className="flex items-center gap-1 bg-white rounded-full justify-center h-7 w-7 whitespace-nowrap"> 
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#048a0e]" fill="#048a0e"><use href="/icons/icon_definitions.svg#Bell"></use></svg>
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
