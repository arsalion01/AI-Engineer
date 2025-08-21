// AI Engineer - n8n Workflow JSON Builder
// Generates complete n8n workflow JSON templates from project blueprints

import { ProjectBlueprint, ProjectRequirement } from './ai-agent';
import { workflowKB } from './workflow-knowledge';

export interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface N8nWorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nWorkflowNode[];
  connections: Record<string, Record<string, N8nWorkflowConnection[][]>>;
  active: boolean;
  settings: Record<string, any>;
  staticData?: Record<string, any>;
  meta: {
    instanceId: string;
  };
  tags: string[];
  versionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowGenerationOptions {
  includeErrorHandling: boolean;
  addMonitoring: boolean;
  enableRetries: boolean;
  includeLogging: boolean;
  securityLevel: 'basic' | 'standard' | 'high';
  scalabilityPattern: 'simple' | 'distributed' | 'enterprise';
}

export class N8nWorkflowBuilder {
  private nodeIdCounter: number = 1;
  private nodePositionX: number = 300;
  private nodePositionY: number = 300;
  private nodeSpacingX: number = 400;
  private nodeSpacingY: number = 200;

  constructor() {
    this.resetCounters();
  }

  /**
   * Generate complete n8n workflow from project blueprint
   */
  public generateWorkflowFromBlueprint(
    blueprint: ProjectBlueprint,
    requirements: ProjectRequirement[],
    options: WorkflowGenerationOptions = this.getDefaultOptions()
  ): N8nWorkflow[] {
    const workflows: N8nWorkflow[] = [];
    
    // Generate main workflow based on blueprint architecture
    const mainWorkflow = this.buildMainWorkflow(blueprint, requirements, options);
    workflows.push(mainWorkflow);
    
    // Generate supporting workflows if needed
    if (this.requiresDataProcessingWorkflow(blueprint)) {
      const dataWorkflow = this.buildDataProcessingWorkflow(blueprint, requirements, options);
      workflows.push(dataWorkflow);
    }
    
    if (this.requiresMonitoringWorkflow(blueprint, options)) {
      const monitoringWorkflow = this.buildMonitoringWorkflow(blueprint, options);
      workflows.push(monitoringWorkflow);
    }
    
    return workflows;
  }

