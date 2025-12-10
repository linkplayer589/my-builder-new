/**
 * Format key to readable label
 * 
 * @description
 * Converts camelCase or snake_case keys to readable labels.
 * Used for auto-generating column headers or mobile card labels.
 * 
 * @param key - The key to format
 * @returns Formatted label with proper capitalization and spacing
 * 
 * @example
 * ```tsx
 * formatKeyToLabel('createdAt')        // "Created At"
 * formatKeyToLabel('user_name')        // "User Name"
 * formatKeyToLabel('resortId')         // "Resort Id"
 * ```
 */
export function formatKeyToLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase to spaces
    .replace(/_/g, ' ')                     // underscores to spaces
    .replace(/^./, str => str.toUpperCase()) // capitalize first letter
}

