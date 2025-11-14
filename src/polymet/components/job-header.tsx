import { useState } from "react";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  BarChart3Icon,
  TimerIcon,
  PackageIcon,
  PlusIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CampaignWizard } from "@/polymet/components/campaign-wizard";
import type { Job } from "@/polymet/data/jobs-data";

interface JobHeaderProps {
  job: Job;
}

export function JobHeader({ job }: JobHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [editedJob, setEditedJob] = useState(job);

  const progressPercentage = (editedJob.hired / editedJob.target) * 100;

  const handleSaveEdit = () => {
    // In a real app, this would update the job in the backend
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />

        <span>Returns to Dashboard</span>
      </Link>

      {/* Job Title and Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{editedJob.title}</h1>
            <Button
              variant="outline"
              size="icon"
              className="border-dashed"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-dashed">
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Company */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <BriefcaseIcon className="w-4 h-4" />

            <span>{editedJob.company}</span>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {editedJob.hired} Hired
              </span>
              <span className="text-sm font-medium">
                {editedJob.target} Target
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-muted" />
          </div>

          {/* Description */}
          <p className="text-muted-foreground max-w-2xl">
            {editedJob.description}
          </p>

          {/* Job Details */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-muted-foreground" />

              <span>{editedJob.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />

              <span>{editedJob.employmentType}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSignIcon className="w-4 h-4 text-muted-foreground" />

              <span>{editedJob.salaryRange}</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-muted-foreground" />

              <span>{editedJob.openPositions} open postions</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {editedJob.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="rounded-md">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Create Campaign Button */}
        <Button
          onClick={() => setShowCampaignWizard(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      {/* Campaign Wizard */}
      <CampaignWizard
        open={showCampaignWizard}
        onOpenChange={setShowCampaignWizard}
        onComplete={(data) => {
          console.log("Campaign created:", data);
        }}
      />

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Details</DialogTitle>
            <DialogDescription>
              Update the job information, requirements, and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={editedJob.title}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, title: e.target.value })
                }
                placeholder="e.g., Project Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={editedJob.company}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, company: e.target.value })
                }
                placeholder="e.g., Tech Solutions Ltd"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hired">Hired</Label>
                <Input
                  id="hired"
                  type="number"
                  value={editedJob.hired}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
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
                  value={editedJob.target}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      target: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedJob.description}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, description: e.target.value })
                }
                placeholder="Job description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editedJob.location}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, location: e.target.value })
                }
                placeholder="e.g., London, UK"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <select
                  id="employmentType"
                  value={editedJob.employmentType}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      employmentType: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openPositions">Open Positions</Label>
                <Input
                  id="openPositions"
                  type="number"
                  value={editedJob.openPositions}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      openPositions: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                value={editedJob.salaryRange}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, salaryRange: e.target.value })
                }
                placeholder="e.g., $40,000 - $60,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editedJob.tags.join(", ")}
                onChange={(e) =>
                  setEditedJob({
                    ...editedJob,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  })
                }
                placeholder="e.g., Agile, Scrum, Leadership"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditedJob(job);
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />

      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
