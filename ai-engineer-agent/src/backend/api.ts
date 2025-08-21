// AI Engineer Agent - Professional Backend API
// Handles Google OAuth, Gemini API, n8n workflows, and project management

// Core interfaces for the AI Engineer system
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  geminiQuotaUsed: number;
  geminiQuotaLimit: number;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  lastLoginAt: string;
}

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  phase: 'requirements' | 'blueprint' | 'development' | 'completed';
  progress: number;
  requirements: ProjectRequirement[];
  blueprint?: ProjectBlueprint;
  workflows: N8nWorkflow[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectRequirement {
  id: string;
  question: string;
  answer: string;
  category: 'business' | 'technical' | 'integration' | 'scale';
  priority: 'high' | 'medium' | 'low';
}

interface ProjectBlueprint {
  id: string;
  overview: string;
  technicalSpecs: TechnicalSpec[];
  integrations: Integration[];
  timeline: TimelineItem[];
  estimatedCost: number;
  riskAssessment: RiskItem[];
}

interface TechnicalSpec {
  component: string;
  description: string;
  requirements: string[];
  dependencies: string[];
}

interface Integration {
  service: string;
  type: 'api' | 'webhook' | 'database' | 'auth';
  credentials: string[];
  rateLimit?: number;
}

interface TimelineItem {
  phase: string;
  duration: string;
  tasks: string[];
  deliverables: string[];
}

interface RiskItem {
  risk: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  json: object;
  nodes: N8nNode[];
  isCustom: boolean;
  projectId?: string;
}

interface N8nNode {
  id: string;
  type: string;
  name: string;
  parameters: Record<string, any>;
  position: [number, number];
  connections: Record<string, any>;
}

interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'blueprint' | 'workflow' | 'requirement';
  metadata?: Record<string, any>;
  timestamp: string;
}

interface GeminiQuota {
  userId: string;
  requestsUsed: number;
  requestsLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  resetDate: string;
}

// Mock database - In production, use D1 or external database
const mockUsers: User[] = [];
const mockProjects: Project[] = [];
const mockMessages: ChatMessage[] = [];
const mockQuotas: GeminiQuota[] = [];

// Pre-loaded n8n workflows from the GitHub repository
const workflowLibrary: N8nWorkflow[] = [
  {
    id: 'ecommerce-order-automation',
    name: 'E-commerce Order Automation',
    description: 'Automated order processing, inventory updates, and customer notifications',
    category: 'e-commerce',
    json: {
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: '/order-webhook',
            responseMode: 'onReceived',
          },
          id: '1',
          name: 'Order Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            operation: 'create',
            resource: 'database',
            table: 'orders',
          },
          id: '2',
          name: 'Save Order',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 1,
          position: [460, 300],
        },
      ],
      connections: {
        'Order Webhook': {
          main: [[
            {
              node: 'Save Order',
              type: 'main',
              index: 0,
            },
          ]],
        },
      },
    },
    nodes: [],
    isCustom: false,
  },
  {
    id: 'lead-generation-crm',
    name: 'Lead Generation & CRM Integration',
    description: 'Capture leads, qualify them, and sync with CRM systems',
    category: 'sales',
    json: {
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: '/lead-capture',
          },
          id: '1',
          name: 'Lead Form Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
      ],
      connections: {},
    },
    nodes: [],
    isCustom: false,
  },
];

// Helper functions
function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Content-Type": "application/json",
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function validateGoogleToken(token: string): Promise<{ email: string; name: string; picture: string } | null> {
  // In production, verify with Google's tokeninfo endpoint
  // For demo, return mock data
  return Promise.resolve({
    email: 'user@example.com',
    name: 'Demo User',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
  });
}

async function callGeminiAPI(prompt: string, userId: string): Promise<string> {
  // Check user quota
  const quota = mockQuotas.find(q => q.userId === userId);
  if (quota && quota.requestsUsed >= quota.requestsLimit) {
    throw new Error('Quota exceeded. Please upgrade your plan.');
  }

  // In production, use actual Gemini API
  // For demo, return intelligent mock responses
  return generateAIResponse(prompt);
}

function generateAIResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('online store')) {
    return `Based on your e-commerce automation requirements, I recommend a comprehensive solution with the following components:

**Technical Blueprint:**

1. **Order Processing Pipeline**
   - Webhook integration with your e-commerce platform
   - Automated inventory checks and updates
   - Payment processing validation
   - Order status notifications

2. **Customer Communication**
   - Automated order confirmation emails
   - Shipping notifications with tracking
   - Review request sequences
   - Abandoned cart recovery

3. **Inventory Management**
   - Real-time stock level monitoring
   - Automatic reorder triggers
   - Supplier notifications
   - Low stock alerts

**n8n Workflow Components:**
- E-commerce platform webhook receiver
- Database operations for order management
- Email/SMS notification system
- CRM integration for customer data
- Analytics and reporting pipeline

**Implementation Timeline:** 2-3 weeks
**Estimated Cost:** $2,500 - $4,000

Would you like me to create the detailed workflow templates for any specific part of this system?`;
  }

  if (lowerPrompt.includes('lead') || lowerPrompt.includes('crm') || lowerPrompt.includes('sales')) {
    return `Perfect! Here's a comprehensive lead generation and CRM automation blueprint:

**System Architecture:**

1. **Lead Capture & Qualification**
   - Multi-channel lead capture (website, social media, ads)
   - Automatic lead scoring based on behavior and demographics
   - Real-time lead qualification workflows
   - Duplicate detection and management

2. **CRM Integration & Management**
   - Seamless data sync with major CRM platforms
   - Automated contact creation and updates
   - Pipeline stage progression rules
   - Activity logging and timeline management

3. **Nurturing & Follow-up**
   - Personalized email sequences
   - SMS automation for high-priority leads
   - Calendar booking integration
   - Task creation for sales team

**Technical Specifications:**
- REST API integrations for form submissions
- Webhook processing for real-time updates
- Advanced conditional logic for lead routing
- Integration with 20+ popular CRM systems

**ROI Projection:** 40-60% increase in lead conversion
**Implementation:** 1-2 weeks

Shall I proceed with creating the specific n8n workflow templates for your CRM system?`;
  }

  return `Thank you for your project details! I'm analyzing your requirements and will create a comprehensive automation blueprint.

To provide the most effective solution, I need to understand:

1. **Current Process Analysis**
   - What manual steps are currently involved?
   - Where do bottlenecks or errors typically occur?
   - What tools/software are you currently using?

2. **Scale & Volume**
   - How many transactions/processes per day?
   - Expected growth over the next 12 months?
   - Peak usage periods or seasonal variations?

3. **Integration Requirements**
   - Which systems need to connect?
   - Any existing APIs or databases?
   - Security and compliance requirements?

4. **Success Metrics**
   - How will we measure automation success?
   - What's your primary goal: time savings, accuracy, or scale?

Once I have these details, I'll create a detailed technical blueprint with:
- System architecture diagram
- n8n workflow specifications
- Implementation timeline
- Cost breakdown
- Risk assessment

What specific aspect would you like to explore first?`;
}

function createProjectBlueprint(requirements: ProjectRequirement[]): ProjectBlueprint {
  // Generate intelligent blueprint based on requirements
  return {
    id: generateId(),
    overview: 'Comprehensive AI automation system designed for your specific business needs.',
    technicalSpecs: [
      {
        component: 'Data Pipeline',
        description: 'Automated data collection and processing system',
        requirements: ['Real-time processing', 'Error handling', 'Data validation'],
        dependencies: ['Database', 'API endpoints']
      },
      {
        component: 'Integration Layer',
        description: 'Connects all systems and services',
        requirements: ['API management', 'Authentication', 'Rate limiting'],
        dependencies: ['Third-party services', 'Internal systems']
      }
    ],
    integrations: [
      {
        service: 'Primary Platform',
        type: 'api',
        credentials: ['API Key', 'OAuth Token'],
        rateLimit: 1000
      }
    ],
    timeline: [
      {
        phase: 'Setup & Configuration',
        duration: '3-5 days',
        tasks: ['Environment setup', 'API configurations', 'Initial testing'],
        deliverables: ['Development environment', 'Configuration files']
      },
      {
        phase: 'Core Development',
        duration: '1-2 weeks',
        tasks: ['Workflow creation', 'Integration development', 'Testing'],
        deliverables: ['Working workflows', 'Integration tests']
      }
    ],
    estimatedCost: 3500,
    riskAssessment: [
      {
        risk: 'API rate limiting',
        impact: 'medium',
        mitigation: 'Implement request queuing and retry logic'
      }
    ]
  };
}

