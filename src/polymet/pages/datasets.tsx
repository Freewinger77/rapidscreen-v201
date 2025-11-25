import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { loadDatasets, addDataset } from "@/lib/supabase-storage";
import {
  SearchIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  MoreVerticalIcon,
  DatabaseIcon,
} from "lucide-react";
import { type Dataset } from "@/polymet/data/datasets-data";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatasetDetailDialog } from "@/polymet/components/dataset-detail-dialog";
import { CSVUploadDialog } from "@/polymet/components/csv-upload-dialog";

export function DatasetsPage() {
  const [search, setSearch] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  // Load datasets from Supabase
  useEffect(() => {
    fetchDatasets();
  }, []);

  async function fetchDatasets() {
    try {
      setLoading(true);
      const loadedDatasets = await loadDatasets();
      setDatasets(loadedDatasets);
    } catch (err) {
      console.error('Failed to load datasets:', err);
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  }

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(search.toLowerCase()) ||
      dataset.description.toLowerCase().includes(search.toLowerCase())
  );

  const getSourceBadgeColor = (source: Dataset["source"]) => {
    switch (source) {
      case "csv":
        return "bg-chart-2/20 text-chart-2";
      case "imported":
        return "bg-primary/20 text-primary";
      case "manual":
        return "bg-chart-1/20 text-chart-1";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ paddingRight: "15px", paddingLeft: "15px" }}
          >
            Datasets
          </h1>
          <p
            className="text-muted-foreground mt-1"
            style={{ paddingRight: "15px", paddingLeft: "15px" }}
          >
            Manage your candidate datasets and groups
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setUploadDialogOpen(true)}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create New Dataset
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <Input
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileTextIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{datasets.length}</p>
              <p className="text-sm text-muted-foreground">Total Datasets</p>
            </div>
          </div>
        </div>
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {datasets.reduce((sum, ds) => sum + ds.candidateCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
            </div>
          </div>
        </div>
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <FileTextIcon className="w-5 h-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {datasets.filter((ds) => ds.source === "csv").length}
              </p>
              <p className="text-sm text-muted-foreground">CSV Imports</p>
            </div>
          </div>
        </div>
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <FileTextIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {datasets.filter((ds) => ds.source === "manual").length}
              </p>
              <p className="text-sm text-muted-foreground">Manual Entries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDatasets.map((dataset) => (
          <div
            key={dataset.id}
            className="p-5 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{dataset.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dataset.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-1 text-xs rounded ${getSourceBadgeColor(
                  dataset.source
                )}`}
              >
                {dataset.source.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UsersIcon className="w-4 h-4" />

                <span>{dataset.candidateCount} candidates</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />

                <span>Updated {dataset.lastUpdated}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedDataset(dataset);
                  setDetailDialogOpen(true);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDatasets.length === 0 && (
        <EmptyState
          icon={DatabaseIcon}
          title="No datasets found"
          description={search ? "Try adjusting your search or create a new dataset" : "Create your first dataset to build a pool of candidates for your campaigns"}
          actionLabel={datasets.length === 0 ? "Create Your First Dataset" : "Create New Dataset"}
          onAction={() => setUploadDialogOpen(true)}
        />
      )}

      {/* Dialogs */}
      <DatasetDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        dataset={selectedDataset}
      />

      <CSVUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onComplete={async (data) => {
          try {
            console.log("Dataset created:", data);
            console.log("CSV Data:", data.data);
            console.log("Column Mapping:", data.mapping);
            
            // Transform CSV data to proper candidate format
            const transformedCandidates = data.data.map((row: any, index: number) => {
              // Map CSV columns to our schema
              const phone = row.number || row.phone || row.Phone || row.Number || row.mobile || '';
              const name = row.name || row.Name || row.full_name || row.fullName || `Candidate ${index + 1}`;
              
              return {
                id: `csv_${Date.now()}_${index}`,
                name: name.trim(),
                phone: phone.trim(),
                postcode: row.postcode || row.Postcode || null,
                location: row.location || row.Location || null,
                trade: row.trade || row.Trade || row.skill || row.Skill || null,
                blueCard: row.blue_card === 'true' || row.blueCard === 'true' || row.BlueCard === 'true' || false,
                greenCard: row.green_card === 'true' || row.greenCard === 'true' || row.GreenCard === 'true' || false,
              };
            });
            
            console.log("Transformed candidates:", transformedCandidates);
            
            // Save to database
            await addDataset({
              name: data.name,
              description: `Imported from CSV with ${transformedCandidates.length} candidates`,
              source: "csv" as const,
              candidateCount: transformedCandidates.length,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              candidates: transformedCandidates,
            });
            
            // Reload datasets
            await fetchDatasets();
            
            toast.success('Dataset created successfully!');
            setUploadDialogOpen(false);
          } catch (error) {
            console.error('Failed to create dataset:', error);
            toast.error('Failed to create dataset');
          }
        }}
      />
    </div>
  );
}
