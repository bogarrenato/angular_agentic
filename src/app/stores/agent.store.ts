import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AppLocalizationsService } from '../services/app-localizations.service';

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'excel' | 'api' | 'file';
  permissions: ('read' | 'write' | 'execute')[];
  icon: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'master' | 'slave';
  status: 'online' | 'busy' | 'offline';
  resources: Resource[];
  parentId?: string;
  icon: string;
  instructions?: string[];
  applications?: string[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'agent';
  agentId?: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastActivity: Date;
  messages: Message[];
}

export interface AgentState {
  agents: Agent[];
  conversations: Conversation[];
  selectedAgentId: string | null;
  selectedConversationId: string | null;
}

export const AgentStore = signalStore(
  { providedIn: 'root' },
  withState<AgentState>({
    agents: [],
    conversations: [],
    selectedAgentId: null,
    selectedConversationId: null
  }),
  withComputed(({ agents, conversations, selectedAgentId, selectedConversationId }) => {
    const localizations = inject(AppLocalizationsService);
    
    return {
      masterAgents: computed(() => agents().filter(agent => agent.type === 'master')),
      slaveAgents: computed(() => agents().filter(agent => agent.type === 'slave')),
      selectedAgent: computed(() => {
        const id = selectedAgentId();
        return id ? agents().find(agent => agent.id === id) : null;
      }),
      selectedConversation: computed(() => {
        const id = selectedConversationId();
        return id ? conversations().find(conv => conv.id === id) : null;
      }),
      agentConversations: computed(() => {
        const agentId = selectedAgentId();
        return agentId ? conversations().filter(conv => conv.agentId === agentId) : [];
      })
    };
  }),
  withMethods((store) => {
    const localizations = inject(AppLocalizationsService);
    
    return {
      initializeDummyData() {
        // Start with some demo data to show the interface
        const demoAgents: Agent[] = [
          {
            id: 'demo-master-1',
            name: 'SimplyFire főmunkatárs',
            description: 'Admin agent • nem törölhető, rendszerszintű jogosultságokkal.',
            type: 'master',
            status: 'online',
            icon: 'pi pi-robot',
            resources: [
              {
                id: 'res-1',
                name: '/shared/drive/projects',
                description: 'Shared project files',
                type: 'file',
                permissions: ['read', 'write'],
                icon: 'pi pi-folder'
              },
              {
                id: 'res-2',
                name: 'Azure Blob: sf-prod-01',
                description: 'Production data storage',
                type: 'database',
                permissions: ['read', 'write'],
                icon: 'pi pi-cloud'
              },
              {
                id: 'res-3',
                name: 'Local: /data/vectors',
                description: 'Vector embeddings storage',
                type: 'database',
                permissions: ['read'],
                icon: 'pi pi-database'
              },
              {
                id: 'res-4',
                name: 'Secrets: managed vault',
                description: 'Secure credential storage',
                type: 'api',
                permissions: ['read'],
                icon: 'pi pi-key'
              }
            ],
            instructions: ['Üzleti hangnem', 'Rövid, tömör válaszok', 'Források hivatkozása, ha releváns'],
            applications: ['Outlook Connector (e-mail küldés/fogadás)', 'SQL driver', 'LibreOffice Writer/Calc', 'PDF motor', 'Kép (png/jpeg) ingest']
          },
          {
            id: 'demo-slave-1',
            name: 'Pénzügyi Elemző',
            description: 'Cashflow előrejelzés, SQL olvasás.',
            type: 'slave',
            status: 'online',
            icon: 'pi pi-chart-line',
            parentId: 'demo-master-1',
            resources: [
              {
                id: 'res-5',
                name: 'DB: sales-read',
                description: 'Sales database (read-only)',
                type: 'database',
                permissions: ['read'],
                icon: 'pi pi-database'
              },
              {
                id: 'res-6',
                name: '/reports/finance',
                description: 'Financial reports directory',
                type: 'file',
                permissions: ['read', 'write'],
                icon: 'pi pi-file-pdf'
              }
            ],
            instructions: ['Elemző hangnem', 'Számok indoklása'],
            applications: ['SQL read-only', 'PDF export']
          }
        ];

        const demoConversations: Conversation[] = [
          {
            id: 'demo-conv-1',
            agentId: 'demo-master-1',
            title: 'Konnektor hozzáadása - OneDrive',
            lastMessage: 'Kérem a OneDrive konnektor telepítését...',
            messageCount: 2,
            lastActivity: new Date('2025-09-02T10:05:00'),
            messages: [
              {
                id: 'msg-1',
                content: 'Üdv! Milyen tárhelyhez kell jogosultság?',
                timestamp: new Date('2025-09-02T10:05:00'),
                sender: 'agent',
                agentId: 'demo-master-1'
              },
              {
                id: 'msg-2',
                content: 'OneDrive Business, csak olvasás.',
                timestamp: new Date('2025-09-02T10:06:00'),
                sender: 'user',
                agentId: 'demo-master-1'
              }
            ]
          },
          {
            id: 'demo-conv-2',
            agentId: 'demo-master-1',
            title: 'Munka ütemezése - heti PDF riport',
            lastMessage: 'Pénteken 16:00-kor heti riport PDF-be...',
            messageCount: 2,
            lastActivity: new Date('2025-09-08T09:12:00'),
            messages: [
              {
                id: 'msg-3',
                content: 'Pénteken 16:00-kor kérek heti riportot.',
                timestamp: new Date('2025-09-08T09:12:00'),
                sender: 'user',
                agentId: 'demo-master-1'
              },
              {
                id: 'msg-4',
                content: 'Beállítva. Emailben küldöm a PDF-et.',
                timestamp: new Date('2025-09-08T09:13:00'),
                sender: 'agent',
                agentId: 'demo-master-1'
              }
            ]
          },
          {
            id: 'demo-conv-3',
            agentId: 'demo-master-1',
            title: 'Ügynök létrehozása - Pénzügyi Elemző',
            lastMessage: 'Feladat: cashflow előrejelzés, SQL olvasás...',
            messageCount: 1,
            lastActivity: new Date('2025-09-10T14:31:00'),
            messages: [
              {
                id: 'msg-5',
                content: 'Felveszem a Pénzügyi Elemzőt a csapatba.',
                timestamp: new Date('2025-09-10T14:31:00'),
                sender: 'agent',
                agentId: 'demo-master-1'
              }
            ]
          },
          {
            id: 'demo-conv-4',
            agentId: 'demo-slave-1',
            title: 'SQL lekérdezés - havi bevétel',
            lastMessage: 'SELECT month, revenue FROM sales...',
            messageCount: 1,
            lastActivity: new Date('2025-09-10T15:02:00'),
            messages: [
              {
                id: 'msg-6',
                content: 'Kérlek futtasd le a havi bevétel riportot.',
                timestamp: new Date('2025-09-10T15:02:00'),
                sender: 'user',
                agentId: 'demo-slave-1'
              }
            ]
          },
          {
            id: 'demo-conv-5',
            agentId: 'demo-slave-1',
            title: 'PDF export - költségkimutatás',
            lastMessage: 'PDF export sablon frissítése...',
            messageCount: 1,
            lastActivity: new Date('2025-09-11T10:12:00'),
            messages: [
              {
                id: 'msg-7',
                content: 'Elkészítettem a PDF export sablont.',
                timestamp: new Date('2025-09-11T10:12:00'),
                sender: 'agent',
                agentId: 'demo-slave-1'
              }
            ]
          }
        ];

        patchState(store, {
          agents: demoAgents,
          conversations: demoConversations,
          selectedAgentId: null,
          selectedConversationId: null
        });
      },

      createMasterAgentFromMessage(userMessage: string) {
        console.log('Creating new master agent from message:', userMessage);
        const localizations = inject(AppLocalizationsService);
        const agentId = `master-${Date.now()}`;
        const conversationId = `conv-${Date.now()}`;
        
        // Helper functions for generating agent data
        const generateInstructionsForAgent = (message: string): string[] => {
          const lowerMessage = message.toLowerCase();
          const instructions = ['Üzleti hangnem', 'Rövid, tömör válaszok', 'Források hivatkozása, ha releváns'];
          
          if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
            instructions.push('Számok indoklása', 'Grafikus ábrázolás preferálása');
          } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
            instructions.push('Empatikus válaszok', 'Gyors megoldás keresése');
          } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
            instructions.push('Tiszta kód írása', 'Dokumentáció készítése');
          }
          
          return instructions;
        };

        const generateApplicationsForAgent = (message: string): string[] => {
          const lowerMessage = message.toLowerCase();
          const applications = ['Outlook Connector (e-mail küldés/fogadás)', 'SQL driver', 'LibreOffice Writer/Calc', 'PDF motor', 'Kép (png/jpeg) ingest'];
          
          if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
            applications.push('Excel Connector', 'Chart Generator', 'Data Visualization Tools');
          } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
            applications.push('Ticket System', 'Knowledge Base Search', 'Customer Database');
          } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
            applications.push('Git Integration', 'Code Review Tools', 'Testing Framework');
          }
          
          return applications;
        };
        
        // Create a master agent based on the user's message
        const masterAgent: Agent = {
          id: agentId,
          name: this.generateAgentNameFromMessage(userMessage),
          description: this.generateAgentDescriptionFromMessage(userMessage),
          type: 'master',
          status: 'online',
          icon: 'pi pi-robot',
          resources: this.generateResourcesForAgent(userMessage),
          instructions: generateInstructionsForAgent(userMessage),
          applications: generateApplicationsForAgent(userMessage)
        };

        // Create slave agents for this master
        const slaveAgents: Agent[] = this.generateSlaveAgentsForMaster(agentId, userMessage);

        // Create initial conversation
        const conversation: Conversation = {
          id: conversationId,
          agentId: agentId,
          title: this.generateConversationTitle(userMessage),
          lastMessage: userMessage,
          messageCount: 1,
          lastActivity: new Date(),
          messages: [
            {
              id: `msg-${Date.now()}-1`,
              content: userMessage,
              timestamp: new Date(),
              sender: 'user',
              agentId: agentId
            },
            {
              id: `msg-${Date.now()}-2`,
              content: this.generateAgentResponse(userMessage),
              timestamp: new Date(),
              sender: 'agent',
              agentId: agentId
            }
          ]
        };

        // Update state
        console.log('Updating state with new agent:', masterAgent.name);
        patchState(store, {
          agents: [...store.agents(), masterAgent, ...slaveAgents],
          conversations: [...store.conversations(), conversation],
          selectedAgentId: agentId,
          selectedConversationId: conversationId
        });
        console.log('State updated. Selected agent ID:', agentId);
      },

      generateAgentNameFromMessage(message: string): string {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('data') || lowerMessage.includes('analysis') || lowerMessage.includes('excel')) {
          return 'Data Analysis Agent';
        } else if (lowerMessage.includes('customer') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
          return 'Customer Support Agent';
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('development')) {
          return 'Development Agent';
        } else if (lowerMessage.includes('marketing') || lowerMessage.includes('social') || lowerMessage.includes('campaign')) {
          return 'Marketing Agent';
        } else {
          return 'AI Assistant Agent';
        }
      },

      generateAgentDescriptionFromMessage(message: string): string {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
          return 'Specialized in data analysis, Excel processing, and generating insights from datasets';
        } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
          return 'Handles customer inquiries, ticket management, and provides support solutions';
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
          return 'Expert in software development, code review, and technical problem solving';
        } else if (lowerMessage.includes('marketing') || lowerMessage.includes('social')) {
          return 'Creates marketing strategies, manages social media, and develops campaigns';
        } else {
          return 'General purpose AI assistant ready to help with various tasks';
        }
      },

      generateResourcesForAgent(message: string): Resource[] {
        const lowerMessage = message.toLowerCase();
        const resources: Resource[] = [];

        if (lowerMessage.includes('data') || lowerMessage.includes('excel')) {
          resources.push({
            id: `res-${Date.now()}-1`,
            name: 'Data Warehouse',
            description: 'Main data storage and analytics database',
            type: 'database',
            permissions: ['read', 'write'],
            icon: 'pi pi-database'
          });
          resources.push({
            id: `res-${Date.now()}-2`,
            name: 'Excel Files',
            description: 'Spreadsheet files and data exports',
            type: 'excel',
            permissions: ['read', 'write'],
            icon: 'pi pi-file-excel'
          });
        }

        if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
          resources.push({
            id: `res-${Date.now()}-3`,
            name: 'Customer Database',
            description: 'Customer information and interaction history',
            type: 'database',
            permissions: ['read', 'write'],
            icon: 'pi pi-users'
          });
          resources.push({
            id: `res-${Date.now()}-4`,
            name: 'Knowledge Base',
            description: 'Support articles and documentation',
            type: 'database',
            permissions: ['read'],
            icon: 'pi pi-book'
          });
        }

        if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
          resources.push({
            id: `res-${Date.now()}-5`,
            name: 'Code Repository',
            description: 'Source code and version control system',
            type: 'api',
            permissions: ['read', 'write', 'execute'],
            icon: 'pi pi-github'
          });
          resources.push({
            id: `res-${Date.now()}-6`,
            name: 'Development Tools',
            description: 'Development environment and tools',
            type: 'api',
            permissions: ['read', 'execute'],
            icon: 'pi pi-cog'
          });
        }

        // Default resources if no specific type detected
        if (resources.length === 0) {
          resources.push({
            id: `res-${Date.now()}-default`,
            name: 'General Resources',
            description: 'General purpose resources and tools',
            type: 'api',
            permissions: ['read'],
            icon: 'pi pi-th-large'
          });
        }

        return resources;
      },

      generateSlaveAgentsForMaster(masterId: string, message: string): Agent[] {
        const lowerMessage = message.toLowerCase();
        const slaveAgents: Agent[] = [];

        if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
          slaveAgents.push({
            id: `slave-${Date.now()}-1`,
            name: 'Data Processor',
            description: 'Processes and cleans raw data',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-cog',
            resources: []
          });
          slaveAgents.push({
            id: `slave-${Date.now()}-2`,
            name: 'Report Generator',
            description: 'Creates visualizations and reports',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-chart-bar',
            resources: []
          });
        } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
          slaveAgents.push({
            id: `slave-${Date.now()}-3`,
            name: 'Ticket Processor',
            description: 'Processes and categorizes support tickets',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-ticket',
            resources: []
          });
          slaveAgents.push({
            id: `slave-${Date.now()}-4`,
            name: 'Knowledge Assistant',
            description: 'Searches knowledge base for solutions',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-search',
            resources: []
          });
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
          slaveAgents.push({
            id: `slave-${Date.now()}-5`,
            name: 'Code Reviewer',
            description: 'Reviews and analyzes code quality',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-eye',
            resources: []
          });
          slaveAgents.push({
            id: `slave-${Date.now()}-6`,
            name: 'Test Generator',
            description: 'Generates unit tests and documentation',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-check-circle',
            resources: []
          });
        } else {
          // Default slave agents
          slaveAgents.push({
            id: `slave-${Date.now()}-7`,
            name: 'Task Executor',
            description: 'Executes specific tasks and operations',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-play',
            resources: []
          });
          slaveAgents.push({
            id: `slave-${Date.now()}-8`,
            name: 'Research Assistant',
            description: 'Researches and gathers information',
            type: 'slave',
            status: 'online',
            parentId: masterId,
            icon: 'pi pi-search',
            resources: []
          });
        }

        return slaveAgents;
      },

      generateConversationTitle(message: string): string {
        const words = message.split(' ').slice(0, 4);
        return words.join(' ') + (message.split(' ').length > 4 ? '...' : '');
      },

      generateAgentResponse(message: string): string {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
          return "Hello! I'm your new AI assistant. I've been created to help you with your request. I have specialized slave agents ready to assist with specific tasks. How can I help you today?";
        } else if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
          return "I understand you need help with data analysis. I've created a data processing team with specialized agents for data cleaning, analysis, and report generation. What specific data would you like me to analyze?";
        } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
          return "I see you need customer support assistance. I've set up a support team with agents specialized in ticket processing and knowledge base searches. What customer issue can I help you resolve?";
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
          return "I understand you need development assistance. I've created a development team with code reviewers and test generators. What programming task would you like me to help with?";
        } else {
          return "I've been created to help you with your request. I have a team of specialized agents ready to assist. Could you provide more details about what you'd like me to help you with?";
        }
      },

      generateInstructionsForAgent(message: string): string[] {
        const lowerMessage = message.toLowerCase();
        const instructions = ['Üzleti hangnem', 'Rövid, tömör válaszok', 'Források hivatkozása, ha releváns'];
        
        if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
          instructions.push('Számok indoklása', 'Grafikus ábrázolás preferálása');
        } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
          instructions.push('Empatikus válaszok', 'Gyors megoldás keresése');
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
          instructions.push('Tiszta kód írása', 'Dokumentáció készítése');
        }
        
        return instructions;
      },

      generateApplicationsForAgent(message: string): string[] {
        const lowerMessage = message.toLowerCase();
        const applications = ['Outlook Connector (e-mail küldés/fogadás)', 'SQL driver', 'LibreOffice Writer/Calc', 'PDF motor', 'Kép (png/jpeg) ingest'];
        
        if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
          applications.push('Excel Connector', 'Chart Generator', 'Data Visualization Tools');
        } else if (lowerMessage.includes('customer') || lowerMessage.includes('support')) {
          applications.push('Ticket System', 'Knowledge Base Search', 'Customer Database');
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
          applications.push('Git Integration', 'Code Review Tools', 'Testing Framework');
        }
        
        return applications;
      },

      // Keep the old method for backward compatibility but make it empty
      initializeDummyDataOld() {
        const dummyAgents: Agent[] = [
          {
            id: 'master-1',
            name: localizations.get('agent.data_analyst'),
            description: localizations.get('agent.data_analyst.desc'),
            type: 'master',
            status: 'online',
            icon: 'pi pi-robot',
            resources: [
              {
                id: 'res-1',
                name: localizations.get('resource.sales_data'),
                description: localizations.get('resource.sales_data.desc'),
                type: 'excel',
                permissions: ['read', 'write'],
                icon: 'pi pi-file-excel'
              },
              {
                id: 'res-2',
                name: localizations.get('resource.analytics_db'),
                description: localizations.get('resource.analytics_db.desc'),
                type: 'database',
                permissions: ['read'],
                icon: 'pi pi-database'
              }
            ]
          },
          {
            id: 'master-2',
            name: localizations.get('agent.customer_support'),
            description: localizations.get('agent.customer_support.desc'),
            type: 'master',
            status: 'online',
            icon: 'pi pi-headphones',
            resources: [
              {
                id: 'res-3',
                name: localizations.get('resource.knowledge_base'),
                description: localizations.get('resource.knowledge_base.desc'),
                type: 'database',
                permissions: ['read'],
                icon: 'pi pi-book'
              },
              {
                id: 'res-4',
                name: localizations.get('resource.customer_db'),
                description: localizations.get('resource.customer_db.desc'),
                type: 'database',
                permissions: ['read', 'write'],
                icon: 'pi pi-users'
              }
            ]
          },
          {
            id: 'slave-1',
            name: localizations.get('agent.excel_processor'),
            description: localizations.get('agent.excel_processor.desc'),
            type: 'slave',
            status: 'online',
            parentId: 'master-1',
            icon: 'pi pi-chart-bar',
            resources: [
              {
                id: 'res-1',
                name: localizations.get('resource.sales_data'),
                description: localizations.get('resource.sales_data.desc'),
                type: 'excel',
                permissions: ['read', 'write'],
                icon: 'pi pi-file-excel'
              }
            ]
          },
          {
            id: 'slave-2',
            name: localizations.get('agent.report_generator'),
            description: localizations.get('agent.report_generator.desc'),
            type: 'slave',
            status: 'online',
            parentId: 'master-1',
            icon: 'pi pi-chart-line',
            resources: [
              {
                id: 'res-2',
                name: localizations.get('resource.analytics_db'),
                description: localizations.get('resource.analytics_db.desc'),
                type: 'database',
                permissions: ['read'],
                icon: 'pi pi-database'
              }
            ]
          },
          {
            id: 'slave-3',
            name: 'Data Validator',
            description: 'Data validation and quality assurance',
            type: 'slave',
            status: 'online',
            parentId: 'master-1',
            icon: 'pi pi-check-circle',
            resources: [
              {
                id: 'res-1',
                name: localizations.get('resource.sales_data'),
                description: localizations.get('resource.sales_data.desc'),
                type: 'excel',
                permissions: ['read'],
                icon: 'pi pi-file-excel'
              }
            ]
          },
          {
            id: 'slave-4',
            name: 'Ticket Processor',
            description: 'Process and categorize support tickets',
            type: 'slave',
            status: 'busy',
            parentId: 'master-2',
            icon: 'pi pi-ticket',
            resources: [
              {
                id: 'res-4',
                name: localizations.get('resource.customer_db'),
                description: localizations.get('resource.customer_db.desc'),
                type: 'database',
                permissions: ['read', 'write'],
                icon: 'pi pi-users'
              }
            ]
          },
          {
            id: 'slave-5',
            name: 'Knowledge Assistant',
            description: 'Search and provide knowledge base answers',
            type: 'slave',
            status: 'online',
            parentId: 'master-2',
            icon: 'pi pi-search',
            resources: [
              {
                id: 'res-3',
                name: localizations.get('resource.knowledge_base'),
                description: localizations.get('resource.knowledge_base.desc'),
                type: 'database',
                permissions: ['read'],
                icon: 'pi pi-book'
              }
            ]
          }
        ];

        const dummyConversations: Conversation[] = [
          {
            id: 'conv-1',
            agentId: 'master-1',
            title: localizations.get('conversation.q4_analysis'),
            lastMessage: localizations.get('conversation.last_message'),
            messageCount: 15,
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            messages: [
              {
                id: 'msg-1',
                content: 'Hello! I need help analyzing Q4 sales data.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                sender: 'user'
              },
              {
                id: 'msg-2',
                content: 'I\'ll help you analyze the Q4 sales data. Let me process the Excel file and generate insights.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
                sender: 'agent',
                agentId: 'master-1'
              }
            ]
          },
          {
            id: 'conv-2',
            agentId: 'master-2',
            title: localizations.get('conversation.customer_issue'),
            lastMessage: localizations.get('conversation.customer_message'),
            messageCount: 8,
            lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            messages: [
              {
                id: 'msg-3',
                content: 'Customer is asking about refund policy for order #1234',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                sender: 'user'
              },
              {
                id: 'msg-4',
                content: 'I\'ll help you with the refund policy. Let me check our knowledge base for the specific terms.',
                timestamp: new Date(Date.now() - 30 * 60 * 1000 + 30000),
                sender: 'agent',
                agentId: 'master-2'
              }
            ]
          }
        ];

        patchState(store, {
          agents: dummyAgents,
          conversations: dummyConversations,
          selectedAgentId: 'master-1',
          selectedConversationId: 'conv-1'
        });
      },

      selectAgent(agentId: string) {
        patchState(store, { selectedAgentId: agentId });
      },

      selectConversation(conversationId: string) {
        patchState(store, { selectedConversationId: conversationId });
      },

      createSlaveAgent(parentId: string, name: string, description: string) {
        const newAgent: Agent = {
          id: `slave-${Date.now()}`,
          name,
          description,
          type: 'slave',
          status: 'online',
          parentId,
          icon: 'pi pi-cog',
          resources: []
        };

        patchState(store, {
          agents: [...store.agents(), newAgent]
        });

        return newAgent;
      },

      sendMessage(content: string, agentId?: string) {
        // If no agents exist, create a new master agent from the message
        if (store.agents().length === 0) {
          this.createMasterAgentFromMessage(content);
          return;
        }

        const conversationId = store.selectedConversationId();
        if (!conversationId) return;

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          content,
          timestamp: new Date(),
          sender: 'user',
          agentId
        };

        const conversations = store.conversations().map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: content,
              lastActivity: new Date(),
              messageCount: conv.messageCount + 1
            };
          }
          return conv;
        });

        patchState(store, { conversations });

        // Simulate agent response
        setTimeout(() => {
          this.simulateAgentResponse(conversationId, agentId);
        }, 1000);
      },

      addUserMessage(content: string) {
        console.log('addUserMessage called with:', content);
        console.log('Current agents count:', store.agents().length);
        console.log('Selected agent ID:', store.selectedAgentId());
        
        // If no agents exist or no agent is selected, create a new master agent from the message
        if (store.agents().length === 0 || !store.selectedAgentId()) {
          console.log('Creating new master agent...');
          // Call createMasterAgentFromMessage directly
          const agentId = `master-${Date.now()}`;
          const conversationId = `conv-${Date.now()}`;
          
          // Create a master agent based on the user's message
          const masterAgent: Agent = {
            id: agentId,
            name: this.generateAgentNameFromMessage(content),
            description: this.generateAgentDescriptionFromMessage(content),
            type: 'master',
            status: 'online',
            icon: 'pi pi-robot',
            resources: this.generateResourcesForAgent(content),
            instructions: this.generateInstructionsForAgent(content),
            applications: this.generateApplicationsForAgent(content)
          };

          // Create slave agents for this master
          const slaveAgents: Agent[] = this.generateSlaveAgentsForMaster(agentId, content);

          // Create initial conversation
          const conversation: Conversation = {
            id: conversationId,
            agentId: agentId,
            title: this.generateConversationTitle(content),
            lastMessage: content,
            messageCount: 1,
            lastActivity: new Date(),
            messages: [
              {
                id: `msg-${Date.now()}-1`,
                content: content,
                timestamp: new Date(),
                sender: 'user',
                agentId: agentId
              },
              {
                id: `msg-${Date.now()}-2`,
                content: this.generateAgentResponse(content),
                timestamp: new Date(),
                sender: 'agent',
                agentId: agentId
              }
            ]
          };

          // Update state
          console.log('Updating state with new agent:', masterAgent.name);
          patchState(store, {
            agents: [...store.agents(), masterAgent, ...slaveAgents],
            conversations: [...store.conversations(), conversation],
            selectedAgentId: agentId,
            selectedConversationId: conversationId
          });
          console.log('State updated. Selected agent ID:', agentId);
          return;
        }

        const conversationId = store.selectedConversationId();
        if (!conversationId) return;

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          content,
          timestamp: new Date(),
          sender: 'user',
          agentId: store.selectedAgentId() || undefined
        };

        const conversations = store.conversations().map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: content,
              lastActivity: new Date(),
              messageCount: conv.messageCount + 1
            };
          }
          return conv;
        });

        patchState(store, { conversations });
      },

      addAgentResponse(userMessage: string) {
        const conversationId = store.selectedConversationId();
        if (!conversationId) return;

        const agentId = store.selectedAgentId();
        const agent = store.agents().find(a => a.id === agentId);
        
        if (!agent) return;

        // Generate a contextual response based on the user message
        const response = this.generateContextualResponse(userMessage, agent);
        
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          content: response,
          timestamp: new Date(),
          sender: 'agent',
          agentId: agentId || undefined
        };

        const conversations = store.conversations().map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: response,
              lastActivity: new Date(),
              messageCount: conv.messageCount + 1
            };
          }
          return conv;
        });

        patchState(store, { conversations });
      },

      generateContextualResponse(userMessage: string, agent: Agent): string {
        const lowerMessage = userMessage.toLowerCase();
        
        // Generate responses based on agent type and message content
        if (agent.type === 'master') {
          if (lowerMessage.includes('riport') || lowerMessage.includes('report')) {
            return 'Rendben, elkészítem a riportot. Melyik időszakra vonatkozóan kell?';
          } else if (lowerMessage.includes('adat') || lowerMessage.includes('data')) {
            return 'Az adatok elemzése folyamatban. Melyik konkrét metrikákra vagy kíváncsi?';
          } else if (lowerMessage.includes('feladat') || lowerMessage.includes('task')) {
            return 'Értem, felveszem a feladatot. Melyik prioritással kezdjem el?';
          } else {
            return 'Köszönöm az üzenetet! Hogyan segíthetek? Van valami konkrét feladat, amit el kell végeznem?';
          }
        } else {
          // Slave agent responses
          if (lowerMessage.includes('sql') || lowerMessage.includes('lekérdezés')) {
            return 'SQL lekérdezés futtatása... Az eredmények hamarosan megérkeznek.';
          } else if (lowerMessage.includes('pdf') || lowerMessage.includes('export')) {
            return 'PDF export előkészítése... A fájl elkészül és elküldöm.';
          } else if (lowerMessage.includes('elemzés') || lowerMessage.includes('analysis')) {
            return 'Adatelemzés folyamatban... Az eredményeket részletesen dokumentálom.';
          } else {
            return 'Értem, dolgozom rajta. Melyik részletre szeretnél koncentrálni?';
          }
        }
      },

      simulateAgentResponse(conversationId: string, agentId?: string) {
        const agent = agentId ? store.agents().find(a => a.id === agentId) : store.selectedAgent();
        if (!agent) return;

        const responses = [
          'I understand your request. Let me process this for you.',
          'I\'ll analyze this data and provide you with insights.',
          'Let me check the available resources and get back to you.',
          'I\'m working on your request. This might take a moment.',
          'I\'ve processed your request. Here are the results...'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const agentMessage: Message = {
          id: `msg-${Date.now()}`,
          content: randomResponse,
          timestamp: new Date(),
          sender: 'agent',
          agentId: agent.id
        };

        const conversations = store.conversations().map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, agentMessage],
              lastMessage: randomResponse,
              lastActivity: new Date(),
              messageCount: conv.messageCount + 1
            };
          }
          return conv;
        });

        patchState(store, { conversations });
      }
    };
  })
);
