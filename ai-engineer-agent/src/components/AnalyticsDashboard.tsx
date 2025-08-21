// Advanced Analytics Dashboard Components
// React components for comprehensive analytics, reporting, and business intelligence

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Download, 
  Filter, 
  Calendar,
  Users,
  Activity,
  Zap,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Share2,
  Settings,
  RefreshCw,
  Bell,
  Play,
  Pause
} from "lucide-react";

import { useAdvancedAnalytics } from '../lib/advanced-analytics';
import { 
  AnalyticsMetrics, 
  TimeRange, 
  UserBehaviorAnalytics,
  CustomReport,
  AlertRule,
  DashboardWidget,
  AnalyticsDashboard 
} from '../lib/advanced-analytics';

interface AnalyticsDashboardProps {
  teamId?: string;
}

export function AnalyticsDashboard({ teamId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    period: 'day'
  });
  
  const { metrics, realtimeMetrics, loading, error, generateReport, createAlert } = useAdvancedAnalytics(timeRange, teamId);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Analytics Sidebar */}
      <div className="w-80 border-r border-border bg-card/50">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Analytics Hub</h2>
              <p className="text-xs text-muted-foreground">Advanced insights & reporting</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Live Users</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{realtimeMetrics?.activeUsers || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Calls/min</span>
              <span className="text-sm font-medium">{realtimeMetrics?.apiCallsPerMinute || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className="text-sm font-medium">{realtimeMetrics?.responseTime || 0}ms</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="p-4 border-b border-border">
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select 
              value={`${timeRange.period}`} 
              onValueChange={(value) => {
                const days = value === 'day' ? 30 : value === 'week' ? 84 : value === 'month' ? 365 : 30;
                setTimeRange({
                  start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                  end: new Date(),
                  period: value as any
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 30 Days</SelectItem>
                <SelectItem value="week">Last 12 Weeks</SelectItem>
                <SelectItem value="month">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setShowReportModal(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setShowAlertModal(true)}
          >
            <Bell className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Share2 className="mr-2 h-4 w-4" />
            Share Dashboard
          </Button>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your AI automation platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1">
              <AnalyticsOverview metrics={metrics} loading={loading} />
            </TabsContent>

            <TabsContent value="performance" className="flex-1">
              <PerformanceAnalytics metrics={metrics} />
            </TabsContent>

            <TabsContent value="users" className="flex-1">
              <UserAnalytics metrics={metrics} />
            </TabsContent>

            <TabsContent value="business" className="flex-1">
              <BusinessAnalytics metrics={metrics} />
            </TabsContent>

            <TabsContent value="realtime" className="flex-1">
              <RealtimeAnalytics realtimeMetrics={realtimeMetrics} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <ReportGenerationModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)}
        onGenerate={generateReport}
      />
      <AlertCreationModal 
        isOpen={showAlertModal} 
        onClose={() => setShowAlertModal(false)}
        onCreate={createAlert}
      />
    </div>
  );
}

function AnalyticsOverview({ metrics, loading }: { metrics: AnalyticsMetrics | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          change="+12%"
          trend="up"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          change="+8%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Workflows Generated"
          value={metrics.workflowsGenerated}
          change="+23%"
          trend="up"
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          title="API Usage"
          value={`${metrics.apiUsage.quotaUtilization}%`}
          change="-2%"
          trend="down"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Completion Trend</CardTitle>
            <CardDescription>Projects completed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Daily active users and session duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Categories</CardTitle>
            <CardDescription>Distribution of workflow types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Monthly cost breakdown and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Gemini API</span>
                <div className="flex items-center gap-2">
                  <Progress value={45} className="w-20" />
                  <span className="text-sm font-medium">$1,234</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Infrastructure</span>
                <div className="flex items-center gap-2">
                  <Progress value={30} className="w-20" />
                  <span className="text-sm font-medium">$856</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <div className="flex items-center gap-2">
                  <Progress value={15} className="w-20" />
                  <span className="text-sm font-medium">$234</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Other</span>
                <div className="flex items-center gap-2">
                  <Progress value={10} className="w-20" />
                  <span className="text-sm font-medium">$123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Overview</CardTitle>
          <CardDescription>Current system status and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">System Uptime</span>
              </div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Average Response Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.apiUsage.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">Excellent performance</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{(metrics.apiUsage.errorRate * 100).toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Within acceptable limits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceAnalytics({ metrics }: { metrics: AnalyticsMetrics | null }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Avg. Project Completion"
          value={`${metrics.performanceMetrics.averageProjectCompletionTime} days`}
          change="-15%"
          trend="down"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Blueprint Generation"
          value={`${metrics.performanceMetrics.blueprintGenerationTime}s`}
          change="-8%"
          trend="down"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="User Satisfaction"
          value={`${metrics.performanceMetrics.userSatisfactionScore}/10`}
          change="+0.3"
          trend="up"
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>API response times over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Response time trend chart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate Analysis</CardTitle>
            <CardDescription>Error patterns and recovery metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Error analysis chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Breakdown</CardTitle>
          <CardDescription>Detailed performance metrics by component</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">AI Agent Response</div>
                  <div className="text-sm text-muted-foreground">Average processing time</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">1.2s</div>
                <div className="text-sm text-green-600">-15% faster</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Blueprint Generation</div>
                  <div className="text-sm text-muted-foreground">Time to create technical specs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">3.4s</div>
                <div className="text-sm text-blue-600">-8% faster</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Activity className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Workflow Generation</div>
                  <div className="text-sm text-muted-foreground">n8n JSON template creation</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">2.8s</div>
                <div className="text-sm text-purple-600">-12% faster</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserAnalytics({ metrics }: { metrics: AnalyticsMetrics | null }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Daily Active Users"
          value={metrics.userEngagement.dailyActiveUsers}
          change="+8%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Session Duration"
          value={`${Math.round(metrics.userEngagement.sessionDuration / 60)}m`}
          change="+12%"
          trend="up"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Projects per User"
          value={metrics.userEngagement.projectsPerUser.toFixed(1)}
          change="+5%"
          trend="up"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Collaboration Rate"
          value={`${metrics.userEngagement.collaborationRate}%`}
          change="+15%"
          trend="up"
          icon={<Share2 className="h-4 w-4" />}
        />
      </div>

      {/* User Behavior Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement Trends</CardTitle>
            <CardDescription>Daily, weekly, and monthly active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">User engagement chart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Adoption</CardTitle>
            <CardDescription>Most and least used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.userEngagement.featureAdoption.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{feature.feature}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={feature.adoptionRate * 100} className="w-20" />
                    <span className="text-sm font-medium">{(feature.adoptionRate * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Segments */}
      <Card>
        <CardHeader>
          <CardTitle>User Segments</CardTitle>
          <CardDescription>User classification based on behavior and usage patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">23%</div>
              <div className="text-sm font-medium">Power Users</div>
              <div className="text-xs text-muted-foreground">High engagement, multiple projects</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">45%</div>
              <div className="text-sm font-medium">Regular Users</div>
              <div className="text-xs text-muted-foreground">Consistent usage, moderate projects</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">22%</div>
              <div className="text-sm font-medium">Occasional Users</div>
              <div className="text-xs text-muted-foreground">Sporadic usage, few projects</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-600">10%</div>
              <div className="text-sm font-medium">New Users</div>
              <div className="text-xs text-muted-foreground">Recently joined, exploring features</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessAnalytics({ metrics }: { metrics: AnalyticsMetrics | null }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue Generated"
          value={`$${metrics.businessMetrics.revenueGenerated.toLocaleString()}`}
          change="+24%"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Cost Savings"
          value={`$${metrics.businessMetrics.costSavings.toLocaleString()}`}
          change="+18%"
          trend="up"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <MetricCard
          title="Customer Retention"
          value={`${metrics.businessMetrics.customerRetention}%`}
          change="+3%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Time to Value"
          value={`${metrics.businessMetrics.timeToValue} days`}
          change="-2 days"
          trend="down"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* ROI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ROI by Project Type</CardTitle>
            <CardDescription>Return on investment across different automation categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.businessMetrics.roiCalculated.map((roi, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{roi.projectTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {roi.timeSaved}h saved • ${roi.costSaved.toLocaleString()} cost reduction
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{roi.estimatedROI}%</div>
                    <div className="text-xs text-muted-foreground">{roi.paybackPeriod}mo payback</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Gains</CardTitle>
            <CardDescription>Measurable improvements in efficiency and output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Time Saved per Project</span>
                <div className="flex items-center gap-2">
                  <Progress value={75} className="w-20" />
                  <span className="text-sm font-medium">{metrics.businessMetrics.productivityGains.averageTimeSavedPerProject}h</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manual Process Reduction</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-20" />
                  <span className="text-sm font-medium">{metrics.businessMetrics.productivityGains.manualProcessReduction}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Reduction</span>
                <div className="flex items-center gap-2">
                  <Progress value={90} className="w-20" />
                  <span className="text-sm font-medium">{metrics.businessMetrics.productivityGains.errorReductionPercentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Development Speed Increase</span>
                <div className="flex items-center gap-2">
                  <Progress value={70} className="w-20" />
                  <span className="text-sm font-medium">{metrics.businessMetrics.productivityGains.developmentSpeedIncrease}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Business Impact Summary</CardTitle>
          <CardDescription>Overall business value and impact metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                ${metrics.businessMetrics.costSavings.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-green-800">Total Cost Savings</div>
              <div className="text-xs text-green-600">Annually across all projects</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.businessMetrics.productivityGains.averageTimeSavedPerProject * metrics.totalProjects}h
              </div>
              <div className="text-sm font-medium text-blue-800">Time Saved</div>
              <div className="text-xs text-blue-600">Total hours automated</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.businessMetrics.productivityGains.workflowReuseRate}%
              </div>
              <div className="text-sm font-medium text-purple-800">Workflow Reuse Rate</div>
              <div className="text-xs text-purple-600">Efficiency through reusability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RealtimeAnalytics({ realtimeMetrics }: { realtimeMetrics: any }) {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-time Analytics</h3>
          <p className="text-sm text-muted-foreground">Live system metrics and user activity</p>
        </div>
        <Button
          variant={isLive ? "default" : "outline"}
          size="sm"
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isLive ? "Pause" : "Resume"} Live Updates
        </Button>
      </div>

      {realtimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{realtimeMetrics.activeUsers}</div>
              <p className="text-sm text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Calls/Minute</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{realtimeMetrics.apiCallsPerMinute}</div>
              <p className="text-sm text-muted-foreground">Real-time throughput</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{realtimeMetrics.systemLoad}%</div>
              <Progress value={realtimeMetrics.systemLoad} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>Real-time user actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {/* Mock real-time events */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">User created new automation project</span>
                <span className="text-xs text-muted-foreground ml-auto">2s ago</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Workflow generated for e-commerce automation</span>
                <span className="text-xs text-muted-foreground ml-auto">15s ago</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">Blueprint created for CRM integration</span>
                <span className="text-xs text-muted-foreground ml-auto">32s ago</span>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          <span>{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Modal Components
function ReportGenerationModal({ isOpen, onClose, onGenerate }: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (report: CustomReport) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Analytics Report</DialogTitle>
          <DialogDescription>
            Create a custom report with selected metrics and time range.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Report generation form would go here</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onClose()}>Generate Report</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AlertCreationModal({ isOpen, onClose, onCreate }: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (alert: Omit<AlertRule, 'id' | 'createdAt' | 'triggeredCount'>) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
          <DialogDescription>
            Set up automated alerts for important metrics and thresholds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Alert creation form would go here</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onClose()}>Create Alert</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}