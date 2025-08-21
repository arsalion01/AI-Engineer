// Team Collaboration Dashboard Components
// React components for team management, project sharing, and real-time collaboration

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Share2, 
  Settings, 
  Crown,
  Eye,
  Edit,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  TrendingUp,
  Filter,
  Search,
  Download,
  Bell,
  Shield
} from "lucide-react";

import { useTeamCollaboration } from '../lib/team-collaboration';
import { 
  Team, 
  TeamMember, 
  SharedProject, 
  Comment, 
  RealTimeActivity, 
  UserRole,
  ProjectCollaborator 
} from '../lib/team-collaboration';

interface TeamDashboardProps {
  team: Team;
  currentUser: TeamMember;
}

export function TeamDashboard({ team, currentUser }: TeamDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Team Sidebar */}
      <div className="w-80 border-r border-border bg-card/50">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">{team.name}</h2>
              <p className="text-xs text-muted-foreground">{team.members.length} members</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">Team Members</div>
            {team.members.map((member) => (
              <Card key={member.id} className="cursor-pointer hover:bg-accent/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{member.name}</span>
                        {member.role === 'admin' && <Crown className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                        <div className={`h-2 w-2 rounded-full ${
                          member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Team Dashboard</h1>
              <p className="text-muted-foreground">Manage your team and collaborate on projects</p>
            </div>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Team Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1">
              <TeamOverview team={team} currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="projects" className="flex-1">
              <TeamProjects team={team} />
            </TabsContent>

            <TabsContent value="activity" className="flex-1">
              <TeamActivity team={team} />
            </TabsContent>

            <TabsContent value="analytics" className="flex-1">
              <TeamAnalytics team={team} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Invite Members Modal */}
      <InviteMembersModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        team={team}
      />
    </div>
  );
}

function TeamOverview({ team, currentUser }: { team: Team; currentUser: TeamMember }) {
  const [recentProjects, setRecentProjects] = useState<SharedProject[]>([]);
  const [teamStats, setTeamStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalWorkflows: 0,
    memberActivity: 0
  });

  useEffect(() => {
    // Load team overview data
    loadTeamOverview();
  }, []);

  const loadTeamOverview = async () => {
    try {
      // Mock data loading
      setTeamStats({
        activeProjects: 8,
        completedProjects: 23,
        totalWorkflows: 67,
        memberActivity: 95
      });
    } catch (error) {
      console.error('Failed to load team overview:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.memberActivity}%</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects and Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Latest projects your team is working on</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{project.title}</span>
                        <Badge variant="outline" className="capitalize">{project.phase}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{project.collaborators.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{project.lastModified.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Weekly performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Projects Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Workflow Quality</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-5/6 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">83%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Collaboration Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-4/5 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-full h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeamProjects({ team }: { team: Team }) {
  const [projects, setProjects] = useState<SharedProject[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="my-projects">My Projects</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">{project.phase}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full transition-all" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Collaborators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{project.collaborators.length} collaborators</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.collaborators.slice(0, 3).map((collaborator, index) => (
                      <Avatar key={index} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {collaborator.userId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.collaborators.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs">+{project.collaborators.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="mr-1 h-3 w-3" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamActivity({ team }: { team: Team }) {
  const [activities, setActivities] = useState<RealTimeActivity[]>([]);
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Activity</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="workflows">Workflows</SelectItem>
            <SelectItem value="comments">Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
              <div className="p-2 rounded-full bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{activity.userId}</span>
                  <span className="text-sm text-muted-foreground">
                    {activity.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleString()}
                  </span>
                  {activity.projectId && (
                    <Badge variant="outline" className="text-xs">
                      Project: {activity.projectId}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function TeamAnalytics({ team }: { team: Team }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Analytics</h3>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Success Rate</CardTitle>
            <CardDescription>Percentage of projects completed successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">87%</div>
            <p className="text-sm text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Completion Time</CardTitle>
            <CardDescription>Time from start to completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.3 days</div>
            <p className="text-sm text-muted-foreground">-2.1 days from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Collaboration Score</CardTitle>
            <CardDescription>Based on comments, reviews, and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">8.6/10</div>
            <p className="text-sm text-muted-foreground">Excellent collaboration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Reuse Rate</CardTitle>
            <CardDescription>Percentage of workflows reused across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">72%</div>
            <p className="text-sm text-muted-foreground">High efficiency indicator</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

function InviteMembersModal({ isOpen, onClose, team }: InviteMembersModalProps) {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<UserRole>('developer');
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    try {
      const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);
      // Call API to send invitations
      console.log('Inviting:', emailList, 'as', role);
      onClose();
    } catch (error) {
      console.error('Failed to send invitations:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Invite new members to join {team.name} and collaborate on projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Addresses</label>
            <Textarea
              placeholder="Enter email addresses separated by commas..."
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Personal Message (Optional)</label>
            <Textarea
              placeholder="Add a personal message to the invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invitations</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}