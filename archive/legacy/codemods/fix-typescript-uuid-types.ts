#!/usr/bin/env tsx

/**
 * Enhanced UUID Type Codemod
 * Targets TypeScript interfaces, types, function parameters, and Zod schemas
 * Converts numeric ID patterns to branded UUID types
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import { readdir } from 'fs/promises';
import path from 'path';

const project = new Project({
	tsConfigFilePath: './tsconfig.json',
	skipAddingFilesFromTsConfig: true
});

interface ChangeRecord {
	file: string;
	line: number;
	old: string;
	new: string;
	type: 'interface' | 'type' | 'function' | 'zod' | 'variable';
}

const changes: ChangeRecord[] = [];

// Mapping of ID field patterns to branded types
const idMappings: Record<string, string> = {
	'userId': 'UserId',
	'threadId': 'ThreadId', 
	'postId': 'PostId',
	'forumId': 'ForumId',
	'categoryId': 'CategoryId',
	'walletId': 'WalletId',
	'transactionId': 'TransactionId',
	'badgeId': 'BadgeId',
	'titleId': 'TitleId',
	'emojiId': 'EmojiId',
	'pollId': 'PollId',
	'tagId': 'TagId',
	'reportId': 'ReportId',
	'notificationId': 'NotificationId',
	'sessionId': 'SessionId',
	'roleId': 'RoleId',
	'permissionId': 'PermissionId',
	'settingId': 'SettingId',
	'auditId': 'AuditId',
	'backupId': 'BackupId',
	'templateId': 'TemplateId',
	'themeId': 'ThemeId',
	'subscriptionId': 'SubscriptionId',
	'paymentId': 'PaymentId',
	'orderI': 'OrderId',
	'productId': 'ProductId',
	'inventoryId': 'InventoryId',
	'achievementId': 'AchievementId',
	'animationId': 'AnimationId',
	'stickerPackId': 'StickerPackId',
	'stickerId': 'StickerId',
	'levelId': 'LevelId',
	'groupId': 'GroupId',
	'messageId': 'MessageId',
	'channelId': 'ChannelId',
	'roomId': 'RoomId',
	'friendshipId': 'FriendshipId',
	'followId': 'FollowId',
	'blockId': 'BlockId',
	'id': 'Id<string>' // Generic fallback
};

// Zod schema mappings
const zodIdMappings: Record<string, string> = {
	'userId': 'z.string().uuid("Invalid userId format")',
	'threadId': 'z.string().uuid("Invalid threadId format")', 
	'postId': 'z.string().uuid("Invalid postId format")',
	'forumId': 'z.string().uuid("Invalid forumId format")',
	'categoryId': 'z.string().uuid("Invalid categoryId format")',
	'walletId': 'z.string().uuid("Invalid walletId format")',
	'transactionId': 'z.string().uuid("Invalid transactionId format")',
	'badgeId': 'z.string().uuid("Invalid badgeId format")',
	'titleId': 'z.string().uuid("Invalid titleId format")',
	'emojiId': 'z.string().uuid("Invalid emojiId format")',
	'pollId': 'z.string().uuid("Invalid pollId format")',
	'tagId': 'z.string().uuid("Invalid tagId format")',
	'reportId': 'z.string().uuid("Invalid reportId format")',
	'notificationId': 'z.string().uuid("Invalid notificationId format")',
	'sessionId': 'z.string().uuid("Invalid sessionId format")',
	'roleId': 'z.string().uuid("Invalid roleId format")',
	'permissionId': 'z.string().uuid("Invalid permissionId format")',
	'settingId': 'z.string().uuid("Invalid settingId format")',
	'auditId': 'z.string().uuid("Invalid auditId format")',
	'backupId': 'z.string().uuid("Invalid backupId format")',
	'templateId': 'z.string().uuid("Invalid templateId format")',
	'themeId': 'z.string().uuid("Invalid themeId format")',
	'subscriptionId': 'z.string().uuid("Invalid subscriptionId format")',
	'paymentId': 'z.string().uuid("Invalid paymentId format")',
	'orderId': 'z.string().uuid("Invalid orderId format")',
	'productId': 'z.string().uuid("Invalid productId format")',
	'inventoryId': 'z.string().uuid("Invalid inventoryId format")',
	'achievementId': 'z.string().uuid("Invalid achievementId format")',
	'animationId': 'z.string().uuid("Invalid animationId format")',
	'stickerPackId': 'z.string().uuid("Invalid stickerPackId format")',
	'stickerId': 'z.string().uuid("Invalid stickerId format")',
	'levelId': 'z.string().uuid("Invalid levelId format")',
	'groupId': 'z.string().uuid("Invalid groupId format")',
	'messageId': 'z.string().uuid("Invalid messageId format")',
	'channelId': 'z.string().uuid("Invalid channelId format")',
	'roomId': 'z.string().uuid("Invalid roomId format")',
	'friendshipId': 'z.string().uuid("Invalid friendshipId format")',
	'followId': 'z.string().uuid("Invalid followId format")',
	'blockId': 'z.string().uuid("Invalid blockId format")'
};

function recordChange(file: string, line: number, old: string, newText: string, type: ChangeRecord['type']) {
	changes.push({ file, line, old, new: newText, type });
}

function processInterfaceAndTypeDeclarations(sourceFile: any) {
	const fileName = sourceFile.getFilePath();
	
	// Process interface declarations
	sourceFile.getInterfaces().forEach((interfaceDecl: any) => {
		interfaceDecl.getProperties().forEach((prop: any) => {
			const propName = prop.getName();
			const typeNode = prop.getTypeNode();
			
			if (typeNode && Node.isToken(typeNode) && typeNode.getKind() === SyntaxKind.NumberKeyword) {
				// Handle patterns like userId: number, threadId?: number
				if (propName.toLowerCase().includes('id')) {
					const brandedType = idMappings[propName] || `Id<'${propName}'>`;
					const oldText = prop.getText();
					
					prop.setType(brandedType);
					
					recordChange(
						fileName, 
						prop.getStartLineNumber(), 
						oldText, 
						prop.getText(), 
						'interface'
					);
				}
			}
		});
	});
	
	// Process type aliases
	sourceFile.getTypeAliases().forEach((typeAlias: any) => {
		const typeNode = typeAlias.getTypeNode();
		if (Node.isTypeLiteral(typeNode)) {
			typeNode.getProperties().forEach((prop: any) => {
				if (Node.isPropertySignature(prop)) {
					const propName = prop.getName();
					const propTypeNode = prop.getTypeNode();
					
					if (propTypeNode && Node.isToken(propTypeNode) && propTypeNode.getKind() === SyntaxKind.NumberKeyword) {
						if (propName.toLowerCase().includes('id')) {
							const brandedType = idMappings[propName] || `Id<'${propName}'>`;
							const oldText = prop.getText();
							
							prop.setType(brandedType);
							
							recordChange(
								fileName,
								prop.getStartLineNumber(),
								oldText,
								prop.getText(),
								'type'
							);
						}
					}
				}
			});
		}
	});
}

function processFunctionParameters(sourceFile: any) {
	const fileName = sourceFile.getFilePath();
	
	// Process function declarations
	sourceFile.getFunctions().forEach((func: any) => {
		func.getParameters().forEach((param: any) => {
			const paramName = param.getName();
			const typeNode = param.getTypeNode();
			
			if (typeNode && Node.isToken(typeNode) && typeNode.getKind() === SyntaxKind.NumberKeyword) {
				if (paramName.toLowerCase().includes('id')) {
					const brandedType = idMappings[paramName] || `Id<'${paramName}'>`;
					const oldText = param.getText();
					
					param.setType(brandedType);
					
					recordChange(
						fileName,
						param.getStartLineNumber(),
						oldText,
						param.getText(),
						'function'
					);
				}
			}
		});
	});
	
	// Process arrow functions and method signatures
	sourceFile.getDescendantsOfKind(SyntaxKind.Parameter).forEach((param: any) => {
		const paramName = param.getName();
		const typeNode = param.getTypeNode();
		
		if (typeNode && Node.isToken(typeNode) && typeNode.getKind() === SyntaxKind.NumberKeyword) {
			if (paramName.toLowerCase().includes('id')) {
				const brandedType = idMappings[paramName] || `Id<'${paramName}'>`;
				const oldText = param.getText();
				
				param.setType(brandedType);
				
				recordChange(
					fileName,
					param.getStartLineNumber(),
					oldText,
					param.getText(),
					'function'
				);
			}
		}
	});
}

function processZodSchemas(sourceFile: any) {
	const fileName = sourceFile.getFilePath();
	
	// Handle Zod schema variable declarations
	sourceFile.getVariableDeclarations().forEach((varDecl: any) => {
		const varName = varDecl.getName();
		const initializer = varDecl.getInitializer();
		
		// Target ID-related Zod schemas using positiveInt
		if (varName.toLowerCase().includes('id') && initializer) {
			const initText = initializer.getText();
			if (initText.includes('positiveInt')) {
				const newZodSchema = zodIdMappings[varName] || 'z.string().uuid("Invalid ID format")';
				const oldText = varDecl.getText();
				
				varDecl.setInitializer(newZodSchema);
				
				recordChange(
					fileName,
					varDecl.getStartLineNumber(),
					oldText,
					varDecl.getText(),
					'zod'
				);
			}
		}
	});
	
	// Handle object literal properties in Zod schemas
	sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment).forEach((prop: any) => {
		const propName = prop.getName();
		if (propName && propName.toLowerCase().includes('id')) {
			const initializer = prop.getInitializer();
			if (initializer && initializer.getText().includes('positiveInt')) {
				const newZodSchema = zodIdMappings[propName] || 'z.string().uuid("Invalid ID format")';
				const oldText = prop.getText();
				
				prop.setInitializer(newZodSchema);
				
				recordChange(
					fileName,
					prop.getStartLineNumber(),
					oldText,
					prop.getText(),
					'zod'
				);
			}
		}
	});
}

function addRequiredImports(sourceFile: any) {
	const fileName = sourceFile.getFilePath();
	
	// Check if file needs branded type imports
	const needsBrandedTypes = changes.some(change => 
		change.file === fileName && 
		(change.type === 'interface' || change.type === 'type' || change.type === 'function')
	);
	
	if (needsBrandedTypes) {
		// Check if import already exists
		const existingImport = sourceFile.getImportDeclarations().find((imp: any) => {
			const moduleSpec = imp.getModuleSpecifierValue();
			return moduleSpec.includes('types/id.types') || moduleSpec.includes('@/types/');
		});
		
		if (!existingImport) {
			// Add import for branded types
			sourceFile.insertImportDeclaration(0, {
				namedImports: ['UserId', 'ThreadId', 'PostId', 'ForumId', 'Id'],
				moduleSpecifier: '@/types/id.types'
			});
		}
	}
}

async function getAllTsFiles(dir: string): Promise<string[]> {
	const files: string[] = [];
	
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			
			if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
				files.push(...await getAllTsFiles(fullPath));
			} else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
				files.push(fullPath);
			}
		}
	} catch (error) {
		console.warn(`Warning: Could not read directory ${dir}:`, error);
	}
	
	return files;
}

async function main() {
	console.log('🔧 Starting Enhanced UUID Type Codemod...\n');
	
	// Get all TypeScript files
	const directories = ['client/src', 'server/src', 'shared', 'db'];
	const allFiles: string[] = [];
	
	for (const dir of directories) {
		try {
			const files = await getAllTsFiles(dir);
			allFiles.push(...files);
		} catch (error) {
			console.warn(`Warning: Could not process directory ${dir}:`, error);
		}
	}
	
	console.log(`📁 Found ${allFiles.length} TypeScript files to process\n`);
	
	// Add files to project
	allFiles.forEach(file => {
		try {
			project.addSourceFileAtPath(file);
		} catch (error) {
			console.warn(`Warning: Could not add file ${file}:`, error);
		}
	});
	
	const sourceFiles = project.getSourceFiles();
	console.log(`🔍 Processing ${sourceFiles.length} source files...\n`);
	
	// Process each source file
	sourceFiles.forEach(sourceFile => {
		try {
			processInterfaceAndTypeDeclarations(sourceFile);
			processFunctionParameters(sourceFile);
			processZodSchemas(sourceFile);
			addRequiredImports(sourceFile);
		} catch (error) {
			console.error(`Error processing file ${sourceFile.getFilePath()}:`, error);
		}
	});
	
	// Save all changes
	try {
		await project.save();
		console.log('💾 All changes saved successfully!\n');
	} catch (error) {
		console.error('❌ Error saving changes:', error);
		process.exit(1);
	}
	
	// Report results
	console.log('📊 CODEMOD RESULTS:');
	console.log('==================');
	console.log(`✅ Total changes: ${changes.length}`);
	
	const changesByType = changes.reduce((acc, change) => {
		acc[change.type] = (acc[change.type] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);
	
	Object.entries(changesByType).forEach(([type, count]) => {
		console.log(`   ${type}: ${count} changes`);
	});
	
	const changesByFile = changes.reduce((acc, change) => {
		const fileName = path.basename(change.file);
		acc[fileName] = (acc[fileName] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);
	
	console.log('\n📂 Changes by file:');
	Object.entries(changesByFile)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 10)
		.forEach(([file, count]) => {
			console.log(`   ${file}: ${count} changes`);
		});
	
	if (changes.length > 0) {
		console.log('\n🎯 Sample changes:');
		changes.slice(0, 5).forEach(change => {
			console.log(`   ${path.basename(change.file)}:${change.line}`);
			console.log(`   - ${change.old.trim()}`);
			console.log(`   + ${change.new.trim()}\n`);
		});
		
		console.log('✅ UUID type migration codemod completed successfully!');
		console.log('🔄 Next: Run type checks and fix any remaining issues');
	} else {
		console.log('ℹ️  No changes needed - all files already use proper UUID types');
	}
}

if (require.main === module) {
	main().catch(console.error);
}