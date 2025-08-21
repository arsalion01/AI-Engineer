import React from 'react';

// Advanced Analytics System - Comprehensive Tracking and Reporting
// Provides detailed insights, metrics, and business intelligence for the AI Engineer Agent

export interface AnalyticsMetrics {
  timeRange: TimeRange;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalWorkflows: number;
  workflowsGenerated: number;
  totalUsers: number;
  activeUsers: number;
  apiUsage: ApiUsageMetrics;
  performanceMetrics: PerformanceMetrics;
  businessMetrics: BusinessMetrics;
  userEngagement: UserEngagementMetrics;
}

export interface ApiUsageMetrics {
  totalCalls: number;
  geminiApiCalls: number;
  authApiCalls: number;
  workflowApiCalls: number;
  averageResponseTime: number;
  errorRate: number;
  quotaUtilization: number;
  costAnalysis: CostAnalysis;
}

export interface CostAnalysis {
  totalCost: number;
  costPerUser: number;
  costPerProject: number;
  costBreakdown: {
    geminiApi: number;
    infrastructure: number;
    storage: number;
    other: number;
  };
  monthlyCostTrend: TimeSeries[];
}

export interface PerformanceMetrics {
  averageProjectCompletionTime: number;
  blueprintGenerationTime: number;
  workflowGenerationTime: number;
  userSatisfactionScore: number;
  systemUptime: number;
  errorRate: number;
  throughput: number;
}

export interface BusinessMetrics {
  revenueGenerated: number;
  costSavings: number;
  roiCalculated: ROIData[];
  customerRetention: number;
  conversionRate: number;
  timeToValue: number;
  productivityGains: ProductivityMetrics;
}

export interface ProductivityMetrics {
  averageTimeSavedPerProject: number;
  manualProcessReduction: number;
  errorReductionPercentage: number;
  developmentSpeedIncrease: number;
  workflowReuseRate: number;
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  projectsPerUser: number;
  workflowsPerUser: number;
  collaborationRate: number;
  featureAdoption: FeatureUsage[];
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  adoptionRate: number;
  lastUsed: Date;
}

export interface ROIData {
  projectId: string;
  projectTitle: string;
  estimatedROI: number;
  actualROI?: number;
  timeSaved: number;
  costSaved: number;
  implementationTime: number;
  paybackPeriod: number;
}

export interface TimeSeries {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface UserBehaviorAnalytics {
  userId: string;
  sessionData: UserSession[];
  preferredFeatures: string[];
  projectPatterns: ProjectPattern[];
  collaborationBehavior: CollaborationBehavior;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  recommendations: UserRecommendation[];
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  pagesVisited: string[];
  actionsPerformed: UserAction[];
  projectsWorkedOn: string[];
  deviceInfo: DeviceInfo;
}

export interface UserAction {
  action: string;
  timestamp: Date;
  context: Record<string, any>;
  duration?: number;
  success: boolean;
}

export interface ProjectPattern {
  type: 'ecommerce' | 'crm' | 'data-processing' | 'analytics' | 'other';
  frequency: number;
  averageComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  successRate: number;
  timePattern: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface CollaborationBehavior {
  averageTeamSize: number;
  preferredRole: 'owner' | 'editor' | 'viewer' | 'commenter';
  communicationFrequency: number;
  feedbackQuality: number;
  mentorshipActivity: number;
}

export interface UserRecommendation {
  type: 'workflow' | 'feature' | 'training' | 'collaboration';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  expectedBenefit: string;
  actionUrl?: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  screenSize: string;
  isMobile: boolean;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  permissions: string[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  dataSource: string;
  refreshInterval: number;
}

export type WidgetType = 
  | 'line-chart' 
  | 'bar-chart' 
  | 'pie-chart' 
  | 'metric' 
  | 'table' 
  | 'heatmap' 
  | 'funnel'
  | 'gauge'
  | 'timeline';

export interface WidgetConfig {
  metrics: string[];
  filters?: Record<string, any>;
  groupBy?: string[];
  timeRange?: TimeRange;
  displayOptions?: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equals' | 'not_equals';
  threshold: number;
  timeWindow: number;
  severity: 'info' | 'warning' | 'critical';
  notifications: AlertNotification[];
  isActive: boolean;
  createdAt: Date;
  triggeredCount: number;
  lastTriggered?: Date;
}

export interface AlertNotification {
  type: 'email' | 'slack' | 'webhook' | 'in-app';
  target: string;
  template?: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'project-performance' | 'user-analytics' | 'cost-analysis' | 'roi-report' | 'custom';
  schedule: ReportSchedule;
  parameters: ReportParameters;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template: string;
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:mm format
  timezone: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

export interface ReportParameters {
  timeRange: TimeRange;
  includeTeams?: string[];
  includeProjects?: string[];
  includeUsers?: string[];
  metrics: string[];
  filters: Record<string, any>;
}

// Advanced Analytics Service
export class AdvancedAnalyticsService {
  constructor(private apiClient: any) {}

