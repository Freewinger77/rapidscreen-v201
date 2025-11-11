/**
 * Retell Agent Browser Tester
 * Allows testing Retell AI agents directly in the browser using Web SDK
 */

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PhoneIcon, 
  PhoneOffIcon, 
  MicIcon, 
  MicOffIcon,
  VolumeIcon,
  Volume2Icon,
  AlertCircleIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RetellAgentBrowserTesterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId?: string | null;
  prompt?: string;
}

export function RetellAgentBrowserTester({
  open,
  onOpenChange,
  agentId,
  prompt,
}: RetellAgentBrowserTesterProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  
  const retellWebClientRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load Retell Web SDK
    if (open && !retellWebClientRef.current) {
      loadRetellWebSDK();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [open]);

  const loadRetellWebSDK = () => {
    // Dynamically load Retell Web SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@1.0.0/dist/web-client.min.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Retell Web SDK loaded');
      if ((window as any).RetellWebClient) {
        retellWebClientRef.current = new (window as any).RetellWebClient();
      }
    };
    script.onerror = () => {
      setError('Failed to load Retell Web SDK');
    };
    document.body.appendChild(script);
  };

  const startCall = async () => {
    if (!agentId) {
      setError('No agent ID provided. Create a campaign first.');
      return;
    }

    if (!retellWebClientRef.current) {
      setError('Retell SDK not loaded yet. Please wait and try again.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get access token from your backend
      const response = await fetch('/api/retell/get-web-call-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get call token');
      }

      const { access_token, call_id } = await response.json();

      // Start call in browser
      await retellWebClientRef.current.startCall({
        accessToken: access_token,
        sampleRate: 24000,
        emitRawAudioSamples: false,
        callId: call_id,
      });

      setIsConnected(true);
      setIsConnecting(false);

      // Start call duration timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Listen to events
      retellWebClientRef.current.on('conversationStarted', () => {
        console.log('Conversation started');
        setTranscript([{ speaker: 'System', text: 'Call connected! Start speaking...' }]);
      });

      retellWebClientRef.current.on('audio', (audio: any) => {
        // Handle audio if needed
      });

      retellWebClientRef.current.on('conversationEnded', ({ code, reason }: any) => {
        console.log('Conversation ended:', code, reason);
        handleEndCall();
      });

      retellWebClientRef.current.on('error', (error: any) => {
        console.error('Retell error:', error);
        setError(error.message || 'Call error occurred');
        handleEndCall();
      });

      retellWebClientRef.current.on('update', (update: any) => {
        // Handle transcript updates
        if (update.transcript) {
          const newTranscript = update.transcript.map((item: any) => ({
            speaker: item.role === 'agent' ? 'AI Agent' : 'You',
            text: item.content,
          }));
          setTranscript(newTranscript);
        }
      });

    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(err.message || 'Failed to start call');
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall();
    }
    handleEndCall();
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setIsConnecting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const toggleMute = () => {
    if (retellWebClientRef.current && isConnected) {
      if (isMuted) {
        retellWebClientRef.current.unmute();
      } else {
        retellWebClientRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Agent in Browser</DialogTitle>
          <DialogDescription>
            Test your Retell AI agent directly in your browser before launching the campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!agentId && (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                No agent created yet. Launch your campaign first to create an agent.
              </AlertDescription>
            </Alert>
          )}

          {/* Call Controls */}
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {!isConnected && !isConnecting && (
              <Button
                onClick={startCall}
                disabled={!agentId}
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                <PhoneIcon className="h-6 w-6" />
              </Button>
            )}

            {isConnecting && (
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 animate-pulse flex items-center justify-center mx-auto mb-2">
                  <PhoneIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Connecting...</p>
              </div>
            )}

            {isConnected && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                  >
                    {isMuted ? <MicOffIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
                  </Button>

                  <div className="relative">
                    <Button
                      onClick={endCall}
                      size="lg"
                      variant="destructive"
                      className="h-16 w-16 rounded-full"
                    >
                      <PhoneOffIcon className="h-6 w-6" />
                    </Button>
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="default" className="bg-green-500">
                        {formatTime(callDuration)}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    disabled
                  >
                    <Volume2Icon className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium text-green-500">Connected - Speak now!</p>
                </div>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          {transcript.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3">Live Transcript</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {transcript.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded",
                        item.speaker === 'AI Agent'
                          ? "bg-primary/10 border-l-2 border-primary"
                          : "bg-muted border-l-2 border-muted-foreground"
                      )}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {item.speaker}
                      </p>
                      <p className="text-sm">{item.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Agent Prompt Preview */}
          {prompt && !isConnected && (
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-semibold mb-2">Agent Prompt Preview</h4>
              <ScrollArea className="h-[150px]">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {prompt.substring(0, 500)}...
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* Instructions */}
          {!isConnected && (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> Click the phone button to start a test call.
                The AI will call YOU in your browser (no phone needed). Speak naturally and test
                how the agent responds to your campaign questions.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

