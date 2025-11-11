import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XIcon, PlusIcon } from "lucide-react";
import { withZoomAnimation } from "@/polymet/components/animated-dialog";
import type { Job } from "@/polymet/data/jobs-data";
import { updateJob } from "@/polymet/data/storage-manager";

interface JobEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSave?: (job: Job) => void;
}

export function JobEditorDialog({
  open,
  onOpenChange,
  job,
  onSave,
}: JobEditorDialogProps) {
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (job) {
      setFormData(job);
      setTags(job.tags || []);
    }
  }, [job]);

  const handleSave = () => {
    if (!job) return;

    const updatedJob: Job = {
      ...job,
      ...formData,
      tags,
    };

    // Update in storage
    updateJob(job.id, {
      ...formData,
      tags,
    });

    // Callback to parent
    onSave?.(updatedJob);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...withZoomAnimation({
          className: "max-w-3xl max-h-[90vh] overflow-y-auto",
        })}
      >
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Update job details. All changes are automatically saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter job title"
            />
          </div>

          {/* Company & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Job location"
              />
            </div>
          </div>

          {/* Employment Type & Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={formData.employmentType || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, employmentType: value })
                }
              >
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                value={formData.salaryRange || ""}
                onChange={(e) =>
                  setFormData({ ...formData, salaryRange: e.target.value })
                }
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
          </div>

          {/* Positions & Target */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openPositions">Open Positions</Label>
              <Input
                id="openPositions"
                type="number"
                value={formData.openPositions || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openPositions: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hired">Hired</Label>
              <Input
                id="hired"
                type="number"
                value={formData.hired || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hired: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                value={formData.target || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Job description"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Skills & Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag (press Enter)"
              />

              <Button type="button" onClick={addTag} size="sm">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <XIcon
                    className="w-3 h-3 ml-1"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats (Read-only display) */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <Label className="text-xs text-muted-foreground">
                Total Candidates
              </Label>
              <p className="text-2xl font-bold">{job.candidates.length}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hired</Label>
              <p className="text-2xl font-bold">{job.hired}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Progress</Label>
              <p className="text-2xl font-bold">
                {job.target > 0
                  ? Math.round((job.hired / job.target) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
