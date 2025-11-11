import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { loadDatasets } from "@/polymet/data/supabase-storage";
import {
  SearchIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { datasetsData, type Dataset } from "@/polymet/data/datasets-data";
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
  const [datasets, setDatasets] = useState(datasetsData);
  const [loading, setLoading] = useState(true);

  // Load datasets from Supabase on mount
  useEffect(() => {
    async function fetchDatasets() {
      try {
        const supabaseDatasets = await loadDatasets();
        if (supabaseDatasets.length > 0) {
          setDatasets(supabaseDatasets);
        } else {
          console.log('No datasets in Supabase, using mock data');
          setDatasets(datasetsData);
        }
      } catch (error) {
        console.error('Error loading datasets:', error);
        setDatasets(datasetsData);
      }
      setLoading(false);
    }
    fetchDatasets();
  }, []);

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

  if (loading) {
    return (
      <div className="p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Skeleton className="h-9 w-40 mb-2" style={{ marginLeft: "15px" }} />
              <Skeleton className="h-5 w-80" style={{ marginLeft: "15px" }} />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Datasets Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
              
              <Skeleton className="h-4 w-full mb-6" />
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
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

      {filteredDatasets.length === 0 && (
        <div className="text-center py-12">
          <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

          <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or create a new dataset
          </p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New Dataset
          </Button>
        </div>
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
        onComplete={(data) => {
          console.log("Dataset created:", data);
          // Save to storage and update state
          const newDataset = {
            id: `dataset-${Date.now()}`,
            name: data.name,
            description: `Imported from CSV with ${data.data.length} candidates`,
            source: "csv" as const,
            candidateCount: data.data.length,
            lastUpdated: "Just now",
            candidates: data.data,
          };
          addDataset(newDataset);
          setDatasets(loadDatasets(datasetsData));
        }}
      />
    </div>
  );
}
