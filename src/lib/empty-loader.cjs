/**
 * Turbopack loader that returns an empty module
 * Used to handle binary files that Turbopack tries to parse as JavaScript
 *
 * This loader is used for binary executables in node_modules/bin directories
 * that would otherwise cause "invalid utf-8 sequence" errors when Turbopack
 * tries to parse them as source code.
 *
 * @param {string} source - The source file content (as string since raw = false)
 * @returns {string} Empty CommonJS module export
 */
module.exports = function emptyLoader(source) {
  // Return an empty module export regardless of input
  // This handles binary files that can't be read as text
  return 'module.exports = {};'
}

// Set raw = false since this loader returns a string module
// and doesn't need to process the actual file content
module.exports.raw = false

