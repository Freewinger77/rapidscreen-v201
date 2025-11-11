import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  isExpanded?: boolean;
}

export function ThemeToggle({ isExpanded = true }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage first, default to dark mode
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme ? savedTheme === "dark" : true;

    setIsDark(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`rounded-lg flex items-center transition-colors text-muted-foreground hover:bg-muted ${isExpanded ? "px-4 py-3 gap-3 w-full" : "w-10 h-10 justify-center"}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 flex-shrink-0" />
      ) : (
        <MoonIcon className="w-5 h-5 flex-shrink-0" />
      )}
      {isExpanded && <span className="font-medium">Toggle theme</span>}
    </button>
  );
}
