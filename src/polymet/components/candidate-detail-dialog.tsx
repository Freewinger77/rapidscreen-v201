import { useState, useEffect } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import { AddNoteDialog } from "@/polymet/components/add-note-dialog";
import { getChatHistoryByPhone, getCallsByPhone, getSessionByPhone } from "@/lib/backend-api";
import {
  PhoneIcon,
  MessageSquareIcon,
  ClockIcon,
  StickyNoteIcon,
  MessageCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  CheckCircleIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import type { CampaignCandidate } from "@/polymet/data/campaigns-data";
import type { CandidateNote } from "@/polymet/data/jobs-data";

interface CandidateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CampaignCandidate | null;
  defaultTab?: "timeline" | "conversation" | "notes";
  visibleTabs?: Array<"timeline" | "conversation" | "notes">;
  onNotesUpdate?: (candidateId: string, notes: CandidateNote[]) => void;
}

export function CandidateDetailDialog({
  open,
  onOpenChange,
  candidate,
  defaultTab = "timeline",
  visibleTabs = ["timeline", "conversation", "notes"],
  onNotesUpdate,
}: CandidateDetailDialogProps) {
  useZoomDialog();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState<CandidateNote[]>([]);
  const [editingNote, setEditingNote] = useState<CandidateNote | null>(null);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [editedCandidate, setEditedCandidate] =
    useState<CampaignCandidate | null>(null);
  
  // Backend data
  const [backendChatHistory, setBackendChatHistory] = useState<any[]>([]);
  const [backendCalls, setBackendCalls] = useState<any[]>([]);
  const [backendSession, setBackendSession] = useState<any>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);

  // Reset to default tab when dialog opens and load notes + backend data
  useEffect(() => {
    if (open && candidate) {
      setActiveTab(defaultTab);
      setCandidateNotes(candidate?.notes || []);
      setEditedCandidate(candidate);
      
      // Load backend data
      loadBackendData(candidate.telMobile);
    }
  }, [open, defaultTab, candidate]);

  async function loadBackendData(phoneNumber: string) {
    setLoadingBackend(true);
    try {
      const [chatHistory, calls, session] = await Promise.all([
        getChatHistoryByPhone(phoneNumber),
        getCallsByPhone(phoneNumber),
        getSessionByPhone(phoneNumber),
      ]);
      
      setBackendChatHistory(chatHistory);
      setBackendCalls(calls);
      setBackendSession(session);
      
      console.log('✅ Backend data loaded:', {
        messages: chatHistory.length,
        calls: calls.length,
        session: session?.session_id
      });
    } catch (error) {
      console.error('Failed to load backend data:', error);
    } finally {
      setLoadingBackend(false);
    }
  }

  if (!candidate) return null;

  const displayCandidate = editedCandidate || candidate;
  const fullName = `${displayCandidate.forename} ${displayCandidate.surname}`;
  const whatsappMessages = candidate.whatsappMessages || [];
  const calls = candidate.calls || [];

  const handleSaveNote = (note: Omit<CandidateNote, "id" | "timestamp">) => {
    if (editingNote) {
      // Update existing note
      const updatedNotes = candidateNotes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              ...note,
              timestamp: new Date().toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : n
      );
      setCandidateNotes(updatedNotes);
      if (candidate && onNotesUpdate) {
        onNotesUpdate(candidate.id, updatedNotes);
      }
      setEditingNote(null);
    } else {
      // Create new note
      const newNote: CandidateNote = {
        ...note,
        id: `n${Date.now()}`,
        timestamp: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      const updatedNotes = [newNote, ...candidateNotes];
      setCandidateNotes(updatedNotes);
      if (candidate && onNotesUpdate) {
        onNotesUpdate(candidate.id, updatedNotes);
      }
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = candidateNotes.filter((n) => n.id !== noteId);
    setCandidateNotes(updatedNotes);
    if (candidate && onNotesUpdate) {
      onNotesUpdate(candidate.id, updatedNotes);
    }
  };

  const handleEditNote = (note: CandidateNote) => {
    setEditingNote(note);
    setShowAddNoteDialog(true);
  };

  const handleCloseAddNoteDialog = () => {
    setShowAddNoteDialog(false);
    setEditingNote(null);
  };

  // Build timeline from all events
  const timelineEvents = [
    ...whatsappMessages.map((msg) => ({
      id: msg.id,
      type: "whatsapp" as const,
      timestamp: msg.timestamp,
      description:
        msg.sender === "agent"
          ? `WhatsApp sent: "${msg.text.substring(0, 50)}..."`
          : `Candidate replied: "${msg.text.substring(0, 50)}..."`,
    })),
    ...calls.map((call) => ({
      id: call.id,
      type: "call" as const,
      timestamp: call.timestamp,
      description: `Phone call - ${call.duration} - ${call.callStatus || "completed"}`,
    })),
    ...candidateNotes.map((note) => ({
      id: note.id,
      type: "note" as const,
      timestamp: note.timestamp,
      description: note.text,
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-background border border-border"
        data-zoom="true"
      >
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {!isEditingCandidate ? (
                  <>
                    <DialogTitle className="text-2xl font-semibold">
                      {fullName}
                    </DialogTitle>
                    <span className="px-2 py-1 bg-chart-1/20 text-chart-1 text-xs rounded border border-chart-1/30">
                      Not Contacted
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsEditingCandidate(true)}
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedCandidate?.forename || ""}
                        onChange={(e) =>
                          setEditedCandidate((prev) =>
                            prev ? { ...prev, forename: e.target.value } : null
                          )
                        }
                        className="h-9 w-32"
                        placeholder="First name"
                      />

                      <Input
                        value={editedCandidate?.surname || ""}
                        onChange={(e) =>
                          setEditedCandidate((prev) =>
                            prev ? { ...prev, surname: e.target.value } : null
                          )
                        }
                        className="h-9 w-32"
                        placeholder="Last name"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={() => setIsEditingCandidate(false)}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditedCandidate(candidate);
                        setIsEditingCandidate(false);
                      }}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-muted-foreground">
                      Phone number:{" "}
                    </span>
                    {!isEditingCandidate ? (
                      <span className="font-medium">
                        {displayCandidate.telMobile}
                      </span>
                    ) : (
                      <Input
                        value={editedCandidate?.telMobile || ""}
                        onChange={(e) =>
                          setEditedCandidate((prev) =>
                            prev ? { ...prev, telMobile: e.target.value } : null
                          )
                        }
                        className="h-7 w-40 inline-flex"
                        placeholder="Phone number"
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    {!isEditingCandidate ? (
                      <span className="font-medium">
                        {displayCandidate.email || "N/A"}
                      </span>
                    ) : (
                      <Input
                        value={editedCandidate?.email || ""}
                        onChange={(e) =>
                          setEditedCandidate((prev) =>
                            prev ? { ...prev, email: e.target.value } : null
                          )
                        }
                        className="h-7 w-48 inline-flex"
                        placeholder="Email address"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {displayCandidate.experience && (
                    <div>
                      <span className="text-muted-foreground">
                        Experience:{" "}
                      </span>
                      <span className="font-medium">
                        {displayCandidate.experience}
                      </span>
                    </div>
                  )}
                  {displayCandidate.lastContact && (
                    <div>
                      <span className="text-muted-foreground">
                        Last Contact:{" "}
                      </span>
                      <span className="font-medium">
                        {displayCandidate.lastContact}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList
            className={`grid w-full bg-muted`}
            style={{
              gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)`,
            }}
          >
            {visibleTabs.includes("timeline") && (
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
            )}
            {visibleTabs.includes("conversation") && (
              <TabsTrigger
                value="conversation"
                className="data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                <MessageCircleIcon className="w-4 h-4 mr-2" />
                Conversation
              </TabsTrigger>
            )}
            {visibleTabs.includes("notes") && (
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                <StickyNoteIcon className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
            )}
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recruiter Notes</h3>
                <Button
                  onClick={() => setShowAddNoteDialog(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {candidateNotes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <StickyNoteIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />

                      <p>No notes yet. Add your first note above.</p>
                    </div>
                  )}
                  {candidateNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 border border-border rounded-lg bg-card space-y-2 group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          {note.actionType && (
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded capitalize">
                              {note.actionType}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {note.timestamp}
                          </span>
                          {note.author && (
                            <span className="text-xs text-muted-foreground">
                              • {note.author}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditNote(note)}
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{note.text}</p>
                      {note.actionDate && (
                        <div className="text-xs text-muted-foreground">
                          Scheduled for: {note.actionDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Timeline Tab - Events from Backend */}
          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Live from backend</span>
                </div>
              </div>

              <ScrollArea className="h-[450px] pr-4">
                {loadingBackend ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading timeline...</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>
                    
                    <div className="space-y-6 relative">
                      {/* WhatsApp Chat Initiated */}
                      {backendChatHistory.length > 0 && (
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-green-500 flex-shrink-0">
                            <MessageSquareIcon className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-base font-medium leading-relaxed mb-2">
                              WhatsApp campaign sent to candidate
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ClockIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{backendSession?.created_at ? new Date(backendSession.created_at).toLocaleString() : 'Just now'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Call Made Events */}
                      {backendCalls.map((call, idx) => (
                        <div key={call.call_id} className="flex items-start gap-4">
                          <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-chart-1 flex-shrink-0">
                            <PhoneIcon className="w-4 h-4 text-chart-1" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-base font-medium leading-relaxed mb-2">
                              {call.duration ? `Call completed` : 'Phone call initiated'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <ClockIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{new Date(call.called_at).toLocaleString()}</span>
                            </div>
                            {call.duration && (
                              <p className="text-sm text-muted-foreground">Duration: {call.duration}</p>
                            )}
                            {call.status && (
                              <p className="text-sm text-muted-foreground">Status: {call.status}</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Session Created */}
                      {backendSession && (
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary flex-shrink-0">
                            <CheckCircleIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-base font-medium leading-relaxed mb-2">
                              Campaign started
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ClockIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{new Date(backendSession.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!backendSession && !backendChatHistory.length && !backendCalls.length && (
                      <div className="text-center py-12 text-muted-foreground">
                        <ClockIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No activity yet. Campaign will create timeline events.</p>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Conversation Tab - Combined WhatsApp + Calls (Merged Chronologically) */}
          <TabsContent value="conversation" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {backendChatHistory.length > 0 ? "WhatsApp Conversation" : backendCalls.length > 0 ? "Call Transcript" : "Conversation"}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Live from backend</span>
                </div>
              </div>

              <ScrollArea className="h-[450px] pr-4">
                {loadingBackend ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading conversation...</p>
                  </div>
                ) : backendChatHistory.length === 0 && backendCalls.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No conversation history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* WhatsApp Messages */}
                    {backendChatHistory.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 border-t border-border"></div>
                          <span className="text-xs text-muted-foreground">
                            WhatsApp • {backendSession?.created_at ? new Date(backendSession.created_at).toLocaleString() : 'Just now'}
                          </span>
                          <div className="flex-1 border-t border-border"></div>
                        </div>
                        <div className="space-y-3">
                          {backendChatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender === "user"
                                  ? "bg-muted text-foreground"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                              <div
                                className={`flex items-center gap-1 mt-1 text-xs ${
                                  msg.sender === "user"
                                    ? "text-muted-foreground"
                                    : "text-primary-foreground/70"
                                }`}
                              >
                                <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</span>
                                {msg.status && (
                                  <span>• {msg.status}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Call Transcripts - Merged After WhatsApp if no response */}
                    {backendCalls.length > 0 && (
                      <div className="mt-6">
                        {backendCalls.map((call) => (
                          <div key={call.call_id} className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex-1 border-t border-border"></div>
                              <span className="text-xs text-muted-foreground">
                                Phone Call • {new Date(call.called_at).toLocaleString()}
                                {call.duration && ` • Duration: ${call.duration}`}
                              </span>
                              <div className="flex-1 border-t border-border"></div>
                            </div>
                            {call.transcript && (
                              <div className="space-y-2">
                                {call.transcript.split('\n').map((line: string, i: number) => {
                                  if (!line.trim()) return null;
                                  const isAgent = line.toLowerCase().includes('agent:');
                                  const isUser = line.toLowerCase().includes('user:') || line.toLowerCase().includes('you:');
                                  
                                  return (
                                    <div
                                      key={i}
                                      className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                                    >
                                      <div
                                        className={`max-w-[70%] rounded-lg p-3 text-sm ${
                                          isUser
                                            ? "bg-muted text-foreground"
                                            : "bg-chart-1/20 text-foreground border border-chart-1/30"
                                        }`}
                                      >
                                        {line}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

        </Tabs>
      </DialogContent>

      {/* Nested Add Note Dialog */}
      <AddNoteDialog
        open={showAddNoteDialog}
        onOpenChange={handleCloseAddNoteDialog}
        candidateName={fullName}
        onSave={handleSaveNote}
        editingNote={editingNote}
      />
    </Dialog>
  );
}
