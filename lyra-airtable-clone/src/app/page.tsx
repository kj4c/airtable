import { auth } from "~/server/auth";
import { AuthButton } from "~/components/ui/auth-button";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-white px-1 shadow-sm">
        <div className="ml-auto">
          <AuthButton />
        </div>
      </header>
      <main className="flex flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center px-4">
          <Image src="/logo-text.png" alt="Logo" width={500} height={50} />
          <div className="flex flex-col items-center justify-center">
            {session && (
              <Link href={`/home`}>
                <Button
                  variant="link"
                  className="h-14 cursor-pointer bg-blue-600 text-2xl text-white hover:bg-blue-700"
                >
                  {`View ${session.user.name} Bases`}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
