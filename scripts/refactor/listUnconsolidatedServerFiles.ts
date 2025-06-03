import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby'; // We'll need to ensure this is available

interface UnconsolidatedFile {
  path: string;
  suggestedDomain: string | null;
}

const SERVER_SERVICES_PATH = 'server/services';
const SERVER_ROUTES_API_PATH = 'server/routes/api';
const PROJECT_ROOT = process.cwd(); // Assumes script is run from project root

// Helper function to infer domain
function inferDomain(filePath: string, basePath: string): string | null {
  const relativePath = path.relative(basePath, filePath);
  const parts = relativePath.split(path.sep);

  if (basePath === SERVER_ROUTES_API_PATH && parts.length > 1 && parts[0] !== '.' && parts[0] !== '..') {
    // For server/routes/api/domain/file.ts, domain is parts[0]
    return parts[0].toLowerCase();
  } else if (basePath === SERVER_SERVICES_PATH && parts.length === 1) {
    // For server/services/someService.ts or server/services/some-client.ts
    const fileNameWithoutExt = path.parse(parts[0]).name.toLowerCase();
    
    // Remove common suffixes like -service, -client, service, client
    let potentialDomain = fileNameWithoutExt.replace(/-service$/, '')
                                         .replace(/-client$/, '')
                                         .replace(/service$/, '')
                                         .replace(/client$/, '');
    
    // If it was something like 'ccpayment-client', it becomes 'ccpayment'
    // If it was 'xp-clout-service', it becomes 'xp-clout'
    // If it was 'pathservice', it becomes 'path'
    
    return potentialDomain || null;
  }
  // If it's a file directly under server/routes/api (e.g., server/routes/api/some-route.ts)
  // This case might need more specific rules or manual assignment later.
  // For now, let's return the filename without extension as a placeholder.
  if (basePath === SERVER_ROUTES_API_PATH && parts.length === 1) {
    return path.parse(parts[0]).name.toLowerCase();
  }
  return null;
}

async function listUnconsolidatedFiles(): Promise<UnconsolidatedFile[]> {
  const results: UnconsolidatedFile[] = [];

  const serviceScanPath = path.join(PROJECT_ROOT, SERVER_SERVICES_PATH);
  const routeScanPath = path.join(PROJECT_ROOT, SERVER_ROUTES_API_PATH);

  // Scan server/services
  try {
    if (await fs.stat(serviceScanPath).then(s => s.isDirectory()).catch(() => false)) {
      const serviceFiles = await globby([`**/*.ts`], { cwd: serviceScanPath, onlyFiles: true, absolute: false });
      for (const file of serviceFiles) {
        const fullPath = path.join(SERVER_SERVICES_PATH, file).replace(/\\/g, '/'); // Normalize path separators
        results.push({
          path: fullPath,
          suggestedDomain: inferDomain(fullPath, SERVER_SERVICES_PATH),
        });
      }
    } else {
      console.warn(`Warning: Directory not found - ${serviceScanPath}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not scan ${SERVER_SERVICES_PATH}: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Scan server/routes/api
  try {
    if (await fs.stat(routeScanPath).then(s => s.isDirectory()).catch(() => false)) {
      // Scan for subdirectories first (e.g., server/routes/api/xp/)
      const domainDirs = await fs.readdir(routeScanPath, { withFileTypes: true });
      for (const dirent of domainDirs) {
        if (dirent.isDirectory()) {
          const domainName = dirent.name.toLowerCase();
          const domainPath = path.join(routeScanPath, dirent.name);
          const routeFiles = await globby([`**/*.ts`, `!index.ts`], { cwd: domainPath, onlyFiles: true, absolute: false });
          for (const file of routeFiles) {
            // Construct path relative to project root
            const fullPath = path.join(SERVER_ROUTES_API_PATH, dirent.name, file).replace(/\\/g, '/');
            results.push({
              path: fullPath,
              suggestedDomain: domainName, // Domain is the directory name
            });
          }
        } else if (dirent.isFile() && dirent.name.endsWith('.ts') && dirent.name !== 'index.ts') {
          // Files directly under server/routes/api (excluding a potential index.ts)
           const fullPath = path.join(SERVER_ROUTES_API_PATH, dirent.name).replace(/\\/g, '/');
           results.push({
             path: fullPath,
             suggestedDomain: inferDomain(fullPath, SERVER_ROUTES_API_PATH) // Try to infer or mark for review
           });
        }
      }
    } else {
      console.warn(`Warning: Directory not found - ${routeScanPath}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not scan ${SERVER_ROUTES_API_PATH}: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return results;
}

async function main() {
  const files = await listUnconsolidatedFiles();
  // Filter out any entries where path is just the base directory itself (if globby returns '.')
  const filteredFiles = files.filter(f => f.path !== SERVER_SERVICES_PATH && f.path !== SERVER_ROUTES_API_PATH);
  console.log(JSON.stringify(filteredFiles, null, 2));
}

main().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});
