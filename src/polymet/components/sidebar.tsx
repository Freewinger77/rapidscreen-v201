import { useState } from "react";
import {
  LayoutGridIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  DatabaseIcon,
  ActivityIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/polymet/components/theme-toggle";
import { ThemeSelector } from "@/polymet/components/theme-selector";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/jobs") {
      return (
        location.pathname === "/jobs" || location.pathname.startsWith("/job/")
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`bg-accent border-r border-border flex flex-col py-6 transition-all duration-300 relative ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      {/* Expand/Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-6 z-10 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-accent"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </Button>
      <div className="flex flex-col items-center space-y-6 px-3">
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-xl">R.</span>
        </div>

        {isExpanded && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-foreground">Rapidscreen.</h2>
          </div>
        )}
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-2 flex-1 mt-6 px-3">
        <Link
          to="/"
          className={`rounded-lg flex items-center transition-colors ${
            isActive("/")
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted"
          } ${isExpanded ? "px-4 py-3 gap-3" : "w-10 h-10 justify-center"}`}
        >
          <LayoutGridIcon className="w-5 h-5 flex-shrink-0" />

          {isExpanded && <span className="font-medium">Dashboard</span>}
        </Link>

        <Link
          to="/jobs"
          className={`rounded-lg flex items-center transition-colors ${
            isActive("/jobs")
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted"
          } ${isExpanded ? "px-4 py-3 gap-3" : "w-10 h-10 justify-center"}`}
        >
          <BriefcaseIcon className="w-5 h-5 flex-shrink-0" />

          {isExpanded && <span className="font-medium">Jobs</span>}
        </Link>

        <Link
          to="/campaigns"
          className={`rounded-lg flex items-center transition-colors ${
            isActive("/campaigns") || isActive("/campaign/")
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted"
          } ${isExpanded ? "px-4 py-3 gap-3" : "w-10 h-10 justify-center"}`}
        >
          <ActivityIcon className="w-5 h-5 flex-shrink-0" />

          {isExpanded && <span className="font-medium">Campaigns</span>}
        </Link>

        <Link
          to="/datasets"
          className={`rounded-lg flex items-center transition-colors ${
            isActive("/datasets")
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted"
          } ${isExpanded ? "px-4 py-3 gap-3" : "w-10 h-10 justify-center"}`}
        >
          <DatabaseIcon className="w-5 h-5 flex-shrink-0" />

          {isExpanded && <span className="font-medium">Datasets</span>}
        </Link>
      </nav>

      {/* Theme Controls */}
      <div className="px-3 mb-4 space-y-2">
        {/* Theme Toggle */}
        <ThemeToggle isExpanded={isExpanded} />

        {/* Theme Selector */}
        <ThemeSelector isExpanded={isExpanded} />
      </div>

      {/* User Avatar */}
      <div className="px-3">
        <div
          className={`flex items-center gap-3 ${isExpanded ? "" : "justify-center"}`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
            <img
              src="https://github.com/yusufhilmi.png"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Muhammad Utban
              </p>
              <p className="text-xs text-muted-foreground truncate">
                ranauttban001@gmail.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
