import React from 'react';

export type ProjectPhase = 'requirements' | 'blueprint' | 'development' | 'completed';

// Team Collaboration System - User Management and Roles
// Extends the AI Engineer Agent with comprehensive team features

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  status: 'active' | 'invited' | 'inactive';
  joinedAt: Date;
  lastActive: Date;
  permissions: Permission[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  settings: TeamSettings;
  subscription: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedProject {
  id: string;
  title: string;
  description: string;
  teamId: string;
  ownerId: string;
  collaborators: ProjectCollaborator[];
  visibility: 'private' | 'team' | 'organization';
  phase: ProjectPhase;
  progress: number;
  tags: string[];
  createdAt: Date;
  lastModified: Date;
  modifiedBy: string;
}

export interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  permissions: CollaborationPermission[];
  addedAt: Date;
  addedBy: string;
}

export type UserRole = 'admin' | 'manager' | 'developer' | 'analyst' | 'viewer';
export type Permission = 
  | 'create_projects' 
  | 'edit_projects' 
  | 'delete_projects' 
  | 'manage_team' 
  | 'view_analytics' 
  | 'export_data'
  | 'manage_workflows'
  | 'approve_deployments';

export type CollaborationPermission = 
  | 'edit_requirements' 
  | 'modify_blueprints' 
  | 'generate_workflows' 
  | 'download_files' 
  | 'add_comments'
  | 'approve_changes';

export interface TeamSettings {
  allowExternalSharing: boolean;
  requireApprovalForWorkflows: boolean;
  enableRealTimeCollaboration: boolean;
  notificationPreferences: NotificationSettings;
  workflowStandards: WorkflowStandards;
  securityPolicies: SecurityPolicies;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  slackIntegration?: {
    webhookUrl: string;
    channels: string[];
  };
  inAppNotifications: boolean;
  digestFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
}

export interface WorkflowStandards {
  requiredTags: string[];
  namingConventions: string;
  approvalWorkflow: boolean;
  testingRequirements: boolean;
  documentationStandards: boolean;
}