  /**
   * Build the main automation workflow
   */
  private buildMainWorkflow(
    blueprint: ProjectBlueprint,
    requirements: ProjectRequirement[],
    options: WorkflowGenerationOptions
  ): N8nWorkflow {
    this.resetCounters();
    
    const nodes: N8nWorkflowNode[] = [];
    const connections: Record<string, Record<string, N8nWorkflowConnection[][]>> = {};
    
    // 1. Add trigger node
    const triggerNode = this.createTriggerNode(requirements);
    nodes.push(triggerNode);
    this.advancePosition();
    
    let previousNodeName = triggerNode.name;
    
    // 2. Add input validation node if needed
    if (options.securityLevel !== 'basic') {
      const validationNode = this.createValidationNode();
      nodes.push(validationNode);
      this.connectNodes(connections, previousNodeName, validationNode.name);
      previousNodeName = validationNode.name;
      this.advancePosition();
    }
    
    // 3. Add processing nodes based on blueprint components
    const processsingNodes = this.createProcessingNodes(blueprint, requirements);
    processsingNodes.forEach(node => {
      nodes.push(node);
      this.connectNodes(connections, previousNodeName, node.name);
      previousNodeName = node.name;
      this.advancePosition();
    });
    
    // 4. Add integration nodes
    const integrationNodes = this.createIntegrationNodes(blueprint);
    integrationNodes.forEach(node => {
      nodes.push(node);
      this.connectNodes(connections, previousNodeName, node.name);
      this.advancePosition();
    });
    
    // 5. Add output/notification nodes
    const outputNode = this.createOutputNode(blueprint);
    nodes.push(outputNode);
    this.connectNodes(connections, previousNodeName, outputNode.name);
    this.advancePosition();
    
    // 6. Add error handling if enabled
    if (options.includeErrorHandling) {
      const errorNodes = this.createErrorHandlingNodes();
      nodes.push(...errorNodes);
      this.addErrorHandlingConnections(connections, nodes, errorNodes);
    }
    
    return {
      id: this.generateWorkflowId(),
      name: `${blueprint.title} - Main Workflow`,
      nodes,
      connections,
      active: false,
      settings: {
        executionOrder: 'v1'
      },
      meta: {
        instanceId: 'n8n-instance'
      },
      tags: this.generateWorkflowTags(blueprint),
      versionId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Create trigger node based on requirements
   */
  private createTriggerNode(requirements: ProjectRequirement[]): N8nWorkflowNode {
    const triggerType = this.determineTriggerType(requirements);
    
    switch (triggerType) {
      case 'webhook':
        return {
          id: this.generateNodeId(),
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [this.nodePositionX, this.nodePositionY] as [number, number],
          parameters: {
            httpMethod: 'POST',
            path: 'automation-trigger',
            responseMode: 'responseNode',
            options: {
              noResponseBody: false
            }
          }
        };
        
      case 'schedule':
        return {
          id: this.generateNodeId(),
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.cron',
          typeVersion: 1,
          position: [this.nodePositionX, this.nodePositionY] as [number, number],
          parameters: {
            rule: {
              interval: [
                {
                  field: 'cronExpression',
                  expression: '0 9 * * 1-5' // Default: weekdays at 9am
                }
              ]
            }
          }
        };
        
      case 'email':
        return {
          id: this.generateNodeId(),
          name: 'Email Trigger',
          type: 'n8n-nodes-base.emailReadImap',
          typeVersion: 2,
          position: [this.nodePositionX, this.nodePositionY] as [number, number],
          parameters: {
            format: 'resolved',
            options: {
              allowUnauthorizedCerts: false,
              forceReconnect: true
            }
          },
          credentials: {
            imap: 'email-credentials'
          }
        };
        
      default:
        return {
          id: this.generateNodeId(),
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [this.nodePositionX, this.nodePositionY] as [number, number],
          parameters: {}
        };
    }
  }

  /**
   * Create validation node for input security
   */
  private createValidationNode(): N8nWorkflowNode {
    return {
      id: this.generateNodeId(),
      name: 'Input Validation',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        functionCode: `
// Input validation and sanitization
const inputData = $input.all();

for (let item of inputData) {
  // Validate required fields
  if (!item.json || typeof item.json !== 'object') {
    throw new Error('Invalid input data structure');
  }
  
  // Sanitize string inputs
  for (let key in item.json) {
    if (typeof item.json[key] === 'string') {
      // Basic sanitization - remove potentially harmful content
      item.json[key] = item.json[key]
        .replace(/<script[^>]*>.*?<\\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
  }
  
  // Add validation timestamp
  item.json._validated_at = new Date().toISOString();
}

return inputData;
`
      }
    };
  }

  /**
   * Create processing nodes based on blueprint components
   */
  private createProcessingNodes(blueprint: ProjectBlueprint, requirements: ProjectRequirement[]): N8nWorkflowNode[] {
    const nodes: N8nWorkflowNode[] = [];
    const components = blueprint.technicalArchitecture?.components || [];
    
    components.forEach(component => {
      if (component.type === 'processor') {
        if (component.name.includes('AI')) {
          nodes.push(this.createAIProcessingNode(component, requirements));
        } else if (component.name.includes('Data')) {
          nodes.push(this.createDataProcessingNode(component));
        } else {
          nodes.push(this.createGenericProcessingNode(component));
        }
      }
    });
    
    // If no specific processing nodes, add a default one
    if (nodes.length === 0) {
      nodes.push(this.createGenericProcessingNode({
        name: 'Data Processing',
        type: 'processor',
        description: 'Process and transform input data'
      }));
    }
    
    return nodes;
  }

  /**
   * Create AI processing node
   */
  private createAIProcessingNode(component: any, requirements: ProjectRequirement[]): N8nWorkflowNode {
    const hasTextProcessing = this.requiresTextProcessing(requirements);
    const hasClassification = this.requiresClassification(requirements);
    
    return {
      id: this.generateNodeId(),
      name: 'AI Processing',
      type: 'n8n-nodes-base.openAi',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        resource: hasTextProcessing ? 'text' : 'chat',
        operation: hasClassification ? 'classify' : 'complete',
        model: 'gpt-3.5-turbo',
        messages: {
          messageValues: [
            {
              role: 'system',
              message: 'You are an AI assistant helping with business process automation. Analyze the input data and provide structured output.'
            },
            {
              role: 'user',
              message: '={{JSON.stringify($json)}}'
            }
          ]
        },
        options: {
          temperature: 0.3,
          maxTokens: 1000
        }
      },
      credentials: {
        openAiApi: 'openai-credentials'
      }
    };
  }

