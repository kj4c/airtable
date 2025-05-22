import { auth } from "~/server/auth";
import { AuthButton } from "~/components/ui/auth-button";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();


  return (
    <HydrateClient>
      <header className="h-14 flex items-center justify-between px-1 bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="ml-auto">
          <AuthButton />
        </div>
      </header>
      <main className="flex flex-col items-center justify-center">
        
        <div className="container flex flex-col items-center justify-center px-4">
          <h1 className="">
            <img src="/logo-text.png"></img>
          </h1>
          <div className="flex flex-col items-center justify-center">
            {session &&
            <Link href={`/home`}>
              <Button variant="link" className="bg-blue-600 text-white h-14 text-2xl hover:bg-blue-700">
                {`View ${session.user.name} Bases`}
              </Button>
            </Link>   
            }
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
