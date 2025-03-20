import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { BookOpen, Network } from "lucide-react";
import { Button } from "./ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

const Header = () => {
    return (
        <TooltipProvider>
            <header className="flex flex-1 container mx-auto p-2 sm:p-4 pt-4 sm:pt-8 bg-background justify-between items-center max-w-3xl">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <h1 className="text-lg font-semibold">Sermon Assistant</h1>
                </div>
                <div className="flex gap-x-2">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button asChild size="icon" variant="secondary">
                                <a
                                    href="https://sermon-assistant.vercel.app/sitemap.xml"
                                    target="_blank"
                                >
                                    <Network
                                        className="h-5 w-5"
                                        aria-label="Sitemap"
                                    />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sitemap</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
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
