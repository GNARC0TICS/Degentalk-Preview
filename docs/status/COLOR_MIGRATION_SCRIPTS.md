# Color Migration Scripts & Tools

## 1. Quick Migration Script

```bash
#!/bin/bash
# scripts/migrate-colors.sh

echo "🎨 Starting DegenTalk Color Migration..."

# Create backup
cp -r client/src client/src.backup-$(date +%Y%m%d-%H%M%S)

# Phase 1: Overlay components
echo "📦 Migrating overlay components..."
find client/src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/bg-black\/80/bg-overlay/g' \
  -e 's/bg-black\/70/bg-overlay\/70/g' \
  -e 's/bg-black\/90/bg-overlay\/90/g' \
  -e 's/rgba(0,\s*0,\s*0,\s*0\.[0-9]+)/bg-overlay/g' \
  {} +

# Phase 2: Surface colors
echo "🎨 Migrating surface colors..."
find client/src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/bg-zinc-900/bg-surface-elevated/g' \
  -e 's/bg-zinc-800/bg-surface-overlay/g' \
  -e 's/bg-zinc-700/bg-surface-subtle/g' \
  {} +

# Phase 3: Text colors
echo "✏️ Migrating text colors..."
find client/src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/text-white/text-primary/g' \
  -e 's/text-gray-300/text-secondary/g' \
  -e 's/text-gray-400/text-tertiary/g' \
  -e 's/text-zinc-400/text-tertiary/g' \
  -e 's/text-zinc-500/text-tertiary/g' \
  {} +

# Phase 4: Border colors
echo "🔲 Migrating border colors..."
find client/src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/border-zinc-700/border-subtle/g' \
  -e 's/border-zinc-800/border-default/g' \
  -e 's/border-gray-700/border-subtle/g' \
  {} +

echo "✅ Migration complete! Check git diff for changes."
```

## 2. Color Validation Script

```javascript
// scripts/validate-colors.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const hardcodedPatterns = [
  { pattern: /#[0-9a-fA-F]{6}/, name: 'Hex color' },
  { pattern: /#[0-9a-fA-F]{3}(?![0-9a-fA-F])/, name: 'Short hex color' },
  { pattern: /rgba?\([^)]+\)/, name: 'RGB/RGBA function' },
  { pattern: /bg-(black|white|gray|zinc|slate|red|blue|green|yellow|purple|pink|amber|emerald|cyan|indigo|violet|fuchsia|rose|sky|teal|lime|orange)-\d+/, name: 'Hardcoded Tailwind bg color' },
  { pattern: /text-(black|white|gray|zinc|slate|red|blue|green|yellow|purple|pink|amber|emerald|cyan|indigo|violet|fuchsia|rose|sky|teal|lime|orange)-\d+/, name: 'Hardcoded Tailwind text color' },
  { pattern: /border-(black|white|gray|zinc|slate|red|blue|green|yellow|purple|pink|amber|emerald|cyan|indigo|violet|fuchsia|rose|sky|teal|lime|orange)-\d+/, name: 'Hardcoded Tailwind border color' },
];

const allowedPatterns = [
  /text-(primary|secondary|tertiary|muted-foreground|foreground)/,
  /bg-(surface|overlay|card|background|muted|primary|secondary)/,
  /border-(subtle|default|strong|border|input)/,
];

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip if line contains allowed patterns
    if (allowedPatterns.some(p => p.test(line))) return;
    
    hardcodedPatterns.forEach(({ pattern, name }) => {
      const matches = line.match(pattern);
      if (matches) {
        issues.push({
          file: filePath,
          line: index + 1,
          type: name,
          value: matches[0],
          preview: line.trim()
        });
      }
    });
  });

  return issues;
}

// Run validation
const files = glob.sync('client/src/**/*.{tsx,jsx,ts,js}', {
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

console.log(`🔍 Validating ${files.length} files...\n`);

const allIssues = [];
files.forEach(file => {
  const issues = validateFile(file);
  allIssues.push(...issues);
});

// Group by type
const grouped = allIssues.reduce((acc, issue) => {
  if (!acc[issue.type]) acc[issue.type] = [];
  acc[issue.type].push(issue);
  return acc;
}, {});

// Report
console.log('📊 Color Usage Report\n');
Object.entries(grouped).forEach(([type, issues]) => {
  console.log(`${type}: ${issues.length} instances`);
  // Show first 3 examples
  issues.slice(0, 3).forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.preview}`);
  });
  if (issues.length > 3) {
    console.log(`  ... and ${issues.length - 3} more\n`);
  }
});

