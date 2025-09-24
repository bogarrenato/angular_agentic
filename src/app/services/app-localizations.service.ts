import { Injectable } from '@angular/core';

export interface AppLocalizations {
  get(key: string): string;
}

@Injectable({
  providedIn: 'root'
})
export class AppLocalizationsService implements AppLocalizations {
  private translations: Record<string, string> = {
    // Navigation
    'nav.agents': 'Agents & Conversations',
    'nav.resources': 'Resources & Permissions',
    'nav.new_chat': 'New Chat',
    'nav.add_agent': 'Add Agent',
    
    // Agent types
    'agent.master': 'Master Agent',
    'agent.slave': 'Slave Agent',
    'agent.data_analyst': 'Data Analyst Agent',
    'agent.customer_support': 'Customer Support Agent',
    'agent.excel_processor': 'Excel Processor',
    'agent.report_generator': 'Report Generator',
    
    // Descriptions
    'agent.data_analyst.desc': 'Data Analysis, Excel Processing, Report Generation',
    'agent.customer_support.desc': 'Customer Service, Ticket Management, Knowledge Base',
    'agent.excel_processor.desc': 'Excel Processing, Data Validation',
    'agent.report_generator.desc': 'Report Generation, Visualization',
    
    // Resources
    'resource.sales_data': 'Sales Data Q4.xlsx',
    'resource.analytics_db': 'Analytics Database',
    'resource.knowledge_base': 'Knowledge Base',
    'resource.customer_db': 'Customer Database',
    
    'resource.sales_data.desc': 'Quarterly sales data',
    'resource.analytics_db.desc': 'Main analytics database',
    'resource.knowledge_base.desc': 'Customer support knowledge base',
    'resource.customer_db.desc': 'Customer information database',
    
    // Permissions
    'permission.read': 'Read',
    'permission.write': 'Write',
    'permission.execute': 'Execute',
    
    // Messages
    'message.start_conversation': 'Start a conversation with',
    'message.ask_anything': 'Ask me anything about',
    'message.placeholder': 'Message',
    'message.send': 'Send',
    
    // Conversations
    'conversation.q4_analysis': 'Q4 Sales Analysis',
    'conversation.customer_issue': 'Customer Issue #1234',
    'conversation.last_message': 'Can you analyze the sales trends?',
    'conversation.customer_message': 'The customer is asking about refund policy...',
    
    // Status
    'status.messages': 'messages',
    'status.online': 'Online',
    'status.busy': 'Busy',
    'status.offline': 'Offline',
    
    // Actions
    'action.create_agent': 'Create New Agent',
    'action.assign_task': 'Assign Task',
    'action.view_resources': 'View Resources',
    'action.delete_agent': 'Delete Agent',
    
    // Theme
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    'theme.light_announce': 'Light theme enabled',
    'theme.dark_announce': 'Dark theme enabled'
  };

  get(key: string): string {
    return this.translations[key] || key;
  }
}
