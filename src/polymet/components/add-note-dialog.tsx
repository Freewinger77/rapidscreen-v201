import { useState, useEffect } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CandidateNote } from "@/polymet/data/jobs-data";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: Omit<CandidateNote, "id" | "timestamp">) => void;
  candidateName: string;
  editingNote?: CandidateNote | null;
}

export function AddNoteDialog({
  open,
  onOpenChange,
  onSave,
  candidateName,
  editingNote,
}: AddNoteDialogProps) {
  useZoomDialog();
  const [noteText, setNoteText] = useState("");
  const [actionType, setActionType] = useState("");
  const [actionDate, setActionDate] = useState("");
  const [author, setAuthor] = useState("");

  // Load editing note data when dialog opens
  useEffect(() => {
    if (open && editingNote) {
      setNoteText(editingNote.text);
      setActionType(editingNote.actionType || "");
      setActionDate(editingNote.actionDate || "");
      setAuthor(editingNote.author || "");
    } else if (open && !editingNote) {
      // Reset form for new note
      setNoteText("");
      setActionType("");
      setActionDate("");
      setAuthor("");
    }
  }, [open, editingNote]);

  const handleSave = () => {
    if (!noteText.trim()) return;

    onSave({
      text: noteText,
      author: author || "Recruiter",
      actionType: actionType || undefined,
      actionDate: actionDate || undefined,
    });

    // Reset form
    setNoteText("");
    setActionType("");
    setActionDate("");
    setAuthor("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNoteText("");
    setActionType("");
    setActionDate("");
    setAuthor("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg bg-background border border-border"
        data-zoom="true"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingNote ? "Edit Note" : "Add Note"} for {candidateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Note Details</label>
            <Textarea
              placeholder="Add detail here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[120px] bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Date</label>
              <Input
                type="date"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
              disabled={!noteText.trim()}
            >
              {editingNote ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
