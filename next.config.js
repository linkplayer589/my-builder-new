/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// await import("./src/env.js")

/** @type {import("next").NextConfig} */
const nextConfig = {
  // TypeScript config - linting and typechecking done separately in CI
  typescript: { ignoreBuildErrors: true },

  // cacheLife: {
  //   default: {
  //     stale: 300, // 5 minutes
  //     revalidate: 900, // 15 minutes
  //     expire: 3600, // 1 hour
  //   },
  //   sessions: {
  //     stale: 60, // 1 minute
  //     revalidate: 300, // 5 minutes
  //     expire: 900, // 15 minutes
  //   },
  // },

  // Enable experimental cache features
  experimental: {
    useCache: true,
    // Try disabling Turbopack for builds to work around worker_threads issue
    // This is a known Turbopack bug: https://github.com/vercel/next.js/issues/86099
    // Setting this to false may help, but Next.js 16 uses Turbopack by default
    // turbopack: false, // Uncomment if available in your Next.js version
  },

  // Mark pino, thread-stream, and Payload as external packages for server components
  // This prevents Turbopack from trying to bundle them incorrectly
  // In Next.js 16, this has been moved from experimental.serverComponentsExternalPackages
  // Payload CMS uses pino internally, which uses thread-stream, which uses worker_threads
  // NOTE: This is a known Turbopack limitation - it may still try to trace worker_threads
  // during NFT (Node File Trace) phase, causing build failures
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "pino-pretty",
    "payload",
    "@payloadcms/db-postgres",
    "@payloadcms/richtext-slate",
  ],

  // Turbopack configuration
  // turbopack: {
  //   rules: {
  //     // Handle markdown files in node_modules (like README.md files)
  //     // This prevents "Unknown module type" errors when Turbopack encounters .md files
  //     "*.md": {
  //       condition: {
  //         // Match files in node_modules directory
  //         path: /node_modules/,
  //       },
  //       loaders: ["raw-loader"],
  //       as: "*.js",
  //     },
  //     // Comprehensive rule to exclude test files, binaries, and other non-production files
  //     // This prevents Turbopack from trying to parse these files as production code
  //     "*": {
  //       condition: {
  //         all: [
  //           {
  //             any: [
  //               { path: /node_modules/ },
  //               { path: /\/ROOT\/.*node_modules/ },
  //             ],
  //           },
  //           {
  //             any: [
  //               // Match test files
  //               { path: /\.test\.(js|ts|mjs|cjs)$/ },
  //               { path: /\.spec\.(js|ts|mjs|cjs)$/ },
  //               // Match test directories (including absolute paths)
  //               { path: /\/test\// },
  //               { path: /\/tests\// },
  //               { path: /\/__tests__\// },
  //               // Match LICENSE files
  //               { path: /\/LICENSE$/ },
  //               { path: /\/LICENSE\.(md|txt)$/ },
  //               // Match benchmark files
  //               { path: /\/bench\.(js|ts|mjs)$/ },
  //               { path: /\/benchmark\.(js|ts|mjs)$/ },
  //               // Match files with unknown extensions in test directories
  //               { path: /\/test\/.*\.(zip|sh|yml|yaml)$/ },
  //               // Match syntax error test files
  //               { path: /syntax-error\.(js|mjs)$/ },
  //               // Match esbuild binary specifically
  //               { path: /@esbuild\/.*\/bin\/esbuild$/ },
  //               // Match any file in bin directories without extension
  //               { path: /\/bin\/[^/]+$/ },
  //               // Match common executable extensions
  //               { path: /\.(exe|bin|so|dylib|dll)$/ },
  //             ],
  //           },
  //         ],
  //       },
  //       loaders: [
  //         {
  //           loader: resolve(__dirname, "./src/lib/empty-loader.cjs"),
  //         },
  //       ],
  //       as: "*.js",
  //     },
  //   },
  //   // Resolve aliases to redirect problematic imports to empty module
  //   resolveAlias: {
  //     // Redirect esbuild binary imports to empty module
  //     // This prevents Turbopack from trying to parse binary executables
  //     "@esbuild/linux-x64/bin/esbuild": "./src/lib/empty-module.js",
  //     // Redirect thread-stream test files to empty module
  //     "thread-stream/test": "./src/lib/empty-module.js",
  //     "thread-stream/bench": "./src/lib/empty-module.js",
  //   },
  // },

  webpack: (config, { isServer }) => {
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js"]

    // Exclude binary files and README files from processing
    if (isServer) {
      config.module = config.module || {}
      config.module.rules = config.module.rules || []

      // Ignore binary files and README files from node_modules
      config.module.rules.push({
        test: /\.(md|bin)$/,
        type: "asset/resource",
      })

      // Ignore esbuild platform-specific binaries
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias["@esbuild/linux-x64/bin/esbuild"] = false
    }

    // Ignore problematic files in node_modules
    config.externals = config.externals || []
    if (Array.isArray(config.externals)) {
      config.externals.push({
        "@esbuild/linux-x64": "commonjs @esbuild/linux-x64",
      })
    }

    return config
  },
}

export default nextConfig
