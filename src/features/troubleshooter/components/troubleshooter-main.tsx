/**
 * Main troubleshooting component that provides issue selection and workflow navigation
 * Displays available troubleshooting scenarios and guides users through step-by-step processes
 */

"use client"

import React, { useState } from "react"
import { 
  ShoppingCart, 
  CreditCard, 
  Monitor, 
  MessageSquare, 
  DoorOpen, 
  MapPin,
  AlertCircle,
  Clock,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { troubleshootingWorkflows } from "../data/workflows"
import { type TroubleshootingWorkflow, type TroubleshootingSession } from "../types"
import { TroubleshootingWorkflowComponent } from "./workflow-component"

// PostHog type declaration
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void
    }
  }
}

// Icon mapping for workflow categories
const iconMap = {
  ShoppingCart,
  CreditCard,
  Monitor,
  MessageSquare,
  DoorOpen,
  MapPin
}

interface TroubleshooterMainProps {
  onClose?: () => void
}

/**
 * Main troubleshooting interface component
 * Handles workflow selection and session management
 */
export function TroubleshooterMain({ onClose }: TroubleshooterMainProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<TroubleshootingWorkflow | null>(null)
  const [currentSession, setCurrentSession] = useState<TroubleshootingSession | null>(null)

  /**
   * Start a new troubleshooting session
   * @param workflow - The selected troubleshooting workflow
   */
  const handleStartWorkflow = (workflow: TroubleshootingWorkflow) => {
    const session: TroubleshootingSession = {
      id: `session-${Date.now()}`,
      workflowId: workflow.id,
      currentStepId: workflow.startStepId,
      startedAt: new Date()
    }
    
    setSelectedWorkflow(workflow)
    setCurrentSession(session)
    
    // PostHog logging for troubleshooting workflow start
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('troubleshooting_workflow_started', {
        workflow_id: workflow.id,
        workflow_title: workflow.title,
        category: workflow.category,
        priority: workflow.priority,
        session_id: session.id
      })
    }
  }

  /**
   * End the current troubleshooting session
   * @param resolution - Optional resolution description
   */
  const handleEndSession = (resolution?: string) => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        completedAt: new Date(),
        resolution
      }
      
      // PostHog logging for troubleshooting session completion
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('troubleshooting_session_completed', {
          session_id: completedSession.id,
          workflow_id: completedSession.workflowId,
          duration_ms: completedSession.completedAt.getTime() - completedSession.startedAt.getTime(),
          resolution: resolution || 'unknown'
        })
      }
    }
    
    setSelectedWorkflow(null)
    setCurrentSession(null)
  }

  /**
   * Return to workflow selection from active session
   */
  const handleBackToSelection = () => {
    if (currentSession) {
      // Log session abandonment
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('troubleshooting_session_abandoned', {
          session_id: currentSession.id,
          workflow_id: currentSession.workflowId,
          current_step: currentSession.currentStepId,
          duration_ms: Date.now() - currentSession.startedAt.getTime()
        })
      }
    }
    
    setSelectedWorkflow(null)
    setCurrentSession(null)
  }

  /**
   * Get priority badge color based on priority level
   * @param priority - Priority level (1-5)
   */
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "destructive"
      case 2: return "destructive" 
      case 3: return "default"
      case 4: return "secondary"
      case 5: return "secondary"
      default: return "default"
    }
  }

  /**
   * Get commonality badge color based on frequency
   * @param commonality - How common the issue is
   */
  const getCommonalityColor = (commonality: string) => {
    switch (commonality) {
      case 'very high': return "destructive"
      case 'high': return "destructive"
      case 'medium': return "default"
      case 'low': return "secondary"
      case 'very low': return "outline"
      default: return "default"
    }
  }

  // If we have an active workflow session, show the workflow component
  if (selectedWorkflow && currentSession) {
    return (
      <TroubleshootingWorkflowComponent
        workflow={selectedWorkflow}
        session={currentSession}
        onSessionUpdate={setCurrentSession}
        onComplete={handleEndSession}
        onBack={handleBackToSelection}
      />
    )
  }

  // Show workflow selection interface
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-6 text-orange-500" />
            <h2 className="text-2xl font-bold">LifePass Troubleshooting</h2>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              Close
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Select the issue you&apos;re experiencing to start guided troubleshooting
        </p>
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">High Priority Issues</p>
              <p className="text-2xl font-bold text-red-500">
                {troubleshootingWorkflows.filter(w => w.priority <= 2).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Common Issues</p>
              <p className="text-2xl font-bold text-orange-500">
                {troubleshootingWorkflows.filter(w => w.commonality === 'high' || w.commonality === 'very high').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-blue-500">5 min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Workflow Selection Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {troubleshootingWorkflows
          .sort((a, b) => a.priority - b.priority) // Sort by priority (1 = highest)
          .map((workflow) => {
            const IconComponent = iconMap[workflow.icon as keyof typeof iconMap] || AlertCircle
            
            return (
              <Card 
                key={workflow.id} 
                className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                onClick={() => handleStartWorkflow(workflow)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2 ${workflow.color.replace('bg-', 'bg-')} opacity-10`}>
                      <IconComponent className={`size-5 ${workflow.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={getPriorityColor(workflow.priority)} className="text-xs">
                        P{workflow.priority}
                      </Badge>
                      <Badge variant={getCommonalityColor(workflow.commonality)} className="text-xs">
                        {workflow.commonality}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <CardTitle className="text-lg leading-tight">{workflow.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {workflow.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {workflow.estimatedTime}
                    </span>
                    <span className="capitalize">
                      {workflow.category.replace('-', ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Help Text */}
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>Need Additional Help?</AlertTitle>
        <AlertDescription>
          If none of these troubleshooting workflows match your issue, escalate to second-line support 
          through Slack or contact the technical team directly.
        </AlertDescription>
      </Alert>
    </div>
  )
}
