import { BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import UserButton from "./UserButton";

const Header = () => {
    return (
        <TooltipProvider>
            <header className="flex flex-1 container mx-auto p-2 sm:p-4 pt-4 sm:pt-8 bg-background justify-between items-center">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <h1 className="text-lg font-semibold">Sermon Assistant</h1>
                </div>
                <div className="flex gap-x-2">
                    <UserButton />

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
