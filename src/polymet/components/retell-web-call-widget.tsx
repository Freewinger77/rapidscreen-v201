/**
 * Retell Web Call Widget
 * 
 * Properly implements Retell web calls using their SDK
 */

import { useEffect, useRef, useState } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneIcon, PhoneOffIcon, MicIcon, MicOffIcon } from "lucide-react";

interface RetellWebCallWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessToken: string;
  callId: string;
  agentPrompt?: string;
  firstMessage?: string;
}

export function RetellWebCallWidget({
  open,
  onOpenChange,
  accessToken,
  callId,
  agentPrompt,
  firstMessage,
}: RetellWebCallWidgetProps) {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const retellClientRef = useRef<any>(null);

  useEffect(() => {
    if (!open || !accessToken) return;

    // Initialize call immediately with imported SDK
    initializeCall();

    return () => {
      // Cleanup
      if (retellClientRef.current) {
        try {
          retellClientRef.current.stopCall();
        } catch (e) {
          console.error('Error stopping call:', e);
        }
      }
    };
  }, [open, accessToken]);

  const initializeCall = async () => {
    try {
      console.log('=' .repeat(60));
      console.log('🎤 INITIALIZING RETELL WEB CALL');
      console.log('=' .repeat(60));
      console.log('📞 Call ID:', callId);
      console.log('🔑 Access Token:', accessToken.substring(0, 30) + '...');

      // Initialize Retell client with imported SDK
      const retellClient = new RetellWebClient();
      retellClientRef.current = retellClient;
      console.log('✅ RetellWebClient initialized');

      // Set up event listeners
      retellClient.on('call_started', () => {
        console.log('✅ Call started');
        setCallStatus('connected');
      });

      retellClient.on('call_ended', () => {
        console.log('📞 Call ended');
        setCallStatus('ended');
        setTimeout(() => onOpenChange(false), 2000);
      });

      retellClient.on('agent_start_talking', () => {
        console.log('🗣️ Agent speaking');
      });

      retellClient.on('agent_stop_talking', () => {
        console.log('🤫 Agent stopped');
      });

      retellClient.on('update', (update: any) => {
        // Handle transcript updates
        if (update.transcript) {
          setTranscript(update.transcript);
        }
      });

      retellClient.on('error', (error: any) => {
        console.error('❌ Retell error:', error);
        setCallStatus('ended');
      });

      // Start the call with the access token
      console.log('🚀 Starting web call with access token...');
      console.log('🔐 Token:', accessToken.substring(0, 30) + '...');
      
      await retellClient.startCall({
        accessToken: accessToken,
        sampleRate: 24000, // Recommended sample rate
        enableUpdate: true, // Enable transcript updates
      });

      console.log('✅ Web call connected and ready!');
      console.log('🎤 Microphone should be active');
      console.log('🗣️ AI should start speaking...');
      console.log('=' .repeat(60));

    } catch (error) {
      console.error('❌ Failed to initialize call:', error);
      setCallStatus('ended');
    }
  };

  const toggleMute = () => {
    if (retellClientRef.current) {
      if (isMuted) {
        retellClientRef.current.unmute();
      } else {
        retellClientRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const endCall = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    setCallStatus('ended');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Call Test - Live Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Call Status */}
          <div className="text-center py-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              callStatus === 'connected' ? 'bg-primary/20 animate-pulse' : 'bg-muted'
            }`}>
              <PhoneIcon className={`w-12 h-12 ${
                callStatus === 'connected' ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {callStatus === 'connecting' && 'Connecting to AI Agent...'}
              {callStatus === 'connected' && 'Call in Progress'}
              {callStatus === 'ended' && 'Call Ended'}
            </h3>

            {callStatus === 'connected' && firstMessage && (
              <p className="text-sm text-muted-foreground mb-4">
                AI will say: "{firstMessage}"
              </p>
            )}
          </div>

          {/* Transcript */}
          {transcript.length > 0 && (
            <div className="max-h-48 overflow-y-auto p-3 bg-muted rounded-lg space-y-2">
              <p className="text-xs font-medium mb-2">Live Transcript:</p>
              {transcript.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold capitalize">{msg.role}:</span> {msg.content}
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {callStatus === 'connected' && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleMute}
                  className="w-16 h-16 rounded-full"
                >
                  {isMuted ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  className="w-16 h-16 rounded-full"
                >
                  <PhoneOffIcon className="w-6 h-6" />
                </Button>
              </>
            )}
            {callStatus === 'ended' && (
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>

          {callStatus === 'connecting' && (
            <p className="text-xs text-center text-muted-foreground">
              Initializing call... Please allow microphone access when prompted.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

