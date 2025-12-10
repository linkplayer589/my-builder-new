/**
 * Workflow component that manages step-by-step troubleshooting process
 * Handles navigation, decision making, and resolution tracking
 */

"use client"

import React, { useState } from "react"
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  Send
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { 
  type TroubleshootingWorkflow,
  type TroubleshootingSession,
  type TroubleshootingOption,
  type TroubleshootingStep
} from "../types"

/**
 * Type guards for different step types
 */
interface DecisionStep extends TroubleshootingStep {
  type: 'decision'
  options: TroubleshootingOption[]
}

interface ActionStep extends TroubleshootingStep {
  type: 'action'
  actions: string[]
  nextStepId?: string
  requiresCompletion?: boolean
}

interface OutcomeStep extends TroubleshootingStep {
  type: 'outcome'
  followUpActions?: string[]
  resolutionType?: string
}

// Type guards
const isDecisionStep = (step: TroubleshootingStep): step is DecisionStep => {
  return step.type === 'decision' && 'options' in step
}

const isActionStep = (step: TroubleshootingStep): step is ActionStep => {
  return step.type === 'action' && 'actions' in step
}

const isOutcomeStep = (step: TroubleshootingStep): step is OutcomeStep => {
  return step.type === 'outcome'
}

// PostHog type declaration
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void
    }
  }
}

interface WorkflowComponentProps {
  workflow: TroubleshootingWorkflow
  session: TroubleshootingSession
  onSessionUpdate: (session: TroubleshootingSession) => void
  onComplete: (resolution?: string) => void
  onBack: () => void
}

interface WorkflowState {
  currentStepId: string
  stepHistory: string[]
  sessionNotes: string
}

/**
 * Main workflow component for step-by-step troubleshooting
 */
