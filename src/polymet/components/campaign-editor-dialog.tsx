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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { XIcon } from "lucide-react";
import { withZoomAnimation } from "@/polymet/components/animated-dialog";
import type { Campaign } from "@/polymet/data/campaigns-data";
import { updateCampaign } from "@/polymet/data/storage-manager";

interface CampaignEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSave?: (campaign: Campaign) => void;
}

export function CampaignEditorDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
}: CampaignEditorDialogProps) {
  const [formData, setFormData] = useState<Partial<Campaign>>({});
  const [channels, setChannels] = useState<("WhatsApp" | "Call" | "Email")[]>(
    []
  );

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
      setChannels(campaign.channels || []);
    }
  }, [campaign]);

  const handleSave = () => {
    if (!campaign) return;

    const updatedCampaign: Campaign = {
      ...campaign,
      ...formData,
      channels,
    };

    // Update in storage
    updateCampaign(campaign.id, {
      ...formData,
      channels,
    });

    // Callback to parent
    onSave?.(updatedCampaign);
    onOpenChange(false);
  };

  const toggleChannel = (channel: "WhatsApp" | "Call" | "Email") => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...withZoomAnimation({ className: "max-w-2xl" })}>
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update campaign details. All changes are automatically saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter campaign name"
            />
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle || ""}
              onChange={(e) =>
                setFormData({ ...formData, jobTitle: e.target.value })
              }
              placeholder="Enter job title"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Communication Channels</Label>
            <div className="flex gap-2">
              {(["WhatsApp", "Call", "Email"] as const).map((channel) => (
                <Badge
                  key={channel}
                  variant={channels.includes(channel) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleChannel(channel)}
                >
                  {channel}
                  {channels.includes(channel) && (
                    <XIcon className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(value: "active" | "draft" | "completed") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats (Read-only display) */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <Label className="text-xs text-muted-foreground">
                Total Candidates
              </Label>
              <p className="text-2xl font-bold">{campaign.totalCandidates}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hired</Label>
              <p className="text-2xl font-bold">{campaign.hired}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Response Rate
              </Label>
              <p className="text-2xl font-bold">{campaign.responseRate}%</p>
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
