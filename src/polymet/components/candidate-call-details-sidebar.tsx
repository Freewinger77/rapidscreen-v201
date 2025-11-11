/**
 * Candidate Call Details Sidebar
 * Shows transcript, recording, AI analysis for a specific candidate's call
 */

import { useState, useEffect } from 'react';
import { X, PlayIcon, DownloadIcon, ClockIcon, PhoneIcon, TrendingUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface CallDetailsProps {
  candidateId: string;
  candidateName: string;
  onClose: () => void;
}

interface CallDetails {
  retell_call_id: string;
  call_status: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  phone_number: string;
  analysis?: {
    available_to_work: boolean;
    interested: boolean;
    know_referee: boolean;
    custom_responses: Record<string, string>;
    call_summary: string;
    sentiment_score: number;
    transcript_url?: string;
    recording_url?: string;
    key_points: string[];
    next_steps?: string;
  };
}

export function CandidateCallDetailsSidebar({ candidateId, candidateName, onClose }: CallDetailsProps) {
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<Array<{role: string; content: string}>>([]);

  useEffect(() => {
    loadCallDetails();
  }, [candidateId]);

  const loadCallDetails = async () => {
    setLoading(true);

    try {
      // Get call record
      const { data: call } = await supabase
        .from('retell_calls')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!call) {
        setLoading(false);
        return;
      }

      // Get call analysis
      const { data: analysis } = await supabase
        .from('retell_call_analysis')
        .select('*')
        .eq('retell_call_id', call.retell_call_id)
        .single();

      setCallDetails({
        ...call,
        analysis: analysis || undefined,
      });

      // Load transcript if URL available
      if (analysis?.transcript_url) {
        fetchTranscript(analysis.transcript_url);
      }

    } catch (error) {
      console.error('Error loading call details:', error);
    }

    setLoading(false);
  };

  const fetchTranscript = async (url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setTranscript(data.transcript || []);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 0.8) return 'Very Positive';
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    if (score >= 0.2) return 'Negative';
    return 'Very Negative';
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    if (score >= 0.2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[600px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold">{candidateName}</h2>
            <p className="text-sm text-muted-foreground">Call Details & Analysis</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {callDetails && (
          <div className="flex items-center gap-2 mt-4">
            <Badge variant={callDetails.call_status === 'completed' ? 'default' : 'secondary'}>
              {callDetails.call_status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDuration(callDetails.duration_seconds)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(callDetails.started_at)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading call details...</p>
          </div>
        ) : !callDetails ? (
          <div className="text-center py-12">
            <PhoneIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No call data available</p>
            <p className="text-xs text-muted-foreground mt-2">
              This candidate hasn't been called yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            {callDetails.analysis && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border border-border bg-card">
                  <div className={`text-2xl font-bold ${callDetails.analysis.available_to_work ? 'text-green-500' : 'text-red-500'}`}>
                    {callDetails.analysis.available_to_work ? '✓' : '✗'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Available</p>
                </div>
                <div className="text-center p-4 rounded-lg border border-border bg-card">
                  <div className={`text-2xl font-bold ${callDetails.analysis.interested ? 'text-green-500' : 'text-red-500'}`}>
                    {callDetails.analysis.interested ? '✓' : '✗'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Interested</p>
                </div>
                <div className="text-center p-4 rounded-lg border border-border bg-card">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((callDetails.analysis.sentiment_score || 0) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Sentiment</p>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {callDetails.analysis?.call_summary && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  AI Summary
                </h3>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm">{callDetails.analysis.call_summary}</p>
                </div>
              </div>
            )}

            {/* Sentiment Score */}
            {callDetails.analysis?.sentiment_score !== undefined && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Sentiment Analysis</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{getSentimentLabel(callDetails.analysis.sentiment_score)}</span>
                    <span className="font-medium">{Math.round(callDetails.analysis.sentiment_score * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getSentimentColor(callDetails.analysis.sentiment_score)} transition-all`}
                      style={{ width: `${callDetails.analysis.sentiment_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Key Points */}
            {callDetails.analysis?.key_points && callDetails.analysis.key_points.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {callDetails.analysis.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Custom Responses */}
            {callDetails.analysis?.custom_responses && Object.keys(callDetails.analysis.custom_responses).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Campaign Questions</h3>
                <div className="space-y-3">
                  {Object.entries(callDetails.analysis.custom_responses).map(([question, answer]) => (
                    <div key={question} className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{question}</p>
                      <p className="text-sm">{answer as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Call Timeline */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Call Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">{formatDateTime(callDetails.started_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ended:</span>
                  <span className="font-medium">{formatDateTime(callDetails.ended_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formatDuration(callDetails.duration_seconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{callDetails.phone_number}</span>
                </div>
              </div>
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Live Transcript</h3>
                <div className="space-y-2 border border-border rounded-lg p-4 bg-muted/30 max-h-[300px] overflow-y-auto">
                  {transcript.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        item.role === 'agent'
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'bg-background border-l-2 border-muted-foreground'
                      }`}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {item.role === 'agent' ? 'AI Agent' : 'Candidate'}
                      </p>
                      <p className="text-sm">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {callDetails.analysis?.recording_url && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(callDetails.analysis?.recording_url, '_blank')}
                >
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Play Recording
                </Button>
              )}
              {callDetails.analysis?.transcript_url && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(callDetails.analysis?.transcript_url, '_blank')}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Transcript
                </Button>
              )}
            </div>

            {/* Next Steps */}
            {callDetails.analysis?.next_steps && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary">
                <h4 className="text-sm font-semibold text-primary mb-2">Recommended Next Steps</h4>
                <p className="text-sm">{callDetails.analysis.next_steps}</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

