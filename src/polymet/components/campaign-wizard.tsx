import { useState } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  ChevronRightIcon,
  UploadIcon,
  XIcon,
  PlusIcon,
  ChevronLeftIcon,
  BriefcaseIcon,
  UsersIcon,
  EditIcon,
  PhoneIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { jobsData } from "@/polymet/data/jobs-data";
import type {
  CampaignTarget,
  CampaignMatrix,
} from "@/polymet/data/campaigns-data";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppPreview } from "@/polymet/components/whatsapp-preview";
import { DatasetSelectorDialog } from "@/polymet/components/dataset-selector-dialog";
import { CallAgentTester } from "@/polymet/components/call-agent-tester";
import { WhatsAppAgentTester } from "@/polymet/components/whatsapp-agent-tester";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (campaignData: any) => void;
}

export function CampaignWizard({
  open,
  onOpenChange,
  onComplete,
}: CampaignWizardProps) {
  useZoomDialog();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [linkJob, setLinkJob] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [uploadMethod, setUploadMethod] = useState<"csv" | "existing">(
    "existing"
  );
  const [targets, setTargets] = useState<CampaignTarget[]>([
    {
      id: "t1",
      name: "Available to Work",
      type: "column",
      description: "Check if candidate is available to work",
      goalType: "boolean",
    },
    {
      id: "t2",
      name: "Interested",
      type: "column",
      description: "Assess candidate interest level",
      goalType: "boolean",
    },
  ]);
  const [matrices, setMatrices] = useState<CampaignMatrix[]>([
    {
      id: "m1",
      name: "Initial Outreach",
      description: "First contact with candidate",
      whatsappMessage:
        "Hi! We have an exciting opportunity for a Steel Fixer position at Hinkley Point C. Are you interested?",
      callScript:
        "Hi, this is James from Nucleo Talent. We're hiring steel fixers for Hinkley Point C. Interested?",
    },
  ]);
  const [newTargetName, setNewTargetName] = useState("");
  const [newTargetDescription, setNewTargetDescription] = useState("");
  const [newTargetGoalType, setNewTargetGoalType] = useState<
    "text" | "number" | "boolean"
  >("text");
  const [newMatrixName, setNewMatrixName] = useState("");
  const [newMatrixDescription, setNewMatrixDescription] = useState("");
  const [newMatrixWhatsappMessage, setNewMatrixWhatsappMessage] = useState("");
  const [newMatrixCallScript, setNewMatrixCallScript] = useState("");
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [showAddMatrix, setShowAddMatrix] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState<string | null>(null);
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);
  const [showCallTester, setShowCallTester] = useState(false);
  const [showWhatsAppTester, setShowWhatsAppTester] = useState(false);
  const [showLaunchConfirmation, setShowLaunchConfirmation] = useState(false);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const addTarget = () => {
    if (newTargetName.trim()) {
      setTargets([
        ...targets,
        {
          id: `t${Date.now()}`,
          name: newTargetName,
          type: "custom",
          description: newTargetDescription,
          goalType: newTargetGoalType,
        },
      ]);
      setNewTargetName("");
      setNewTargetDescription("");
      setNewTargetGoalType("text");
      setShowAddTarget(false);
    }
  };

  const removeTarget = (id: string) => {
    setTargets(targets.filter((t) => t.id !== id));
  };

  const addMatrix = () => {
    if (newMatrixName.trim()) {
      setMatrices([
        ...matrices,
        {
          id: `m${Date.now()}`,
          name: newMatrixName,
          description: newMatrixDescription,
          whatsappMessage: newMatrixWhatsappMessage,
          callScript: newMatrixCallScript,
        },
      ]);
      setNewMatrixName("");
      setNewMatrixDescription("");
      setNewMatrixWhatsappMessage("");
      setNewMatrixCallScript("");
      setShowAddMatrix(false);
    }
  };

  const updateMatrix = (id: string, updates: Partial<CampaignMatrix>) => {
    setMatrices(matrices.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const removeMatrix = (id: string) => {
    setMatrices(matrices.filter((m) => m.id !== id));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Show launch confirmation dialog
      setShowLaunchConfirmation(true);
    }
  };

  const handleLaunchCampaign = () => {
    // Complete campaign creation
    const campaignData = {
      name: campaignName,
      linkJob,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      channels: selectedChannels,
      targets,
      matrices,
    };
    onComplete?.(campaignData);
    setShowLaunchConfirmation(false);
    onOpenChange(false);
    // Reset form
    setStep(1);
    setCampaignName("");
    setLinkJob("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedChannels([]);
    setTargets([
      {
        id: "t1",
        name: "Available to Work",
        type: "column",
        description: "Check if candidate is available to work",
        goalType: "boolean",
      },
      {
        id: "t2",
        name: "Interested",
        type: "column",
        description: "Assess candidate interest level",
        goalType: "boolean",
      },
    ]);
    setMatrices([
      {
        id: "m1",
        name: "Initial Outreach",
        description: "First contact with candidate",
        whatsappMessage:
          "Hi! We have an exciting opportunity for a Steel Fixer position at Hinkley Point C. Are you interested?",
        callScript:
          "Hi, this is James from Nucleo Talent. We're hiring steel fixers for Hinkley Point C. Interested?",
      },
    ]);
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const steps = [
    { number: 1, label: "Campaign Details" },
    { number: 2, label: "Campaign Target" },
    { number: 3, label: "Create Matrix" },
    { number: 4, label: "Preview & Publish" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl" data-zoom="true">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Create New Campaign
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2",
                      step >= s.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s.number}
                  </div>
                  <span
                    className={cn(
                      "text-xs text-center",
                      step >= s.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-[2px] flex-1 mx-2 mb-6",
                      step > s.number ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6 min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name" className="text-foreground">
                    Campaign Name
                  </Label>
                  <Input
                    id="campaign-name"
                    placeholder="Type campaign name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-job" className="text-foreground">
                    Link Job
                  </Label>
                  <Select value={linkJob} onValueChange={setLinkJob}>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {jobsData.map((job) => (
                        <SelectItem
                          key={job.id}
                          value={job.id}
                          className="text-foreground hover:bg-accent"
                        >
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-input text-foreground hover:bg-accent",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />

                          {startDate ? (
                            format(startDate, "PPP")
                          ) : (
                            <span>Select Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="text-foreground"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-input text-foreground hover:bg-accent",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />

                          {endDate ? (
                            format(endDate, "PPP")
                          ) : (
                            <span>Select Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="text-foreground"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Channel</Label>
                  <div className="flex gap-2">
                    {["Phone", "WhatsApp", "SMS"].map((channel) => (
                      <Button
                        key={channel}
                        type="button"
                        variant={
                          selectedChannels.includes(channel)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleChannel(channel)}
                        className={cn(
                          "flex-1",
                          selectedChannels.includes(channel)
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {channel}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Target Group</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMethod === "csv" ? "default" : "outline"}
                      onClick={() => setUploadMethod("csv")}
                      className={cn(
                        "flex-1",
                        uploadMethod === "csv"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <Button
                      type="button"
                      variant={
                        uploadMethod === "existing" ? "default" : "outline"
                      }
                      onClick={() => {
                        setUploadMethod("existing");
                        setShowDatasetSelector(true);
                      }}
                      className={cn(
                        "flex-1",
                        uploadMethod === "existing"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <UsersIcon className="w-4 h-4 mr-2" />

                      {selectedDatasetIds.length > 0
                        ? `${selectedDatasetIds.length} Dataset${selectedDatasetIds.length > 1 ? "s" : ""} Selected`
                        : "Select Dataset"}
                    </Button>
                  </div>
                </div>

                {uploadMethod === "csv" && (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

                    <p className="text-muted-foreground mb-1">
                      Drag and drop your CV here or click to browse your files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: CSV, XLSX(Excel), XLSM
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      The AI will automatically extract the candidates
                      information
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {targets.map((target) => (
                    <div
                      key={target.id}
                      className="p-4 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-foreground font-medium">
                              {target.name}
                            </span>
                            {target.goalType && (
                              <Badge variant="outline" className="text-xs">
                                {target.goalType}
                              </Badge>
                            )}
                          </div>
                          {target.description && (
                            <p className="text-sm text-muted-foreground">
                              {target.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTarget(target.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddTarget ? (
                  <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-foreground">Target Name</Label>
                      <Input
                        placeholder="e.g., Prior Formwork Experience"
                        value={newTargetName}
                        onChange={(e) => setNewTargetName(e.target.value)}
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Description</Label>
                      <Textarea
                        placeholder="e.g., Ask candidate if they have prior formwork experience or Blue card"
                        value={newTargetDescription}
                        onChange={(e) =>
                          setNewTargetDescription(e.target.value)
                        }
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Goal Type</Label>
                      <Select
                        value={newTargetGoalType}
                        onValueChange={(value: any) =>
                          setNewTargetGoalType(value)
                        }
                      >
                        <SelectTrigger className="bg-background border-input text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem
                            value="text"
                            className="text-foreground hover:bg-accent"
                          >
                            Text
                          </SelectItem>
                          <SelectItem
                            value="number"
                            className="text-foreground hover:bg-accent"
                          >
                            Number
                          </SelectItem>
                          <SelectItem
                            value="boolean"
                            className="text-foreground hover:bg-accent"
                          >
                            Boolean (Yes/No)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={addTarget}
                        className="bg-primary hover:bg-primary/90 flex-1"
                      >
                        Add Target
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddTarget(false);
                          setNewTargetName("");
                          setNewTargetDescription("");
                          setNewTargetGoalType("text");
                        }}
                        className="bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTarget(true)}
                    className="w-full bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Target
                  </Button>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Only boolean target types create Kanban Swimlanes
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {matrices.length > 0 ? (
                  <div className="space-y-3">
                    {matrices.map((matrix) => (
                      <div
                        key={matrix.id}
                        className="p-4 bg-card border border-border rounded-lg"
                      >
                        {editingMatrix === matrix.id ? (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-foreground">
                                Matrix Name
                              </Label>
                              <Input
                                value={matrix.name}
                                onChange={(e) =>
                                  updateMatrix(matrix.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="bg-background border-input text-foreground"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground">
                                Description
                              </Label>
                              <Textarea
                                value={matrix.description || ""}
                                onChange={(e) =>
                                  updateMatrix(matrix.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="What will this matrix achieve?"
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[60px]"
                              />
                            </div>
                            {matrix.name === "Initial Outreach" &&
                              selectedChannels.includes("Phone") && (
                                <div className="space-y-2">
                                  <Label className="text-foreground">
                                    Call Script (First Message)
                                  </Label>
                                  <Textarea
                                    value={matrix.callScript || ""}
                                    onChange={(e) =>
                                      updateMatrix(matrix.id, {
                                        callScript: e.target.value,
                                      })
                                    }
                                    placeholder="Enter the opening message for calls"
                                    className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[80px]"
                                  />
                                </div>
                              )}
                            {matrix.name === "Initial Outreach" &&
                              selectedChannels.includes("WhatsApp") && (
                                <div className="space-y-2">
                                  <Label className="text-foreground">
                                    WhatsApp Message (First Message)
                                  </Label>
                                  <div className="grid grid-cols-2 gap-4">
                                    <Textarea
                                      value={matrix.whatsappMessage || ""}
                                      onChange={(e) =>
                                        updateMatrix(matrix.id, {
                                          whatsappMessage: e.target.value,
                                        })
                                      }
                                      placeholder="Type your WhatsApp message here..."
                                      className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[120px]"
                                    />

                                    <div className="bg-muted border border-border rounded-lg p-3">
                                      <p className="text-xs text-muted-foreground mb-2">
                                        Live Preview:
                                      </p>
                                      <div className="bg-background rounded-lg p-2">
                                        <div className="bg-[#dcf8c6] dark:bg-[#005c4b] text-black dark:text-white rounded-lg p-2 text-sm max-w-[200px]">
                                          {matrix.whatsappMessage ||
                                            "Your message will appear here..."}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          7:15 PM
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setEditingMatrix(null)}
                                className="bg-primary hover:bg-primary/90 flex-1"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingMatrix(null)}
                                className="bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-foreground font-medium mb-1">
                                {matrix.name}
                              </h4>
                              {matrix.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {matrix.description}
                                </p>
                              )}
                              <div className="flex gap-2 flex-wrap">
                                {matrix.callScript && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Has Call Script
                                  </Badge>
                                )}
                                {matrix.whatsappMessage && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Has WhatsApp Message
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingMatrix(matrix.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                              >
                                <EditIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMatrix(matrix.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddMatrix(true)}
                      className="bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add a Matrix
                    </Button>
                  </div>
                )}

                {showAddMatrix ? (
                  <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-foreground">Matrix Name</Label>
                      <Input
                        placeholder="e.g., Experience Check"
                        value={newMatrixName}
                        onChange={(e) => setNewMatrixName(e.target.value)}
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Description</Label>
                      <Textarea
                        placeholder="What will this matrix achieve?"
                        value={newMatrixDescription}
                        onChange={(e) =>
                          setNewMatrixDescription(e.target.value)
                        }
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[60px]"
                      />
                    </div>
                    {matrices.length === 0 &&
                      selectedChannels.includes("Phone") && (
                        <div className="space-y-2">
                          <Label className="text-foreground">
                            Call Script (First Message)
                          </Label>
                          <Textarea
                            placeholder="Enter the opening message for calls"
                            value={newMatrixCallScript}
                            onChange={(e) =>
                              setNewMatrixCallScript(e.target.value)
                            }
                            className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[80px]"
                          />
                        </div>
                      )}
                    {matrices.length === 0 &&
                      selectedChannels.includes("WhatsApp") && (
                        <div className="space-y-2">
                          <Label className="text-foreground">
                            WhatsApp Message (First Message)
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Textarea
                              placeholder="Type your WhatsApp message here..."
                              value={newMatrixWhatsappMessage}
                              onChange={(e) =>
                                setNewMatrixWhatsappMessage(e.target.value)
                              }
                              className="bg-background border-input text-foreground placeholder:text-muted-foreground min-h-[120px]"
                            />

                            <div className="bg-muted border border-border rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                Live Preview:
                              </p>
                              <div className="bg-background rounded-lg p-2">
                                <div className="bg-[#dcf8c6] dark:bg-[#005c4b] text-black dark:text-white rounded-lg p-2 text-sm max-w-[200px]">
                                  {newMatrixWhatsappMessage ||
                                    "Your message will appear here..."}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  7:15 PM
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    <div className="flex gap-2">
                      <Button
                        onClick={addMatrix}
                        className="bg-primary hover:bg-primary/90 flex-1"
                      >
                        Add Matrix
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddMatrix(false);
                          setNewMatrixName("");
                          setNewMatrixDescription("");
                          setNewMatrixWhatsappMessage("");
                          setNewMatrixCallScript("");
                        }}
                        className="bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : matrices.length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddMatrix(true)}
                    className="w-full bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Matrix
                  </Button>
                ) : null}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {campaignName || "Campaign Name"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Duration:{" "}
                        {startDate ? format(startDate, "M/d/yyyy") : "N/A"} -{" "}
                        {endDate ? format(endDate, "M/d/yyyy") : "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        {selectedChannels.join(" + ") || "No channels selected"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />

                      <span className="text-muted-foreground">
                        {linkJob
                          ? jobsData.find((j) => j.id === linkJob)?.title
                          : "No job linked"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-muted-foreground" />

                      <span className="text-muted-foreground">
                        {targets.reduce((acc, t) => {
                          // Mock candidate count
                          return acc + 15;
                        }, 0)}{" "}
                        Candidates
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Agent Section */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Test Agent in Browser
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Test how your AI agent will interact with candidates before
                    publishing
                  </p>
                  <div className="flex gap-2">
                    {selectedChannels.includes("Phone") && (
                      <Button
                        variant="outline"
                        onClick={() => setShowCallTester(true)}
                        className="flex-1"
                      >
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        Test Call Agent
                      </Button>
                    )}
                    {selectedChannels.includes("WhatsApp") && (
                      <Button
                        variant="outline"
                        onClick={() => setShowWhatsAppTester(true)}
                        className="flex-1"
                      >
                        Test WhatsApp Agent
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={step === 1 ? () => onOpenChange(false) : handlePrevious}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {step === 1 ? (
                "Save as Draft"
              ) : (
                <>
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Previous Step
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {step === 4 ? "Launch Campaign" : "Next Step"}
              {step < 4 && <ChevronRightIcon className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DatasetSelectorDialog
        open={showDatasetSelector}
        onOpenChange={setShowDatasetSelector}
        selectedDatasets={selectedDatasetIds}
        onConfirm={(datasetIds) => setSelectedDatasetIds(datasetIds)}
      />

      <CallAgentTester
        open={showCallTester}
        onOpenChange={setShowCallTester}
        callScript={
          matrices.find((m) => m.name === "Initial Outreach")?.callScript ||
          "Hi, this is calling from the recruitment team."
        }
      />

      <WhatsAppAgentTester
        open={showWhatsAppTester}
        onOpenChange={setShowWhatsAppTester}
        whatsappMessage={
          matrices.find((m) => m.name === "Initial Outreach")
            ?.whatsappMessage || "Hi! We have an exciting opportunity for you."
        }
      />

      {/* Launch Confirmation Dialog */}
      <Dialog
        open={showLaunchConfirmation}
        onOpenChange={setShowLaunchConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Launch Campaign?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to launch{" "}
              <span className="font-semibold text-foreground">
                {campaignName}
              </span>
              ? The campaign will start immediately and begin contacting
              candidates.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Channels:</span>
                <span className="text-foreground font-medium">
                  {selectedChannels.join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Candidates:</span>
                <span className="text-foreground font-medium">
                  {targets.reduce((acc) => acc + 15, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground font-medium">
                  {startDate ? format(startDate, "M/d/yyyy") : "N/A"} -{" "}
                  {endDate ? format(endDate, "M/d/yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLaunchConfirmation(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLaunchCampaign}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Yes, Launch Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
