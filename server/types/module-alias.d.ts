declare module 'module-alias' {
  export function addAlias(alias: string, path: string): void;
  export function addAliases(aliases: Record<string, string>): void;
  export function addPath(path: string): void;
  export function registerFromPath(path: string): void;
  export function reset(): void;
}