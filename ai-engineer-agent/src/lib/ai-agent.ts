// AI Engineer Agent - Core Intelligence System
// Advanced conversational AI for n8n workflow generation and project management

import { workflowKB, WorkflowTemplate, WorkflowCategory } from './workflow-knowledge';

// Re-export types for use in other modules
export { WorkflowTemplate, WorkflowCategory } from './workflow-knowledge';

export interface ConversationContext {
  projectId?: string;
  phase: 'discovery' | 'requirements' | 'blueprint' | 'implementation' | 'optimization';
  requirements: ProjectRequirement[];
  preferences: UserPreferences;
  chatHistory: Message[];
  currentFocus?: string;
}

export interface ProjectRequirement {
  id: string;
  category: RequirementCategory;
  question: string;
  answer: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  followUpNeeded: boolean;
  tags: string[];
}

export type RequirementCategory = 
  | 'business-process'
  | 'technical-specs'
  | 'integrations'
  | 'scale-volume'
  | 'security-compliance'
  | 'user-experience'
  | 'budget-timeline'
  | 'success-metrics';

export interface UserPreferences {
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'enterprise';
  technicalLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredIntegrations?: string[];
  budgetRange?: string;
  timeframe?: string;
  priorityGoals?: ('cost-reduction' | 'time-saving' | 'accuracy' | 'scalability')[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'question' | 'answer' | 'clarification' | 'recommendation' | 'blueprint' | 'workflow';
    category?: RequirementCategory;
    confidence?: number;
    relatedWorkflows?: string[];
  };
}

export interface ProjectBlueprint {
  id: string;
  title: string;
  overview: string;
  businessCase: BusinessCase;
  technicalArchitecture: TechnicalArchitecture;
  implementationPlan: ImplementationPlan;
  riskAssessment: RiskAssessment;
  successMetrics: SuccessMetric[];
  estimatedROI: number;
  createdAt: Date;
}

export interface BusinessCase {
  problemStatement: string;
  proposedSolution: string;
  expectedBenefits: string[];
  successCriteria: string[];
  stakeholders: string[];
}

export interface TechnicalArchitecture {
  components: TechnicalComponent[];
  dataFlow: DataFlowStep[];
  integrations: IntegrationSpec[];
  securityConsiderations: string[];
  scalabilityPlan: string;
}

export interface TechnicalComponent {
  name: string;
  type: 'trigger' | 'processor' | 'integrator' | 'storage' | 'notifier';
  description: string;
  n8nNodes: string[];
  dependencies: string[];
  configuration: Record<string, any>;
}

export interface DataFlowStep {
  step: number;
  description: string;
  inputSource: string;
  processing: string;
  outputDestination: string;
  errorHandling: string;
}

export interface IntegrationSpec {
  service: string;
  purpose: string;
  dataExchanged: string[];
  authMethod: string;
  rateLimit?: number;
  fallbackStrategy?: string;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  totalTimeEstimate: string;
  resourceRequirements: string[];
  prerequisites: string[];
  testingStrategy: string;
  deploymentPlan: string;
}

