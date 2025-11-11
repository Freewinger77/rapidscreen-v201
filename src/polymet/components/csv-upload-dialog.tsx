import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  UploadIcon,
  FileTextIcon,
  ArrowRightIcon,
  XIcon,
  CheckIcon,
  AlertCircleIcon,
} from "lucide-react";
import {
  useZoomDialog,
  withZoomAnimation,
} from "@/polymet/components/animated-dialog";

interface CSVUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (data: any) => void;
}

type UploadStep = "method" | "upload" | "mapping" | "details";

interface ColumnMapping {
  [csvColumn: string]: string | null;
}

const ATTRIBUTE_OPTIONS = [
  { value: "name-full", label: "Name › Full" },
  { value: "name-first", label: "Name › First" },
  { value: "name-last", label: "Name › Last" },
  { value: "phone", label: "Phone Number" },
];

export function CSVUploadDialog({
  open,
  onOpenChange,
  onComplete,
}: CSVUploadDialogProps) {
  useZoomDialog();
  const [step, setStep] = useState<UploadStep>("method");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) return;

      // Parse header
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      setCsvColumns(headers);

      // Parse data rows
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });
      setCsvData(rows);

      // Auto-detect mappings for name and phone only
      const autoMapping: ColumnMapping = {};
      headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes("full") && lowerHeader.includes("name")) {
          autoMapping[header] = "name-full";
        } else if (
          lowerHeader.includes("first") &&
          lowerHeader.includes("name")
        ) {
          autoMapping[header] = "name-first";
        } else if (
          lowerHeader.includes("last") &&
          lowerHeader.includes("name")
        ) {
          autoMapping[header] = "name-last";
        } else if (
          lowerHeader.includes("phone") ||
          lowerHeader.includes("mobile") ||
          lowerHeader.includes("tel")
        ) {
          autoMapping[header] = "phone";
        }
      });
      setColumnMapping(autoMapping);

      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (csvColumn: string, attribute: string | null) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvColumn]: attribute,
    }));
  };

  const removeMappingForAttribute = (attribute: string) => {
    setColumnMapping((prev) => {
      const newMapping = { ...prev };
      Object.keys(newMapping).forEach((key) => {
        if (newMapping[key] === attribute) {
          newMapping[key] = null;
        }
      });
      return newMapping;
    });
  };

  const getMappedAttribute = (attribute: string): string | null => {
    const entry = Object.entries(columnMapping).find(
      ([_, val]) => val === attribute
    );
    return entry ? entry[0] : null;
  };

  const handleNext = () => {
    if (step === "method") {
      // User selected CSV upload
      setStep("upload");
    } else if (step === "upload" && csvFile) {
      // Already parsed, move to mapping
      setStep("mapping");
    } else if (step === "mapping") {
      setStep("details");
    } else if (step === "details") {
      // Complete the upload
      onComplete?.({
        name: datasetName,
        description: datasetDescription,
        file: csvFile,
        mapping: columnMapping,
        data: csvData,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("method");
    setCsvFile(null);
    setCsvColumns([]);
    setCsvData([]);
    setColumnMapping({});
    setDatasetName("");
    setDatasetDescription("");
    onOpenChange(false);
  };

  const canProceed = () => {
    if (step === "upload") return csvFile !== null;
    if (step === "mapping") {
      // At least name and phone must be mapped
      const hasName = Object.values(columnMapping).some(
        (v) => v === "name-full" || v === "name-first" || v === "name-last"
      );
      const hasPhone = Object.values(columnMapping).includes("phone");
      return hasName && hasPhone;
    }
    if (step === "details") return datasetName.trim().length > 0;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        {...withZoomAnimation({
          className: "max-w-4xl max-h-[85vh] overflow-hidden flex flex-col",
        })}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === "method" && "Create New Dataset"}
            {step === "upload" && "Upload CSV File"}
            {step === "mapping" && "Map Columns"}
            {step === "details" && "Dataset Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Method Selection */}
          {step === "method" && (
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                Choose how you'd like to create your dataset
              </p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setStep("upload")}
                  className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <UploadIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        Upload CSV File
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Import candidates from a CSV file with column mapping
                      </p>
                    </div>
                  </div>
                </button>

                <div className="p-6 border-2 border-border rounded-lg opacity-60 cursor-not-allowed text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <FileTextIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          Connect to Attio
                        </h3>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sync candidates directly from your Attio workspace
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Step */}
          {step === "upload" && (
            <div className="space-y-4 py-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

                <h3 className="font-semibold mb-2">
                  {csvFile ? csvFile.name : "Click to upload CSV file"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {csvFile
                    ? `${csvData.length} rows detected`
                    : "or drag and drop your file here"}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {csvFile && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="w-5 h-5 text-primary" />

                      <div>
                        <p className="font-medium">{csvFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {csvColumns.length} columns, {csvData.length} rows
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCsvFile(null);
                        setCsvColumns([]);
                        setCsvData([]);
                      }}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mapping Step */}
          {step === "mapping" && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
                <AlertCircleIcon className="w-5 h-5 text-primary mt-0.5" />

                <div className="flex-1">
                  <p className="text-sm font-medium">Map Your Columns</p>
                  <p className="text-sm text-muted-foreground">
                    Map name and phone number columns. Other columns will be
                    displayed as-is from the database. At least one name field
                    and phone number are required.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {csvColumns.map((column) => {
                  const currentMapping = columnMapping[column];
                  const mappedOption = ATTRIBUTE_OPTIONS.find(
                    (opt) => opt.value === currentMapping
                  );

                  return (
                    <div
                      key={column}
                      className="p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* File Column Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileTextIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                            <p className="font-medium truncate">{column}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate pl-6">
                            Example: {csvData[0]?.[column] || "No data"}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ArrowRightIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                        {/* Attribute Dropdown */}
                        <div className="w-64 flex-shrink-0">
                          <Select
                            value={currentMapping || ""}
                            onValueChange={(value) => {
                              if (value === "none") {
                                handleMappingChange(column, null);
                              } else {
                                // Remove this attribute from other columns first
                                Object.keys(columnMapping).forEach((col) => {
                                  if (
                                    col !== column &&
                                    columnMapping[col] === value
                                  ) {
                                    handleMappingChange(col, null);
                                  }
                                });
                                handleMappingChange(column, value);
                              }
                            }}
                          >
                            <SelectTrigger
                              className={currentMapping ? "border-primary" : ""}
                            >
                              <SelectValue placeholder="Select attribute...">
                                {mappedOption ? (
                                  <span className="flex items-center gap-2">
                                    <CheckIcon className="w-4 h-4 text-primary" />

                                    {mappedOption.label}
                                  </span>
                                ) : (
                                  "Select attribute..."
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">
                                  Don't map this column
                                </span>
                              </SelectItem>
                              {ATTRIBUTE_OPTIONS.map((option) => {
                                const isRequired =
                                  option.value.includes("name") ||
                                  option.value === "phone";
                                const isAlreadyMapped = Object.entries(
                                  columnMapping
                                ).some(
                                  ([col, val]) =>
                                    col !== column && val === option.value
                                );

                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={isAlreadyMapped}
                                  >
                                    <span className="flex items-center gap-2">
                                      {option.label}
                                      {isRequired && (
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      )}
                                      {isAlreadyMapped && (
                                        <span className="text-xs text-muted-foreground">
                                          (mapped)
                                        </span>
                                      )}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mapping Summary */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Mapping Summary</h4>
                  <span className="text-sm text-muted-foreground">
                    {Object.values(columnMapping).filter((v) => v).length} of{" "}
                    {csvColumns.length} columns mapped
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(columnMapping)
                    .filter(([_, value]) => value)
                    .map(([column, attribute]) => {
                      const option = ATTRIBUTE_OPTIONS.find(
                        (opt) => opt.value === attribute
                      );
                      return (
                        <div
                          key={column}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
                        >
                          <span className="font-medium">{column}</span>
                          <ArrowRightIcon className="w-3 h-3" />

                          <span>{option?.label}</span>
                          <button
                            onClick={() => handleMappingChange(column, null)}
                            className="ml-1 hover:bg-primary/20 rounded p-0.5"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Details Step */}
          {step === "details" && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="dataset-name">Dataset Name *</Label>
                <Input
                  id="dataset-name"
                  placeholder="e.g., Steel Fixers - London"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dataset-description">Description</Label>
                <Textarea
                  id="dataset-description"
                  placeholder="Brief description of this dataset..."
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Import Summary</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {csvData.length}
                    </span>{" "}
                    candidates will be imported
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {Object.values(columnMapping).filter((v) => v).length}
                    </span>{" "}
                    columns mapped
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step !== "method" && step !== "upload" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "details") setStep("mapping");
                  else if (step === "mapping") setStep("upload");
                }}
              >
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed()}>
              {step === "details" ? "Create Dataset" : "Next"}
              {step !== "details" && (
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
