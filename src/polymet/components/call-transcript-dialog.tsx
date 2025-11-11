import { XIcon, DownloadIcon, PlayIcon, SkipForwardIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CallRecord } from "@/polymet/data/campaigns-data";

interface CallTranscriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  call: CallRecord | null;
}

export function CallTranscriptDialog({
  open,
  onOpenChange,
  call,
}: CallTranscriptDialogProps) {
  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border border-border">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                {call.timestamp} phone_call
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Call ID: {call.callId}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Call Details */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Phone Call: </span>
              <span className="font-medium">
                {call.phoneFrom} -&gt; {call.phoneTo}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Duration: </span>
              <span className="font-medium">{call.duration}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Available to Work:{" "}
                </span>
                <span className="font-medium">
                  {call.availableToWork === null
                    ? "N/A"
                    : call.availableToWork
                      ? "Yes"
                      : "No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Interested: </span>
                <span className="font-medium">
                  {call.interested === null
                    ? "N/A"
                    : call.interested
                      ? "Yes"
                      : "No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Know Referee: </span>
                <span className="font-medium">
                  {call.knowReferee === null
                    ? "N/A"
                    : call.knowReferee
                      ? "Yes"
                      : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlayIcon className="w-5 h-5 fill-current" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>0:00</span>
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span>{call.duration}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SkipForwardIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DownloadIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <div className="space-y-3">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {call.transcript.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <span className="font-semibold capitalize">
                        {message.speaker}:
                      </span>
                      {message.speaker === "user" && (
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <DownloadIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="flex-1 leading-relaxed">{message.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