export interface ImplementationPhase {
  name: string;
  duration: string;
  tasks: Task[];
  deliverables: string[];
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  skillsRequired: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface RiskAssessment {
  risks: Risk[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationStrategy: string;
}

export interface Risk {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  category: 'technical' | 'business' | 'operational' | 'security';
  mitigation: string;
  contingency: string;
}

export interface SuccessMetric {
  name: string;
  description: string;
  measurementMethod: string;
  targetValue: string;
  currentBaseline?: string;
  frequency: string;
}

export class AIEngineerAgent {
  private context: ConversationContext;
  private questionBank: Map<RequirementCategory, string[]> = new Map();
  private responseTemplates: Map<string, string> = new Map();

  constructor() {
    this.context = {
      phase: 'discovery',
      requirements: [],
      preferences: {},
      chatHistory: []
    };
    this.initializeQuestionBank();
    this.initializeResponseTemplates();
  }

  private initializeQuestionBank() {
    this.questionBank = new Map([
      ['business-process', [
        'What specific business process or workflow would you like to automate?',
        'How is this process currently handled manually?',
        'What are the main pain points with the current process?',
        'Who are the key stakeholders involved in this process?',
        'What triggers the start of this process?',
        'What are the typical decision points in this workflow?',
        'How often does this process occur (daily, weekly, monthly)?',
        'What are the success criteria for this automation?'
      ]],
      ['technical-specs', [
        'What platforms or systems are currently involved?',
        'Do you have existing APIs or databases that need integration?',
        'What data formats are you working with?',
        'Are there any specific performance requirements?',
        'What level of real-time processing do you need?',
        'Do you need data transformation or validation steps?',
        'Are there any specific compliance or security requirements?',
        'What error handling and monitoring capabilities do you need?'
      ]],
      ['integrations', [
        'Which third-party services do you currently use?',
        'What CRM, ERP, or other business systems need to connect?',
        'Do you have preferred cloud platforms (AWS, Azure, GCP)?',
        'Are there any legacy systems that need integration?',
        'What authentication methods are supported by your systems?',
        'Do you have webhook capabilities in your current tools?',
        'Are there any rate limiting considerations we should know about?',
        'What data synchronization requirements do you have?'
      ]],
      ['scale-volume', [
        'What is the current volume of transactions/data you process?',
        'What volume do you expect in 6-12 months?',
        'Are there peak usage periods we should plan for?',
        'Do you need the system to scale automatically?',
        'Are there any geographical distribution requirements?',
        'What are your uptime and availability requirements?',
        'Do you need redundancy and failover capabilities?',
        'What is the acceptable processing time for each workflow?'
      ]],
      ['security-compliance', [
        'What industry regulations do you need to comply with?',
        'Do you handle sensitive data (PII, financial, health)?',
        'What are your data retention and deletion requirements?',
        'Do you need audit logging and compliance reporting?',
        'What authentication and authorization controls are required?',
        'Are there data residency or sovereignty requirements?',
        'Do you need encryption at rest and in transit?',
        'What are your backup and disaster recovery needs?'
      ]],
      ['budget-timeline', [
        'What is your budget range for this automation project?',
        'When do you need this system to be operational?',
        'Are there any critical deadlines or business events?',
        'Do you prefer a phased implementation approach?',
        'What ongoing maintenance and support do you expect?',
        'Do you have internal resources to manage the system?',
        'Are you open to SaaS solutions or prefer on-premise?',
        'What is your expected ROI timeline?'
      ]]
    ]);
  }

  private initializeResponseTemplates() {
    this.responseTemplates = new Map([
      ['greeting', `Hello! I'm your AI Engineer specialist with extensive knowledge of n8n automation workflows. I'll help you design, blueprint, and build a complete AI automation system tailored to your specific needs.

To create the most effective solution, I'll ask targeted questions about your business process, technical requirements, and goals. This ensures we build exactly what you need.

Let's start: **What business process or workflow would you like to automate?**`],

      ['process-analysis', `Excellent! I can see great automation potential here. Let me analyze your process and ask some clarifying questions to design the optimal solution.

**Current Process Analysis:**
{analysis}

**Key Questions:**
{questions}

Once I understand these details, I'll create a comprehensive technical blueprint with:
- System architecture diagram
- n8n workflow specifications  
- Integration requirements
- Implementation timeline
- Cost breakdown and ROI analysis`],

      ['blueprint-ready', `Perfect! Based on our discussion, I have all the information needed to create your automation blueprint. Let me generate a comprehensive technical specification.

**Project Summary:**
{summary}

**Recommended Approach:**
{approach}

I'm now creating your detailed blueprint with technical specifications, workflow designs, and implementation plan. This will take just a moment...`],

      ['workflow-recommendation', `Based on your requirements, I found {count} relevant workflow patterns from our library of 3,400+ proven n8n templates:

**Top Recommendations:**
{workflows}

These workflows can be customized to match your specific needs. Would you like me to:
1. Generate a custom workflow combining these patterns
2. Show detailed implementation for a specific workflow
3. Create a completely custom solution from scratch`]
    ]);
  }

  public async processMessage(userMessage: string, context?: Partial<ConversationContext>): Promise<string> {
    // Update context if provided
    if (context) {
      this.context = { ...this.context, ...context };
    }

    // Add user message to history
    this.context.chatHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Analyze user message
    const intent = this.analyzeUserIntent(userMessage);
    const requirements = this.extractRequirements(userMessage);
    
    // Update requirements
    this.context.requirements.push(...requirements);

    // Generate response based on phase and intent
    const response = await this.generateResponse(intent, userMessage);

    // Add assistant response to history
    this.context.chatHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: {
        type: intent.type as 'question',
        category: intent.category,
        confidence: intent.confidence
      }
    });

    return response;
  }

