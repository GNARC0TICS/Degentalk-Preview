import { Project, SyntaxKind, CallExpression, PropertyAccessExpression } from 'ts-morph';
import { globSync } from 'glob';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Domain-specific transformer mappings
const TRANSFORMER_MAPPINGS = {
  'wallet': { 
    import: 'EconomyTransformer', 
    module: '@server/src/domains/economy/transformers/economy.transformer',
    methods: {
      transaction: 'toTransaction',
      transactions: 'toTransactionHistory',
      balance: 'toWalletBalance',
      wallet: 'toWalletBalance'
    }
  },
  'auth': {
    import: 'UserTransformer',
    module: '@server/src/domains/users/transformers/user.transformer',
    methods: {
      user: 'toPublicUser',
      userResponse: 'toAuthenticatedSelf'
    }
  },
  'forum': {
    import: 'ForumTransformer',
    module: '@server/src/domains/forum/transformers/forum.transformer',
    methods: {
      thread: 'toPublicThread',
      post: 'toPublicPost',
      category: 'toPublicCategory'
    }
  },
  'gamification': {
    import: 'CloutTransformer',
    module: '@server/src/domains/gamification/transformers/clout.transformer',
    methods: {
      achievement: 'toPublicAchievement',
      badge: 'toPublicBadge'
    }
  },
  'shop': {
    import: 'ShopTransformer',
    module: '@server/src/domains/shop/transformers/shop.transformer',
    methods: {
      product: 'toPublicProduct',
      item: 'toPublicProduct'
    }
  }
};

async function fixTransformerViolations() {
  console.log('🔧 Starting transformer violation fixes...\n');
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Focus on high-violation domains first
  const targetFiles = [
    'server/src/domains/wallet/**/*.controller.ts',
    'server/src/domains/wallet/**/*.routes.ts',
    'server/src/domains/auth/**/*.controller.ts',
    'server/src/domains/forum/**/*.controller.ts',
    'server/src/domains/forum/**/*.routes.ts',
    'server/src/domains/gamification/**/*.controller.ts',
    'server/src/domains/shop/**/*.controller.ts',
    'server/src/domains/shop/**/*.routes.ts'
  ];
  
  let totalFixed = 0;
  const fixedFiles = new Set<string>();
  
  for (const pattern of targetFiles) {
    const files = globSync(pattern, { cwd: projectRoot });
    
    for (const relPath of files) {
      const fullPath = path.join(projectRoot, relPath);
      const sourceFile = project.addSourceFileAtPath(fullPath);
      let fileFixed = false;
      let fixCount = 0;
      
      // Find domain from path
      const domainMatch = relPath.match(/server\/src\/domains\/([^\/]+)/);
      const domain = domainMatch ? domainMatch[1] : null;
      const transformerConfig = domain ? TRANSFORMER_MAPPINGS[domain] : null;
      
      if (!transformerConfig) continue;
      
      // Find all res.json() calls
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
          const callExpr = node as CallExpression;
          const expression = callExpr.getExpression();
          
          if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const object = propAccess.getExpression().getText().trim();
            const method = propAccess.getName();
            
            if (object === 'res' && method === 'json') {
              const args = callExpr.getArguments();
              if (args.length === 1) {
                const argText = args[0].getText().trim();
                
                // Check if we have a transformation for this argument
                const transformMethod = transformerConfig.methods[argText];
                if (transformMethod) {
                  // Apply the transformation
                  const transformedCall = `res.json(${transformerConfig.import}.${transformMethod}(${argText}))`;
                  callExpr.replaceWithText(transformedCall);
                  fileFixed = true;
                  fixCount++;
                  
                  // Ensure import exists
                  ensureImport(sourceFile, transformerConfig.import, transformerConfig.module);
                }
              }
            }
          }
        }
      });
      
      if (fileFixed) {
        await sourceFile.save();
        fixedFiles.add(relPath);
        totalFixed += fixCount;
        console.log(`✅ Fixed ${fixCount} violations in ${relPath}`);
      }
    }
  }
  
  console.log(`\n📊 Summary: Fixed ${totalFixed} violations in ${fixedFiles.size} files`);
  return { totalFixed, filesFixed: fixedFiles.size };
}

function ensureImport(sourceFile: any, namedImport: string, moduleSpec: string) {
  const existing = sourceFile.getImportDeclaration((decl: any) => 
    decl.getModuleSpecifierValue() === moduleSpec
  );
  
  if (existing) {
    const namedImports = existing.getNamedImports();
    const hasImport = namedImports.some((imp: any) => imp.getName() === namedImport);
    if (!hasImport) {
      existing.addNamedImport(namedImport);
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: moduleSpec,
      namedImports: [namedImport]
    });
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixTransformerViolations()
    .then(result => {
      console.log('\n✅ Transformer violation fixes complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fixing violations:', error);
      process.exit(1);
    });
}