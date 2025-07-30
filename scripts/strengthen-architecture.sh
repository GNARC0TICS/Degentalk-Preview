#!/bin/bash

# DegenTalk Architecture Strengthening Script
# Phase 2: Add missing repositories, transformers, and validation layers
# Non-disruptive improvements to existing domain structure

set -e

echo "🏗️  Starting DegenTalk Architecture Strengthening..."
echo "==================================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Function to create directory if it doesn't exist
ensure_dir() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "   ✅ Created directory: $dir"
    else
        echo "   ℹ️  Directory exists: $dir"
    fi
}

# Function to create repository template
create_repository_template() {
    local domain="$1"
    local repo_file="server/src/domains/$domain/repositories/${domain}.repository.ts"
    
    if [ ! -f "$repo_file" ]; then
        ensure_dir "server/src/domains/$domain/repositories"
        
        cat > "$repo_file" << EOF
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@db';
// Import your domain's schema tables here
// import { ${domain}Table } from '@db/schema/${domain}';

/**
 * Repository for ${domain} domain
 * All database operations for ${domain} should go through this repository
 */
export class ${domain^}Repository {
  /**
   * Find all ${domain} records
   * TODO: Implement based on your domain's schema
   */
  async findAll() {
    // TODO: Replace with actual table
    // return await db.select().from(${domain}Table);
    throw new Error('${domain^}Repository.findAll() not implemented');
  }

  /**
   * Find ${domain} by ID
   * TODO: Implement based on your domain's schema
   */
  async findById(id: string) {
    // TODO: Replace with actual table and ID field
    // return await db.select().from(${domain}Table).where(eq(${domain}Table.id, id)).limit(1);
    throw new Error('${domain^}Repository.findById() not implemented');
  }

  /**
   * Create new ${domain} record
   * TODO: Implement based on your domain's schema
   */
  async create(data: any) {
    // TODO: Replace with actual table and data structure
    // return await db.insert(${domain}Table).values(data).returning();
    throw new Error('${domain^}Repository.create() not implemented');
  }

  /**
   * Update ${domain} record
   * TODO: Implement based on your domain's schema
   */
  async update(id: string, data: any) {
    // TODO: Replace with actual table, ID field, and data structure
    // return await db.update(${domain}Table).set(data).where(eq(${domain}Table.id, id)).returning();
    throw new Error('${domain^}Repository.update() not implemented');
  }

  /**
   * Delete ${domain} record
   * TODO: Implement based on your domain's schema
   */
  async delete(id: string) {
    // TODO: Replace with actual table and ID field
    // return await db.delete(${domain}Table).where(eq(${domain}Table.id, id));
    throw new Error('${domain^}Repository.delete() not implemented');
  }
}

// Export singleton instance
export const ${domain}Repository = new ${domain^}Repository();
EOF
        echo "   ✅ Created repository template: $repo_file"
    else
        echo "   ℹ️  Repository exists: $repo_file"
    fi
}

# Function to create transformer template
create_transformer_template() {
    local domain="$1"
    local transformer_file="server/src/domains/$domain/transformers/${domain}.transformer.ts"
    
    if [ ! -f "$transformer_file" ]; then
        ensure_dir "server/src/domains/$domain/transformers"
        
        cat > "$transformer_file" << EOF
// Import shared types
// import type { SomeType } from '@shared/types/some.types';

/**
 * Transformer for ${domain} domain
 * Converts internal/database representations to public API responses
 */
export class ${domain^}Transformer {
  /**
   * Transform internal ${domain} to public representation
   * TODO: Define input and output types based on your domain
   */
  static toPublic${domain^}(internal: any) {
    // TODO: Implement transformation logic
    // Example:
    // return {
    //   id: internal.id,
    //   name: internal.name,
    //   createdAt: internal.createdAt,
    //   // Remove sensitive fields, format dates, etc.
    // };
    
    throw new Error('${domain^}Transformer.toPublic${domain^}() not implemented');
  }

  /**
   * Transform array of internal ${domain}s to public representation
   */
  static toPublic${domain^}List(internals: any[]) {
    return internals.map(internal => this.toPublic${domain^}(internal));
  }

  /**
   * Transform for summary/list views (lighter payload)
   * TODO: Implement if needed for performance
   */
  static toPublic${domain^}Summary(internal: any) {
    // TODO: Return minimal fields for list views
    return this.toPublic${domain^}(internal);
  }
}
EOF
        echo "   ✅ Created transformer template: $transformer_file"
    else
        echo "   ℹ️  Transformer exists: $transformer_file"
    fi
}