function generateN8nWorkflow(projectId: string, requirements: ProjectRequirement[]): N8nWorkflow {
  // Generate custom workflow based on requirements
  return {
    id: generateId(),
    name: 'Custom Automation Workflow',
    description: 'Tailored workflow for your specific automation needs',
    category: 'custom',
    json: {
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: '/automation-trigger',
          },
          id: '1',
          name: 'Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            operation: 'process',
            resource: 'data',
          },
          id: '2',
          name: 'Process Data',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [460, 300],
        }
      ],
      connections: {
        'Trigger': {
          main: [[
            {
              node: 'Process Data',
              type: 'main',
              index: 0,
            },
          ]],
        },
      },
    },
    nodes: [],
    isCustom: true,
    projectId
  };
}

// Main AI Engineer API Handler
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get("Origin") || "*";
    
    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    
    try {
      // GET /api/health - System health check
      if (url.pathname === "/api/health" && method === "GET") {
        return Response.json(
          { 
            status: "healthy", 
            timestamp: new Date().toISOString(),
            version: "2.0.0",
            services: {
              ai: "operational",
              workflows: "operational",
              auth: "operational"
            }
          },
          { headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/auth/google - Google OAuth authentication
      if (url.pathname === "/api/auth/google" && method === "POST") {
        const { token } = await request.json() as { token: string };
        
        const googleUser = await validateGoogleToken(token);
        if (!googleUser) {
          return Response.json(
            { error: "Invalid Google token" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        // Find or create user
        let user = mockUsers.find(u => u.email === googleUser.email);
        if (!user) {
          user = {
            id: generateId(),
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            geminiQuotaUsed: 0,
            geminiQuotaLimit: 100, // Free tier limit
            subscriptionTier: 'free',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          mockUsers.push(user);
          
          // Initialize quota
          mockQuotas.push({
            userId: user.id,
            requestsUsed: 0,
            requestsLimit: 100,
            tokensUsed: 0,
            tokensLimit: 50000,
            resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        } else {
          user.lastLoginAt = new Date().toISOString();
        }
        
        return Response.json(
          { 
            user,
            token: `mock_jwt_${user.id}`,
            quota: mockQuotas.find(q => q.userId === user.id)
          },
          { headers: corsHeaders(origin) }
        );
      }
      
      // GET /api/projects - List user projects
      if (url.pathname === "/api/projects" && method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return Response.json(
            { error: "Authorization required" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        const userId = authHeader.replace('Bearer mock_jwt_', '');
        const userProjects = mockProjects.filter(p => p.userId === userId);
        
        return Response.json(
          { projects: userProjects },
          { headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/projects - Create new project
      if (url.pathname === "/api/projects" && method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return Response.json(
            { error: "Authorization required" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        const userId = authHeader.replace('Bearer mock_jwt_', '');
        const { title, description } = await request.json() as { title: string; description: string };
        
        const newProject: Project = {
          id: generateId(),
          userId,
          title,
          description,
          phase: 'requirements',
          progress: 10,
          requirements: [],
          workflows: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        mockProjects.push(newProject);
        
        return Response.json(
          { project: newProject },
          { status: 201, headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/chat - AI Engineer chat endpoint
      if (url.pathname === "/api/chat" && method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return Response.json(
            { error: "Authorization required" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        const userId = authHeader.replace('Bearer mock_jwt_', '');
        const { message, projectId } = await request.json() as { message: string; projectId?: string };
        
        try {
          const aiResponse = await callGeminiAPI(message, userId);
          
          // Save user message
          const userMessage: ChatMessage = {
            id: generateId(),
            projectId: projectId || '',
            role: 'user',
            content: message,
            type: 'text',
            timestamp: new Date().toISOString()
          };
          mockMessages.push(userMessage);
          
          // Save AI response
          const assistantMessage: ChatMessage = {
            id: generateId(),
            projectId: projectId || '',
            role: 'assistant',
            content: aiResponse,
            type: 'text',
            timestamp: new Date().toISOString()
          };
          mockMessages.push(assistantMessage);
          
          // Update quota
          const quota = mockQuotas.find(q => q.userId === userId);
          if (quota) {
            quota.requestsUsed += 1;
            quota.tokensUsed += Math.floor(message.length / 4); // Rough token estimation
          }
          
          return Response.json(
            { 
              response: aiResponse,
              quotaRemaining: quota ? quota.requestsLimit - quota.requestsUsed : 0
            },
            { headers: corsHeaders(origin) }
          );
        } catch (error) {
          return Response.json(
            { error: (error as Error).message },
            { status: 429, headers: corsHeaders(origin) }
          );
        }
      }
      
      // GET /api/workflows - Get workflow library
      if (url.pathname === "/api/workflows" && method === "GET") {
        const category = url.searchParams.get("category");
        let workflows = workflowLibrary;
        
        if (category) {
          workflows = workflows.filter(w => w.category === category);
        }
        
        return Response.json(
          { 
            workflows,
            categories: ['e-commerce', 'sales', 'marketing', 'support', 'finance', 'hr']
          },
          { headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/workflows/generate - Generate custom workflow
      if (url.pathname === "/api/workflows/generate" && method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return Response.json(
            { error: "Authorization required" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        const { projectId, requirements } = await request.json() as { 
          projectId: string; 
          requirements: ProjectRequirement[]; 
        };
        
        const customWorkflow = generateN8nWorkflow(projectId, requirements);
        
        return Response.json(
          { workflow: customWorkflow },
          { headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/projects/:id/blueprint - Generate project blueprint
      const blueprintMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/blueprint$/);
      if (blueprintMatch && method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return Response.json(
            { error: "Authorization required" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        const projectId = blueprintMatch[1];
        const project = mockProjects.find(p => p.id === projectId);
        
        if (!project) {
          return Response.json(
            { error: "Project not found" },
            { status: 404, headers: corsHeaders(origin) }
          );
        }
        
        const blueprint = createProjectBlueprint(project.requirements);
        project.blueprint = blueprint;
        project.phase = 'blueprint';
        project.progress = 40;
        project.updatedAt = new Date().toISOString();
        
        return Response.json(
          { blueprint },
          { headers: corsHeaders(origin) }
        );
      }
      
      // GET /api/user/quota - Get user quota information
      if (url.pathname === "/api/user/quota" && method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return Response.json(
            { error: "Authorization required" },
            { status: 401, headers: corsHeaders(origin) }
          );
        }
        
        const userId = authHeader.replace('Bearer mock_jwt_', '');
        const quota = mockQuotas.find(q => q.userId === userId);
        
        return Response.json(
          { quota: quota || { requestsUsed: 0, requestsLimit: 100, tokensUsed: 0, tokensLimit: 50000 } },
          { headers: corsHeaders(origin) }
        );
      }
      
      // 404 for unmatched routes
      return Response.json(
        { error: "Not Found", path: url.pathname },
        { status: 404, headers: corsHeaders(origin) }
      );
      
    } catch (error) {
      console.error("AI Engineer API Error:", error);
      return Response.json(
        { error: "Internal Server Error" },
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  }
};

// Environment bindings for production deployment
interface Env {
  // Database
  DB?: any;                    // SQLite database for user data (D1Database in production)
  CACHE?: any;                // Key-value cache for sessions (KVNamespace in production)
  
  // External APIs
  GOOGLE_CLIENT_ID: string;          // Google OAuth client ID
  GOOGLE_CLIENT_SECRET: string;      // Google OAuth client secret
  GEMINI_API_KEY: string;           // Google Gemini API key
  
  // Application secrets
  JWT_SECRET: string;               // JWT signing secret
  WEBHOOK_SECRET: string;           // Webhook validation secret
  
  // Configuration
  FRONTEND_URL: string;             // Frontend URL for CORS
  RATE_LIMIT_REQUESTS: string;      // Rate limiting configuration
} 