import { BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import UserButton from "./UserButton";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "./ui/button";

const Header = async () => {
    const session = await auth();
    return (
        <TooltipProvider>
            <header className="flex flex-1 container mx-auto p-2 sm:p-4 pt-4 sm:pt-8 bg-background justify-between items-center">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <h1 className="text-lg font-semibold">Sermon Assistant</h1>
                </div>
                <div className="flex gap-x-2">
                    {/* User Button */}
                    {session?.user ? (
                        <UserButton session={session} />
                    ) : (
                        <form
                            action={async () => {
                                "use server";
                                await signIn("google");
                            }}
                        >
                            <Button>Sign in</Button>
                        </form>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ThemeToggle />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle theme</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </header>
        </TooltipProvider>
    );
};

export default Header;