# Function to create validation template
create_validation_template() {
    local domain="$1"
    local validation_file="server/src/domains/$domain/validation/${domain}.validation.ts"
    
    if [ ! -f "$validation_file" ]; then
        ensure_dir "server/src/domains/$domain/validation"
        
        cat > "$validation_file" << EOF
import { z } from 'zod';

/**
 * Validation schemas for ${domain} domain
 * Use these schemas to validate API requests and data
 */

/**
 * Schema for creating a new ${domain}
 * TODO: Define based on your domain requirements
 */
export const create${domain^}Schema = z.object({
  // TODO: Add validation fields
  // name: z.string().min(1).max(100),
  // description: z.string().optional(),
});

/**
 * Schema for updating a ${domain}
 * TODO: Define based on your domain requirements
 */
export const update${domain^}Schema = z.object({
  // TODO: Add validation fields (usually partial of create schema)
  // name: z.string().min(1).max(100).optional(),
  // description: z.string().optional(),
});

/**
 * Schema for ${domain} query parameters
 * TODO: Define based on your API endpoints
 */
export const ${domain}QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  // TODO: Add domain-specific query parameters
  // search: z.string().optional(),
  // status: z.enum(['active', 'inactive']).optional(),
});

// Export types for use in controllers
export type Create${domain^}Input = z.infer<typeof create${domain^}Schema>;
export type Update${domain^}Input = z.infer<typeof update${domain^}Schema>;
export type ${domain^}QueryInput = z.infer<typeof ${domain}QuerySchema>;
EOF
        echo "   ✅ Created validation template: $validation_file"
    else
        echo "   ℹ️  Validation exists: $validation_file"
    fi
}

echo ""
echo "🔍 PHASE 1: Analyzing Domain Structure"
echo "======================================"

# Find domains that need repositories
domains_needing_repos=()
domains_needing_transformers=()
domains_needing_validation=()

echo "🔍 Scanning domains for missing components..."

