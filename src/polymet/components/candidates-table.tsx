import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Trash2Icon, ArrowUpDownIcon } from "lucide-react";
import type { CampaignCandidate } from "@/polymet/data/campaigns-data";
import { getCampaignInfo, getSessionByPhone } from "@/lib/backend-api";

interface CandidatesTableProps {
  candidates: CampaignCandidate[];
  campaignName: string;  // Backend campaign ID
  onViewTranscript: (candidate: CampaignCandidate) => void;
  onDeleteCandidate: (candidateId: string) => void;
}

export function CandidatesTable({
  candidates,
  campaignName,
  onViewTranscript,
  onDeleteCandidate,
}: CandidatesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFilter, setAvailableFilter] = useState<string>("all");
  const [interestedFilter, setInterestedFilter] = useState<string>("all");
  const [refereeFilter, setRefereeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("forename");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [campaignObjectives, setCampaignObjectives] = useState<any>(null);
  const [candidateSessions, setCandidateSessions] = useState<Map<string, any>>(new Map());

  // Load campaign objectives from backend
  useEffect(() => {
    async function loadCampaignInfo() {
      if (!campaignName) return;
      
      try {
        const info = await getCampaignInfo(campaignName);
        if (info?.objectives_template) {
          setCampaignObjectives(info.objectives_template);
        }
      } catch (error) {
        console.error('Failed to load campaign objectives:', error);
      }
    }
    
    loadCampaignInfo();
  }, [campaignName]);

  // Load session info for each candidate
  useEffect(() => {
    async function loadSessions() {
      if (candidates.length === 0) return;
      
      const sessionMap = new Map();
      
      for (const candidate of candidates) {
        try {
          const session = await getSessionByPhone(candidate.telMobile);
          if (session) {
            sessionMap.set(candidate.telMobile, session);
          }
        } catch (error) {
          console.error(`Failed to load session for ${candidate.telMobile}:`, error);
        }
      }
      
      setCandidateSessions(sessionMap);
    }
    
    loadSessions();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, [candidates]);

  const getCallStatusLabel = (status: CampaignCandidate["callStatus"]) => {
    const statusMap = {
      not_called: "Not Called",
      agent_hangup: "Agent Hangup",
      user_declined: "User Declined",
      user_hangup: "User Hangup",
      no_answer: "No Answer",
      voicemail: "Voicemail",
      invalid_destination: "Invalid Destination",
    };
    return statusMap[status] || status;
  };

  const getCallStatusVariant = (status: CampaignCandidate["callStatus"]) => {
    const variantMap = {
      not_called: "secondary",
      agent_hangup: "warning",
      user_declined: "destructive",
      user_hangup: "warning",
      no_answer: "secondary",
      voicemail: "secondary",
      invalid_destination: "destructive",
    };
    return variantMap[status] || "default";
  };

  const getCallStatusStyle = (status: CampaignCandidate["callStatus"]) => {
    if (status === "agent_hangup" || status === "user_hangup") {
      return {
        backgroundColor: "hsl(var(--chart-1))",
        color: "white",
      };
    }
    return { backgroundColor: "#71717a", color: "#f1f5f9" };
  };

  const getBooleanDisplay = (value: boolean | null) => {
    if (value === null)
      return <span className="text-muted-foreground">N/A</span>;

    return (
      <Badge
        variant={value ? "default" : "destructive"}
        className="text-xs"
        style={{ backgroundColor: "#71717a" }}
      >
        {value ? "Yes" : "No"}
      </Badge>
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter candidates
  let filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.forename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.telMobile.includes(searchQuery);

    const matchesAvailable =
      availableFilter === "all" ||
      (availableFilter === "yes" && candidate.availableToWork === true) ||
      (availableFilter === "no" && candidate.availableToWork === false) ||
      (availableFilter === "na" && candidate.availableToWork === null);

    const matchesInterested =
      interestedFilter === "all" ||
      (interestedFilter === "yes" && candidate.interested === true) ||
      (interestedFilter === "no" && candidate.interested === false) ||
      (interestedFilter === "na" && candidate.interested === null);

    const matchesReferee =
      refereeFilter === "all" ||
      (refereeFilter === "yes" && candidate.knowReferee === true) ||
      (refereeFilter === "no" && candidate.knowReferee === false) ||
      (refereeFilter === "na" && candidate.knowReferee === null);

    return (
      matchesSearch && matchesAvailable && matchesInterested && matchesReferee
    );
  });

  // Sort candidates
  filteredCandidates = [...filteredCandidates].sort((a, b) => {
    let aValue: any = a[sortField as keyof CampaignCandidate];
    let bValue: any = b[sortField as keyof CampaignCandidate];

    if (aValue === null) aValue = "";
    if (bValue === null) bValue = "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-background"
        />

        <Select value={availableFilter} onValueChange={setAvailableFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Available to Work" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Available: All</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="na">N/A</SelectItem>
          </SelectContent>
        </Select>
        <Select value={interestedFilter} onValueChange={setInterestedFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Interested" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Interested: All</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="na">N/A</SelectItem>
          </SelectContent>
        </Select>
        <Select value={refereeFilter} onValueChange={setRefereeFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Know Referee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Know Referee: All</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="na">N/A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("forename")}
                  className="h-8 px-2 hover:bg-muted/50"
                >
                  Forename
                  <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("telMobile")}
                  className="h-8 px-2 hover:bg-muted/50"
                >
                  Tel Mobile
                  <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("callStatus")}
                  className="h-8 px-2 hover:bg-muted/50"
                >
                  Status
                  <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              {/* Dynamic objective columns from backend */}
              {campaignObjectives ? (
                Object.entries(campaignObjectives).map(([key, config]: [string, any]) => {
                  if (config.type === 'boolean') {
                    return (
                      <TableHead key={key}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 hover:bg-muted/50 capitalize"
                        >
                          {key.replace(/_/g, ' ')}
                          <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                    );
                  }
                  return null;
                })
              ) : (
                <>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("availableToWork")}
                      className="h-8 px-2 hover:bg-muted/50"
                    >
                      Available to Work
                      <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("interested")}
                      className="h-8 px-2 hover:bg-muted/50"
                    >
                      Interested
                      <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("knowReferee")}
                      className="h-8 px-2 hover:bg-muted/50"
                    >
                      Know Referee
                      <ArrowUpDownIcon className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                </>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="hover:bg-muted/30 border-border"
                >
                  <TableCell className="font-medium">
                    {candidate.forename} {candidate.surname}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {candidate.telMobile}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const session = candidateSessions.get(candidate.telMobile);
                      const status = session?.session_status || 'not_contacted';
                      const isActive = status === 'active';
                      
                      return (
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          )}
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs capitalize"
                          >
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                      );
                    })()}
                  </TableCell>
                  {/* Dynamic objective columns from backend */}
                  {campaignObjectives ? (
                    Object.entries(campaignObjectives).map(([key, config]: [string, any]) => {
                      if (config.type === 'boolean') {
                        const session = candidateSessions.get(candidate.telMobile);
                        const value = session?.objectives?.[key] ?? null;
                        return (
                          <TableCell key={key}>
                            {getBooleanDisplay(value)}
                          </TableCell>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <>
                      <TableCell>
                        {getBooleanDisplay(candidate.availableToWork)}
                      </TableCell>
                      <TableCell>
                        {getBooleanDisplay(candidate.interested)}
                      </TableCell>
                      <TableCell>
                        {getBooleanDisplay(candidate.knowReferee)}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewTranscript(candidate)}
                        title="View Conversation & Timeline"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteCandidate(candidate.id)}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
