/**
 * TypeScript interfaces for the troubleshooting feature
 * Defines the structure for workflows, steps, sessions, and related data
 */
export type WorkflowStep = TroubleshootingStep | DecisionStep | ActionStep | OutcomeStep

export interface TroubleshootingWorkflow {
  id: string
  title: string
  description: string
  category: string
  priority: number // 1-5, where 1 is highest priority
  commonality: IssueCommonality
  estimatedTime: string
  icon: string // Icon name for UI display
  color: string // Tailwind color class
  startStepId: string
  steps: Record<string, WorkflowStep>
}

export interface TroubleshootingStep {
  id: string
  type: 'decision' | 'action' | 'outcome'
  title: string
  description?: string
  content?: string
}

export interface DecisionStep extends TroubleshootingStep {
  type: 'decision'
  options: TroubleshootingOption[]
}

export interface ActionStep extends TroubleshootingStep {
  type: 'action'
  actions: string[]
  nextStepId?: string
  requiresCompletion?: boolean
}

export interface OutcomeStep extends TroubleshootingStep {
  type: 'outcome'
  resolutionType: ResolutionType
  followUpActions?: string[]
}

export interface TroubleshootingOption {
  id: string
  label: string
  nextStepId: string
  description?: string
}

export interface TroubleshootingSession {
  id: string
  workflowId: string
  currentStepId: string
  startedAt: Date
  completedAt?: Date
  notes?: string
  resolution?: string
}

export interface WorkflowState {
  currentStepId: string
  stepHistory: string[]
  sessionNotes: string
}

export type IssueCategory = 
  | 'booking' 
  | 'payment' 
  | 'device-pickup' 
  | 'gate-access' 
  | 'sms-verification' 
  | 'location' 
  | 'refund'

export type IssuePriority = 1 | 2 | 3 | 4 | 5

export type IssueCommonality = 
  | 'very high' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'very low'

export type ResolutionType = 
  | 'resolved' 
  | 'escalated' 
  | 'requires-followup' 
  | 'cancelled'
