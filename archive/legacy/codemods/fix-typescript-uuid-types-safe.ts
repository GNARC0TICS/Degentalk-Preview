#!/usr/bin/env tsx

/**
 * Safe UUID Type Migration Codemod
 * 
 * This codemod safely converts:
 * 1. TypeScript type annotations from number to branded UUID types
 * 2. Zod schemas from positiveInt to z.string().uuid()
 * 
 * Safety features:
 * - Dry run by default
 * - Only touches known ID patterns
 * - Preserves exact formatting
 * - Reports all changes before applying
 */

import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph';
import { readFileSync } from 'fs';
import path from 'path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
	boolean: ['dry', 'apply'],
	string: ['file'],
	default: { dry: true, apply: false }
});

const isDryRun = !argv.apply;
const singleFile = argv.file;

// Load actual branded types from db/types/id.types.ts
const idTypesPath = path.resolve('db/types/id.types.ts');
const idTypesContent = readFileSync(idTypesPath, 'utf8');

// Extract all exported type aliases
const brandedTypes = new Map<string, string>();
const typeAliasRegex = /export\s+type\s+(\w+)\s*=\s*(?:Brand<string,\s*'(\w+)'>|Id<'(\w+)'>)/g;
let match;
while ((match = typeAliasRegex.exec(idTypesContent)) !== null) {
	const typeName = match[1];
	// Convert TypeName to fieldName (e.g., UserId -> userId)
	const fieldName = typeName.charAt(0).toLowerCase() + typeName.slice(1);
	brandedTypes.set(fieldName, typeName);
}

// Add some common variations
brandedTypes.set('userid', 'UserId');
brandedTypes.set('threadid', 'ThreadId');
brandedTypes.set('postid', 'PostId');
brandedTypes.set('forumid', 'ForumId');

console.log(`Loaded ${brandedTypes.size} branded type mappings`);

interface Change {
	file: string;
	line: number;
	column: number;
	type: 'typescript' | 'zod';
	before: string;
	after: string;
	context: string;
}

const changes: Change[] = [];

function recordChange(sourceFile: SourceFile, node: Node, type: 'typescript' | 'zod', before: string, after: string) {
	const start = node.getStart();
	const { line, column } = sourceFile.getLineAndColumnAtPos(start);
	
	// Get surrounding context
	const parent = node.getParent();
	const context = parent ? parent.getText().substring(0, 100) : '';
	
	changes.push({
		file: sourceFile.getFilePath(),
		line,
		column,
		type,
		before,
		after,
		context
	});
}

function processTypeScriptAnnotations(sourceFile: SourceFile) {
	// Process interface properties
	sourceFile.getInterfaces().forEach(interfaceDecl => {
		interfaceDecl.getProperties().forEach(prop => {
			const propName = prop.getName();
			const typeNode = prop.getTypeNode();
			
			if (typeNode && Node.isToken(typeNode) && typeNode.getKind() === SyntaxKind.NumberKeyword) {
				const brandedType = brandedTypes.get(propName);
				if (brandedType) {
					const before = prop.getText();
					prop.setType(brandedType);
					const after = prop.getText();
					recordChange(sourceFile, prop, 'typescript', before, after);
				}
			}
		});
	});
	
	// Process function parameters
	sourceFile.getDescendantsOfKind(SyntaxKind.Parameter).forEach(param => {
		const paramName = param.getName();
		if (!paramName) return;
		
		const typeNode = param.getTypeNode();
		if (typeNode && Node.isToken(typeNode) && typeNode.getKind() === SyntaxKind.NumberKeyword) {
			const brandedType = brandedTypes.get(paramName);
			if (brandedType) {
				const before = param.getText();
				param.setType(brandedType);
				const after = param.getText();
				recordChange(sourceFile, param, 'typescript', before, after);
			}
		}
	});
	
	// Process type aliases
	sourceFile.getTypeAliases().forEach(typeAlias => {
		const typeNode = typeAlias.getTypeNode();
		if (Node.isTypeLiteral(typeNode)) {
			typeNode.getProperties().forEach(prop => {
				if (Node.isPropertySignature(prop)) {
					const propName = prop.getName();
					const propTypeNode = prop.getTypeNode();
					
					if (propTypeNode && Node.isToken(propTypeNode) && propTypeNode.getKind() === SyntaxKind.NumberKeyword) {
						const brandedType = brandedTypes.get(propName);
						if (brandedType) {
							const before = prop.getText();
							prop.setType(brandedType);
							const after = prop.getText();
							recordChange(sourceFile, prop, 'typescript', before, after);
						}
					}
				}
			});
		}
	});
}

