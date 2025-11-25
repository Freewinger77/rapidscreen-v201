import { StickyNoteIcon } from "lucide-react";
import type { Candidate } from "@/polymet/data/jobs-data";

interface CandidateCardProps {
  candidate: Candidate;
  isDragging?: boolean;
  onClick?: () => void;
}

export function CandidateCard({
  candidate,
  isDragging = false,
  onClick,
}: CandidateCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const noteCount = candidate.notes?.length || 0;

  return (
    <div
      className={`p-4 rounded-lg bg-card border border-border cursor-pointer hover:border-primary/50 relative ${
        isDragging ? "opacity-40" : ""
      }`}
      style={{
        transition: "all 150ms cubic-bezier(0.2, 0, 0, 1)",
        transform: isDragging
          ? "scale(1.02) rotate(2deg)"
          : "scale(1) rotate(0deg)",
      }}
      onClick={handleClick}
    >
      <h4 className="font-semibold text-foreground">{candidate.name}</h4>
      <p className="text-sm text-muted-foreground mt-1">{candidate.phone}</p>
      {noteCount > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <StickyNoteIcon className="w-3 h-3" />
          <span>{noteCount} notes</span>
        </div>
      )}
    </div>
  );
}
