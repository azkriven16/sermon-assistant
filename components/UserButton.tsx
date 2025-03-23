"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const UserButton = () => {
    const { data: session } = useSession();

    if (session) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={session.user?.image ?? ""}
                                alt={session.user?.name ?? "User"}
                            />
                            <AvatarFallback>
                                {session.user?.name?.[0] ?? "U"}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                        {session.user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return <Button onClick={() => signIn("google")}>Sign in</Button>;
};

export default UserButton;