console.log(`\n📈 Total hardcoded colors: ${allIssues.length}`);
```

## 3. Component Migration Helper

```typescript
// scripts/component-migrator.ts
interface ColorMapping {
  from: string;
  to: string;
  context?: string; // Optional context for more specific replacements
}

const colorMappings: ColorMapping[] = [
  // Backgrounds
  { from: 'bg-black/80', to: 'bg-overlay' },
  { from: 'bg-black/70', to: 'bg-overlay/70' },
  { from: 'bg-zinc-900/80', to: 'bg-surface-elevated/80' },
  { from: 'bg-zinc-900', to: 'bg-surface-elevated' },
  { from: 'bg-zinc-800', to: 'bg-surface-overlay' },
  { from: 'bg-card', to: 'bg-surface-elevated' }, // Already semantic but map to new system
  
  // Text
  { from: 'text-white', to: 'text-primary' },
  { from: 'text-zinc-50', to: 'text-primary' },
  { from: 'text-gray-300', to: 'text-secondary' },
  { from: 'text-zinc-300', to: 'text-secondary' },
  { from: 'text-gray-400', to: 'text-tertiary' },
  { from: 'text-zinc-400', to: 'text-tertiary' },
  { from: 'text-gray-500', to: 'text-muted-foreground' },
  { from: 'text-zinc-500', to: 'text-muted-foreground' },
  
  // Borders
  { from: 'border-zinc-700', to: 'border-subtle' },
  { from: 'border-zinc-800', to: 'border-default' },
  { from: 'border-gray-700', to: 'border-subtle' },
  { from: 'border-gray-800', to: 'border-default' },
  
  // Special components
  { from: "style={{ background: 'rgba(30, 30, 40, 0.7)' }}", to: 'className="bg-surface-overlay/70"' },
  { from: "style={{ background: '#222' }}", to: 'className="bg-xp-progress-bg"' },
];

// Generate sed commands
colorMappings.forEach(({ from, to }) => {
  console.log(`sed -i '' 's/${from.replace(/[\/\(\)]/g, '\\$&')}/${to}/g' "$1"`);
});
```

## 4. CSS Variable Manager

```typescript
// client/src/utils/theme-colors.ts
export class ThemeColorManager {
  private static instance: ThemeColorManager;
  private root = document.documentElement;
  
  // Color conversion utilities
  static hexToHSL(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }
  
  // Set a CSS variable
  setColor(varName: string, value: string) {
    // Handle different input formats
    let hslValue = value;
    if (value.startsWith('#')) {
      hslValue = ThemeColorManager.hexToHSL(value);
    }
    
    this.root.style.setProperty(`--${varName}`, hslValue);
  }
  
  // Get current color value
  getColor(varName: string): string {
    return getComputedStyle(this.root).getPropertyValue(`--${varName}`).trim();
  }
  
  // Batch update colors
  updateTheme(colors: Record<string, string>) {
    Object.entries(colors).forEach(([varName, value]) => {
      this.setColor(varName, value);
    });
  }
  
  // Export current theme
  exportTheme(): Record<string, string> {
    const vars = [
      'surface-base', 'surface-elevated', 'surface-overlay',
      'overlay-backdrop', 'overlay-opacity',
      'text-primary', 'text-secondary', 'text-tertiary',
      'border-subtle', 'border-default', 'border-strong',
      'xp-primary', 'xp-gradient-start', 'xp-gradient-end'
    ];
    
    const theme: Record<string, string> = {};
    vars.forEach(v => {
      theme[v] = this.getColor(v);
    });
    
    return theme;
  }
}
```

## 5. Admin Panel Color Picker Component

```tsx
// client/src/features/admin/components/ColorThemeEditor.tsx
import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ThemeColorManager } from '@/utils/theme-colors';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ColorGroup {
  name: string;
  variables: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
}

