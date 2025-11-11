import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import {
  useZoomDialog,
  withZoomAnimation,
} from "@/polymet/components/animated-dialog";
import type { Dataset } from "@/polymet/data/datasets-data";

interface DatasetDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: Dataset | null;
}

export function DatasetDetailDialog({
  open,
  onOpenChange,
  dataset,
}: DatasetDetailDialogProps) {
  useZoomDialog();
  const [search, setSearch] = useState("");

  if (!dataset) return null;

  const filteredCandidates = dataset.candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.phone.toLowerCase().includes(search.toLowerCase()) ||
      candidate.location?.toLowerCase().includes(search.toLowerCase()) ||
      candidate.trade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...withZoomAnimation({
          className: "max-w-5xl max-h-[85vh] overflow-hidden flex flex-col",
        })}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">{dataset.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{dataset.description}</p>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 border border-border rounded-lg bg-card">
              <p className="text-2xl font-bold">{dataset.candidateCount}</p>
              <p className="text-xs text-muted-foreground">Total Candidates</p>
            </div>
            <div className="p-3 border border-border rounded-lg bg-card">
              <p className="text-2xl font-bold">
                {dataset.candidates.filter((c) => c.blueCard).length}
              </p>
              <p className="text-xs text-muted-foreground">Blue Card Holders</p>
            </div>
            <div className="p-3 border border-border rounded-lg bg-card">
              <p className="text-2xl font-bold">
                {dataset.candidates.filter((c) => c.greenCard).length}
              </p>
              <p className="text-xs text-muted-foreground">
                Green Card Holders
              </p>
            </div>
            <div className="p-3 border border-border rounded-lg bg-card">
              <p className="text-2xl font-bold capitalize">{dataset.source}</p>
              <p className="text-xs text-muted-foreground">Source Type</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Candidates Table */}
          <div className="border border-border rounded-lg overflow-hidden flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Blue Card</TableHead>
                  <TableHead>Green Card</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        {candidate.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-3 h-3 text-muted-foreground" />

                          <span className="text-sm">{candidate.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.location || candidate.postcode ? (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-3 h-3 text-muted-foreground" />

                            <span className="text-sm">
                              {candidate.location || candidate.postcode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.trade ? (
                          <div className="flex items-center gap-2">
                            <BriefcaseIcon className="w-3 h-3 text-muted-foreground" />

                            <span className="text-sm">{candidate.trade}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.blueCard === true ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : candidate.blueCard === false ? (
                          <XCircleIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.greenCard === true ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : candidate.greenCard === false ? (
                          <XCircleIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {dataset.candidateCount}{" "}
              candidates
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
