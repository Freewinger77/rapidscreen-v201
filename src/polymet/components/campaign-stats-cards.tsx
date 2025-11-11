import { PhoneOffIcon, PhoneMissedIcon, VoicemailIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CampaignStatsCardsProps {
  notCalled: number;
  noAnswer: number;
  voicemail: number;
}

export function CampaignStatsCards({
  notCalled,
  noAnswer,
  voicemail,
}: CampaignStatsCardsProps) {
  const stats = [
    {
      label: "Not Called",
      value: notCalled,
      icon: PhoneOffIcon,
      subtitle: "Ready to call",
    },
    {
      label: "No Answer",
      value: noAnswer,
      icon: PhoneMissedIcon,
      subtitle: "Retry eligible",
    },
    {
      label: "Voicemail",
      value: voicemail,
      icon: VoicemailIcon,
      subtitle: "Retry eligible",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="p-6 bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4" />

                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <div className="text-4xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
