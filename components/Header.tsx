import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-1 container mx-auto p-2 sm:p-4 pt-4 sm:pt-8 bg-background justify-between items-center max-w-3xl">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Sermon Assistant</h1>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