const colorGroups: ColorGroup[] = [
  {
    name: 'Surfaces',
    variables: [
      { key: 'surface-base', label: 'Base Background', description: 'Main app background' },
      { key: 'surface-elevated', label: 'Elevated Surface', description: 'Cards and raised elements' },
      { key: 'surface-overlay', label: 'Overlay Surface', description: 'Modals and sheets' },
    ]
  },
  {
    name: 'Text',
    variables: [
      { key: 'text-primary', label: 'Primary Text' },
      { key: 'text-secondary', label: 'Secondary Text' },
      { key: 'text-tertiary', label: 'Muted Text' },
    ]
  },
  {
    name: 'Borders',
    variables: [
      { key: 'border-subtle', label: 'Subtle Border' },
      { key: 'border-default', label: 'Default Border' },
      { key: 'border-strong', label: 'Strong Border' },
    ]
  }
];

export const ColorThemeEditor: React.FC = () => {
  const manager = ThemeColorManager.getInstance();
  const [selectedVar, setSelectedVar] = useState('surface-base');
  const [currentColor, setCurrentColor] = useState('#000000');
  
  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    manager.setColor(selectedVar, color);
  };
  
  const exportTheme = () => {
    const theme = manager.exportTheme();
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'degentalk-theme.json';
    a.click();
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {colorGroups.map(group => (
          <Card key={group.name} className="p-6">
            <h3 className="text-lg font-semibold mb-4">{group.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              {group.variables.map(variable => (
                <button
                  key={variable.key}
                  onClick={() => setSelectedVar(variable.key)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    selectedVar === variable.key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-md border"
                      style={{
                        backgroundColor: `hsl(${manager.getColor(variable.key)})`
                      }}
                    />
                    <div>
                      <div className="font-medium">{variable.label}</div>
                      {variable.description && (
                        <div className="text-xs text-muted-foreground">
                          {variable.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Color Picker</h3>
          <Label className="mb-2">Editing: {selectedVar}</Label>
          <HexColorPicker color={currentColor} onChange={handleColorChange} />
          <div className="mt-4 space-y-2">
            <Input
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#000000"
            />
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-2">
            <Button onClick={exportTheme} className="w-full">
              Export Theme
            </Button>
            <Button variant="outline" className="w-full">
              Import Theme
            </Button>
            <Button variant="destructive" className="w-full">
              Reset to Default
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

## 6. Pre-Migration Checklist

```bash
#!/bin/bash
# scripts/pre-migration-check.sh

echo "🔍 Pre-Migration Checklist"
echo "========================="

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "❌ Uncommitted changes detected. Please commit or stash first."
  exit 1
else
  echo "✅ Working directory clean"
fi

# Check current branch
BRANCH=$(git branch --show-current)
if [[ $BRANCH == "main" ]]; then
  echo "❌ On main branch. Please create feature branch first."
  echo "   Run: git checkout -b feat/semantic-color-system"
  exit 1
else
  echo "✅ On feature branch: $BRANCH"
fi

# Check dependencies
if ! command -v sed &> /dev/null; then
  echo "❌ sed command not found"
  exit 1
else
  echo "✅ sed available"
fi

# Count current hardcoded colors
TOTAL=$(grep -r -E "(bg|text|border)-(zinc|gray|black|white)-[0-9]+" client/src --include="*.tsx" | wc -l)
echo "📊 Found $TOTAL hardcoded color instances"

echo ""
echo "✅ Ready to proceed with migration!"
echo "   Run: ./scripts/migrate-colors.sh"
```

## Usage Instructions

1. **Run pre-migration check:**
   ```bash
   chmod +x scripts/pre-migration-check.sh
   ./scripts/pre-migration-check.sh
   ```

2. **Execute migration:**
   ```bash
   chmod +x scripts/migrate-colors.sh
   ./scripts/migrate-colors.sh
   ```

3. **Validate results:**
   ```bash
   node scripts/validate-colors.js
   ```

4. **Test specific component:**
   ```bash
   # Test a single file
   sed -i '' 's/bg-black\/80/bg-overlay/g' client/src/components/xp/LevelUpModal.tsx
   ```

5. **Review changes:**
   ```bash
   git diff --stat
   git diff client/src/components/xp/LevelUpModal.tsx
   ```

## Rollback

If needed, restore from backup:
```bash
rm -rf client/src
mv client/src.backup-* client/src
```