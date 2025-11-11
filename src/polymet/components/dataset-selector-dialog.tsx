import { useState } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SearchIcon,
  UsersIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  PhoneIcon,
  BriefcaseIcon,
  BadgeCheckIcon,
} from "lucide-react";
import {
  datasetsData,
  type Dataset,
  type Candidate,
} from "@/polymet/data/datasets-data";
import { cn } from "@/lib/utils";

interface DatasetSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDatasets: string[];
  onConfirm: (datasetIds: string[]) => void;
}

export function DatasetSelectorDialog({
  open,
  onOpenChange,
  selectedDatasets,
  onConfirm,
}: DatasetSelectorDialogProps) {
  useZoomDialog();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedDatasets);
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);

  const filteredDatasets = datasetsData.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(search.toLowerCase()) ||
      dataset.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDataset = (datasetId: string) => {
    setSelected((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const toggleExpanded = (datasetId: string) => {
    setExpandedDataset((prev) => (prev === datasetId ? null : datasetId));
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onOpenChange(false);
  };

  const getSourceBadgeColor = (source: Dataset["source"]) => {
    switch (source) {
      case "csv":
        return "bg-blue-500/20 text-blue-400";
      case "imported":
        return "bg-green-500/20 text-green-400";
      case "manual":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[80vh] flex flex-col"
        data-zoom="true"
      >
        <DialogHeader>
          <DialogTitle>Select Datasets</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Datasets List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredDatasets.map((dataset) => {
            const isSelected = selected.includes(dataset.id);
            const isExpanded = expandedDataset === dataset.id;

            return (
              <div
                key={dataset.id}
                className={cn(
                  "border border-border rounded-lg transition-colors",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                {/* Dataset Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDataset(dataset.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1">
                            {dataset.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {dataset.description}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded whitespace-nowrap ${getSourceBadgeColor(
                            dataset.source
                          )}`}
                        >
                          {dataset.source.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />

                          <span>{dataset.candidateCount} candidates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />

                          <span>{dataset.lastUpdated}</span>
                        </div>
                      </div>

                      {/* View Candidates Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(dataset.id)}
                        className="mt-2 h-8 text-xs"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUpIcon className="w-3 h-3 mr-1" />
                            Hide Candidates
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-3 h-3 mr-1" />
                            View Candidates
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Candidates List */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 p-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {dataset.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="p-3 bg-background border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium">{candidate.name}</h4>
                            <div className="flex gap-1">
                              {candidate.blueCard && (
                                <BadgeCheckIcon
                                  className="w-4 h-4 text-blue-500"
                                  title="Blue Card"
                                />
                              )}
                              {candidate.greenCard && (
                                <BadgeCheckIcon
                                  className="w-4 h-4 text-green-500"
                                  title="Green Card"
                                />
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="w-3 h-3" />

                              <span>{candidate.phone}</span>
                            </div>
                            {candidate.postcode && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" />

                                <span>{candidate.postcode}</span>
                              </div>
                            )}
                            {candidate.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" />

                                <span>{candidate.location}</span>
                              </div>
                            )}
                            {candidate.trade && (
                              <div className="flex items-center gap-1">
                                <BriefcaseIcon className="w-3 h-3" />

                                <span>{candidate.trade}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredDatasets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />

              <p>No datasets found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selected.length} dataset{selected.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={selected.length === 0}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
