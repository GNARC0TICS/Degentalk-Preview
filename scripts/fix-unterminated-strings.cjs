const glob = require('glob');
const fs = require('fs');

// List of files with unterminated string literals (from the TypeScript error output)
const problemFiles = [
  'src/components/editor/enhanced-gif-picker.tsx',
  'src/components/editor/gif-picker.tsx',
  'src/components/editor/suggestion.ts',
  'src/components/errors/AdminErrorBoundary.tsx',
  'src/components/errors/ErrorBoundary.tsx',
  'src/components/errors/NetworkError.tsx',
  'src/components/forum/ForumErrorBoundary.tsx',
  'src/components/icons/iconRenderer.tsx',
  'src/components/payment/PaymentForm.tsx',
  'src/components/payment/StripeElementsWrapper.tsx',
  'src/components/profile/ProfileEditor.tsx',
  'src/components/shop/shop-item-card.tsx',
  'src/components/shoutbox/shoutbox-position-selector.tsx',
  'src/contexts/safe-shoutbox-provider.tsx',
  'src/contexts/shoutbox-context.tsx',
  'src/contexts/UIConfigContext.tsx',
  'src/contexts/wallet-context.tsx',
  'src/core/api.ts',
  'src/core/queryClient.ts',
  'src/features/admin/components/analytics/CacheAnalyticsCard.tsx'
];

const clientDir = 'client/';

problemFiles.forEach(relativePath => {
  const fullPath = clientDir + relativePath;
  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Fix the specific pattern where @app/lib/logger" is missing the closing quote
    content = content.replace(/@app\/lib\/logger"/g, '@app/lib/logger\'');
    
    // More general fix: find lines with imports that have mismatched quotes
    content = content.replace(/from\s+['"]@app\/([^'"]+)"/g, 'from \'@app/$1\'');
    content = content.replace(/from\s+"@app\/([^'"]+)'/g, 'from \'@app/$1\'');
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${fullPath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${fullPath}:`, error.message);
  }
});

// Also check for any other files with similar issues
const allFiles = glob.sync(['client/src/**/*.ts', 'client/src/**/*.tsx']);
let additionalFixed = 0;

allFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    let originalContent = content;
    
    // Fix any import statements with mismatched quotes
    content = content.replace(/from\s+['"]@app\/([^'"]+)"/g, 'from \'@app/$1\'');
    content = content.replace(/from\s+"@app\/([^'"]+)'/g, 'from \'@app/$1\'');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      additionalFixed++;
      console.log(`✅ Also fixed: ${file}`);
    }
  } catch (error) {
    // Ignore errors for files we can't read
  }
});

console.log(`\nFixed ${problemFiles.length} known problem files`);
if (additionalFixed > 0) {
  console.log(`Fixed ${additionalFixed} additional files with similar issues`);
}