import { useState, useEffect } from "react";
import { Swimlane } from "@/polymet/components/swimlane";
import { CandidateDetailDialog } from "@/polymet/components/candidate-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import type { Candidate, Job } from "@/polymet/data/jobs-data";
import type { CampaignCandidate } from "@/polymet/data/campaigns-data";
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
}

interface SwimlaneConfig {
  id: string;
  title: string;
  status: Candidate["status"];
  color: string;
}

const defaultSwimlanes: SwimlaneConfig[] = [
  {
    id: "1",
    title: "Not Contacted",
    status: "not-contacted",
    color: "hsl(var(--chart-1))",
  },
  {
    id: "2",
    title: "Interested",
    status: "interested",
    color: "hsl(var(--chart-2))",
  },
  {
    id: "3",
    title: "Started Work",
    status: "started-work",
    color: "hsl(var(--primary))",
  },
];

export function KanbanBoard({ job }: KanbanBoardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(job.candidates);
  const [swimlanes, setSwimlanes] =
    useState<SwimlaneConfig[]>(defaultSwimlanes);
  const [swimlanesLoaded, setSwimlanesLoaded] = useState(false);

  // Load custom columns from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadColumns() {
      try {
        const { loadJobColumns, saveJobColumn } = await import('@/polymet/data/supabase-storage');
        const customColumns = await loadJobColumns(job.id);
        
        if (!isMounted) return;
        
        if (customColumns.length > 0) {
          // Use existing columns from database
          const loadedSwimlanes: SwimlaneConfig[] = customColumns.map(col => ({
            id: col.id,
            title: col.title,
            status: col.status as Candidate["status"],
            color: col.color,
          }));
          setSwimlanes(loadedSwimlanes);
          console.log(`✅ Loaded ${customColumns.length} columns from Supabase`);
        } else {
          // First time: initialize with default columns
          console.log('📝 Initializing default columns in Supabase...');
          const newColumnIds: string[] = [];
          
          for (let i = 0; i < defaultSwimlanes.length; i++) {
            const columnId = await saveJobColumn({
              jobId: job.id,
              title: defaultSwimlanes[i].title,
              status: defaultSwimlanes[i].status,
              color: defaultSwimlanes[i].color,
              position: i,
            });
            if (columnId) newColumnIds.push(columnId);
          }
          
          if (!isMounted) return;
          
          // Reload to get the saved columns with their IDs
          const reloadedColumns = await loadJobColumns(job.id);
          if (reloadedColumns.length > 0) {
            const loadedSwimlanes: SwimlaneConfig[] = reloadedColumns.map(col => ({
              id: col.id,
              title: col.title,
              status: col.status as Candidate["status"],
              color: col.color,
            }));
            setSwimlanes(loadedSwimlanes);
            console.log('✅ Default columns initialized');
          }
        }
        
        if (isMounted) {
          setSwimlanesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading columns:', error);
        if (isMounted) {
          setSwimlanesLoaded(true);
        }
      }
    }
    
    loadColumns();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [job.id]);

  // Note: Candidates are now saved to Supabase in real-time via individual actions
  // No need for bulk persistence on every change
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // New candidate dialog state
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidatePhone, setNewCandidatePhone] = useState("");
  const [newCandidateStatus, setNewCandidateStatus] = useState<
    Candidate["status"]
  >(defaultSwimlanes[0].status);

  // New column dialog state
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("hsl(var(--chart-1))");

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
  const handleUpdateCandidateNotes = async (candidateId: string, notes: any[]) => {
    // Update local state
    setCandidates((prev) => {
      const updated = prev.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, notes } : candidate
      );
      return updated;
    });
    // Notes are already saved to Supabase in the dialog, just update local state
  };

  const handleDrop = async (candidateId: string, newStatus: Candidate["status"]) => {
    // Optimistic update
    setCandidates((prev) => {
      const updated = prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus }
          : candidate
      );
      return updated;
    });
    setDraggingId(null);

    // Save to Supabase
    const { moveCandidateToStatus } = await import('@/polymet/data/supabase-storage');
    await moveCandidateToStatus(candidateId, newStatus);
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

    // Save to Supabase
    const { saveCandidate } = await import('@/polymet/data/supabase-storage');
    const candidateId = await saveCandidate(job.id, {
      name: newCandidateName,
      phone: newCandidatePhone,
      status: newCandidateStatus,
    });

    if (candidateId) {
      const newCandidate: Candidate = {
        id: candidateId,
        name: newCandidateName,
        phone: newCandidatePhone,
        status: newCandidateStatus,
      };

      setCandidates((prev) => [...prev, newCandidate]);

      // Reset form
      setNewCandidateName("");
      setNewCandidatePhone("");
      setNewCandidateStatus(swimlanes[0]?.status || "not-contacted");
      setIsAddCandidateOpen(false);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    const newStatus = `custom-${Date.now()}` as Candidate["status"];
    const position = swimlanes.length;

    // Save to Supabase first
    const { saveJobColumn } = await import('@/polymet/data/supabase-storage');
    const columnId = await saveJobColumn({
      jobId: job.id,
      title: newColumnTitle.trim(),
      status: newStatus,
      color: newColumnColor,
      position,
    });

    if (columnId) {
      const newSwimlane: SwimlaneConfig = {
        id: columnId,
        title: newColumnTitle.trim(),
        status: newStatus,
        color: newColumnColor,
      };

      setSwimlanes((prev) => [...prev, newSwimlane]);
      console.log('✅ Column saved to Supabase');
    } else {
      alert('Failed to create column. Please try again.');
    }

    setNewColumnTitle("");
    setNewColumnColor("hsl(var(--chart-1))");
    setIsAddColumnOpen(false);
  };

  const handleEditColumn = async (id: string, newTitle: string, newColor: string) => {
    // Optimistic update
    setSwimlanes((prev) =>
      prev.map((swimlane) =>
        swimlane.id === id
          ? { ...swimlane, title: newTitle, color: newColor }
          : swimlane
      )
    );

    // Save to Supabase
    const { updateJobColumn } = await import('@/polymet/data/supabase-storage');
    const success = await updateJobColumn(id, {
      title: newTitle,
      color: newColor,
    });

    if (success) {
      console.log('✅ Column updated in Supabase');
    } else {
      alert('Failed to update column');
    }
  };

  const handleDeleteColumn = async () => {
    if (!columnToDelete || !moveToColumn) return;

    const columnToDeleteData = swimlanes.find((s) => s.id === columnToDelete);
    const targetColumn = swimlanes.find((s) => s.id === moveToColumn);

    if (!columnToDeleteData || !targetColumn) return;

    // Move all candidates from deleted column to target column in database
    const candidatesToMove = candidates.filter(
      (c) => c.status === columnToDeleteData.status
    );

    // Update candidates in Supabase
    const { moveCandidateToStatus } = await import('@/polymet/data/supabase-storage');
    for (const candidate of candidatesToMove) {
      await moveCandidateToStatus(candidate.id, targetColumn.status);
    }

    // Move all candidates locally
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.status === columnToDeleteData.status
          ? { ...candidate, status: targetColumn.status }
          : candidate
      )
    );

    // Delete column from Supabase
    const { deleteJobColumn } = await import('@/polymet/data/supabase-storage');
    const success = await deleteJobColumn(columnToDelete);

    if (success) {
      // Remove the column locally
      setSwimlanes((prev) => prev.filter((s) => s.id !== columnToDelete));
      console.log('✅ Column deleted from Supabase');
    } else {
      alert('Failed to delete column');
    }

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
                        <SelectItem key={swimlane.id} value={swimlane.status}>
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {swimlanes.map((swimlane) => (
          <Swimlane
            key={swimlane.id}
            id={swimlane.id}
            title={swimlane.title}
            candidates={getCandidatesByStatus(swimlane.status)}
            status={swimlane.status}
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