for domain_dir in server/src/domains/*/; do
    if [ -d "$domain_dir" ]; then
        domain_name=$(basename "$domain_dir")
        
        # Skip certain directories
        if [[ "$domain_name" == "core" || "$domain_name" == "example" ]]; then
            continue
        fi
        
        # Check for services (indicates active domain)
        if [ -d "$domain_dir/services" ] || [ -f "$domain_dir"*.service.ts ]; then
            # Check if repository is missing
            if [ ! -d "$domain_dir/repositories" ]; then
                domains_needing_repos+=("$domain_name")
            fi
        fi
        
        # Check for controllers (indicates API endpoints)
        if [ -d "$domain_dir/controllers" ] || [ -f "$domain_dir"*.controller.ts ]; then
            # Check if transformer is missing
            if [ ! -d "$domain_dir/transformers" ]; then
                domains_needing_transformers+=("$domain_name")
            fi
            
            # Check if validation is missing
            if [ ! -d "$domain_dir/validation" ]; then
                domains_needing_validation+=("$domain_name")
            fi
        fi
    fi
done

echo "📊 Analysis Results:"
echo "   Domains needing repositories: ${#domains_needing_repos[@]}"
echo "   Domains needing transformers: ${#domains_needing_transformers[@]}"
echo "   Domains needing validation: ${#domains_needing_validation[@]}"

echo ""
echo "🏗️  PHASE 2: Adding Missing Repositories"
echo "========================================"

if [ ${#domains_needing_repos[@]} -gt 0 ]; then
    echo "Adding repositories to domains:"
    for domain in "${domains_needing_repos[@]}"; do
        echo "   📁 $domain"
    done
    echo ""
    
    read -p "❓ Create repository templates for these domains? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for domain in "${domains_needing_repos[@]}"; do
            echo "🔨 Creating repository for $domain..."
            create_repository_template "$domain"
        done
        echo "   ✅ Repository templates created"
    else
        echo "   ⏭️  Skipped repository creation"
    fi
else
    echo "✅ All domains have repositories"
fi

echo ""
echo "🎨 PHASE 3: Adding Missing Transformers"
echo "======================================"

if [ ${#domains_needing_transformers[@]} -gt 0 ]; then
    echo "Adding transformers to domains:"
    for domain in "${domains_needing_transformers[@]}"; do
        echo "   📁 $domain"
    done
    echo ""
    
    read -p "❓ Create transformer templates for these domains? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for domain in "${domains_needing_transformers[@]}"; do
            echo "🔨 Creating transformer for $domain..."
            create_transformer_template "$domain"
        done
        echo "   ✅ Transformer templates created"
    else
        echo "   ⏭️  Skipped transformer creation"
    fi
else
    echo "✅ All domains have transformers"
fi

echo ""
echo "✅ PHASE 4: Adding Missing Validation"
echo "==================================="

if [ ${#domains_needing_validation[@]} -gt 0 ]; then
    echo "Adding validation to domains:"
    for domain in "${domains_needing_validation[@]}"; do
        echo "   📁 $domain"
    done
    echo ""
    
    read -p "❓ Create validation templates for these domains? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for domain in "${domains_needing_validation[@]}"; do
            echo "🔨 Creating validation for $domain..."
            create_validation_template "$domain"
        done
        echo "   ✅ Validation templates created"
    else
        echo "   ⏭️  Skipped validation creation"
    fi
else
    echo "✅ All domains have validation"
fi

echo ""
echo "📋 PHASE 5: Implementation Guidelines"
echo "===================================="

cat << 'EOF'
🔧 Next Steps for Each Domain:

1. REPOSITORIES (server/src/domains/*/repositories/*.repository.ts):
   - Replace TODO comments with actual database schema imports
   - Implement methods using your domain's Drizzle schema
   - Follow the pattern: db.select().from(table).where(...)

2. TRANSFORMERS (server/src/domains/*/transformers/*.transformer.ts):
   - Define input/output types using @shared/types
   - Remove sensitive fields (passwords, internal IDs, etc.)
   - Format dates, numbers, and other data for API consumption
   - Consider performance (don't over-fetch relations)

3. VALIDATION (server/src/domains/*/validation/*.validation.ts):
   - Define Zod schemas based on your API requirements
   - Add proper constraints (min/max length, regex patterns, etc.)
   - Export TypeScript types for controller usage
   - Consider security (input sanitization, size limits)

4. INTEGRATION:
   - Update services to use repositories instead of direct DB calls
   - Update controllers to use transformers for responses
   - Update routes to use validation middleware
   - Follow existing domain patterns in the codebase

💡 PATTERNS TO FOLLOW:
   - Check existing domains like 'forum', 'wallet', 'auth' for examples
   - Use branded IDs from @shared/types/ids
   - Follow import alias rules from CLAUDE.md
   - Maintain separation: Controllers → Services → Repositories
EOF

echo ""
echo "🎉 ARCHITECTURE STRENGTHENING SUMMARY"
echo "===================================="
echo "✅ Phase 1: Domain structure analyzed"
echo "✅ Phase 2: Repository templates added"
echo "✅ Phase 3: Transformer templates added"
echo "✅ Phase 4: Validation templates added"
echo "✅ Phase 5: Implementation guidelines provided"
echo ""
echo "🚀 The codebase now has stronger architectural foundations!"
echo "📝 Next: Implement the TODO items in the generated templates"
echo "🧪 Then: Run 'pnpm typecheck' and 'pnpm lint' to verify everything works"