import { useState } from "react";
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
import { withZoomAnimation } from "@/polymet/components/animated-dialog";
import type { Job } from "@/polymet/data/jobs-data";
import { XIcon, PlusIcon } from "lucide-react";

interface JobCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (job: Omit<Job, "id" | "candidates">) => void;
}

export function JobCreationDialog({
  open,
  onOpenChange,
  onSave,
}: JobCreationDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    employmentType: "Full Time",
    salaryRange: "",
    description: "",
    openPositions: "1",
    target: "1",
    hired: "0",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newJob: Omit<Job, "id" | "candidates"> = {
      title: formData.title,
      company: formData.company,
      location: formData.location,
      employmentType: formData.employmentType,
      salaryRange: formData.salaryRange,
      description: formData.description,
      openPositions: parseInt(formData.openPositions) || 1,
      target: parseInt(formData.target) || 1,
      hired: parseInt(formData.hired) || 0,
      tags: tags,
    };

    onSave(newJob);
    onOpenChange(false);

    // Reset form
    setFormData({
      title: "",
      company: "",
      location: "",
      employmentType: "Full Time",
      salaryRange: "",
      description: "",
      openPositions: "1",
      target: "1",
      hired: "0",
    });
    setTags([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...withZoomAnimation({
          className: "max-w-3xl max-h-[90vh] overflow-y-auto",
        })}
      >
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new job posting to your recruitment dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="Enter job title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Company & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Job location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Employment Type & Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
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
                  placeholder="e.g., $50,000 - $70,000"
                  value={formData.salaryRange}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryRange: e.target.value })
                  }
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
                  min="1"
                  value={formData.openPositions}
                  onChange={(e) =>
                    setFormData({ ...formData, openPositions: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hired">Hired</Label>
                <Input
                  id="hired"
                  type="number"
                  min="0"
                  value={formData.hired}
                  onChange={(e) =>
                    setFormData({ ...formData, hired: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  min="1"
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Job description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    {tag}
                    <XIcon
                      className="w-3 h-3 ml-1"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
