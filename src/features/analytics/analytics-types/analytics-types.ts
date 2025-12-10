/**
 * Type definitions for analytics feature
 * Includes types for Userback widget configuration and user data
 */

/**
 * Userback user data structure
 */
export type TAnalyticsUserData = {
  /** User unique identifier */
  id: string
  /** User information object */
  info: {
    /** User's full name or display name */
    name: string
    /** User's email address */
    email: string
    /** User's first name (optional) */
    firstName?: string
    /** User's last name (optional) */
    lastName?: string
    /** User's avatar URL (optional) */
    avatar?: string
  }
}

/**
 * Userback widget configuration options
 */
export type TAnalyticsUserbackOptions = {
  /** User data to associate with feedback */
  user_data?: TAnalyticsUserData
}

/**
 * Props for UserbackWidget component
 */
export type TAnalyticsUserbackWidgetProps = {
  /** Optional custom token (defaults to env variable) */
  token?: string
  /** Enable debug logging in development */
  debug?: boolean
}

