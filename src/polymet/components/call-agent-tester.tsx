import { useState, useEffect } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneIcon, PhoneOffIcon, MicIcon, MicOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallAgentTesterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callScript: string;
}

type ConversationMessage = {
  id: string;
  speaker: "agent" | "user";
  text: string;
  timestamp: string;
};

export function CallAgentTester({
  open,
  onOpenChange,
  callScript,
}: CallAgentTesterProps) {
  useZoomDialog();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  // Simulate call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setConversation([]);

    // Simulate agent starting the conversation
    setTimeout(() => {
      addMessage(
        "agent",
        callScript || "Hi, this is calling from the recruitment team."
      );
    }, 1000);

    // Simulate user response
    setTimeout(() => {
      addMessage("user", "Hello, yes I can hear you.");
    }, 3500);

    // Simulate agent follow-up
    setTimeout(() => {
      addMessage(
        "agent",
        "Great! Are you available to discuss this opportunity?"
      );
    }, 5500);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
  };

  const addMessage = (speaker: "agent" | "user", text: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setConversation((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        speaker,
        text,
        timestamp,
      },
    ]);
  };

  const handleClose = () => {
    endCall();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-zoom="true">
        <DialogHeader>
          <DialogTitle>Test Call Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Call Status */}
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all",
                isCallActive ? "bg-primary/20 animate-pulse" : "bg-muted"
              )}
            >
              <PhoneIcon
                className={cn(
                  "w-12 h-12",
                  isCallActive ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>

            <h3 className="text-lg font-semibold mb-1">
              {isCallActive ? "Call in Progress" : "Ready to Test"}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {isCallActive
                ? formatDuration(callDuration)
                : "Start a test call"}
            </p>

            {isCallActive && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

                <span>Connected</span>
              </div>
            )}
          </div>

          {/* Conversation Transcript */}
          {conversation.length > 0 && (
            <div className="border border-border rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Live Transcript:
              </p>
              {conversation.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        msg.speaker === "agent"
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {msg.speaker === "agent" ? "Agent" : "You"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{msg.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {!isCallActive ? (
              <Button
                onClick={startCall}
                className="bg-primary hover:bg-primary/90 gap-2"
                size="lg"
              >
                <PhoneIcon className="w-5 h-5" />
                Start Test Call
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "w-12 h-12 rounded-full",
                    isMuted && "bg-muted"
                  )}
                >
                  {isMuted ? (
                    <MicOffIcon className="w-5 h-5" />
                  ) : (
                    <MicIcon className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  onClick={endCall}
                  className="bg-destructive hover:bg-destructive/90 gap-2 w-12 h-12 rounded-full"
                  size="icon"
                >
                  <PhoneOffIcon className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            This is a simulated test call to preview how the agent will interact
            with candidates.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
