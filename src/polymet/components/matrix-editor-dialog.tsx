import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquareIcon, PhoneIcon } from "lucide-react";

export interface MatrixGoal {
  id: string;
  name: string;
  type: "text" | "number" | "boolean";
  description: string;
}

export interface MatrixData {
  id: string;
  name: string;
  description: string;
  goals: MatrixGoal[];
  whatsappMessage?: string;
  callMessage?: string;
}

interface MatrixEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix?: MatrixData;
  onSave: (matrix: MatrixData) => void;
  availableChannels: string[];
}

export function MatrixEditorDialog({
  open,
  onOpenChange,
  matrix,
  onSave,
  availableChannels,
}: MatrixEditorDialogProps) {
  const [name, setName] = useState(matrix?.name || "");
  const [description, setDescription] = useState(matrix?.description || "");
  const [goals, setGoals] = useState<MatrixGoal[]>(matrix?.goals || []);
  const [whatsappMessage, setWhatsappMessage] = useState(
    matrix?.whatsappMessage || ""
  );
  const [callMessage, setCallMessage] = useState(matrix?.callMessage || "");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalType, setNewGoalType] = useState<"text" | "number" | "boolean">(
    "text"
  );
  const [newGoalDescription, setNewGoalDescription] = useState("");

  const hasWhatsApp = availableChannels.includes("WhatsApp");
  const hasCall = availableChannels.includes("Call");

  const addGoal = () => {
    if (newGoalName.trim() && newGoalDescription.trim()) {
      setGoals([
        ...goals,
        {
          id: `goal-${Date.now()}`,
          name: newGoalName,
          type: newGoalType,
          description: newGoalDescription,
        },
      ]);
      setNewGoalName("");
      setNewGoalType("text");
      setNewGoalDescription("");
      setShowAddGoal(false);
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleSave = () => {
    const matrixData: MatrixData = {
      id: matrix?.id || `matrix-${Date.now()}`,
      name,
      description,
      goals,
      whatsappMessage: hasWhatsApp ? whatsappMessage : undefined,
      callMessage: hasCall ? callMessage : undefined,
    };
    onSave(matrixData);
    onOpenChange(false);
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Text";
      case "number":
        return "Number";
      case "boolean":
        return "Yes/No";
      default:
        return type;
    }
  };

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-500/20 text-blue-400";
      case "number":
        return "bg-green-500/20 text-green-400";
      case "boolean":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#2a2a2a] border-[#3a3a3a] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {matrix ? "Edit Matrix" : "Create Matrix"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matrix-name" className="text-gray-300">
                Matrix Name
              </Label>
              <Input
                id="matrix-name"
                placeholder="e.g., Initial Outreach"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1f1f1f] border-[#3a3a3a] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matrix-description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="matrix-description"
                placeholder="Describe what this matrix will achieve..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="bg-[#1f1f1f] border-[#3a3a3a] text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>

          {/* Goals Section */}
          <div className="space-y-3">
            <Label className="text-gray-300">Goals to Collect</Label>
            {goals.length > 0 && (
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {goal.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${getGoalTypeColor(
                            goal.type
                          )}`}
                        >
                          {getGoalTypeLabel(goal.type)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(goal.id)}
                        className="h-6 px-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400">{goal.description}</p>
                  </div>
                ))}
              </div>
            )}

            {showAddGoal ? (
              <div className="p-4 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="goal-name" className="text-gray-300 text-sm">
                    Goal Name
                  </Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Prior Formwork Experience"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-type" className="text-gray-300 text-sm">
                    Goal Type
                  </Label>
                  <Select
                    value={newGoalType}
                    onValueChange={(value: any) => setNewGoalType(value)}
                  >
                    <SelectTrigger className="bg-[#2a2a2a] border-[#3a3a3a] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      <SelectItem
                        value="text"
                        className="text-white hover:bg-[#3a3a3a]"
                      >
                        Text - Free form text response
                      </SelectItem>
                      <SelectItem
                        value="number"
                        className="text-white hover:bg-[#3a3a3a]"
                      >
                        Number - Numeric value
                      </SelectItem>
                      <SelectItem
                        value="boolean"
                        className="text-white hover:bg-[#3a3a3a]"
                      >
                        Yes/No - Boolean response
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="goal-description"
                    className="text-gray-300 text-sm"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="goal-description"
                    placeholder="e.g., Ask candidate if they have prior formwork experience or Blue card"
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    rows={2}
                    className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={addGoal}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Add Goal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddGoal(false);
                      setNewGoalName("");
                      setNewGoalType("text");
                      setNewGoalDescription("");
                    }}
                    className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAddGoal(true)}
                className="w-full bg-[#1f1f1f] border-[#3a3a3a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
              >
                + Add Goal
              </Button>
            )}
          </div>

          {/* Message Templates */}
          <div className="space-y-4">
            <Label className="text-gray-300">Message Templates</Label>

            {hasWhatsApp && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MessageSquareIcon className="w-4 h-4" />

                  <span>WhatsApp Message</span>
                </div>
                <Textarea
                  placeholder="Enter the first WhatsApp message..."
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  rows={3}
                  className="bg-[#1f1f1f] border-[#3a3a3a] text-white placeholder:text-gray-500 resize-none"
                />
              </div>
            )}

            {hasCall && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <PhoneIcon className="w-4 h-4" />

                  <span>Call Script</span>
                </div>
                <Textarea
                  placeholder="Enter the first call message..."
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  rows={3}
                  className="bg-[#1f1f1f] border-[#3a3a3a] text-white placeholder:text-gray-500 resize-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#3a3a3a]">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !description.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Save Matrix
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