  // Core Analytics Methods
  async getAnalyticsOverview(timeRange: TimeRange, teamId?: string): Promise<AnalyticsMetrics> {
    const params = new URLSearchParams({
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
      period: timeRange.period
    });
    
    if (teamId) params.append('teamId', teamId);

    const response = await this.apiClient.get(`/api/analytics/overview?${params}`);
    return response.data;
  }

  async getUserBehaviorAnalytics(userId: string, timeRange: TimeRange): Promise<UserBehaviorAnalytics> {
    const response = await this.apiClient.get(`/api/analytics/users/${userId}/behavior`, {
      params: { start: timeRange.start, end: timeRange.end }
    });
    return response.data;
  }

  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    const response = await this.apiClient.get(`/api/analytics/projects/${projectId}`);
    return response.data;
  }

  async getWorkflowPerformance(timeRange: TimeRange): Promise<WorkflowPerformance[]> {
    const response = await this.apiClient.get(`/api/analytics/workflows/performance`, {
      params: { start: timeRange.start, end: timeRange.end }
    });
    return response.data;
  }

  // Real-time Analytics
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    const response = await this.apiClient.get('/api/analytics/realtime');
    return response.data;
  }

  async subscribeToRealtimeUpdates(callback: (metrics: RealtimeMetrics) => void): Promise<() => void> {
    const ws = new WebSocket('wss://api.example.com/analytics/realtime');
    
    ws.onmessage = (event) => {
      const metrics = JSON.parse(event.data);
      callback(metrics);
    };

    return () => ws.close();
  }

  // Custom Analytics Queries
  async executeCustomQuery(query: AnalyticsQuery): Promise<any[]> {
    const response = await this.apiClient.post('/api/analytics/query', query);
    return response.data;
  }

  async createDashboard(dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt'>): Promise<AnalyticsDashboard> {
    const response = await this.apiClient.post('/api/analytics/dashboards', dashboard);
    return response.data;
  }

  async updateWidget(dashboardId: string, widget: DashboardWidget): Promise<void> {
    await this.apiClient.put(`/api/analytics/dashboards/${dashboardId}/widgets/${widget.id}`, widget);
  }

  // Predictive Analytics
  async getPredictiveInsights(type: 'user-churn' | 'project-success' | 'resource-usage'): Promise<PredictiveInsight[]> {
    const response = await this.apiClient.get(`/api/analytics/predictions/${type}`);
    return response.data;
  }

  async getAnomalyDetection(metric: string, timeRange: TimeRange): Promise<AnomalyAlert[]> {
    const response = await this.apiClient.get(`/api/analytics/anomalies/${metric}`, {
      params: { start: timeRange.start, end: timeRange.end }
    });
    return response.data;
  }

  // Reporting
  async generateReport(reportConfig: CustomReport): Promise<string> {
    const response = await this.apiClient.post('/api/analytics/reports/generate', reportConfig);
    return response.data.downloadUrl;
  }

  async scheduleReport(report: CustomReport): Promise<void> {
    await this.apiClient.post('/api/analytics/reports/schedule', report);
  }

  async getReportHistory(reportId: string): Promise<ReportExecution[]> {
    const response = await this.apiClient.get(`/api/analytics/reports/${reportId}/history`);
    return response.data;
  }

  // Alert Management
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'triggeredCount'>): Promise<AlertRule> {
    const response = await this.apiClient.post('/api/analytics/alerts', rule);
    return response.data;
  }

  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    await this.apiClient.put(`/api/analytics/alerts/${ruleId}`, updates);
  }

  async getActiveAlerts(): Promise<ActiveAlert[]> {
    const response = await this.apiClient.get('/api/analytics/alerts/active');
    return response.data;
  }

  // Export and Data Management
  async exportData(query: DataExportQuery): Promise<string> {
    const response = await this.apiClient.post('/api/analytics/export', query);
    return response.data.downloadUrl;
  }

  async getDataRetentionPolicy(): Promise<DataRetentionPolicy> {
    const response = await this.apiClient.get('/api/analytics/retention-policy');
    return response.data;
  }

  // Advanced Features
  async getCohortAnalysis(cohortType: 'user' | 'project', timeRange: TimeRange): Promise<CohortData> {
    const response = await this.apiClient.get(`/api/analytics/cohorts/${cohortType}`, {
      params: { start: timeRange.start, end: timeRange.end }
    });
    return response.data;
  }

  async getFunnelAnalysis(funnel: string[], timeRange: TimeRange): Promise<FunnelData> {
    const response = await this.apiClient.post('/api/analytics/funnel', {
      steps: funnel,
      timeRange
    });
    return response.data;
  }

