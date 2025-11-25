import { useState, useEffect } from "react";
import { Swimlane } from "@/polymet/components/swimlane";
import { CandidateDetailDialog } from "@/polymet/components/candidate-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import type { Candidate, Job } from "@/polymet/data/jobs-data";
import type { CampaignCandidate } from "@/polymet/data/campaigns-data";
import { updateCandidates, addCandidateToJob, updateJob } from "@/lib/supabase-storage";
import { markAsManuallyMoved, syncJobCandidates } from "@/lib/smart-kanban-sync";
import {
  loadKanbanColumns,
  addKanbanColumn,
  updateKanbanColumn,
  deleteKanbanColumn,
  isHiredColumn,
  type KanbanColumn,
} from "@/lib/kanban-columns";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KanbanBoardProps {
  job: Job;
  onUpdate?: () => void | Promise<void>;
  onHiredCountChange?: (count: number) => void;
}

export function KanbanBoard({ job, onUpdate, onHiredCountChange }: KanbanBoardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(job.candidates);
  const [swimlanes, setSwimlanes] = useState<KanbanColumn[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(true);
  const [localHiredCount, setLocalHiredCount] = useState(job.hired);

  // Load kanban columns from database
  useEffect(() => {
    async function fetchColumns() {
      setLoadingColumns(true);
      try {
        const cols = await loadKanbanColumns(job.id);
        setSwimlanes(cols);
      } catch (error) {
        console.error('Failed to load kanban columns:', error);
      } finally {
        setLoadingColumns(false);
      }
    }
    
    fetchColumns();
  }, [job.id]);

  // Sync local state with job prop
  useEffect(() => {
    setCandidates(job.candidates);
  }, [job.candidates]);

  // Auto-sync DISABLED - was moving candidates back automatically
  // TODO: Re-enable with proper manual_override checking
  /*
  useEffect(() => {
    async function autoSync() {
      if (candidates.length === 0) return;
      
      const result = await syncJobCandidates(job.id, candidates);
      
      if (result.updated > 0) {
        if (onUpdate) {
          await onUpdate();
        }
      }
    }

    autoSync();
    const interval = setInterval(autoSync, 30000);
    return () => clearInterval(interval);
  }, [job.id, candidates.length]);
  */

  // Persist candidates to database (background, no loading screen!)
  async function persistCandidates(updatedCandidates: Candidate[]) {
    try {
      // Don't set saving state - no loading screen!
      await updateCandidates(job.id, updatedCandidates);
      // Don't call onUpdate here - prevents reload flash
    } catch (error) {
      console.error('Failed to save candidates:', error);
      toast.error('Failed to save changes');
    }
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // New candidate dialog state
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidatePhone, setNewCandidatePhone] = useState("");
  const [newCandidateStatus, setNewCandidateStatus] = useState<
    Candidate["status"]
  >("not-contacted");

  // New column dialog state
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("hsl(var(--chart-1))");
  const [newColumnIsPostHire, setNewColumnIsPostHire] = useState(false);

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

  // Delete column dialog state
  const [isDeleteColumnOpen, setIsDeleteColumnOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [moveToColumn, setMoveToColumn] = useState<string>("");

  // Candidate detail dialog state
  const [selectedCandidate, setSelectedCandidate] =
    useState<CampaignCandidate | null>(null);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);

  // Handle note updates from candidate dialog
  const handleUpdateCandidateNotes = (candidateId: string, notes: any[]) => {
    const updated = candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, notes } : candidate
    );
    setCandidates(updated);
    persistCandidates(updated);
  };

  const handleDrop = async (candidateId: string, newStatus: Candidate["status"]) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const oldStatus = candidate.status;
    const oldColumn = swimlanes.find(s => s.statusKey === oldStatus);
    const newColumn = swimlanes.find(s => s.statusKey === newStatus);

    // Mark as manually moved (won't auto-sync)
    markAsManuallyMoved(candidateId);
    
    // Optimistic update (instant UI)
    const updated = candidates.map((c) =>
      c.id === candidateId ? { ...c, status: newStatus } : c
    );
    setCandidates(updated);
    setDraggingId(null);

    // Check if hired status changed
    const wasHired = oldColumn && isHiredColumn(oldColumn);
    const isNowHired = newColumn && isHiredColumn(newColumn);

    try {
      // Mark candidate as manually overridden
      const candidateWithOverride = updated.map(c =>
        c.id === candidateId ? { ...c, manual_override: true } : c
      );

      // Save to database in background
      updateCandidates(job.id, candidateWithOverride).catch(err => {
        console.error('Failed to save:', err);
        toast.error('Failed to save changes');
        setCandidates(candidates);
      });

      // Update hired count immediately
      if (!wasHired && isNowHired) {
        const newCount = localHiredCount + 1;
        setLocalHiredCount(newCount);
        if (onHiredCountChange) onHiredCountChange(newCount);
        toast.success('Candidate marked as hired!');
        // Update job in database (background)
        updateJob(job.id, { hired: newCount });
      } else if (wasHired && !isNowHired) {
        const newCount = Math.max(0, localHiredCount - 1);
        setLocalHiredCount(newCount);
        if (onHiredCountChange) onHiredCountChange(newCount);
        // Update job in database (background)  
        updateJob(job.id, { hired: newCount });
      }
    } catch (error) {
      // Revert on error
      setCandidates(candidates);
      console.error('Failed to move candidate:', error);
      toast.error('Failed to move candidate');
    }
  };

  const handleDragStart = (candidateId: string) => {
    setDraggingId(candidateId);
  };

  const handleReorder = (candidateId: string, targetIndex: number) => {
    setCandidates((prev) => {
      const candidate = prev.find((c) => c.id === candidateId);
      if (!candidate) return prev;

      // Get all candidates with the same status
      const sameStatusCandidates = prev.filter(
        (c) => c.status === candidate.status
      );
      const otherCandidates = prev.filter((c) => c.status !== candidate.status);

      // Remove the dragged candidate
      const filteredSameStatus = sameStatusCandidates.filter(
        (c) => c.id !== candidateId
      );

      // Insert at target index
      filteredSameStatus.splice(targetIndex, 0, candidate);

      // Combine and return
      return [...otherCandidates, ...filteredSameStatus];
    });
  };

  const getCandidatesByStatus = (status: Candidate["status"]) => {
    return candidates.filter((candidate) => {
      const matchesStatus = candidate.status === status;
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.phone.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  };

  const handleAddCandidate = async () => {
    if (!newCandidateName || !newCandidatePhone) return;

    try {
      const newCandidateId = await addCandidateToJob(job.id, {
        name: newCandidateName,
        phone: newCandidatePhone,
        status: newCandidateStatus,
        notes: [],
      });

      toast.success('Candidate added successfully');

      // Reload job data
      if (onUpdate) await onUpdate();

      // Reset form
      setNewCandidateName("");
      setNewCandidatePhone("");
      setNewCandidateStatus(swimlanes[0]?.status || "not-contacted");
      setIsAddCandidateOpen(false);
    } catch (error) {
      console.error('Failed to add candidate:', error);
      toast.error('Failed to add candidate');
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    const newStatus = `custom-${Date.now()}` as Candidate["status"];
    const newColumn: Omit<KanbanColumn, 'id'> = {
      jobId: job.id,
      title: newColumnTitle.trim(),
      statusKey: newStatus,
      color: newColumnColor,
      position: swimlanes.length,
      isDefault: false,
      isPostHire: newColumnIsPostHire,
    };

    try {
      // Optimistic update
      const tempColumn = { ...newColumn, id: `temp-${Date.now()}` };
      setSwimlanes((prev) => [...prev, tempColumn]);
      setNewColumnTitle("");
      setNewColumnColor("hsl(var(--chart-1))");
      setNewColumnIsPostHire(false);
      setIsAddColumnOpen(false);

      // Save to database
      const savedColumn = await addKanbanColumn(newColumn);
      
      // Update with real ID
      setSwimlanes((prev) =>
        prev.map((s) => (s.id === tempColumn.id ? savedColumn : s))
      );

      toast.success('Column created');
    } catch (error) {
      console.error('Failed to add column:', error);
      toast.error('Failed to create column');
      // Revert
      setSwimlanes((prev) => prev.filter((s) => s.id !== `temp-${Date.now()}`));
    }
  };

  const handleEditColumn = async (id: string, newTitle: string, newColor: string) => {
    // Optimistic update
    const oldSwimlanes = [...swimlanes];
    setSwimlanes((prev) =>
      prev.map((swimlane) =>
        swimlane.id === id
          ? { ...swimlane, title: newTitle, color: newColor }
          : swimlane
      )
    );

    try {
      // Save to database
      await updateKanbanColumn(id, { title: newTitle, color: newColor });
      toast.success('Column updated');
    } catch (error) {
      console.error('Failed to update column:', error);
      toast.error('Failed to update column');
      // Revert
      setSwimlanes(oldSwimlanes);
    }
  };

  const handleDeleteColumn = () => {
    if (!columnToDelete || !moveToColumn) return;

    const columnToDeleteData = swimlanes.find((s) => s.id === columnToDelete);
    const targetColumn = swimlanes.find((s) => s.id === moveToColumn);

    if (!columnToDeleteData || !targetColumn) return;

    // Move all candidates from deleted column to target column
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.status === columnToDeleteData.status
          ? { ...candidate, status: targetColumn.status }
          : candidate
      )
    );

    // Remove the column
    setSwimlanes((prev) => prev.filter((s) => s.id !== columnToDelete));

    // Reset state
    setColumnToDelete(null);
    setMoveToColumn("");
    setIsDeleteColumnOpen(false);
  };

  const initiateDeleteColumn = (id: string) => {
    setColumnToDelete(id);
    setIsDeleteColumnOpen(true);
  };

  const totalCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.phone.includes(searchQuery)
  ).length;

  // Convert simple Candidate to CampaignCandidate format for dialog
  const handleCandidateClick = (candidate: Candidate) => {
    const campaignCandidate: CampaignCandidate = {
      id: candidate.id,
      forename: candidate.name.split(" ")[0] || candidate.name,
      surname: candidate.name.split(" ").slice(1).join(" ") || "",
      telMobile: candidate.phone,
      email: candidate.email,
      callStatus: "not_called",
      availableToWork: null,
      interested: null,
      knowReferee: null,
      calls: [],
      notes: candidate.notes || [],
    };
    setSelectedCandidate(campaignCandidate);
    setCandidateDialogOpen(true);
  };

  // Update selected candidate when candidates change
  useEffect(() => {
    if (selectedCandidate) {
      const updatedCandidate = candidates.find(
        (c) => c.id === selectedCandidate.id
      );
      if (updatedCandidate) {
        setSelectedCandidate({
          ...selectedCandidate,
          notes: updatedCandidate.notes || [],
        });
      }
    }
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Header with Total and Search */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Total Candidates: {totalCandidates}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* Add New Candidate Dialog */}
          <Dialog
            open={isAddCandidateOpen}
            onOpenChange={setIsAddCandidateOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Create a new candidate card in the kanban board.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Enter candidate name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCandidatePhone}
                    onChange={(e) => setNewCandidatePhone(e.target.value)}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Column</Label>
                  <Select
                    value={newCandidateStatus}
                    onValueChange={(value) =>
                      setNewCandidateStatus(value as Candidate["status"])
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      {swimlanes.map((swimlane) => (
                        <SelectItem key={swimlane.id} value={swimlane.statusKey}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: swimlane.color }}
                            />

                            {swimlane.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddCandidateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddCandidate}>Add Candidate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      {loadingColumns ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading board...</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {swimlanes.map((swimlane) => (
            <Swimlane
              key={swimlane.id}
              id={swimlane.id}
              title={swimlane.title}
              candidates={getCandidatesByStatus(swimlane.statusKey as Candidate["status"])}
              status={swimlane.statusKey as Candidate["status"]}
              color={swimlane.color}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onEdit={handleEditColumn}
              onDelete={initiateDeleteColumn}
              canDelete={swimlanes.length > 1}
              onCandidateClick={handleCandidateClick}
              onReorder={handleReorder}
            />
          ))}

          {/* Add Column Button */}
          <div className="flex-shrink-0 min-w-[280px]">
            <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-full min-h-[120px] border-dashed border-2 hover:border-primary hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlusIcon className="w-6 h-6" />

                  <span>Add Column</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
                <DialogDescription>
                  Create a new swimlane column for organizing candidates.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="columnTitle">Column Title</Label>
                  <Input
                    id="columnTitle"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="e.g., Interview Scheduled"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Column Color</Label>
                  <div className="flex items-center gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewColumnColor(color.value)}
                        className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                          newColumnColor === color.value
                            ? "ring-2 ring-offset-2 ring-foreground scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="postHire"
                    checked={newColumnIsPostHire}
                    onChange={(e) => setNewColumnIsPostHire(e.target.checked)}
                    className="w-4 h-4 rounded border-input"
                  />
                  <label htmlFor="postHire" className="text-sm">
                    Post-hire column (counts toward hired total)
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddColumnOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddColumn}>Add Column</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      )}

      {/* Delete Column Dialog */}
      <Dialog open={isDeleteColumnOpen} onOpenChange={setIsDeleteColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              This column contains candidates. Please select a column to move
              them to before deleting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columnToDelete && (
              <>
                <div className="space-y-2">
                  <Label>Candidates to move:</Label>
                  <div className="text-sm text-muted-foreground">
                    {getCandidatesByStatus(
                      swimlanes.find((s) => s.id === columnToDelete)?.status ||
                        "not-contacted"
                    )
                      .map((c) => c.name)
                      .join(", ") || "No candidates"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moveToColumn">Move to column:</Label>
                  <Select value={moveToColumn} onValueChange={setMoveToColumn}>
                    <SelectTrigger id="moveToColumn">
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      {swimlanes
                        .filter((s) => s.id !== columnToDelete)
                        .map((swimlane) => (
                          <SelectItem key={swimlane.id} value={swimlane.id}>
                            {swimlane.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteColumnOpen(false);
                setColumnToDelete(null);
                setMoveToColumn("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteColumn}
              disabled={!moveToColumn}
            >
              Delete Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        open={candidateDialogOpen}
        onOpenChange={setCandidateDialogOpen}
        candidate={selectedCandidate}
        defaultTab="notes"
        visibleTabs={["notes", "timeline", "conversation"]}
        onNotesUpdate={handleUpdateCandidateNotes}
      />
    </div>
  );
}
