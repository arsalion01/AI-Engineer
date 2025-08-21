import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Bot, 
  User, 
  Send, 
  Brain, 
  Workflow, 
  Code, 
  Download, 
  Sparkles, 
  FileText, 
  Settings, 
  History,
  MessageSquare,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  LogIn,
  Menu,
  ArrowRight,
  Github,
  BookOpen,
  Target,
  Lightbulb
} from "lucide-react";

type MessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'blueprint' | 'workflow' | 'system';
};

type ProjectPhase = 'requirements' | 'blueprint' | 'development' | 'completed';

type Project = {
  id: string;
  title: string;
  description: string;
  phase: ProjectPhase;
  progress: number;
  createdAt: Date;
  lastUpdated: Date;
};

export default function App() {
  const [user, setUser] = useState<{name: string; email: string; avatar: string} | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Engineer specialist. I'll help you design, blueprint, and build complete AI automation systems with custom n8n workflows.\n\nTo get started, tell me about your automation project. What business process or workflow would you like to automate?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<any>(null);
  const [generatedWorkflows, setGeneratedWorkflows] = useState<any[]>([]);
  const [showWorkflowDownload, setShowWorkflowDownload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    // Call real AI API
    try {
      const responseContent = await callAIAPI(currentInput);
      
      const aiResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Check if response contains blueprint or workflow generation trigger
      if (responseContent.includes('blueprint') || responseContent.includes('generate workflow')) {
        setTimeout(() => generateProjectBlueprint(), 2000);
      }
    } catch (error) {
      const errorResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const callAIAPI = async (input: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          projectId: currentProject?.id,
          userId: user?.email
        })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      return data.response || data.message || 'I apologize, but I encountered an issue processing your request. Please try again.';
    } catch (error) {
      console.error('API Error:', error);
      return 'I am currently experiencing technical difficulties. Please try again in a moment.';
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // In a real implementation, this would redirect to Google OAuth
      // For now, simulate the OAuth flow
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          name: userData.name || 'John Doe',
          email: userData.email || 'john@example.com',
          avatar: userData.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        });
      } else {
        // Fallback for demo
        setUser({
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Fallback for demo
      setUser({
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      });
    }
  };

  const createNewProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Automation Project',
          description: 'Custom AI automation system',
          userId: user?.email
        })
      });
      
      if (response.ok) {
        const projectData = await response.json();
        const newProject: Project = {
          id: projectData.id,
          title: projectData.title,
          description: projectData.description,
          phase: 'requirements',
          progress: 10,
          createdAt: new Date(projectData.createdAt),
          lastUpdated: new Date()
        };
        setProjects(prev => [...prev, newProject]);
        setCurrentProject(newProject);
      } else {
        // Fallback
        const newProject: Project = {
          id: Date.now().toString(),
          title: 'New Automation Project',
          description: 'Custom AI automation system',
          phase: 'requirements',
          progress: 10,
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        setProjects(prev => [...prev, newProject]);
        setCurrentProject(newProject);
      }
    } catch (error) {
      console.error('Project creation error:', error);
      // Fallback for offline functionality
      const newProject: Project = {
        id: Date.now().toString(),
        title: 'New Automation Project',
        description: 'Custom AI automation system',
        phase: 'requirements',
        progress: 10,
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
    }
  };

  const generateProjectBlueprint = async () => {
    if (!currentProject) return;
    
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.role === 'user').map(m => m.content)
        })
      });
      
      if (response.ok) {
        const blueprintData = await response.json();
        setGeneratedBlueprint(blueprintData);
        
        // Update project phase
        const updatedProject = {
          ...currentProject,
          phase: 'blueprint' as ProjectPhase,
          progress: 60,
          lastUpdated: new Date()
        };
        setCurrentProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
        
        // Add blueprint message
        const blueprintMessage: MessageType = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I have generated a comprehensive project blueprint! You can now review the technical specifications and generate n8n workflows.',
          timestamp: new Date(),
          type: 'blueprint'
        };
        setMessages(prev => [...prev, blueprintMessage]);
        
        // Auto-generate workflows
        setTimeout(() => generateN8nWorkflows(blueprintData), 1000);
      }
    } catch (error) {
      console.error('Blueprint generation error:', error);
    }
  };

  const generateN8nWorkflows = async (blueprint: any) => {
    if (!currentProject) return;
    
    try {
      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          blueprint: blueprint
        })
      });
      
      if (response.ok) {
        const workflowData = await response.json();
        setGeneratedWorkflows(workflowData.workflows || []);
        setShowWorkflowDownload(true);
        
        // Update project to development phase
        const updatedProject = {
          ...currentProject,
          phase: 'development' as ProjectPhase,
          progress: 90,
          lastUpdated: new Date()
        };
        setCurrentProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
        
        // Add workflow generation message
        const workflowMessage: MessageType = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Perfect! I have generated ${workflowData.workflows?.length || 1} custom n8n workflows for your project. You can now download them and import directly into your n8n instance.`,
          timestamp: new Date(),
          type: 'workflow'
        };
        setMessages(prev => [...prev, workflowMessage]);
      }
    } catch (error) {
      console.error('Workflow generation error:', error);
    }
  };

  const downloadWorkflow = (workflow: any, filename: string) => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllWorkflows = () => {
    generatedWorkflows.forEach((workflow, index) => {
      const filename = workflow.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || `workflow_${index + 1}`;
      setTimeout(() => downloadWorkflow(workflow, filename), index * 500);
    });
  };

  const getPhaseIcon = (phase: ProjectPhase) => {
    switch (phase) {
      case 'requirements': return <MessageSquare className="h-4 w-4" />;
      case 'blueprint': return <FileText className="h-4 w-4" />;
      case 'development': return <Code className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (phase: ProjectPhase) => {
    switch (phase) {
      case 'requirements': return 'bg-blue-500';
      case 'blueprint': return 'bg-yellow-500';
      case 'development': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <main className="container relative z-10 flex max-w-4xl flex-col items-center justify-center gap-12 px-4 py-16 text-center">
          <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 px-6 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            <Bot className="h-4 w-4" />
            <span>AI Engineer Agent v2.0</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-serif text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Engineer
              </span>
              <br />
              <span className="text-foreground">Agent</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Professional AI automation specialist that designs blueprints, asks the right questions, 
              and builds complete AI systems with custom n8n workflows tailored to your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Smart Requirements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Asks intelligent questions to understand your exact automation needs
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Project Blueprints</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Creates detailed technical blueprints and MVPs with clear specifications
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">n8n Workflows</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generates custom n8n JSON templates from 3400+ proven workflow patterns
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleGoogleSignIn}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Sign in with Google</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            
            <Button variant="outline" size="lg" className="backdrop-blur-sm" asChild>
              <a href="https://github.com/oxbshw/ultimate-n8n-ai-workflows" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View Workflows
              </a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Load projects on user sign-in
  useEffect(() => {
    const loadUserProjects = async () => {
      try {
        const response = await fetch(`/api/projects?userId=${user?.email}`);
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            phase: p.phase || 'requirements',
            progress: p.progress || 10,
            createdAt: new Date(p.createdAt),
            lastUpdated: new Date(p.updatedAt)
          })));
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    if (user) {
      loadUserProjects();
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-80 flex-col border-r border-border bg-card/50">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI Engineer</h2>
              <p className="text-xs text-muted-foreground">v2.0 Professional</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button 
            onClick={createNewProject}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No projects yet</p>
                <p className="text-xs">Create your first automation project!</p>
              </div>
            ) : (
              projects.map((project) => (
                <Card 
                  key={project.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    currentProject?.id === project.id ? 'border-primary bg-accent/30' : ''
                  }`}
                  onClick={() => setCurrentProject(project)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPhaseIcon(project.phase)}
                      <span className="text-sm font-medium truncate">{project.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getPhaseColor(project.phase)}`} />
                      <span className="text-xs text-muted-foreground capitalize">{project.phase}</span>
                      <Badge variant="outline" className="text-xs">{project.progress}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{project.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">AI Engineer</div>
                <div className="text-xs text-muted-foreground">v2.0 Professional</div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4">
            <Button 
              onClick={createNewProject}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {currentProject ? currentProject.title : 'AI Engineer Assistant'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentProject ? 
                  `${currentProject.phase.charAt(0).toUpperCase() + currentProject.phase.slice(1)} Phase • ${currentProject.progress}% Complete` :
                  'Professional AI automation specialist ready to help'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.role === 'assistant' ? (
                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-card border border-border'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    
                    {/* Blueprint Display */}
                    {message.type === 'blueprint' && generatedBlueprint && (
                      <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-sm">Project Blueprint Generated</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div><strong>Title:</strong> {generatedBlueprint.title}</div>
                          <div><strong>Overview:</strong> {generatedBlueprint.overview}</div>
                          <div><strong>Estimated ROI:</strong> {generatedBlueprint.estimatedROI}%</div>
                          <div><strong>Components:</strong> {generatedBlueprint.technicalArchitecture?.components?.length || 0}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Workflow Download */}
                    {message.type === 'workflow' && showWorkflowDownload && (
                      <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-3">
                          <Workflow className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">n8n Workflows Ready</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {generatedWorkflows.map((workflow, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => downloadWorkflow(workflow, workflow.name || `workflow_${index + 1}`)}
                              className="text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {workflow.name || `Workflow ${index + 1}`}
                            </Button>
                          ))}
                          {generatedWorkflows.length > 1 && (
                            <Button
                              size="sm"
                              onClick={downloadAllWorkflows}
                              className="text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download All
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-card/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Describe your automation project or ask a question..."
                  className="min-h-[60px] resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-2 right-2 h-8 w-8"
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Powered by Gemini Pro</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>3400+ n8n workflows</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>Enterprise-ready</span>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              {currentProject && (
                <div className="flex items-center gap-2">
                  {generatedBlueprint && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blueprintStr = JSON.stringify(generatedBlueprint, null, 2);
                        const blob = new Blob([blueprintStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${currentProject.title.replace(/[^a-z0-9]/gi, '_')}_blueprint.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Export Blueprint
                    </Button>
                  )}
                  
                  {showWorkflowDownload && generatedWorkflows.length > 0 && (
                    <Button
                      size="sm"
                      onClick={downloadAllWorkflows}
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Get n8n Files
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
