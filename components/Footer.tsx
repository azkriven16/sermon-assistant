import React from "react";

const Footer = () => {
  return (
    <footer className="flex flex-col sm:flex-row flex-1 container mx-auto p-2 sm:p-4 pt-4 sm:pt-8 bg-background max-w-3xl items-center justify-between text-sm">
      <p>© 2025 Sermon Assistant</p>
      <p className="text-muted-foreground">
        This is an open source project. Visit us on{" "}
        <a
          href="https://github.com/azkriven16/sermon-assistant"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;
