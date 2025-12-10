/**
 * Mobile utility functions for consistent mobile detection and behavior
 * across the application. These functions help ensure reliable mobile
 * responsive behavior and prevent hydration mismatches.
 */

/**
 * Check if the current device is mobile based on window size
 * This is a fallback function for server-side or when hooks aren't available
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * Get the appropriate sidebar collapsible behavior based on mobile state
 * @param isMobile - Whether the device is mobile
 * @returns The appropriate collapsible setting for the sidebar
 */
export function getSidebarCollapsibleType(isMobile: boolean): "offcanvas" | "icon" | "none" {
  return isMobile ? "offcanvas" : "icon"
}

/**
 * Handle mobile-specific PostHog logging for sidebar interactions
 * @param event - The event name to log
 * @param properties - Additional properties to log
 */
export function logMobileSidebarEvent(event: string, properties: Record<string, any> = {}): void {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, {
      ...properties,
      is_mobile: isMobileDevice(),
      timestamp: Date.now(),
      user_agent: navigator.userAgent
    })
  }
}

/**
 * Apply mobile-specific CSS classes conditionally
 * @param isMobile - Whether the device is mobile
 * @param mobileClasses - Classes to apply on mobile
 * @param desktopClasses - Classes to apply on desktop
 * @returns Combined class string
 */
export function getMobileClasses(
  isMobile: boolean, 
  mobileClasses: string, 
  desktopClasses: string = ""
): string {
  return isMobile ? mobileClasses : desktopClasses
}
