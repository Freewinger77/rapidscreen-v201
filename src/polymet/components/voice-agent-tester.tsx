import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneIcon, PhoneOffIcon, MicIcon, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAgentTesterProps {
  callScript: string;
}

export function VoiceAgentTester({ callScript }: VoiceAgentTesterProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<
    Array<{ speaker: "agent" | "user"; text: string }>
  >([]);

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setTranscript([
      {
        speaker: "agent",
        text: callScript || "Hi, this is the AI agent. How can I help you?",
      },
    ]);

    // Simulate call duration counter
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Store interval ID for cleanup
    (window as any).callInterval = interval;
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    if ((window as any).callInterval) {
      clearInterval((window as any).callInterval);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const simulateSpeaking = () => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
      // Simulate agent response
      setTranscript((prev) => [
        ...prev,
        { speaker: "user", text: "Yes, I'm interested in the position." },
        {
          speaker: "agent",
          text: "Great! Can you tell me about your experience?",
        },
      ]);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!isCallActive ? (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <PhoneIcon className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Test Voice Agent
            </h3>
            <p className="text-sm text-gray-400">
              Click to start a test call with your configured AI agent
            </p>
          </div>
          <Button
            onClick={startCall}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <PhoneIcon className="w-5 h-5 mr-2" />
            Start Test Call
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Call Status */}
          <div className="text-center space-y-3">
            <div
              className={cn(
                "w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all",
                isSpeaking ? "bg-primary/30 animate-pulse" : "bg-primary/10"
              )}
            >
              {isSpeaking ? (
                <Volume2Icon className="w-12 h-12 text-primary" />
              ) : (
                <PhoneIcon className="w-12 h-12 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Call in Progress
              </h3>
              <p className="text-2xl font-mono text-primary mt-1">
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-2">
            {transcript.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "text-sm",
                  item.speaker === "agent" ? "text-primary" : "text-white"
                )}
              >
                <span className="font-medium">
                  {item.speaker === "agent" ? "Agent: " : "You: "}
                </span>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              onClick={simulateSpeaking}
              disabled={isSpeaking}
              className="flex-1 bg-[#1f1f1f] border border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
            >
              <MicIcon className="w-5 h-5 mr-2" />

              {isSpeaking ? "Speaking..." : "Speak"}
            </Button>
            <Button onClick={endCall} variant="destructive" className="flex-1">
              <PhoneOffIcon className="w-5 h-5 mr-2" />
              End Call
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This is a simulated test call. In production, this will connect to
            your AI agent.
          </p>
        </div>
      )}
    </div>
  );
}