  async getAttributionAnalysis(conversionEvent: string, timeRange: TimeRange): Promise<AttributionData> {
    const response = await this.apiClient.get('/api/analytics/attribution', {
      params: { event: conversionEvent, start: timeRange.start, end: timeRange.end }
    });
    return response.data;
  }
}

// Additional Types for Advanced Features
export interface ProjectAnalytics {
  projectId: string;
  title: string;
  metrics: {
    completionTime: number;
    requirementsChangeCount: number;
    blueprintIterations: number;
    workflowComplexity: number;
    collaboratorCount: number;
    commentCount: number;
    approvalTime: number;
  };
  timeline: ProjectTimeline[];
  riskFactors: RiskFactor[];
  recommendations: string[];
}

export interface ProjectTimeline {
  phase: string;
  startDate: Date;
  endDate?: Date;
  duration?: number;
  events: TimelineEvent[];
}

export interface TimelineEvent {
  type: string;
  description: string;
  timestamp: Date;
  userId: string;
}

export interface WorkflowPerformance {
  workflowId: string;
  name: string;
  type: string;
  usageCount: number;
  successRate: number;
  averageExecutionTime: number;
  errorRate: number;
  popularityScore: number;
  lastUsed: Date;
}

export interface RealtimeMetrics {
  activeUsers: number;
  currentProjects: number;
  apiCallsPerMinute: number;
  systemLoad: number;
  responseTime: number;
  errorCount: number;
  timestamp: Date;
}

export interface AnalyticsQuery {
  select: string[];
  from: string;
  where?: Record<string, any>;
  groupBy?: string[];
  orderBy?: string[];
  limit?: number;
  timeRange?: TimeRange;
}

export interface PredictiveInsight {
  type: string;
  title: string;
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  timeframe: string;
  confidence: number;
}

export interface AnomalyAlert {
  id: string;
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  context: Record<string, any>;
}

export interface ReportExecution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  downloadUrl?: string;
  error?: string;
}

export interface ActiveAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: string;
  triggeredAt: Date;
  acknowledged: boolean;
}

export interface DataExportQuery {
  tables: string[];
  timeRange: TimeRange;
  format: 'csv' | 'json' | 'excel';
  filters?: Record<string, any>;
  includeMetadata: boolean;
}

export interface DataRetentionPolicy {
  rawDataRetentionDays: number;
  aggregatedDataRetentionDays: number;
  userDataRetentionDays: number;
  auditLogRetentionDays: number;
  autoDeleteEnabled: boolean;
}

export interface CohortData {
  cohorts: Cohort[];
  retentionMatrix: number[][];
  avgRetentionByPeriod: number[];
}

export interface Cohort {
  id: string;
  name: string;
  startDate: Date;
  size: number;
  retentionRates: number[];
}

export interface FunnelData {
  steps: FunnelStep[];
  conversionRates: number[];
  dropOffPoints: DropOffPoint[];
}

export interface FunnelStep {
  name: string;
  userCount: number;
  conversionRate: number;
  averageTime: number;
}

export interface DropOffPoint {
  fromStep: string;
  toStep: string;
  dropOffRate: number;
  commonReasons: string[];
}

export interface AttributionData {
  channels: AttributionChannel[];
  touchpointAnalysis: TouchpointData[];
  conversionPaths: ConversionPath[];
}

export interface AttributionChannel {
  channel: string;
  conversions: number;
  cost: number;
  roas: number;
  attribution: number;
}

export interface TouchpointData {
  touchpoint: string;
  position: number;
  influence: number;
  conversionRate: number;
}

export interface ConversionPath {
  path: string[];
  conversions: number;
  averageTime: number;
  value: number;
}

export interface RiskFactor {
  type: string;
  description: string;
  likelihood: number;
  impact: number;
  mitigation: string;
}

// Analytics Hook for React Components
export function useAdvancedAnalytics(timeRange: TimeRange, teamId?: string) {
  const [metrics, setMetrics] = React.useState<AnalyticsMetrics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = React.useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const analyticsService = React.useMemo(() => new AdvancedAnalyticsService({} as any), []);

  React.useEffect(() => {
    loadAnalytics();
    subscribeToRealtimeUpdates();
  }, [timeRange, teamId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsOverview(timeRange, teamId);
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRealtimeUpdates = () => {
    return analyticsService.subscribeToRealtimeUpdates((newMetrics) => {
      setRealtimeMetrics(newMetrics);
    });
  };

  const generateReport = async (reportConfig: CustomReport) => {
    try {
      const downloadUrl = await analyticsService.generateReport(reportConfig);
      // Trigger download
      window.open(downloadUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    }
  };

  const createAlert = async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'triggeredCount'>) => {
    try {
      await analyticsService.createAlertRule(rule);
      // Show success notification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    }
  };

  return {
    metrics,
    realtimeMetrics,
    loading,
    error,
    generateReport,
    createAlert,
    refreshData: loadAnalytics
  };
}