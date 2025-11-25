/**
 * Call History View Component
 * 
 * Displays call records from backend database
 */

import { useEffect, useState } from 'react';
import { getCallsByPhone } from '@/lib/backend-api';
import type { CallInfo } from '@/lib/backend-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneIcon, PlayIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CallHistoryViewProps {
  phoneNumber: string;
}

export function CallHistoryView({ phoneNumber }: CallHistoryViewProps) {
  const [calls, setCalls] = useState<CallInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallInfo | null>(null);

  useEffect(() => {
    async function loadCalls() {
      setLoading(true);
      setError(null);
      
      try {
        const callHistory = await getCallsByPhone(phoneNumber);
        setCalls(callHistory);
      } catch (err) {
        console.error('Failed to load calls:', err);
        setError('Failed to load call history');
      } finally {
        setLoading(false);
      }
    }

    loadCalls();
  }, [phoneNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading call history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PhoneIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No calls found for {phoneNumber}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Call records will appear here once calls are made
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {calls.map((call) => (
          <Card key={call.call_id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">
                    {new Date(call.called_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{call.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{call.status || 'N/A'}</p>
                  </div>
                  
                  {call.analysis && (
                    <>
                      {call.analysis.interested !== undefined && (
                        <div>
                          <p className="text-muted-foreground">Interested</p>
                          <p className="font-medium">{call.analysis.interested ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      )}
                      {call.analysis.available_to_work !== undefined && (
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">{call.analysis.available_to_work ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {call.transcript && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCall(call)}
                  >
                    View Transcript
                  </Button>
                )}
                {call.recording_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(call.recording_url!, '_blank')}
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                )}
              </div>
            </div>
            
            {call.analysis && Object.keys(call.analysis).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">AI Analysis</p>
                <div className="bg-muted p-3 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(call.analysis, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Transcript Dialog */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Call Transcript</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground">
                  {new Date(selectedCall.called_at).toLocaleString()}
                </p>
                <p className="text-muted-foreground">
                  Duration: {selectedCall.duration}
                </p>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="whitespace-pre-wrap bg-muted p-4 rounded text-sm">
                  {selectedCall.transcript}
                </div>
              </ScrollArea>
              
              {selectedCall.recording_url && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedCall.recording_url!, '_blank')}
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Play Recording
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

