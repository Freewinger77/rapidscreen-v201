/**
 * Dynamic Candidates Table with Campaign-Specific Target Columns
 * Shows custom columns based on campaign targets (text/number/boolean)
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SearchIcon, EyeIcon, FilterIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import type { CampaignCandidate, CampaignTarget } from '@/polymet/data/campaigns-data';

interface DynamicCandidatesTableProps {
  candidates: CampaignCandidate[];
  targets: CampaignTarget[];
  onViewDetails: (candidate: CampaignCandidate) => void;
  onDeleteCandidate?: (candidateId: string) => void;
}

export function DynamicCandidatesTable({
  candidates,
  targets,
  onViewDetails,
  onDeleteCandidate,
}: DynamicCandidatesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableFilter, setAvailableFilter] = useState<string>('all');
  const [interestedFilter, setInterestedFilter] = useState<string>('all');
  const [callStatusFilter, setCallStatusFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('forename');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Check if standard columns are already in targets
  const hasStandardAsTarget = (columnName: string) => {
    return targets.some(t => {
      const targetNameLower = t.name.toLowerCase();
      const descLower = t.description?.toLowerCase() || '';
      const colLower = columnName.toLowerCase();
      
      return targetNameLower.includes(colLower) || 
             descLower.includes(colLower) ||
             (colLower === 'available' && (targetNameLower.includes('available') || descLower.includes('available'))) ||
             (colLower === 'interested' && (targetNameLower.includes('interest') || descLower.includes('interest'))) ||
             (colLower === 'referee' && (targetNameLower.includes('referee') || descLower.includes('refer')));
    });
  };

  // Column visibility state - AUTO-HIDE standard columns if they're custom targets
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    forename: true,
    telMobile: true,
    callStatus: true,
    // These are HIDDEN if they exist as campaign targets
    availableToWork: false, // Always show via targets instead
    interested: false,      // Always show via targets instead  
    knowReferee: false,     // Always show via targets instead
  });

  // Initialize visibility for custom target columns
  useMemo(() => {
    const targetColumns: Record<string, boolean> = {};
    targets.forEach(target => {
      const columnKey = `target_${target.id}`;
      if (!(columnKey in visibleColumns)) {
        targetColumns[columnKey] = true;
      }
    });
    if (Object.keys(targetColumns).length > 0) {
      setVisibleColumns(prev => ({ ...prev, ...targetColumns }));
    }
  }, [targets]);

  // Get custom response value for a target
  const getTargetValue = (candidate: CampaignCandidate, target: CampaignTarget) => {
    // Check if candidate has call analysis with custom responses
    const customResponses = (candidate as any).customResponses || {};
    const responseKey = `question_${target.id}` || target.name.toLowerCase().replace(/\s+/g, '_');
    
    return customResponses[responseKey] || customResponses[target.name] || 'N/A';
  };

  // Format value based on target type
  const formatTargetValue = (value: any, targetType: string) => {
    if (value === 'N/A' || value === null || value === undefined) return 'N/A';
    
    if (targetType === 'boolean') {
      return value === true || value === 'true' || value === 'yes' ? '✓ Yes' : '✗ No';
    }
    
    return String(value);
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        candidate.forename.toLowerCase().includes(searchLower) ||
        candidate.surname.toLowerCase().includes(searchLower) ||
        candidate.telMobile.includes(searchQuery);

      if (!matchesSearch) return false;

      // Available filter
      if (availableFilter !== 'all') {
        const isAvailable = candidate.availableToWork === true;
        if (availableFilter === 'yes' && !isAvailable) return false;
        if (availableFilter === 'no' && isAvailable) return false;
      }

      // Interested filter
      if (interestedFilter !== 'all') {
        const isInterested = candidate.interested === true;
        if (interestedFilter === 'yes' && !isInterested) return false;
        if (interestedFilter === 'no' && !isInterested) return false;
      }

      // Call status filter
      if (callStatusFilter !== 'all' && candidate.callStatus !== callStatusFilter) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn.startsWith('target_')) {
        // Sorting by custom target column
        const targetId = sortColumn.replace('target_', '');
        const target = targets.find(t => t.id === targetId);
        if (target) {
          aValue = getTargetValue(a, target);
          bValue = getTargetValue(b, target);
        }
      } else {
        aValue = (a as any)[sortColumn];
        bValue = (b as any)[sortColumn];
      }

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [candidates, searchQuery, availableFilter, interestedFilter, callStatusFilter, sortColumn, sortDirection, targets]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const getCallStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      not_called: 'secondary',
      contacted: 'default',
      no_answer: 'outline',
      voicemail: 'outline',
      user_hangup: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and Column Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={availableFilter} onValueChange={setAvailableFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Available" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Available: All</SelectItem>
            <SelectItem value="yes">Available: Yes</SelectItem>
            <SelectItem value="no">Available: No</SelectItem>
          </SelectContent>
        </Select>

        <Select value={interestedFilter} onValueChange={setInterestedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Interested" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Interested: All</SelectItem>
            <SelectItem value="yes">Interested: Yes</SelectItem>
            <SelectItem value="no">Interested: No</SelectItem>
          </SelectContent>
        </Select>

        <Select value={callStatusFilter} onValueChange={setCallStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Call Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="not_called">Not Called</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="no_answer">No Answer</SelectItem>
            <SelectItem value="voicemail">Voicemail</SelectItem>
          </SelectContent>
        </Select>

        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={visibleColumns.forename}
              onCheckedChange={() => toggleColumnVisibility('forename')}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.telMobile}
              onCheckedChange={() => toggleColumnVisibility('telMobile')}
            >
              Phone
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.callStatus}
              onCheckedChange={() => toggleColumnVisibility('callStatus')}
            >
              Call Status
            </DropdownMenuCheckboxItem>
            {/* Hide standard columns - they're in targets now */}
            
            {targets.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Campaign Targets</DropdownMenuLabel>
                {targets.map(target => (
                  <DropdownMenuCheckboxItem
                    key={target.id}
                    checked={visibleColumns[`target_${target.id}`]}
                    onCheckedChange={() => toggleColumnVisibility(`target_${target.id}`)}
                  >
                    {target.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.forename && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('forename')}
                >
                  Name <SortIcon column="forename" />
                </TableHead>
              )}
              {visibleColumns.telMobile && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('telMobile')}
                >
                  Phone <SortIcon column="telMobile" />
                </TableHead>
              )}
              {visibleColumns.callStatus && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('callStatus')}
                >
                  Call Status <SortIcon column="callStatus" />
                </TableHead>
              )}
              {visibleColumns.availableToWork && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('availableToWork')}
                >
                  Available <SortIcon column="availableToWork" />
                </TableHead>
              )}
              {visibleColumns.interested && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('interested')}
                >
                  Interested <SortIcon column="interested" />
                </TableHead>
              )}
              {visibleColumns.knowReferee && (
                <TableHead>Know Referee</TableHead>
              )}
              
              {/* Dynamic Target Columns */}
              {targets.map(target => (
                visibleColumns[`target_${target.id}`] && (
                  <TableHead 
                    key={target.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort(`target_${target.id}`)}
                  >
                    {target.name}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {target.goalType}
                    </Badge>
                    <SortIcon column={`target_${target.id}`} />
                  </TableHead>
                )
              ))}
              
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={Object.values(visibleColumns).filter(Boolean).length + targets.length + 1}
                  className="text-center py-8 text-muted-foreground"
                >
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow 
                  key={candidate.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails(candidate)}
                >
                  {visibleColumns.forename && (
                    <TableCell className="font-medium">
                      {candidate.forename} {candidate.surname}
                    </TableCell>
                  )}
                  {visibleColumns.telMobile && (
                    <TableCell>{candidate.telMobile}</TableCell>
                  )}
                  {visibleColumns.callStatus && (
                    <TableCell>
                      <Badge variant={getCallStatusBadge(candidate.callStatus)}>
                        {candidate.callStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.availableToWork && (
                    <TableCell>
                      {candidate.availableToWork === null ? (
                        <span className="text-muted-foreground">N/A</span>
                      ) : candidate.availableToWork ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.interested && (
                    <TableCell>
                      {candidate.interested === null ? (
                        <span className="text-muted-foreground">N/A</span>
                      ) : candidate.interested ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.knowReferee && (
                    <TableCell>
                      {candidate.knowReferee === null ? (
                        <span className="text-muted-foreground">N/A</span>
                      ) : candidate.knowReferee ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </TableCell>
                  )}
                  
                  {/* Dynamic Target Columns */}
                  {targets.map(target => (
                    visibleColumns[`target_${target.id}`] && (
                      <TableCell key={target.id}>
                        {formatTargetValue(getTargetValue(candidate, target), target.goalType)}
                      </TableCell>
                    )
                  ))}
                  
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(candidate);
                      }}
                    >
                      View
                    </Button>
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

