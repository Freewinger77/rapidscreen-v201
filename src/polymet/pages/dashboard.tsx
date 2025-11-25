import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadCampaigns } from "@/lib/supabase-storage";
import { loadJobs } from "@/lib/supabase-storage";
import { useAutoSync } from "@/hooks/use-auto-sync";
import type { Campaign } from "@/polymet/data/campaigns-data";
import type { Job } from "@/polymet/data/jobs-data";
import {
  PhoneIcon,
  UsersIcon,
  DollarSignIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync backend data to frontend every 30 seconds
  useAutoSync(30000);

  // Load data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [loadedCampaigns, loadedJobs] = await Promise.all([
          loadCampaigns(),
          loadJobs(),
        ]);
        
        setCampaigns(loadedCampaigns);
        setJobs(loadedJobs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate metrics
  const totalCandidates = campaigns.reduce(
    (sum, c) => sum + c.totalCandidates,
    0
  );
  const totalCalls = campaigns.reduce(
    (sum, c) =>
      sum +
      c.candidates.reduce(
        (callSum, candidate) => callSum + candidate.calls.length,
        0
      ),
    0
  );
  const totalCost = totalCalls * 0.15; // $0.15 per call
  const contactedCandidates = campaigns.reduce(
    (sum, c) =>
      sum +
      c.candidates.filter((candidate) => candidate.callStatus !== "not_called")
        .length,
    0
  );

  // Donut chart data for contacted vs not contacted
  const contactedData = [
    {
      name: "Contacted",
      value: contactedCandidates,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Not Contacted",
      value: totalCandidates - contactedCandidates,
      color: "hsl(var(--chart-3))",
    },
  ];

  // Calculate interested vs not interested candidates
  const interestedCandidates = campaigns.reduce(
    (sum, c) =>
      sum +
      c.candidates.filter((candidate) => candidate.interested === true).length,
    0
  );
  const notInterestedCandidates = campaigns.reduce(
    (sum, c) =>
      sum +
      c.candidates.filter((candidate) => candidate.interested === false).length,
    0
  );
  const unknownInterest =
    totalCandidates - interestedCandidates - notInterestedCandidates;

  // Interest distribution data
  const interestData = [
    {
      name: "Interested",
      value: interestedCandidates,
      color: "hsl(var(--chart-2))",
    },
    {
      name: "Not Interested",
      value: notInterestedCandidates,
      color: "hsl(var(--chart-5))",
    },
    {
      name: "Unknown",
      value: unknownInterest,
      color: "hsl(var(--chart-3))",
    },
  ].filter((item) => item.value > 0);

  // Pickup rate vs call rate data
  const callRateData = [
    { name: "Mon", calls: 45, pickups: 32, rate: 71 },
    { name: "Tue", calls: 52, pickups: 38, rate: 73 },
    { name: "Wed", calls: 48, pickups: 35, rate: 73 },
    { name: "Thu", calls: 61, pickups: 47, rate: 77 },
    { name: "Fri", calls: 55, pickups: 41, rate: 75 },
    { name: "Sat", calls: 38, pickups: 28, rate: 74 },
    { name: "Sun", calls: 42, pickups: 30, rate: 71 },
  ];

  // WhatsApp engagement data
  const whatsappData = [
    { name: "Sent", value: 234, color: "hsl(var(--chart-2))" },
    { name: "Delivered", value: 198, color: "hsl(var(--chart-1))" },
    { name: "Read", value: 156, color: "hsl(var(--chart-5))" },
    { name: "Replied", value: 89, color: "hsl(var(--primary))" },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: "success",
      message: "Campaign 'Plumber - London' reached 78% response rate",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "call",
      message: "45 new calls completed for Site Engineer position",
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "candidate",
      message: "12 candidates added to Project Manager job",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "whatsapp",
      message: "WhatsApp campaign sent to 156 candidates",
      time: "2 hours ago",
    },
    {
      id: 5,
      type: "success",
      message: "3 candidates marked as hired for Site Engineer",
      time: "3 hours ago",
    },
    {
      id: 6,
      type: "error",
      message: "Campaign 'Steel Fixer' paused due to low response",
      time: "4 hours ago",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;

      case "error":
        return <XCircleIcon className="w-4 h-4 text-destructive" />;

      case "call":
        return <PhoneIcon className="w-4 h-4 text-chart-1" />;

      case "whatsapp":
        return <MessageSquareIcon className="w-4 h-4 text-chart-2" />;

      case "candidate":
        return <UsersIcon className="w-4 h-4 text-chart-5" />;

      default:
        return <ActivityIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Overview of your recruitment analytics and activities
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Call Costs
            </CardTitle>
            <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCalls} calls at $0.15 each
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contacted Candidates
            </CardTitle>
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contactedCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((contactedCandidates / totalCandidates) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <ActivityIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {campaigns.filter((c) => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {campaigns.length} total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Positions
            </CardTitle>
            <PhoneIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {jobs.reduce((sum, j) => sum + j.hired, 0)} candidates hired
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-full">
        {/* Contacted vs Not Contacted Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Contact Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[250px] md:h-[200px] lg:h-[280px] xl:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={contactedData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contactedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Interested vs Not Interested Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Global Candidate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[250px] md:h-[200px] lg:h-[280px] xl:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={interestData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {interestData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* WhatsApp Engagement Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[250px] md:h-[200px] lg:h-[280px] xl:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={whatsappData}
                  margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />

                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {whatsappData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Call Performance Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Call Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[250px] md:h-[200px] lg:h-[280px] xl:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={callRateData}
                  margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="pickups"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-6 md:px-8">
          <div className="space-y-4 md:space-y-5">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 md:gap-6 pb-4 md:pb-5 border-b border-border last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base md:text-lg font-medium text-foreground leading-relaxed mb-2">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClockIcon className="w-4 h-4 flex-shrink-0" />

                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
