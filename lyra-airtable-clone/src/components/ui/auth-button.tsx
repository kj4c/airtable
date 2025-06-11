"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button disabled>Loading...</Button>;
  }

  if (!session) {
    return (
      <Button
        className="cursor-pointer px-6 py-3 text-xl"
        onClick={() => signIn("google", { callbackUrl: "/home" })}
      >
        Sign in with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={session.user?.image ?? ""} />
          <AvatarFallback>{session.user?.name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled>{session.user?.email}</DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
