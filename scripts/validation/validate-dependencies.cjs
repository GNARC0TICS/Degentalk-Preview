#!/usr/bin/env node

/**
 * Dependency Flow Validation Script
 * Validates that workspace dependencies follow the hierarchical flow rules
 */

const fs = require('fs');
const path = require('path');

// Define the strict hierarchical dependency flow
const DEPENDENCY_HIERARCHY = {
  'shared': { level: 0, allowedTargets: [] },
  'db': { level: 1, allowedTargets: ['shared'] },
  'client': { level: 2, allowedTargets: ['shared'] },
  'server': { level: 2, allowedTargets: ['shared', 'db'] },
  'scripts': { level: 3, allowedTargets: ['shared', 'db', 'client', 'server'] }
};

const WORKSPACE_PACKAGES = [
  'client',
  'server', 
  'shared',
  'db',
  'scripts'
];

function loadPackageJson(packageName) {
  const packagePath = path.join(packageName, 'package.json');
  if (!fs.existsSync(packagePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function getDependencies(pkg) {
  if (!pkg) return [];
  
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies
  };
  
  return Object.keys(deps).filter(dep => dep.startsWith('@degentalk/'));
}

function extractPackageName(dependencyName) {
  return dependencyName.replace('@degentalk/', '');
}

function validateDependencyFlow() {
  const violations = [];
  
  for (const packageName of WORKSPACE_PACKAGES) {
    const pkg = loadPackageJson(packageName);
    if (!pkg) continue;
    
    const dependencies = getDependencies(pkg);
    const packageHierarchy = DEPENDENCY_HIERARCHY[packageName];
    
    if (!packageHierarchy) {
      violations.push({
        package: packageName,
        type: 'unknown_package',
        message: `Unknown package "${packageName}" not in dependency hierarchy`
      });
      continue;
    }
    
    for (const dep of dependencies) {
      const depPackageName = extractPackageName(dep);
      const depHierarchy = DEPENDENCY_HIERARCHY[depPackageName];
      
      if (!depHierarchy) {
        violations.push({
          package: packageName,
          dependency: dep,
          type: 'unknown_dependency',
          message: `Unknown dependency "${dep}" not in workspace`
        });
        continue;
      }
      
      // Check if this dependency is allowed
      if (!packageHierarchy.allowedTargets.includes(depPackageName)) {
        violations.push({
          package: packageName,
          dependency: dep,
          type: 'forbidden_dependency',
          message: `Package "${packageName}" cannot depend on "${depPackageName}" (violates dependency hierarchy)`
        });
      }
      
      // Check for circular dependencies
      if (depHierarchy.level >= packageHierarchy.level && depPackageName !== packageName) {
        violations.push({
          package: packageName,
          dependency: dep,
          type: 'circular_dependency',
          message: `Circular dependency detected: "${packageName}" (level ${packageHierarchy.level}) depends on "${depPackageName}" (level ${depHierarchy.level})`
        });
      }
    }
  }
  
  return violations;
}

function validateWorkspaceConfiguration() {
  const violations = [];
  
  // Check root package.json workspace configuration
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!rootPkg.pnpm || !rootPkg.pnpm.dependencyRules) {
    violations.push({
      type: 'missing_config',
      message: 'Missing pnpm.dependencyRules in root package.json'
    });
  }
  
  // Check pnpm-workspace.yaml
  const workspaceConfigPath = 'pnpm-workspace.yaml';
  if (!fs.existsSync(workspaceConfigPath)) {
    violations.push({
      type: 'missing_workspace_config',
      message: 'Missing pnpm-workspace.yaml file'
    });
  } else {
    const workspaceConfig = fs.readFileSync(workspaceConfigPath, 'utf8');
    for (const packageName of WORKSPACE_PACKAGES) {
      if (!workspaceConfig.includes(`'${packageName}'`)) {
        violations.push({
          type: 'missing_workspace_package',
          package: packageName,
          message: `Package "${packageName}" not listed in pnpm-workspace.yaml`
        });
      }
    }
  }
  
  return violations;
}

function generateDependencyGraph() {
  const graph = {};
  
  for (const packageName of WORKSPACE_PACKAGES) {
    const pkg = loadPackageJson(packageName);
    if (!pkg) continue;
    
    const dependencies = getDependencies(pkg).map(extractPackageName);
    graph[packageName] = dependencies;
  }
  
  return graph;
}

function main() {
  console.log('🔍 Validating dependency flow...');
  
  const dependencyViolations = validateDependencyFlow();
  const configViolations = validateWorkspaceConfiguration();
  const allViolations = [...dependencyViolations, ...configViolations];
  
  if (allViolations.length === 0) {
    console.log('✅ All dependency flows are valid!');
    
    // Show dependency graph
    console.log('\\n📊 Current dependency graph:');
    const graph = generateDependencyGraph();
    for (const [pkg, deps] of Object.entries(graph)) {
      const hierarchy = DEPENDENCY_HIERARCHY[pkg];
      console.log(`   ${pkg} (L${hierarchy.level}) → [${deps.join(', ') || 'none'}]`);
    }
    
    process.exit(0);
  } else {
    console.log(`❌ Found ${allViolations.length} dependency violations:`);
    console.log('');
    
    // Group violations by type
    const violationsByType = {};
    for (const violation of allViolations) {
      if (!violationsByType[violation.type]) {
        violationsByType[violation.type] = [];
      }
      violationsByType[violation.type].push(violation);
    }
    
    for (const [type, violations] of Object.entries(violationsByType)) {
      console.log(`🚨 ${type.toUpperCase().replace('_', ' ')} (${violations.length}):`);
      
      for (const violation of violations) {
        console.log(`   ❌ ${violation.message}`);
        if (violation.package && violation.dependency) {
          console.log(`      Package: ${violation.package} → Dependency: ${violation.dependency}`);
        }
      }
      console.log('');
    }
    
    console.log('💡 Dependency hierarchy rules:');
    console.log('   Level 0: shared (foundation - no dependencies)');
    console.log('   Level 1: db (data layer - depends on shared only)');
    console.log('   Level 2: client, server (business/presentation - depends on lower levels)');
    console.log('   Level 3: scripts (operations - can access all layers)');
    console.log('');
    console.log('   Fix by removing forbidden dependencies or moving shared logic to appropriate layer.');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  validateDependencyFlow, 
  validateWorkspaceConfiguration, 
  generateDependencyGraph,
  DEPENDENCY_HIERARCHY 
};