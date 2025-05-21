import Link from "next/link";

// import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { AuthButton } from "~/components/ui/auth-button";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();


  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center px-4">
          <h1 className="">
            <img src="/logo-text.png"></img>
          </h1>
          <div className="flex flex-col items-center justify-center">
            <p className="text-center text-2xl">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            <AuthButton />
          </div>

          {/* {session?.user && <LatestPost />} */}
        </div>
      </main>
    </HydrateClient>
  );
}