  /**
   * Create data processing node
   */
  private createDataProcessingNode(component: any): N8nWorkflowNode {
    return {
      id: this.generateNodeId(),
      name: 'Transform Data',
      type: 'n8n-nodes-base.set',
      typeVersion: 3,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        mode: 'manual',
        duplicateItem: false,
        assignments: {
          assignments: [
            {
              id: this.generateNodeId(),
              name: 'processed_at',
              value: '={{new Date().toISOString()}}',
              type: 'string'
            },
            {
              id: this.generateNodeId(),
              name: 'status',
              value: 'processed',
              type: 'string'
            },
            {
              id: this.generateNodeId(),
              name: 'original_data',
              value: '={{JSON.stringify($json)}}',
              type: 'string'
            }
          ]
        },
        options: {}
      }
    };
  }

  /**
   * Create generic processing node
   */
  private createGenericProcessingNode(component: any): N8nWorkflowNode {
    return {
      id: this.generateNodeId(),
      name: 'Process Data',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        functionCode: `
// Business logic processing
const items = $input.all();

for (let item of items) {
  // Add processing logic here based on requirements
  item.json.processed = true;
  item.json.processed_at = new Date().toISOString();
  
  // Example: Calculate derived values
  if (item.json.amount && item.json.tax_rate) {
    item.json.total_amount = item.json.amount * (1 + item.json.tax_rate);
  }
  
  // Example: Categorization logic
  if (item.json.type) {
    switch (item.json.type.toLowerCase()) {
      case 'urgent':
        item.json.priority = 'high';
        break;
      case 'important':
        item.json.priority = 'medium';
        break;
      default:
        item.json.priority = 'low';
    }
  }
}

return items;
`
      }
    };
  }

  /**
   * Create integration nodes for external systems
   */
  private createIntegrationNodes(blueprint: ProjectBlueprint): N8nWorkflowNode[] {
    const nodes: N8nWorkflowNode[] = [];
    const integrations = blueprint.technicalArchitecture?.integrations || [];
    
    integrations.forEach(integration => {
      const integrationNode = this.createIntegrationNodeForService(integration);
      if (integrationNode) {
        nodes.push(integrationNode);
      }
    });
    
    // Default integration node if none specified
    if (nodes.length === 0) {
      nodes.push(this.createHttpRequestNode());
    }
    
    return nodes;
  }

  /**
   * Create integration node for specific service
   */
  private createIntegrationNodeForService(integration: any): N8nWorkflowNode | null {
    const service = integration.service?.toLowerCase() || '';
    
    if (service.includes('hubspot')) {
      return {
        id: this.generateNodeId(),
        name: 'HubSpot Integration',
        type: 'n8n-nodes-base.hubspot',
        typeVersion: 2,
        position: [this.nodePositionX, this.nodePositionY] as [number, number],
        parameters: {
          resource: 'contact',
          operation: 'upsert',
          email: '={{$json.email}}',
          additionalFields: {
            firstName: '={{$json.first_name}}',
            lastName: '={{$json.last_name}}',
            company: '={{$json.company}}'
          }
        },
        credentials: {
          hubspotApi: 'hubspot-credentials'
        }
      };
    }
    
    if (service.includes('salesforce')) {
      return {
        id: this.generateNodeId(),
        name: 'Salesforce Integration',
        type: 'n8n-nodes-base.salesforce',
        typeVersion: 2,
        position: [this.nodePositionX, this.nodePositionY] as [number, number],
        parameters: {
          resource: 'contact',
          operation: 'upsert',
          externalId: 'Email',
          externalIdValue: '={{$json.email}}',
          updateFields: {
            FirstName: '={{$json.first_name}}',
            LastName: '={{$json.last_name}}',
            Email: '={{$json.email}}'
          }
        },
        credentials: {
          salesforceOAuth2Api: 'salesforce-credentials'
        }
      };
    }
    
    if (service.includes('stripe')) {
      return {
        id: this.generateNodeId(),
        name: 'Stripe Integration',
        type: 'n8n-nodes-base.stripe',
        typeVersion: 1,
        position: [this.nodePositionX, this.nodePositionY] as [number, number],
        parameters: {
          resource: 'customer',
          operation: 'create',
          email: '={{$json.email}}',
          additionalFields: {
            name: '={{$json.name}}',
            description: '={{$json.description}}'
          }
        },
        credentials: {
          stripeApi: 'stripe-credentials'
        }
      };
    }
    
    if (service.includes('database')) {
      return {
        id: this.generateNodeId(),
        name: 'Database Insert',
        type: 'n8n-nodes-base.postgres',
        typeVersion: 2,
        position: [this.nodePositionX, this.nodePositionY] as [number, number],
        parameters: {
          operation: 'insert',
          schema: 'public',
          table: 'automation_data',
          columns: 'data, created_at',
          additionalFields: {
            mode: 'independently'
          }
        },
        credentials: {
          postgres: 'database-credentials'
        }
      };
    }
    
    // Default to HTTP request for unknown services
    return this.createHttpRequestNode();
  }

  /**
   * Create HTTP request node for custom integrations
   */
  private createHttpRequestNode(): N8nWorkflowNode {
    return {
      id: this.generateNodeId(),
      name: 'API Integration',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        method: 'POST',
        url: 'https://api.example.com/webhook',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'Content-Type',
              value: 'application/json'
            },
            {
              name: 'Authorization',
              value: 'Bearer {{$credentials.apiToken}}'
            }
          ]
        },
        sendBody: true,
        bodyParameters: {
          parameters: [
            {
              name: 'data',
              value: '={{JSON.stringify($json)}}'
            },
            {
              name: 'timestamp',
              value: '={{new Date().toISOString()}}'
            }
          ]
        },
        options: {
          timeout: 30000,
          retry: {
            enabled: true,
            maxTries: 3
          }
        }
      }
    };
  }

  /**
   * Create output/notification node
   */
  private createOutputNode(blueprint: ProjectBlueprint): N8nWorkflowNode {
    return {
      id: this.generateNodeId(),
      name: 'Send Notification',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        fromEmail: 'automation@company.com',
        toEmail: '={{$json.notification_email || "admin@company.com"}}',
        subject: `${blueprint.title} - Process Completed`,
        message: `
The automation process has been completed successfully.

Details:
- Process: ${blueprint.title}
- Completed: {{new Date().toLocaleString()}}
- Status: {{$json.status || "Success"}}
- Records processed: {{$json.count || 1}}

Data: {{JSON.stringify($json, null, 2)}}
`,
        options: {
          allowUnauthorizedCerts: false,
          appendAttribution: false
        }
      },
      credentials: {
        smtp: 'email-credentials'
      }
    };
  }

  /**
   * Create error handling nodes
   */
  private createErrorHandlingNodes(): N8nWorkflowNode[] {
    const errorNodes: N8nWorkflowNode[] = [];
    
    // Error handler function
    errorNodes.push({
      id: this.generateNodeId(),
      name: 'Error Handler',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY + 300],
      parameters: {
        functionCode: `
// Error handling logic
const error = $input.first().json;

return [{
  json: {
    error_type: error.name || 'Unknown Error',
    error_message: error.message || 'An unexpected error occurred',
    error_stack: error.stack,
    timestamp: new Date().toISOString(),
    workflow_id: $workflow.id,
    execution_id: $execution.id,
    node_name: error.node?.name || 'Unknown Node',
    retry_count: error.retry_count || 0
  }
}];
`
      }
    });
    
    // Error notification
    errorNodes.push({
      id: this.generateNodeId(),
      name: 'Error Notification',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2,
      position: [this.nodePositionX, this.nodePositionY + 500],
      parameters: {
        fromEmail: 'automation@company.com',
        toEmail: 'admin@company.com',
        subject: 'Automation Error Alert',
        message: `
An error occurred in the automation workflow:

Error Type: {{$json.error_type}}
Message: {{$json.error_message}}
Node: {{$json.node_name}}
Time: {{$json.timestamp}}
Workflow: {{$json.workflow_id}}

Please check the workflow execution for more details.
`,
        options: {
          allowUnauthorizedCerts: false
        }
      },
      credentials: {
        smtp: 'email-credentials'
      }
    });
    
    return errorNodes;
  }

  /**
   * Build data processing workflow
   */
  private buildDataProcessingWorkflow(
    blueprint: ProjectBlueprint,
    requirements: ProjectRequirement[],
    options: WorkflowGenerationOptions
  ): N8nWorkflow {
    this.resetCounters();
    
    const nodes: N8nWorkflowNode[] = [];
    const connections: Record<string, Record<string, N8nWorkflowConnection[][]>> = {};
    
    // Schedule trigger for data processing
    const triggerNode = {
      id: this.generateNodeId(),
      name: 'Data Processing Schedule',
      type: 'n8n-nodes-base.cron',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        rule: {
          interval: [
            {
              field: 'cronExpression',
              expression: '0 */4 * * *' // Every 4 hours
            }
          ]
        }
      }
    };
    nodes.push(triggerNode);
    this.advancePosition();
    
    // Data fetch node
    const fetchNode = {
      id: this.generateNodeId(),
      name: 'Fetch Data',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        operation: 'select',
        query: 'SELECT * FROM pending_data WHERE processed = false ORDER BY created_at ASC LIMIT 100'
      },
      credentials: {
        postgres: 'database-credentials'
      }
    };
    nodes.push(fetchNode);
    this.connectNodes(connections, triggerNode.name, fetchNode.name);
    this.advancePosition();
    
    // Processing logic
    const processNode = {
      id: this.generateNodeId(),
      name: 'Process Data Batch',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        functionCode: `
const items = $input.all();
const processedItems = [];

for (let item of items) {
  // Data processing logic
  const processed = {
    ...item.json,
    processed: true,
    processed_at: new Date().toISOString(),
    processing_duration: Math.floor(Math.random() * 1000) + 100
  };
  
  processedItems.push({ json: processed });
}

return processedItems;
`
      }
    };
    nodes.push(processNode);
    this.connectNodes(connections, fetchNode.name, processNode.name);
    this.advancePosition();
    
    // Update processed status
    const updateNode = {
      id: this.generateNodeId(),
      name: 'Update Status',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        operation: 'update',
        table: 'pending_data',
        updateKey: 'id',
        columns: 'processed, processed_at',
        additionalFields: {
          mode: 'independently'
        }
      },
      credentials: {
        postgres: 'database-credentials'
      }
    };
    nodes.push(updateNode);
    this.connectNodes(connections, processNode.name, updateNode.name);
    
    return {
      id: this.generateWorkflowId(),
      name: `${blueprint.title} - Data Processing`,
      nodes,
      connections,
      active: true,
      settings: {
        executionOrder: 'v1'
      },
      meta: {
        instanceId: 'n8n-instance'
      },
      tags: [...this.generateWorkflowTags(blueprint), 'data-processing'],
      versionId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Build monitoring workflow
   */
  private buildMonitoringWorkflow(blueprint: ProjectBlueprint, options: WorkflowGenerationOptions): N8nWorkflow {
    this.resetCounters();
    
    const nodes: N8nWorkflowNode[] = [];
    const connections: Record<string, Record<string, N8nWorkflowConnection[][]>> = {};
    
    // Monitoring schedule
    const triggerNode = {
      id: this.generateNodeId(),
      name: 'Monitoring Schedule',
      type: 'n8n-nodes-base.cron',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        rule: {
          interval: [
            {
              field: 'cronExpression',
              expression: '*/15 * * * *' // Every 15 minutes
            }
          ]
        }
      }
    };
    nodes.push(triggerNode);
    this.advancePosition();
    
    // Health check
    const healthCheckNode = {
      id: this.generateNodeId(),
      name: 'System Health Check',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [this.nodePositionX, this.nodePositionY] as [number, number],
      parameters: {
        functionCode: `
// System health monitoring
const healthChecks = [];

// Check workflow execution status
const recentExecutions = $workflow.getExecutions(10);
const failureRate = recentExecutions.filter(e => e.status === 'failed').length / recentExecutions.length;

healthChecks.push({
  check: 'workflow_failure_rate',
  status: failureRate < 0.1 ? 'healthy' : 'warning',
  value: failureRate,
  threshold: 0.1
});

// Check system resources (mock)
healthChecks.push({
  check: 'cpu_usage',
  status: Math.random() < 0.8 ? 'healthy' : 'warning',
  value: Math.random() * 100,
  threshold: 80
});

return [{ json: { checks: healthChecks, timestamp: new Date().toISOString() } }];
`
      }
    };
    nodes.push(healthCheckNode);
    this.connectNodes(connections, triggerNode.name, healthCheckNode.name);
    
    return {
      id: this.generateWorkflowId(),
      name: `${blueprint.title} - Monitoring`,
      nodes,
      connections,
      active: true,
      settings: {
        executionOrder: 'v1'
      },
      meta: {
        instanceId: 'n8n-instance'
      },
      tags: [...this.generateWorkflowTags(blueprint), 'monitoring'],
      versionId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Helper methods
  private resetCounters(): void {
    this.nodeIdCounter = 1;
    this.nodePositionX = 300;
    this.nodePositionY = 300;
  }

  private generateNodeId(): string {
    return `node_${this.nodeIdCounter++}`;
  }

  private generateWorkflowId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private advancePosition(): void {
    this.nodePositionX += this.nodeSpacingX;
  }

  private connectNodes(
    connections: Record<string, Record<string, N8nWorkflowConnection[][]>>,
    fromNode: string,
    toNode: string
  ): void {
    if (!connections[fromNode]) {
      connections[fromNode] = {};
    }
    if (!connections[fromNode].main) {
      connections[fromNode].main = [];
    }
    connections[fromNode].main.push([{
      node: toNode,
      type: 'main',
      index: 0
    }]);
  }

  private addErrorHandlingConnections(
    connections: Record<string, Record<string, N8nWorkflowConnection[][]>>,
    allNodes: N8nWorkflowNode[],
    errorNodes: N8nWorkflowNode[]
  ): void {
    // Connect error outputs to error handler
    const errorHandler = errorNodes.find(n => n.name === 'Error Handler');
    const errorNotification = errorNodes.find(n => n.name === 'Error Notification');
    
    if (errorHandler && errorNotification) {
      this.connectNodes(connections, errorHandler.name, errorNotification.name);
    }
  }

  private determineTriggerType(requirements: ProjectRequirement[]): string {
    const content = requirements.map(r => r.answer.toLowerCase()).join(' ');
    
    if (content.includes('webhook') || content.includes('api') || content.includes('real-time')) {
      return 'webhook';
    }
    if (content.includes('schedule') || content.includes('daily') || content.includes('hourly')) {
      return 'schedule';
    }
    if (content.includes('email') || content.includes('imap')) {
      return 'email';
    }
    
    return 'manual';
  }

  private requiresTextProcessing(requirements: ProjectRequirement[]): boolean {
    const content = requirements.map(r => r.answer.toLowerCase()).join(' ');
    return content.includes('text') || content.includes('content') || content.includes('message');
  }

  private requiresClassification(requirements: ProjectRequirement[]): boolean {
    const content = requirements.map(r => r.answer.toLowerCase()).join(' ');
    return content.includes('classify') || content.includes('categorize') || content.includes('analyze');
  }

  private requiresDataProcessingWorkflow(blueprint: ProjectBlueprint): boolean {
    return blueprint.technicalArchitecture?.components?.some(
      c => c.type === 'storage' || c.name.includes('Data')
    ) || false;
  }

  private requiresMonitoringWorkflow(blueprint: ProjectBlueprint, options: WorkflowGenerationOptions): boolean {
    return options.addMonitoring || blueprint.technicalArchitecture?.components?.length > 3;
  }

  private generateWorkflowTags(blueprint: ProjectBlueprint): string[] {
    const tags = ['automation', 'ai-engineer'];
    
    if (blueprint.title.toLowerCase().includes('ecommerce')) {
      tags.push('ecommerce');
    }
    if (blueprint.title.toLowerCase().includes('crm')) {
      tags.push('crm', 'sales');
    }
    if (blueprint.title.toLowerCase().includes('data')) {
      tags.push('data-processing');
    }
    
    return tags;
  }

  private getDefaultOptions(): WorkflowGenerationOptions {
    return {
      includeErrorHandling: true,
      addMonitoring: true,
      enableRetries: true,
      includeLogging: true,
      securityLevel: 'standard',
      scalabilityPattern: 'simple'
    };
  }

  /**
   * Export workflow as JSON string for direct import into n8n
   */
  public exportWorkflowJSON(workflow: N8nWorkflow): string {
    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Generate multiple workflow variations for A/B testing
   */
  public generateWorkflowVariations(
    blueprint: ProjectBlueprint,
    requirements: ProjectRequirement[]
  ): N8nWorkflow[] {
    const variations: N8nWorkflow[] = [];
    
    // Basic version
    const basic = this.generateWorkflowFromBlueprint(blueprint, requirements, {
      includeErrorHandling: false,
      addMonitoring: false,
      enableRetries: false,
      includeLogging: false,
      securityLevel: 'basic',
      scalabilityPattern: 'simple'
    });
    
    // Advanced version
    const advanced = this.generateWorkflowFromBlueprint(blueprint, requirements, {
      includeErrorHandling: true,
      addMonitoring: true,
      enableRetries: true,
      includeLogging: true,
      securityLevel: 'high',
      scalabilityPattern: 'enterprise'
    });
    
    return [...basic, ...advanced];
  }
}

// Export singleton instance
export const n8nBuilder = new N8nWorkflowBuilder();