export function TroubleshootingWorkflowComponent({ 
  workflow, 
  session, 
  onSessionUpdate, 
  onComplete, 
  onBack 
}: WorkflowComponentProps) {
  
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStepId: session.currentStepId,
    stepHistory: [session.currentStepId],
    sessionNotes: session.notes || ""
  })

  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [resolutionNotes, setResolutionNotes] = useState("")

  /**
   * Navigate to a specific step in the workflow
   * @param stepId - The ID of the step to navigate to
   */
  const navigateToStep = (stepId: string) => {
    const newState = {
      ...workflowState,
      currentStepId: stepId,
      stepHistory: [...workflowState.stepHistory, stepId]
    }
    
    setWorkflowState(newState)
    
    const updatedSession = {
      ...session,
      currentStepId: stepId,
      notes: newState.sessionNotes
    }
    
    onSessionUpdate(updatedSession)
    
    // PostHog logging for step navigation
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('troubleshooting_step_navigation', {
        session_id: session.id,
        workflow_id: workflow.id,
        from_step: workflowState.currentStepId,
        to_step: stepId,
        step_number: newState.stepHistory.length
      })
    }
  }

  /**
   * Handle going back to the previous step
   */
  const handleGoBack = () => {
    const previousStepId = workflowState.stepHistory[workflowState.stepHistory.length - 2]
    if (previousStepId) {
      navigateToStep(previousStepId)
    }
  }

  /**
   * Handle decision selection
   * @param option - The selected troubleshooting option
   */
  const handleDecision = (option: TroubleshootingOption) => {
    // PostHog logging for decision selection
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('troubleshooting_decision_made', {
        session_id: session.id,
        workflow_id: workflow.id,
        step_id: workflowState.currentStepId,
        decision: option.id,
        decision_label: option.label
      })
    }
    
    navigateToStep(option.nextStepId)
  }

  /**
   * Handle action completion
   * @param actionIndex - Index of the completed action
   */
  const handleActionComplete = (actionIndex: number) => {
    const actionKey = `${workflowState.currentStepId}-${actionIndex}`
    const newCompletedActions = new Set(completedActions)
    
    if (completedActions.has(actionKey)) {
      newCompletedActions.delete(actionKey)
    } else {
      newCompletedActions.add(actionKey)
      
      // PostHog logging for action completion
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('troubleshooting_action_completed', {
          session_id: session.id,
          workflow_id: workflow.id,
          step_id: workflowState.currentStepId,
          action_index: actionIndex
        })
      }
    }
    
    setCompletedActions(newCompletedActions)
  }

  /**
   * Handle workflow completion
   * @param resolution - Resolution type or description
   */
  const handleWorkflowComplete = (resolution: string) => {
    // PostHog logging for workflow completion
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('troubleshooting_workflow_completed', {
        session_id: session.id,
        workflow_id: workflow.id,
        total_steps: workflowState.stepHistory.length,
        resolution_type: resolution,
        resolution_notes: resolutionNotes
      })
    }
    
    onComplete(`${resolution}: ${resolutionNotes}`)
  }

  // Get current step
  const currentStep = workflow.steps[workflowState.currentStepId]
  
  if (!currentStep) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="mx-auto mb-4 size-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold">Step Not Found</h3>
        <p className="mb-4 text-muted-foreground">
          The current step could not be found in the workflow.
        </p>
        <Button onClick={onBack}>Return to Workflows</Button>
      </div>
    )
  }

  // Calculate progress
  const totalSteps = Object.keys(workflow.steps).length
  const currentStepNumber = workflowState.stepHistory.length
  const progress = Math.min((currentStepNumber / totalSteps) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Mobile: Top row with back button and badges */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            disabled={workflowState.stepHistory.length <= 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="size-3" />
              Step {currentStepNumber} of {totalSteps}
            </Badge>
            <Badge variant="secondary">
              {workflow.estimatedTime}
            </Badge>
          </div>
        </div>

        {/* Mobile: Second row with title and description */}
        <div>
          <h2 className="text-2xl font-bold">{workflow.title}</h2>
          <p className="text-muted-foreground">{workflow.description}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <Separator />

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {currentStep.type === 'decision' && <AlertCircle className="size-5 text-orange-500" />}
            {currentStep.type === 'action' && <FileText className="size-5 text-blue-500" />}
            {currentStep.type === 'outcome' && <CheckCircle className="size-5 text-green-500" />}
            <Badge variant={
              currentStep.type === 'decision' ? 'default' : 
              currentStep.type === 'action' ? 'secondary' : 
              'outline'
            }>
              {currentStep.type.charAt(0).toUpperCase() + currentStep.type.slice(1)}
            </Badge>
          </div>
          <CardTitle>{currentStep.title}</CardTitle>
          {currentStep.description && (
            <CardDescription>{currentStep.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {currentStep.content && (
            <p className="rounded-lg bg-muted p-3 text-sm">
              {currentStep.content}
            </p>
          )}

          {/* Decision Step */}
          {isDecisionStep(currentStep) && (
            <div className="space-y-3">
              <h4 className="font-medium">Choose the appropriate option:</h4>
              <div className="space-y-2">
                {currentStep.options.map((option: TroubleshootingOption) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="h-auto w-full justify-start p-4 text-left"
                    onClick={() => handleDecision(option)}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Step */}
          {isActionStep(currentStep) && (
            <div className="space-y-3">
              <h4 className="font-medium">Complete the following actions:</h4>
              <div className="space-y-2">
                {currentStep.actions.map((action: string, index: number) => {
                  const actionKey = `${workflowState.currentStepId}-${index}`
                  const isCompleted = completedActions.has(actionKey)
                  
                  return (
                    <div
                      key={index}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => handleActionComplete(index)}
                    >
                      <div className={`mt-0.5 ${isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className="size-4" />
                      </div>
                      <span className={`text-sm ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                        {action}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              {currentStep.nextStepId && (
                <Button 
                  onClick={() => currentStep.nextStepId && navigateToStep(currentStep.nextStepId)}
                  className="w-full"
                  disabled={currentStep.requiresCompletion && 
                    currentStep.actions.some((_, index: number) => 
                      !completedActions.has(`${workflowState.currentStepId}-${index}`)
                    )
                  }
                >
                  Continue to Next Step
                </Button>
              )}
            </div>
          )}

          {/* Outcome Step */}
          {isOutcomeStep(currentStep) && (
            <div className="space-y-4">
              {currentStep.followUpActions && (
                <div className="space-y-2">
                  <h4 className="font-medium">Follow-up Actions:</h4>
                  <ul className="list-disc space-y-1 pl-6 text-sm">
                    {currentStep.followUpActions.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="resolution-notes">Resolution Notes (Optional)</Label>
                  <Textarea
                    id="resolution-notes"
                    placeholder="Add any additional notes about this resolution..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleWorkflowComplete(currentStep.resolutionType || 'resolved')}
                    className="flex-1"
                  >
                    <Send className="mr-2 size-4" />
                    Complete Resolution
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onBack}
                  >
                    Start New Issue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Notes</CardTitle>
          <CardDescription>
            Keep track of important details during troubleshooting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about this troubleshooting session..."
            value={workflowState.sessionNotes}
            onChange={(e) => setWorkflowState(prev => ({
              ...prev,
              sessionNotes: e.target.value
            }))}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}
