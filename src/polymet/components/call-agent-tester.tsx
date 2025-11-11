/**
 * Retell AI Browser Tester - LIVE with Real Transcripts
 * Connects to actual Retell AI agents for browser-based testing
 */

import { useState, useEffect, useRef } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneIcon, PhoneOffIcon, MicIcon, MicOffIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RetellWebClient } from 'retell-client-js-sdk';

interface CallAgentTesterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callScript: string;
  agentId?: string | null;
  campaign?: any; // Full campaign data with matrices
  job?: any; // Job data
}

type TranscriptItem = {
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
};

export function CallAgentTester({
  open,
  onOpenChange,
  callScript,
  agentId,
  campaign,
  job,
}: CallAgentTesterProps) {
  useZoomDialog();
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testAgentId, setTestAgentId] = useState<string | null>(agentId || null);
  
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Retell Web Client
  useEffect(() => {
    if (open && !retellClientRef.current) {
      console.log('🔧 Initializing Retell Web Client...');
      retellClientRef.current = new RetellWebClient();
      
      // Event: Call started
      retellClientRef.current.on("call_started", () => {
        console.log("📞 Call started");
        setIsCallActive(true);
        setIsConnecting(false);
        
        // Start timer
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      });

      // Event: Call ended
      retellClientRef.current.on("call_ended", () => {
        console.log("📞 Call ended");
        handleEndCall();
      });

      // Event: Agent started talking
      retellClientRef.current.on("agent_start_talking", () => {
        console.log("🤖 Agent speaking...");
      });

      // Event: Agent stopped talking
      retellClientRef.current.on("agent_stop_talking", () => {
        console.log("🤖 Agent finished");
      });

      // Event: Live transcript updates (THIS IS THE KEY!)
      retellClientRef.current.on("update", (update) => {
        console.log("📝 Transcript update:", update);
        
        if (update.transcript && Array.isArray(update.transcript)) {
          const formattedTranscript: TranscriptItem[] = update.transcript.map((item: any) => ({
            role: item.role === 'agent' ? 'agent' : 'user',
            content: item.content,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            }),
          }));
          
          setTranscript(formattedTranscript);
        }
      });

      // Event: Error handling
      retellClientRef.current.on("error", (error) => {
        console.error("❌ Retell error:", error);
        setError(error.message || 'Call error occurred');
        handleEndCall();
      });

      // Event: Metadata
      retellClientRef.current.on("metadata", (metadata) => {
        console.log("📊 Call metadata:", metadata);
      });
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [open]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const startCall = async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript([]);
    setCallDuration(0);

    try {
      let currentAgentId = agentId;
      
      // ALWAYS create a fresh agent with current campaign configuration
      // This ensures the test uses YOUR latest questions and matrices
      if (campaign && job) {
        console.log('🤖 Creating FRESH test agent with YOUR current configuration...');
        console.log('━'.repeat(50));
        console.log('📝 Your Matrices:');
        campaign.matrices?.forEach((m: any, i: number) => {
          console.log(`   ${i + 1}. ${m.name}`);
          console.log(`      Call Script: ${m.callScript?.substring(0, 60)}...`);
        });
        console.log('🎯 Your Targets:');
        campaign.targets?.forEach((t: any, i: number) => {
          console.log(`   ${i + 1}. ${t.name} (${t.goalType})`);
        });
        console.log('━'.repeat(50));
        
        const { retellService } = await import('@/lib/retell-client');
        
        // Create new agent with current configuration
        currentAgentId = await retellService.createCampaignAgent(campaign, job);
        setTestAgentId(currentAgentId);
        
        console.log(`✅ Fresh test agent created: ${currentAgentId}`);
        console.log('   ✓ Uses YOUR job details');
        console.log('   ✓ Uses YOUR custom matrices');
        console.log('   ✓ Uses YOUR campaign targets');
        console.log('   ✓ Uses YOUR first message');
      } else if (!currentAgentId) {
        throw new Error('No agent configuration available. Please provide campaign and job data.');
      }
      
      console.log(`🤖 Starting browser call with agent: ${currentAgentId}`);
      console.log(`📍 Backend URL: http://localhost:3001/api/retell-get-web-token`);

      // Get web call token from backend
      const response = await fetch('http://localhost:3001/api/retell-get-web-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: currentAgentId,
        }),
      }).catch(fetchError => {
        console.error('Fetch error:', fetchError);
        throw new Error('Cannot connect to API server. Make sure webhook server is running (npm run webhook or npm run dev:all)');
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Token response:', data);
      
      if (!data.access_token || !data.call_id) {
        throw new Error('Invalid response from server - missing access_token or call_id');
      }

      const { access_token, call_id } = data;
      
      console.log(`✅ Got access token for call: ${call_id}`);
      console.log('🎤 Requesting microphone permission...');

      // Start call using Retell Web SDK
      if (retellClientRef.current) {
        await retellClientRef.current.startCall({
          accessToken: access_token,
          callId: call_id,
          sampleRate: 24000,
          emitRawAudioSamples: false,
        });

        console.log('🎉 Web call connected! Start speaking...');
      } else {
        throw new Error('Retell client not initialized');
      }
      
    } catch (err: any) {
      console.error('❌ Complete error:', err);
      
      let errorMessage = err.message || 'Failed to start test call';
      
      setError(errorMessage);
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    console.log('📞 Ending call...');
    
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    
    handleEndCall();
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setIsConnecting(false);
    setIsMuted(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleMute = () => {
    if (retellClientRef.current && isCallActive) {
      if (isMuted) {
        retellClientRef.current.unmute();
        console.log('🎤 Unmuted');
      } else {
        retellClientRef.current.mute();
        console.log('🔇 Muted');
      }
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    if (isCallActive) {
      endCall();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-zoom="true">
        <DialogHeader>
          <DialogTitle>Test Call Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-wrap text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Call Status */}
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all",
                isCallActive ? "bg-primary/20 animate-pulse" : isConnecting ? "bg-primary/10" : "bg-muted"
              )}
            >
              {isConnecting ? (
                <Loader2Icon className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <PhoneIcon
                  className={cn(
                    "w-12 h-12",
                    isCallActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
            </div>

            <h3 className="text-lg font-semibold mb-1">
              {isConnecting ? "Connecting..." : isCallActive ? "Call in Progress" : "Ready to Test"}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {isCallActive ? formatDuration(callDuration) : "Start a test call"}
            </p>

            {isCallActive && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Connected</span>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          {transcript.length > 0 && (
            <div className="border border-border rounded-lg p-4 max-h-[250px] overflow-y-auto space-y-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Live Transcript:
              </p>
              <div ref={scrollRef} className="space-y-2">
                {transcript.map((msg, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          msg.role === "agent" ? "text-orange-500" : "text-foreground"
                        )}
                      >
                        {msg.role === "agent" ? "Agent" : "You"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {!isCallActive && !isConnecting && (
              <Button
                onClick={startCall}
                className="bg-primary hover:bg-primary/90 gap-2"
                size="lg"
              >
                <PhoneIcon className="w-5 h-5" />
                Start Test Call
              </Button>
            )}

            {isCallActive && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
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

          {/* Instructions */}
          {!isCallActive && !isConnecting && (
            <p className="text-xs text-center text-muted-foreground">
              This is a simulated test call to preview how the agent will interact with candidates.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
