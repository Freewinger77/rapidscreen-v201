import { Link } from "react-router-dom";
import { ClockIcon, BriefcaseIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Campaign } from "@/polymet/data/campaigns-data";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "draft":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return "text-primary";
    if (rate >= 40) return "text-chart-1";
    return "text-destructive";
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const endDate = new Date(campaign.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();
  const isExpired = daysRemaining < 0;

  return (
    <Link
      to={`/campaign/${campaign.id}`}
      className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {campaign.name}
          </h3>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Campaign End: {campaign.endDate}
              </span>
            </div>
            <Progress
              value={
                isExpired
                  ? 100
                  : Math.min(
                      ((new Date().getTime() -
                        new Date(campaign.startDate).getTime()) /
                        (new Date(campaign.endDate).getTime() -
                          new Date(campaign.startDate).getTime())) *
                        100,
                      100
                    )
              }
              className="h-2"
            />
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(campaign.status)}>
          {campaign.status === "active" ? "● Active" : campaign.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UsersIcon className="w-4 h-4" />

            <span>Candidates</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {campaign.totalCandidates}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BriefcaseIcon className="w-4 h-4" />

            <span>Hired</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{campaign.hired}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Response Rate</p>
          <p
            className={`text-2xl font-bold ${getResponseRateColor(campaign.responseRate)}`}
          >
            {campaign.responseRate}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />

          <span className="text-sm text-muted-foreground">
            {campaign.jobTitle}
          </span>
        </div>
        <div className="flex gap-2">
          {campaign.channels.map((channel) => (
            <Badge key={channel} variant="secondary" className="text-xs">
              {channel}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