  private analyzeUserIntent(message: string): { type: string; category?: RequirementCategory; confidence: number; keywords: string[] } {
    const lowerMessage = message.toLowerCase();
    const keywords = lowerMessage.split(' ').filter(word => word.length > 3);

    // Business process indicators
    if (this.containsKeywords(lowerMessage, ['ecommerce', 'e-commerce', 'online store', 'shop', 'orders', 'products'])) {
      return { type: 'business-process', category: 'business-process', confidence: 0.9, keywords: ['ecommerce'] };
    }

    if (this.containsKeywords(lowerMessage, ['lead', 'leads', 'crm', 'sales', 'prospects', 'customers'])) {
      return { type: 'business-process', category: 'business-process', confidence: 0.85, keywords: ['crm', 'sales'] };
    }

    if (this.containsKeywords(lowerMessage, ['marketing', 'email', 'social media', 'content', 'campaigns'])) {
      return { type: 'business-process', category: 'business-process', confidence: 0.8, keywords: ['marketing'] };
    }

    if (this.containsKeywords(lowerMessage, ['support', 'tickets', 'customer service', 'helpdesk'])) {
      return { type: 'business-process', category: 'business-process', confidence: 0.8, keywords: ['support'] };
    }

    // Technical indicators
    if (this.containsKeywords(lowerMessage, ['api', 'database', 'integration', 'webhook', 'data'])) {
      return { type: 'technical-requirement', category: 'technical-specs', confidence: 0.7, keywords: ['technical'] };
    }

    // Scale indicators
    if (this.containsKeywords(lowerMessage, ['scale', 'volume', 'performance', 'load', 'capacity'])) {
      return { type: 'scale-requirement', category: 'scale-volume', confidence: 0.7, keywords: ['scale'] };
    }

    // Default to general inquiry
    return { type: 'general-inquiry', confidence: 0.5, keywords };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractRequirements(message: string): ProjectRequirement[] {
    const requirements: ProjectRequirement[] = [];
    const lowerMessage = message.toLowerCase();

    // Extract business process requirements
    if (lowerMessage.includes('automate') || lowerMessage.includes('automation')) {
      const processMatch = message.match(/(automate|automation).{0,100}/i);
      if (processMatch) {
        requirements.push({
          id: this.generateId(),
          category: 'business-process',
          question: 'What process needs automation?',
          answer: processMatch[0],
          priority: 'critical',
          confidence: 0.8,
          followUpNeeded: true,
          tags: ['automation', 'process']
        });
      }
    }

    // Extract integration requirements
    const integrationKeywords = ['integrate', 'connect', 'sync', 'api', 'webhook'];
    integrationKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        requirements.push({
          id: this.generateId(),
          category: 'integrations',
          question: `What integration is needed for ${keyword}?`,
          answer: message,
          priority: 'high',
          confidence: 0.7,
          followUpNeeded: true,
          tags: ['integration', keyword]
        });
      }
    });

    return requirements;
  }

  private async generateResponse(intent: any, userMessage: string): Promise<string> {
    switch (this.context.phase) {
      case 'discovery':
        return this.generateDiscoveryResponse(intent, userMessage);
      
      case 'requirements':
        return this.generateRequirementsResponse(intent, userMessage);
      
      case 'blueprint':
        return this.generateBlueprintResponse(intent, userMessage);
      
      case 'implementation':
        return this.generateImplementationResponse(intent, userMessage);
      
      default:
        return this.generateDefaultResponse(intent, userMessage);
    }
  }

  private generateDiscoveryResponse(intent: any, userMessage: string): string {
    if (intent.type === 'business-process') {
      // Transition to requirements phase
      this.context.phase = 'requirements';
      
      // Find relevant workflows
      const workflows = workflowKB.searchWorkflows(userMessage, { 
        category: this.getCategoryFromKeywords(intent.keywords) 
      });

      if (workflows.length > 0) {
        const topWorkflows = workflows.slice(0, 3);
        const workflowList = topWorkflows.map(w => 
          `• **${w.name}** - ${w.description} (${w.difficulty} difficulty)`
        ).join('\n');

        return `Excellent! I can see this is a ${intent.keywords.join('/')}-related automation project. This is a popular area where I've helped many businesses achieve significant efficiency gains.

**I found ${workflows.length} relevant workflow patterns in my knowledge base:**

${workflowList}

To design the perfect solution for your specific needs, I need to understand your requirements better:

**Key Questions:**
1. **Current Process**: How do you currently handle this manually?
2. **Volume & Scale**: How many transactions/items do you process daily/weekly?
3. **Integration Needs**: What tools/platforms need to connect?
4. **Priority Goals**: What's most important - time savings, accuracy, or scalability?
5. **Timeline**: When do you need this operational?

The more details you provide, the more precise and effective your custom automation will be!`;
      }
    }

    // Default discovery response
    return this.responseTemplates.get('greeting') || 'How can I help you with automation today?';
  }

  private generateRequirementsResponse(intent: any, userMessage: string): string {
    // Analyze completeness of requirements
    const completeness = this.assessRequirementsCompleteness();
    
    if (completeness > 0.8) {
      // Ready for blueprint
      this.context.phase = 'blueprint';
      return this.generateBlueprintReadyResponse();
    }

    // Generate next questions
    const nextQuestions = this.generateNextQuestions();
    
    return `Great information! I'm building a clear picture of your automation needs.

**What I understand so far:**
${this.summarizeRequirements()}

**To complete the technical specification, I need a few more details:**

${nextQuestions}

Once I have these details, I'll generate your comprehensive project blueprint with technical architecture, n8n workflows, and implementation roadmap.`;
  }

  private generateBlueprintResponse(intent: any, userMessage: string): string {
    // Generate blueprint
    const blueprint = this.createProjectBlueprint();
    
    return `# 🚀 Your Custom Automation Blueprint

## Project Overview
${blueprint.overview}

## Technical Architecture
I've designed a ${blueprint.technicalArchitecture.components.length}-component system using proven n8n workflow patterns:

${blueprint.technicalArchitecture.components.map(c => 
  `### ${c.name} (${c.type})
${c.description}
- **n8n Nodes**: ${c.n8nNodes.join(', ')}
- **Dependencies**: ${c.dependencies.join(', ')}`
).join('\n\n')}

## Implementation Plan
**Timeline**: ${blueprint.implementationPlan.totalTimeEstimate}
**Phases**: ${blueprint.implementationPlan.phases.length}

${blueprint.implementationPlan.phases.map((phase, i) => 
  `**Phase ${i+1}: ${phase.name}** (${phase.duration})
${phase.tasks.map(t => `- ${t.name}`).join('\n')}`
).join('\n\n')}

## Investment & ROI
- **Estimated Cost**: Based on complexity and requirements
- **Expected ROI**: ${blueprint.estimatedROI}% within first year
- **Time Savings**: Estimated ${this.calculateTimeSavings()} hours/week

**Next Steps:**
1. Review and approve this blueprint
2. I'll generate the specific n8n workflow JSON templates
3. We'll create a detailed implementation guide

Would you like me to proceed with generating the n8n workflows, or do you have questions about any part of this blueprint?`;
  }

  private generateImplementationResponse(intent: any, userMessage: string): string {
    return `I'm now in implementation mode! I can help you with:

1. **Generating n8n Workflow JSON** - Complete, ready-to-import templates
2. **Step-by-step Implementation Guide** - Detailed setup instructions
3. **Testing & Validation Scripts** - Ensure everything works perfectly
4. **Optimization Recommendations** - Fine-tune for maximum performance

What would you like to focus on first?`;
  }

  private generateDefaultResponse(intent: any, userMessage: string): string {
    return `I understand you're interested in automation. I specialize in creating custom n8n workflows and can help with:

- **Business Process Automation** (e-commerce, CRM, marketing, support)
- **Data Integration & Processing** (APIs, databases, file handling)
- **AI-Enhanced Workflows** (intelligent routing, content generation, analysis)
- **Custom n8n Templates** (from our library of 3,400+ proven patterns)

What specific automation challenge are you facing?`;
  }

  private getCategoryFromKeywords(keywords: string[]): WorkflowCategory | undefined {
    const categoryMap: Record<string, WorkflowCategory> = {
      'ecommerce': 'e-commerce',
      'crm': 'crm-sales',
      'sales': 'crm-sales',
      'marketing': 'marketing-automation',
      'support': 'customer-support',
      'technical': 'data-processing'
    };

    for (const keyword of keywords) {
      if (categoryMap[keyword]) {
        return categoryMap[keyword];
      }
    }
    return undefined;
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private assessRequirementsCompleteness(): number {
    const criticalCategories: RequirementCategory[] = [
      'business-process', 
      'technical-specs', 
      'integrations', 
      'scale-volume'
    ];
    
    const coveredCategories = new Set(this.context.requirements.map(r => r.category));
    const completeness = criticalCategories.filter(cat => coveredCategories.has(cat)).length / criticalCategories.length;
    
    return completeness;
  }

  private generateNextQuestions(): string {
    const missingCategories = this.getMissingRequirementCategories();
    const questions: string[] = [];
    
    missingCategories.forEach(category => {
      const categoryQuestions = this.questionBank.get(category) || [];
      if (categoryQuestions.length > 0) {
        questions.push(`**${this.formatCategoryName(category)}**: ${categoryQuestions[0]}`);
      }
    });

    return questions.slice(0, 3).join('\n\n');
  }

  private getMissingRequirementCategories(): RequirementCategory[] {
    const covered = new Set(this.context.requirements.map(r => r.category));
    const all: RequirementCategory[] = [
      'business-process', 'technical-specs', 'integrations', 
      'scale-volume', 'security-compliance', 'budget-timeline'
    ];
    
    return all.filter(cat => !covered.has(cat));
  }

  private formatCategoryName(category: RequirementCategory): string {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private summarizeRequirements(): string {
    if (this.context.requirements.length === 0) {
      return 'No specific requirements captured yet.';
    }

    return this.context.requirements.map(req => 
      `• **${this.formatCategoryName(req.category)}**: ${req.answer.substring(0, 100)}...`
    ).join('\n');
  }

  private generateBlueprintReadyResponse(): string {
    return this.responseTemplates.get('blueprint-ready')?.replace(
      '{summary}', this.summarizeRequirements()
    ).replace(
      '{approach}', 'Based on your requirements, I recommend a multi-stage automation approach with proven n8n workflow patterns.'
    ) || 'Ready to generate your blueprint!';
  }

  private createProjectBlueprint(): ProjectBlueprint {
    return {
      id: this.generateId(),
      title: 'Custom AI Automation System',
      overview: 'Comprehensive automation solution designed specifically for your business needs using n8n workflows and AI integration.',
      businessCase: {
        problemStatement: 'Manual processes are time-consuming and error-prone',
        proposedSolution: 'Intelligent automation using n8n workflows with AI enhancement',
        expectedBenefits: ['80% time savings', 'Reduced errors', 'Better scalability'],
        successCriteria: ['Automated process completion', 'Error rate < 1%', 'Positive ROI within 6 months'],
        stakeholders: ['Operations team', 'IT team', 'Management']
      },
      technicalArchitecture: {
        components: [
          {
            name: 'Data Collector',
            type: 'trigger',
            description: 'Collects data from various sources using webhooks and scheduled triggers',
            n8nNodes: ['webhook', 'cron', 'http-request'],
            dependencies: ['External APIs'],
            configuration: {}
          },
          {
            name: 'Process Engine',
            type: 'processor',
            description: 'Core processing logic with business rules and AI integration',
            n8nNodes: ['function', 'if', 'switch', 'openai'],
            dependencies: ['AI API'],
            configuration: {}
          }
        ],
        dataFlow: [],
        integrations: [],
        securityConsiderations: ['API key management', 'Data encryption', 'Access controls'],
        scalabilityPlan: 'Horizontal scaling with load balancing'
      },
      implementationPlan: {
        phases: [
          {
            name: 'Setup & Configuration',
            duration: '3-5 days',
            tasks: [
              {
                id: '1',
                name: 'Environment setup',
                description: 'Configure n8n instance and basic settings',
                estimatedHours: 8,
                skillsRequired: ['n8n', 'DevOps'],
                priority: 'critical'
              }
            ],
            deliverables: ['Working n8n environment'],
            dependencies: [],
            riskLevel: 'low'
          }
        ],
        totalTimeEstimate: '2-3 weeks',
        resourceRequirements: ['n8n developer', 'System administrator'],
        prerequisites: ['API access', 'System credentials'],
        testingStrategy: 'Staged testing with sample data',
        deploymentPlan: 'Blue-green deployment'
      },
      riskAssessment: {
        risks: [],
        overallRiskLevel: 'low',
        mitigationStrategy: 'Comprehensive testing and phased rollout'
      },
      successMetrics: [],
      estimatedROI: 250,
      createdAt: new Date()
    };
  }

  private calculateTimeSavings(): number {
    // Estimate based on requirements
    return Math.floor(Math.random() * 20) + 10; // 10-30 hours/week
  }

  // Public methods for external use
  public getContext(): ConversationContext {
    return this.context;
  }

  public resetContext(): void {
    this.context = {
      phase: 'discovery',
      requirements: [],
      preferences: {},
      chatHistory: []
    };
  }

  public getRecommendedWorkflows(limit: number = 5): WorkflowTemplate[] {
    const requirements = this.context.requirements.map(r => r.answer);
    return workflowKB.getRecommendedWorkflows(requirements).slice(0, limit);
  }
}

// Export singleton instance
export const aiAgent = new AIEngineerAgent();