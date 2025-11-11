import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaletteIcon, CheckIcon } from "lucide-react";

const themes = [
  {
    id: "default",
    name: "Default",
    description: "Warm orange primary",
    colors: {
      light: {
        primary: "15.1111 55.5556% 52.3529%",
        chart1: "18.2813 57.1429% 43.9216%",
        chart2: "251.4545 84.6154% 74.5098%",
        chart5: "17.7778 60% 44.1176%",
      },
      dark: {
        primary: "14.7692 63.1068% 59.6078%",
        chart1: "18.2813 57.1429% 43.9216%",
        chart2: "251.4545 84.6154% 74.5098%",
        chart5: "17.7778 60% 44.1176%",
      },
    },
  },
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Cool blue tones",
    colors: {
      light: {
        primary: "210 100% 50%",
        chart1: "200 100% 45%",
        chart2: "220 90% 60%",
        chart5: "190 85% 40%",
      },
      dark: {
        primary: "210 100% 60%",
        chart1: "200 100% 55%",
        chart2: "220 90% 70%",
        chart5: "190 85% 50%",
      },
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    description: "Rich purple shades",
    colors: {
      light: {
        primary: "270 70% 50%",
        chart1: "260 65% 45%",
        chart2: "280 75% 60%",
        chart5: "250 60% 40%",
      },
      dark: {
        primary: "270 70% 60%",
        chart1: "260 65% 55%",
        chart2: "280 75% 70%",
        chart5: "250 60% 50%",
      },
    },
  },
  {
    id: "green",
    name: "Forest Green",
    description: "Natural green palette",
    colors: {
      light: {
        primary: "140 60% 45%",
        chart1: "130 55% 40%",
        chart2: "150 65% 50%",
        chart5: "120 50% 35%",
      },
      dark: {
        primary: "140 60% 55%",
        chart1: "130 55% 50%",
        chart2: "150 65% 60%",
        chart5: "120 50% 45%",
      },
    },
  },
  {
    id: "rose",
    name: "Rose Pink",
    description: "Elegant rose tones",
    colors: {
      light: {
        primary: "340 75% 55%",
        chart1: "330 70% 50%",
        chart2: "350 80% 60%",
        chart5: "320 65% 45%",
      },
      dark: {
        primary: "340 75% 65%",
        chart1: "330 70% 60%",
        chart2: "350 80% 70%",
        chart5: "320 65% 55%",
      },
    },
  },
  {
    id: "amber",
    name: "Amber Gold",
    description: "Warm amber shades",
    colors: {
      light: {
        primary: "35 90% 50%",
        chart1: "25 85% 45%",
        chart2: "45 95% 55%",
        chart5: "15 80% 40%",
      },
      dark: {
        primary: "35 90% 60%",
        chart1: "25 85% 55%",
        chart2: "45 95% 65%",
        chart5: "15 80% 50%",
      },
    },
  },
];

interface ThemeSelectorProps {
  isExpanded?: boolean;
}

export function ThemeSelector({ isExpanded = true }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState("default");

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("app-theme") || "default";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const colors = isDark ? theme.colors.dark : theme.colors.light;

    // Apply CSS variables
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--chart-1", colors.chart1);
    root.style.setProperty("--chart-2", colors.chart2);
    root.style.setProperty("--chart-5", colors.chart5);

    // Save to localStorage
    localStorage.setItem("app-theme", themeId);
    setCurrentTheme(themeId);
  };

  // Listen for theme mode changes (light/dark)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyTheme(currentTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [currentTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`rounded-lg flex items-center transition-colors text-muted-foreground hover:bg-muted ${isExpanded ? "px-4 py-3 gap-3 w-full" : "w-10 h-10 justify-center"}`}
        >
          <PaletteIcon className="w-5 h-5 flex-shrink-0" />

          {isExpanded && <span className="font-medium">Color Theme</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex-1">
              <div className="font-medium">{theme.name}</div>
              <div className="text-xs text-muted-foreground">
                {theme.description}
              </div>
            </div>
            {currentTheme === theme.id && (
              <CheckIcon className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
