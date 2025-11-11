import { useState } from "react";
import { CandidateCard } from "@/polymet/components/candidate-card";
import type { Candidate } from "@/polymet/data/jobs-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SwimlaneProps {
  id: string;
  title: string;
  candidates: Candidate[];
  status: Candidate["status"];
  color: string;
  onDrop: (candidateId: string, newStatus: Candidate["status"]) => void;
  onDragStart: (candidateId: string) => void;
  onEdit?: (id: string, newTitle: string, newColor: string) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  onCandidateClick?: (candidate: Candidate) => void;
  onReorder?: (candidateId: string, targetIndex: number) => void;
}

export function Swimlane({
  id,
  title,
  candidates,
  status,
  color,
  onDrop,
  onDragStart,
  onEdit,
  onDelete,
  canDelete = true,
  onCandidateClick,
  onReorder,
}: SwimlaneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editColor, setEditColor] = useState(color);

  // Color options for columns
  const colorOptions = [
    {
      value: "hsl(var(--chart-1))",
      label: "Orange",
      bg: "bg-[hsl(var(--chart-1))]",
    },
    {
      value: "hsl(var(--chart-2))",
      label: "Purple",
      bg: "bg-[hsl(var(--chart-2))]",
    },
    {
      value: "hsl(var(--chart-3))",
      label: "Beige",
      bg: "bg-[hsl(var(--chart-3))]",
    },
    {
      value: "hsl(var(--chart-4))",
      label: "Dark Purple",
      bg: "bg-[hsl(var(--chart-4))]",
    },
    {
      value: "hsl(var(--chart-5))",
      label: "Brown",
      bg: "bg-[hsl(var(--chart-5))]",
    },
    { value: "hsl(var(--primary))", label: "Primary", bg: "bg-primary" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverIndex(null);
    const candidateId = e.dataTransfer.getData("candidateId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");

    if (candidateId) {
      onDrop(candidateId, status);
    }
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleCardDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const candidateId = e.dataTransfer.getData("candidateId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");

    if (candidateId) {
      // If dropping in same column, reorder
      if (sourceStatus === status && onReorder) {
        onReorder(candidateId, targetIndex);
      } else {
        // If dropping from different column, just move to new status
        onDrop(candidateId, status);
      }
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editTitle) {
      onEdit(id, editTitle, editColor);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-[300px]">
      {/* Swimlane Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge
          className="rounded-full w-7 h-7 flex items-center justify-center p-0"
          style={{ backgroundColor: color }}
        >
          {candidates.length}
        </Badge>

        {/* Edit and Delete Buttons */}
        {onEdit && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                onClick={() => {
                  setEditTitle(title);
                  setEditColor(color);
                }}
              >
                <PencilIcon className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Column</DialogTitle>
                <DialogDescription>
                  Update the column title and color.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Column Title</Label>
                  <Input
                    id="editTitle"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter column title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Column Color</Label>
                  <div className="flex items-center gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditColor(color.value)}
                        className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                          editColor === color.value
                            ? "ring-2 ring-offset-2 ring-foreground scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {onDelete && canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(id)}
          >
            <TrashIcon className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Candidates Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`space-y-2 min-h-[400px] p-2 rounded-lg border-2 border-dashed transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-transparent"
        }`}
      >
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="relative"
            style={{
              transition: "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
              transform:
                dragOverIndex === index ? "translateY(8px)" : "translateY(0)",
            }}
          >
            {dragOverIndex === index && (
              <div
                className="h-2 bg-primary/20 rounded-full mb-2 transition-all duration-150"
                style={{
                  boxShadow: "0 0 8px hsl(var(--primary) / 0.3)",
                }}
              />
            )}
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("candidateId", candidate.id);
                e.dataTransfer.setData("sourceStatus", status);
                onDragStart(candidate.id);
              }}
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDrop={(e) => handleCardDrop(e, index)}
              onDragLeave={() => setDragOverIndex(null)}
            >
              <CandidateCard
                candidate={candidate}
                onClick={() => onCandidateClick?.(candidate)}
              />
            </div>
          </div>
        ))}

        {candidates.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Drop candidates here
          </div>
        )}
        {dragOverIndex === candidates.length && (
          <div className="h-1 bg-primary rounded-full mt-2" />
        )}
      </div>
    </div>
  );
}
