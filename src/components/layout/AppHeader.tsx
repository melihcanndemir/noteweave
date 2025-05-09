"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { useSidebar } from "@/components/ui/sidebar"; // Assuming this hook exists for mobile sidebar toggling

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  // This is a placeholder for mobile sidebar toggle.
  // If using the Sidebar component from ui/sidebar.tsx, it might provide its own trigger.
  // For a custom sidebar, you'd need to manage its state.
  // const { toggleSidebar } = useSidebar ? useSidebar() : { toggleSidebar: () => console.warn("useSidebar not available") };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button - Placeholder */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button> */}

        <div className="mr-4 flex items-center">
          <LogoIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold text-foreground">NoteWeave</h1>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}

