/**
 * Campaign Live Stats Component
 * 
 * Displays real-time statistics from backend database
 * Auto-refreshes every 30 seconds
 */

import { useEffect, useState } from 'react';
import { getCampaignLiveStats } from '@/lib/backend-sync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityIcon, MessageSquareIcon, PhoneIcon, UsersIcon, CheckCircleIcon } from 'lucide-react';

interface CampaignLiveStatsProps {
  campaignId: string;
  campaignName: string;
}

export function CampaignLiveStats({ campaignId, campaignName }: CampaignLiveStatsProps) {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getCampaignLiveStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getCampaignLiveStats(campaignId);
        setStats(data);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to load campaign stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [campaignId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No backend data available for this campaign
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Live Statistics</CardTitle>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Updated {lastRefresh.toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Total Contacted */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Contacted</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalContacted}</p>
          </div>

          {/* Active Conversations */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.activeConversations}</p>
          </div>

          {/* Messages Sent */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <p className="text-2xl font-bold">{stats.messagesSent}</p>
          </div>

          {/* Calls Made */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Calls</p>
            </div>
            <p className="text-2xl font-bold">{stats.callsMade}</p>
          </div>
        </div>

        {/* Objectives Achieved */}
        {Object.keys(stats.objectivesAchieved).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Objectives Achieved</p>
            </div>
            <div className="space-y-2">
              {Object.entries(stats.objectivesAchieved).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Activity */}
        {stats.lastActivity && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Last activity: {new Date(stats.lastActivity).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

