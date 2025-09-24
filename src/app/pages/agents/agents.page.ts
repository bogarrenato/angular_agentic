import { Component, computed, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { SplitterModule } from 'primeng/splitter';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';

import { AgentStore } from '../../stores/agent.store';
import { AppLocalizationsService } from '../../services/app-localizations.service';
import { ThemeStore } from '../../theme.store';

@Component({
  selector: 'app-agents-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SplitterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    BadgeModule,
    ChipModule,
    DividerModule,
    ScrollPanelModule,
    DialogModule,
    TextareaModule,
    SelectModule,
    MessageModule,
  ],
  styleUrls: ['./agents.page.scss'],
  template: `
    <div class="agents-container" id="main-content" role="main">
      <!-- Fallback content to ensure visibility -->
      <div *ngIf="!isInitialized" class="loading-fallback">
        <h2>Loading Agentic AI Demo...</h2>
        <p>Please wait while the application initializes...</p>
      </div>

      <p-splitter
        *ngIf="isInitialized"
        [style]="{ height: '100vh' }"
        [panelSizes]="[25, 50, 25]"
        role="region"
        aria-label="AI Agent Management Interface"
      >
        <!-- Left Panel: Agents with Accordion Conversations -->
        <ng-template pTemplate>
          <div class="panel-left" role="complementary" aria-label="Agent List">
            <div class="panel-header">
              <h3>Munkatársak</h3>
              <p-button
                icon="pi pi-plus"
                [text]="true"
                (onClick)="showCreateAgentDialog = true"
                aria-label="Új munkatárs hozzáadása"
              >
              </p-button>
            </div>

            <div class="agents-scroll-container">
              <!-- Agents with Accordion Conversations -->
              <!-- Agents with Accordion Conversations -->
              <div class="agent-list">
                @for (masterAgent of agentStore.masterAgents(); track masterAgent.id) {
                <!-- Master Agent -->
                <div
                  class="agent-item master-agent"
                  [class.selected]="agentStore.selectedAgentId() === masterAgent.id"
                  (click)="toggleAgentAccordion(masterAgent.id)"
                  role="button"
                  [attr.aria-label]="'Munkatárs kiválasztása: ' + masterAgent.name"
                  [attr.aria-expanded]="isAgentAccordionOpen(masterAgent.id)"
                  tabindex="0"
                  (keydown.enter)="toggleAgentAccordion(masterAgent.id)"
                  (keydown.space)="toggleAgentAccordion(masterAgent.id)"
                >
                  <div class="agent-avatar" aria-hidden="true">
                    {{ masterAgent.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="agent-details">
                    <div class="agent-name">{{ masterAgent.name }}</div>
                    <div class="agent-role">
                      FŐ • nem törölhető
                    </div>
                  </div>
                  <p-chip
                    label="FŐ"
                    styleClass="agent-badge"
                    aria-label="Főmunkatárs"
                  ></p-chip>
                </div>

                <!-- Sub-agents for this master -->
                @for (slaveAgent of getSlaveAgentsForMaster(masterAgent.id); track slaveAgent.id) {
                <div
                  class="agent-item slave-agent"
                  [class.selected]="agentStore.selectedAgentId() === slaveAgent.id"
                  (click)="toggleAgentAccordion(slaveAgent.id)"
                  role="button"
                  [attr.aria-label]="'Almunkatárs kiválasztása: ' + slaveAgent.name"
                  [attr.aria-expanded]="isAgentAccordionOpen(slaveAgent.id)"
                  tabindex="0"
                  (keydown.enter)="toggleAgentAccordion(slaveAgent.id)"
                  (keydown.space)="toggleAgentAccordion(slaveAgent.id)"
                >
                  <div class="agent-avatar slave-avatar" aria-hidden="true">
                    {{ slaveAgent.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="agent-details">
                    <div class="agent-name">{{ slaveAgent.name }}</div>
                    <div class="agent-role">
                      Almunkatárs
                    </div>
                  </div>
                </div>
                }

                <!-- Accordion Panel for Master Agent Conversations -->
                <div
                  class="agent-accordion"
                  [class.open]="isAgentAccordionOpen(masterAgent.id)"
                  [attr.data-agent-id]="masterAgent.id"
                >
                  <div class="search-container">
                    <p-inputText
                      placeholder="Keresés a beszélgetésekben..."
                      [(ngModel)]="searchText"
                      (onInput)="onSearchConversations($event, masterAgent.id)"
                      ngDefaultControl
                    >
                    </p-inputText>
                  </div>
                  <div class="conversation-list">
                    @for (conv of getFilteredConversations(masterAgent.id); track
                    conv.id) {
                    <div
                      class="conversation-item"
                      [class.active]="
                        agentStore.selectedConversationId() === conv.id
                      "
                      (click)="selectConversation(conv.id)"
                    >
                      <div class="conversation-title">{{ conv.title }}</div>
                      <div class="conversation-time">
                        {{ formatTime(conv.lastActivity) }}
                      </div>
                      <div class="conversation-preview">
                        {{ conv.lastMessage }}
                      </div>
                    </div>
                    } @if (getFilteredConversations(masterAgent.id).length === 0) {
                    <div class="no-conversations">
                      Ehhez a munkatárshoz nincs beszélgetés.
                    </div>
                    }
                  </div>
                </div>
                }

                <!-- Add Agent Button -->
                <div
                  class="add-agent-button"
                  (click)="showCreateAgentDialog = true"
                >
                  <i class="pi pi-plus"></i>
                  <span>Almunkatárs hozzáadása</span>
                </div>

                <p class="hint-text">
                  Kattints egy munkatársra a beszélgetéseinek megnyitásához.
                  Egyszerre csak egy munkatárs lehet lenyitva.
                </p>
              </div>
            </div>
          </div>
        </ng-template>

        <!-- Middle Panel: Chat -->
        <ng-template pTemplate>
          <div class="panel-middle">
            <div class="chat-header">
              <div class="active-agent-info">
                @if (agentStore.selectedAgent(); as selectedAgent) {
                  <p-chip
                    [label]="'Aktív: ' + selectedAgent.name"
                    styleClass="active-agent-chip"
                  >
                  </p-chip>
                  <div class="agent-description">
                    {{ selectedAgent.description }}
                  </div>
                } @else {
                  <p-chip
                    label="Új AI munkatárs létrehozása"
                    styleClass="active-agent-chip"
                  >
                  </p-chip>
                  <div class="agent-description">
                    Írjon egy üzenetet az alábbi mezőben, és automatikusan létrehozunk egy új AI munkatársat a feladatához.
                  </div>
                }
              </div>
              <div
                class="quick-actions"
                (keydown)="onQuickActionsKeyDown($event)"
                role="toolbar"
                aria-label="Gyors műveletek"
              >
                <p-button
                  label="Munkatárs létrehozása"
                  [text]="true"
                  size="small"
                  (onClick)="showCreateAgentDialog = true"
                  aria-label="Új munkatárs létrehozása"
                >
                </p-button>
                <p-button
                  label="Felhasználók kezelése"
                  [text]="true"
                  size="small"
                  aria-label="Felhasználók kezelése"
                >
                </p-button>
                <p-button
                  label="Konnektor hozzáadása"
                  [text]="true"
                  size="small"
                  aria-label="Új konnektor hozzáadása"
                >
                </p-button>
                <p-button
                  label="Egyedi konnektor igény"
                  [text]="true"
                  size="small"
                  aria-label="Egyedi konnektor igénylése"
                >
                </p-button>
                <p-button
                  label="Munka ütemezése"
                  [text]="true"
                  size="small"
                  aria-label="Munka ütemezése"
                >
                </p-button>
                <p-button
                  label="SF csapattal kapcsolatfelvétel"
                  [text]="true"
                  size="small"
                  aria-label="SimplyFire csapattal kapcsolatfelvétel"
                >
                </p-button>
              </div>
            </div>

            <div class="chat-container">
              @if (agentStore.selectedConversation(); as conversation) {
               <div class="messages-container" #messagesContainer>
                 @for (message of conversation.messages; track message.id) {
                 <div class="message" [class.user]="message.sender === 'user'">
                   <div class="message-content">
                     <p>{{ message.content }}</p>
                     <small>{{ formatTime(message.timestamp) }}</small>
                   </div>
                 </div>
                 }
                 
                 <!-- Typing indicator -->
                 @if (isAgentTyping) {
                 <div class="message typing-message">
                   <div class="message-content typing-content">
                     <div class="typing-indicator">
                       <div class="typing-dots">
                         <span></span>
                         <span></span>
                         <span></span>
                       </div>
                       <span class="typing-text">Az AI munkatárs ír...</span>
                     </div>
                   </div>
                 </div>
                 }
               </div>
              } @else {
              <div class="empty-state">
                <i
                  class="pi pi-robot"
                  style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"
                ></i>
                <h2>Üdvözöljük az AI HUB-ban!</h2>
                <p style="margin-bottom: 2rem; color: var(--text-color-secondary);">
                  Kezdje el a beszélgetést az alábbi mezőben, és automatikusan létrehozunk egy új AI munkatársat a feladatához.
                </p>
                <div class="example-prompts">
                  <h4>Példa feladatok:</h4>
                  <div class="prompt-examples">
                    <button class="prompt-button" (click)="useExamplePrompt('Készíts elemzést a havi értékesítési adatokról')">
                      📊 Adatelemzés
                    </button>
                    <button class="prompt-button" (click)="useExamplePrompt('Segíts a vevői problémák megoldásában')">
                      🎧 Ügyfélszolgálat
                    </button>
                    <button class="prompt-button" (click)="useExamplePrompt('Írj egy Python scriptet az adatok feldolgozásához')">
                      💻 Programozás
                    </button>
                    <button class="prompt-button" (click)="useExamplePrompt('Készíts marketing kampányt a termék bevezetéséhez')">
                      📢 Marketing
                    </button>
                  </div>
                </div>
              </div>
              }

              <div class="message-input">
                <div class="input-container">
                  <textarea
                    [(ngModel)]="newMessage"
                    (keydown)="onTextareaKeyDown($event)"
                    placeholder="💬 Írj ide üzenetet az aktív munkatársnak... (Enter küldéshez)"
                    class="message-textarea"
                    aria-label="Üzenet szövege"
                    aria-describedby="input-hint"
                    [disabled]="isAgentTyping"
                  >
                  </textarea>
                  <p-button
                    icon="pi pi-send"
                    (onClick)="sendMessage()"
                    [disabled]="!newMessage.trim() || isAgentTyping"
                    styleClass="send-button"
                    aria-label="Üzenet küldése"
                  >
                  </p-button>
                </div>
                <div class="input-hint" id="input-hint">
                  <i class="pi pi-info-circle" aria-hidden="true"></i>
                  <span>Enter küldéshez, Shift+Enter új sorhoz</span>
                </div>
              </div>
            </div>
          </div>
        </ng-template>

        <!-- Right Panel: Agent Settings -->
        <ng-template pTemplate>
          <div class="panel-right">
            <div class="panel-header">
              <h3>Munkatárs beállítások</h3>
              <p-chip
                [label]="agentStore.agents().length + ' munkatárs'"
                styleClass="agent-count-chip"
              ></p-chip>
            </div>

            <div class="settings-scroll-container">
              @if (agentStore.selectedAgent(); as selectedAgent) {
              <div class="settings-sections">
                <!-- Instructions Section -->
                <div
                  class="settings-section"
                  (keydown)="onSettingsKeyDown($event, 'instructions')"
                  role="group"
                  aria-label="Instrukciók"
                >
                  <div class="section-header">
                    <h4>Instrukciók</h4>
                    <p-button
                      icon="pi pi-plus"
                      [text]="true"
                      size="small"
                      (onClick)="addInstruction()"
                      aria-label="Új instrukció hozzáadása"
                    >
                    </p-button>
                  </div>
                  <div
                    class="section-content"
                    role="list"
                    aria-label="Instrukciók listája"
                  >
                    @for (instruction of selectedAgent.instructions || []; track
                    $index) {
                    <p-chip
                      [label]="instruction"
                      styleClass="setting-chip"
                      role="listitem"
                      tabindex="0"
                      [attr.aria-label]="'Instrukció: ' + instruction"
                    >
                    </p-chip>
                    } @if (!selectedAgent.instructions ||
                    selectedAgent.instructions.length === 0) {
                    <div class="empty-setting">Nincs instrukció</div>
                    }
                  </div>
                </div>

                <!-- Applications Section -->
                <div
                  class="settings-section"
                  (keydown)="onSettingsKeyDown($event, 'applications')"
                  role="group"
                  aria-label="Alkalmazások"
                >
                  <div class="section-header">
                    <h4>Alkalmazások</h4>
                    <p-button
                      icon="pi pi-plus"
                      [text]="true"
                      size="small"
                      (onClick)="addApplication()"
                      aria-label="Új alkalmazás hozzáadása"
                    >
                    </p-button>
                  </div>
                  <div
                    class="section-content"
                    role="list"
                    aria-label="Alkalmazások listája"
                  >
                    @for (app of selectedAgent.applications || []; track $index)
                    {
                    <p-chip
                      [label]="app"
                      styleClass="setting-chip"
                      role="listitem"
                      tabindex="0"
                      [attr.aria-label]="'Alkalmazás: ' + app"
                    >
                    </p-chip>
                    } @if (!selectedAgent.applications ||
                    selectedAgent.applications.length === 0) {
                    <div class="empty-setting">Nincs alkalmazás</div>
                    }
                  </div>
                </div>

                <!-- Resources Section -->
                <div
                  class="settings-section"
                  (keydown)="onSettingsKeyDown($event, 'resources')"
                  role="group"
                  aria-label="Erőforrások és konnektorok"
                >
                  <div class="section-header">
                    <h4>Erőforrások</h4>
                    <p-button
                      icon="pi pi-plus"
                      [text]="true"
                      size="small"
                      (onClick)="addResource()"
                      aria-label="Új erőforrás vagy konnektor hozzáadása"
                    >
                    </p-button>
                  </div>
                  <div
                    class="section-content"
                    role="list"
                    aria-label="Erőforrások és konnektorok listája"
                  >
                    @for (resource of selectedAgent.resources; track
                    resource.id) {
                    <p-chip
                      [label]="resource.name"
                      styleClass="setting-chip"
                      role="listitem"
                      tabindex="0"
                      [attr.aria-label]="
                        'Erőforrás: ' +
                        resource.name +
                        ' (' +
                        resource.type +
                        ')'
                      "
                    >
                    </p-chip>
                    } @if (selectedAgent.resources.length === 0) {
                    <div class="empty-setting">Nincs erőforrás</div>
                    }
                  </div>
                </div>
              </div>

              <p class="hint-text">
                A beállítások **az aktív munkatárshoz** tartoznak. A „+”
                gombokkal adhatsz hozzá új elemeket.
              </p>
              } @else {
              <div class="empty-state">
                <i
                  class="pi pi-cog"
                  style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;"
                ></i>
                <h4>AI Munkatárs Beállítások</h4>
                <p>
                  Amikor létrehoz egy új AI munkatársat, itt láthatja és szerkesztheti a beállításait, 
                  alkalmazásait és erőforrásait.
                </p>
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--surface-100); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                  <h5 style="margin: 0 0 0.5rem 0; color: var(--text-color);">✨ Automatikus beállítások</h5>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--text-color-secondary);">
                    Az új munkatárs automatikusan megkapja a megfelelő beállításokat, alkalmazásokat és erőforrásokat a feladat típusa alapján.
                  </p>
                </div>
              </div>
              }
            </div>
          </div>
        </ng-template>
      </p-splitter>
    </div>

    <!-- Create Agent Dialog -->
    <p-dialog
      [(visible)]="showCreateAgentDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [header]="localizations.get('action.create_agent')"
      styleClass="create-agent-dialog"
    >
      <div class="create-agent-form">
        <div class="field">
          <label for="agentName"
            >{{ localizations.get('agent.slave') }} Name</label
          >
          <p-inputText
            id="agentName"
            [(ngModel)]="newAgentName"
            placeholder="Enter agent name"
            ngDefaultControl
          >
          </p-inputText>
        </div>

        <div class="field">
          <label for="agentDesc">Description</label>
          <p-textarea
            id="agentDesc"
            [(ngModel)]="newAgentDescription"
            ngDefaultControl
          >
          </p-textarea>
        </div>

        <div class="field">
          <label for="parentAgent">Parent Agent</label>
          <p-select
            id="parentAgent"
            [(ngModel)]="selectedParentAgent"
            [options]="agentStore.masterAgents()"
            optionLabel="name"
            optionValue="id"
            placeholder="Select parent agent"
            ngDefaultControl
          >
          </p-select>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div style="display: flex; gap: 0.5rem;">
          <p-button
            [label]="'Cancel'"
            [text]="true"
            (onClick)="showCreateAgentDialog = false"
          >
          </p-button>
          <p-button
            [label]="'Create'"
            (onClick)="createAgent()"
            [disabled]="!newAgentName.trim() || !selectedParentAgent"
          >
          </p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class AgentsPage implements OnInit, AfterViewChecked {
  protected readonly agentStore = inject(AgentStore);
  protected readonly localizations = inject(AppLocalizationsService);
  protected readonly themeStore = inject(ThemeStore);

  protected isInitialized = false;
  newMessage = '';
  showCreateAgentDialog = false;
  newAgentName = '';
  newAgentDescription = '';
  selectedParentAgent = '';
  searchText = '';
  openAccordions = new Set<string>();
  isAgentTyping = false;
  
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  private shouldScrollToBottom = false;

  ngOnInit() {
    this.agentStore.initializeDummyData();
    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.isInitialized = true;
      // Scroll to bottom on initial load
      setTimeout(() => {
        this.shouldScrollToBottom = true;
      }, 200);
    }, 100);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && this.messagesContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  selectAgent(agentId: string) {
    this.agentStore.selectAgent(agentId);
  }

  selectConversation(conversationId: string) {
    this.agentStore.selectConversation(conversationId);
    // Scroll to bottom when selecting a conversation
    setTimeout(() => {
      this.shouldScrollToBottom = true;
    }, 100);
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const userMessage = this.newMessage.trim();
      this.newMessage = '';
      
      // Show typing indicator
      this.isAgentTyping = true;
      this.shouldScrollToBottom = true;
      
      // Add user message immediately
      this.agentStore.addUserMessage(userMessage);
      this.shouldScrollToBottom = true;
      
      // Simulate AI thinking and responding
      setTimeout(() => {
        // Only add agent response if there's a selected agent
        if (this.agentStore.selectedAgentId()) {
          this.agentStore.addAgentResponse(userMessage);
        }
        this.isAgentTyping = false;
        this.shouldScrollToBottom = true;
      }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds delay
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  onTextareaKeyDown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  createNewConversation() {
    // Implementation for creating new conversation
    console.log('Create new conversation');
  }

  createAgent() {
    if (this.newAgentName.trim() && this.selectedParentAgent) {
      this.agentStore.createSlaveAgent(
        this.selectedParentAgent,
        this.newAgentName.trim(),
        this.newAgentDescription.trim()
      );
      this.showCreateAgentDialog = false;
      this.newAgentName = '';
      this.newAgentDescription = '';
      this.selectedParentAgent = '';
    }
  }

  getAgentConversations(agentId: string) {
    return this.agentStore
      .conversations()
      .filter((conv) => conv.agentId === agentId);
  }

  getSlaveAgentsForMaster(masterId: string) {
    return this.agentStore
      .slaveAgents()
      .filter((agent) => agent.parentId === masterId);
  }

  toggleAgentAccordion(agentId: string) {
    // Close all other accordions
    this.openAccordions.clear();
    // Open the selected one
    this.openAccordions.add(agentId);
    // Select the agent
    this.agentStore.selectAgent(agentId);
  }

  isAgentAccordionOpen(agentId: string): boolean {
    return this.openAccordions.has(agentId);
  }

  getFilteredConversations(agentId: string) {
    const conversations = this.agentStore
      .conversations()
      .filter((conv) => conv.agentId === agentId);
    if (!this.searchText) {
      return conversations;
    }
    const searchLower = this.searchText.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower)
    );
  }

  onSearchConversations(event: any, agentId: string) {
    this.searchText = event.target.value;
  }

  useExamplePrompt(prompt: string) {
    this.newMessage = prompt;
  }

  addInstruction() {
    const instruction = prompt('Add instruction:');
    if (instruction) {
      // Add instruction to selected agent
      console.log('Adding instruction:', instruction);
    }
  }

  addApplication() {
    const app = prompt('Add application:');
    if (app) {
      // Add application to selected agent
      console.log('Adding application:', app);
    }
  }

  addResource() {
    const resource = prompt('Add resource:');
    if (resource) {
      // Add resource to selected agent
      console.log('Adding resource:', resource);
    }
  }

  onSettingsKeyDown(
    event: KeyboardEvent,
    sectionType: 'instructions' | 'applications' | 'resources'
  ) {
    const target = event.target as HTMLElement;
    const section = target.closest('.settings-section');
    if (!section) return;

    const chips = section.querySelectorAll('.setting-chip, .p-chip');
    const currentIndex = Array.from(chips).indexOf(target);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, chips.length - 1);
        (chips[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        (chips[prevIndex] as HTMLElement)?.focus();
        break;
      case 'Home':
        event.preventDefault();
        (chips[0] as HTMLElement)?.focus();
        break;
      case 'End':
        event.preventDefault();
        (chips[chips.length - 1] as HTMLElement)?.focus();
        break;
    }
  }

  onQuickActionsKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const toolbar = target.closest('.quick-actions');
    if (!toolbar) return;

    const buttons = toolbar.querySelectorAll('p-button, button');
    const currentIndex = Array.from(buttons).indexOf(target);

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, buttons.length - 1);
        (buttons[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        (buttons[prevIndex] as HTMLElement)?.focus();
        break;
      case 'Home':
        event.preventDefault();
        (buttons[0] as HTMLElement)?.focus();
        break;
      case 'End':
        event.preventDefault();
        (buttons[buttons.length - 1] as HTMLElement)?.focus();
        break;
    }
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'online':
        return 'success';
      case 'busy':
        return 'warn';
      case 'offline':
        return 'danger';
      default:
        return 'info';
    }
  }

  getPermissionColor(permission: string): string {
    switch (permission) {
      case 'read':
        return '#10b981';
      case 'write':
        return '#f59e0b';
      case 'execute':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
