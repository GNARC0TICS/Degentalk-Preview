// This file serves as a compatibility bridge between historical imports using
// "use-media-query" (kebab-case) and the canonical implementation located in
// "useMediaQuery.ts" (camelCase). All public APIs are re-exported so that both
// import styles resolve to the same module, avoiding duplicate implementations
// and case-sensitivity issues in CI / Linux environments.

export { useMediaQuery, useBreakpoint, useMobileDetector } from './useMediaQuery';