export interface SecurityPolicies {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  ipRestrictions: string[];
  auditLogging: boolean;
  dataRetentionDays: number;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  type: 'general' | 'suggestion' | 'issue' | 'approval';
  status: 'open' | 'resolved' | 'dismissed';
  threadId?: string;
  mentions: string[];
  attachments: CommentAttachment[];
  reactions: CommentReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface CommentReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface RealTimeActivity {
  id: string;
  projectId: string;
  userId: string;
  action: ActivityType;
  details: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export type ActivityType = 
  | 'project_created' 
  | 'requirements_updated' 
  | 'blueprint_generated' 
  | 'workflow_created'
  | 'comment_added' 
  | 'user_joined' 
  | 'approval_requested' 
  | 'deployment_completed';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  teamId: string;
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  requirements: TemplateRequirement[];
  blueprintTemplate: any;
  workflowTemplates: any[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateRequirement {
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean';
  options?: string[];
  required: boolean;
  placeholder?: string;
  validation?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  teamId: string;
  projects: string[];
  settings: WorkspaceSettings;
  integrations: WorkspaceIntegration[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultProjectVisibility: 'private' | 'team' | 'organization';
  allowGuestAccess: boolean;
  customBranding: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export interface WorkspaceIntegration {
  id: string;
  type: 'slack' | 'discord' | 'teams' | 'jira' | 'github' | 'gitlab';
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  addedAt: Date;
  addedBy: string;
}

export type SubscriptionTier = 'free' | 'team' | 'professional' | 'enterprise';

export interface SubscriptionLimits {
  maxTeamMembers: number;
  maxProjects: number;
  maxWorkflows: number;
  apiCallsPerMonth: number;
  storageGB: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
}

// Team Management Service
export class TeamCollaborationService {
  constructor(private apiClient: any) {}

  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const response = await this.apiClient.post('/api/teams', teamData);
    return response.data;
  }

  async inviteMembers(teamId: string, emails: string[], role: UserRole): Promise<TeamMember[]> {
    const response = await this.apiClient.post(`/api/teams/${teamId}/invite`, {
      emails,
      role,
      permissions: this.getDefaultPermissions(role)
    });
    return response.data;
  }

  async updateMemberRole(teamId: string, userId: string, role: UserRole, permissions: Permission[]): Promise<void> {
    await this.apiClient.put(`/api/teams/${teamId}/members/${userId}`, {
      role,
      permissions
    });
  }

  async shareProject(projectId: string, collaborators: ProjectCollaborator[]): Promise<void> {
    await this.apiClient.post(`/api/projects/${projectId}/share`, {
      collaborators
    });
  }

  async addComment(projectId: string, content: string, type: Comment['type'], mentions: string[] = []): Promise<Comment> {
    const response = await this.apiClient.post(`/api/projects/${projectId}/comments`, {
      content,
      type,
      mentions
    });
    return response.data;
  }

  async getProjectActivity(projectId: string, limit = 50): Promise<RealTimeActivity[]> {
    const response = await this.apiClient.get(`/api/projects/${projectId}/activity?limit=${limit}`);
    return response.data;
  }

  async createProjectTemplate(projectId: string, templateData: Partial<ProjectTemplate>): Promise<ProjectTemplate> {
    const response = await this.apiClient.post(`/api/projects/${projectId}/create-template`, templateData);
    return response.data;
  }

  async useTemplate(templateId: string, answers: Record<string, any>): Promise<SharedProject> {
    const response = await this.apiClient.post(`/api/templates/${templateId}/use`, { answers });
    return response.data;
  }

  async getTeamAnalytics(teamId: string, timeRange: string): Promise<any> {
    const response = await this.apiClient.get(`/api/teams/${teamId}/analytics?range=${timeRange}`);
    return response.data;
  }

  private getDefaultPermissions(role: UserRole): Permission[] {
    const permissionMap: Record<UserRole, Permission[]> = {
      admin: ['create_projects', 'edit_projects', 'delete_projects', 'manage_team', 'view_analytics', 'export_data', 'manage_workflows', 'approve_deployments'],
      manager: ['create_projects', 'edit_projects', 'manage_workflows', 'view_analytics', 'approve_deployments'],
      developer: ['create_projects', 'edit_projects', 'manage_workflows'],
      analyst: ['view_analytics', 'export_data'],
      viewer: []
    };
    return permissionMap[role] || [];
  }

  // Real-time collaboration methods
  async subscribeToProject(projectId: string, callback: (activity: RealTimeActivity) => void): Promise<() => void> {
    // WebSocket or Server-Sent Events implementation
    const ws = new WebSocket(`wss://api.example.com/projects/${projectId}/subscribe`);
    
    ws.onmessage = (event) => {
      const activity = JSON.parse(event.data);
      callback(activity);
    };

    return () => ws.close();
  }

  async broadcastActivity(projectId: string, activity: Omit<RealTimeActivity, 'id' | 'timestamp'>): Promise<void> {
    await this.apiClient.post(`/api/projects/${projectId}/activity`, activity);
  }
}

// Team Collaboration React Hook
export function useTeamCollaboration(projectId?: string) {
  const [team, setTeam] = React.useState<Team | null>(null);
  const [project, setProject] = React.useState<SharedProject | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [activity, setActivity] = React.useState<RealTimeActivity[]>([]);
  const [activeUsers, setActiveUsers] = React.useState<TeamMember[]>([]);

  const collaborationService = React.useMemo(() => new TeamCollaborationService({} as any), []);

  React.useEffect(() => {
    if (projectId) {
      loadProjectCollaboration();
      subscribeToRealTimeUpdates();
    }
  }, [projectId]);

  const loadProjectCollaboration = async () => {
    if (!projectId) return;

    try {
      const [projectData, commentsData, activityData] = await Promise.all([
        fetch(`/api/projects/${projectId}`).then(r => r.json()),
        fetch(`/api/projects/${projectId}/comments`).then(r => r.json()),
        collaborationService.getProjectActivity(projectId)
      ]);

      setProject(projectData);
      setComments(commentsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    }
  };

  const subscribeToRealTimeUpdates = () => {
    if (!projectId) return;

    return collaborationService.subscribeToProject(projectId, (newActivity) => {
      setActivity(prev => [newActivity, ...prev].slice(0, 100));
      
      // Update active users based on activity
      if (newActivity.action === 'user_joined' || newActivity.action === 'requirements_updated') {
        // Logic to update active users
      }
    });
  };

  const addComment = async (content: string, type: Comment['type'] = 'general', mentions: string[] = []) => {
    if (!projectId) return;

    try {
      const newComment = await collaborationService.addComment(projectId, content, type, mentions);
      setComments(prev => [newComment, ...prev]);
      
      // Broadcast activity
      await collaborationService.broadcastActivity(projectId, {
        projectId,
        userId: 'current-user-id', // Get from auth context
        action: 'comment_added',
        details: `Added a ${type} comment`,
        metadata: { commentId: newComment.id }
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const inviteCollaborator = async (email: string, role: ProjectCollaborator['role']) => {
    if (!projectId || !project) return;

    try {
      const collaborator: ProjectCollaborator = {
        userId: email, // This would be resolved to actual user ID
        role,
        permissions: role === 'owner' ? ['edit_requirements', 'modify_blueprints', 'generate_workflows', 'download_files', 'add_comments', 'approve_changes'] : 
                     role === 'editor' ? ['edit_requirements', 'modify_blueprints', 'add_comments'] :
                     role === 'commenter' ? ['add_comments'] : [],
        addedAt: new Date(),
        addedBy: 'current-user-id'
      };

      await collaborationService.shareProject(projectId, [...project.collaborators, collaborator]);
      
      setProject(prev => prev ? {
        ...prev,
        collaborators: [...prev.collaborators, collaborator]
      } : null);
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
    }
  };

  return {
    team,
    project,
    comments,
    activity,
    activeUsers,
    addComment,
    inviteCollaborator,
    isLoading: !project && !!projectId
  };
}