function processZodSchemas(sourceFile: SourceFile) {
	// Only process files that import zod
	const hasZodImport = sourceFile.getImportDeclarations().some(imp => 
		imp.getModuleSpecifierValue().includes('zod')
	);
	
	if (!hasZodImport) return;
	
	// Find Zod schema definitions
	sourceFile.getVariableDeclarations().forEach(varDecl => {
		const varName = varDecl.getName();
		const initializer = varDecl.getInitializer();
		
		if (initializer && brandedTypes.has(varName)) {
			const initText = initializer.getText();
			if (initText === 'positiveInt') {
				const before = varDecl.getText();
				varDecl.setInitializer(`z.string().uuid()`);
				const after = varDecl.getText();
				recordChange(sourceFile, varDecl, 'zod', before, after);
			}
		}
	});
}

function ensureImports(sourceFile: SourceFile) {
	// Check if any TypeScript changes were made to this file
	const hasTypeScriptChanges = changes.some(
		c => c.file === sourceFile.getFilePath() && c.type === 'typescript'
	);
	
	if (!hasTypeScriptChanges) return;
	
	// Collect all branded types used in this file
	const usedTypes = new Set<string>();
	changes
		.filter(c => c.file === sourceFile.getFilePath() && c.type === 'typescript')
		.forEach(c => {
			const typeMatch = c.after.match(/:\s*(\w+Id)/);
			if (typeMatch) {
				usedTypes.add(typeMatch[1]);
			}
		});
	
	if (usedTypes.size === 0) return;
	
	// Check for existing import
	const existingImport = sourceFile.getImportDeclarations().find(imp => 
		imp.getModuleSpecifierValue() === '@/db/types'
	);
	
	if (existingImport) {
		// Add to existing import
		const namedImports = existingImport.getNamedImports().map(ni => ni.getName());
		const toAdd = Array.from(usedTypes).filter(t => !namedImports.includes(t));
		if (toAdd.length > 0) {
			existingImport.addNamedImports(toAdd);
		}
	} else {
		// Add new import at the top
		sourceFile.insertImportDeclaration(0, {
			moduleSpecifier: '@/db/types',
			namedImports: Array.from(usedTypes)
		});
	}
}

async function main() {
	console.log('🔍 Safe UUID Type Migration Codemod\n');
	console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLY CHANGES'}\n`);
	
	const project = new Project({
		tsConfigFilePath: './tsconfig.json',
		skipAddingFilesFromTsConfig: true
	});
	
	// Add files to process
	if (singleFile) {
		project.addSourceFileAtPath(singleFile);
		console.log(`Processing single file: ${singleFile}\n`);
	} else {
		// Add specific files we know need changes
		const filesToProcess = [
			'client/src/components/profile/SignatureRenderer.tsx',
			'client/src/components/forum/SignatureRenderer.tsx',
			'shared/validation/common.schemas.ts'
		];
		
		filesToProcess.forEach(file => {
			try {
				project.addSourceFileAtPath(file);
			} catch (error) {
				console.warn(`Could not add file ${file}: ${error}`);
			}
		});
	}
	
	const sourceFiles = project.getSourceFiles();
	console.log(`Processing ${sourceFiles.length} files...\n`);
	
	// Process each file
	sourceFiles.forEach(sourceFile => {
		processTypeScriptAnnotations(sourceFile);
		processZodSchemas(sourceFile);
		
		if (!isDryRun) {
			ensureImports(sourceFile);
		}
	});
	
	// Report changes
	if (changes.length === 0) {
		console.log('✅ No changes needed!');
		return;
	}
	
	console.log(`Found ${changes.length} changes:\n`);
	
	// Group by file
	const changesByFile = new Map<string, Change[]>();
	changes.forEach(change => {
		const existing = changesByFile.get(change.file) || [];
		existing.push(change);
		changesByFile.set(change.file, existing);
	});
	
	// Display changes
	changesByFile.forEach((fileChanges, filePath) => {
		console.log(`📄 ${path.relative(process.cwd(), filePath)}`);
		fileChanges.forEach(change => {
			console.log(`   Line ${change.line}:`);
			console.log(`   - ${change.before.trim()}`);
			console.log(`   + ${change.after.trim()}`);
		});
		console.log('');
	});
	
	if (isDryRun) {
		console.log('This was a DRY RUN. To apply changes, run with --apply flag.');
		console.log('Example: tsx scripts/codemods/fix-typescript-uuid-types-safe.ts --apply');
	} else {
		// Apply changes
		await project.save();
		console.log('✅ Changes applied successfully!');
	}
}

main().catch(error => {
	console.error('❌ Error:', error);
	process.exit(1);
});