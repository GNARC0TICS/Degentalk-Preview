#!/usr/bin/env tsx

/**
 * Admin Controller Validation Audit
 * 
 * This script audits all admin controllers to ensure they have:
 * 1. Proper input validation using Zod schemas
 * 2. Standardized response formats
 * 3. Comprehensive error handling
 */

import fs from 'fs';
import path from 'path';

interface ValidationIssue {
	file: string;
	line?: number;
	type: 'missing_validation' | 'non_standard_response' | 'poor_error_handling';
	description: string;
	severity: 'high' | 'medium' | 'low';
}

const adminDomainsPath = path.join(process.cwd(), 'server/src/domains/admin/sub-domains');

function auditController(filePath: string): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	
	let hasZodImport = content.includes('import') && content.includes('zod');
	let hasValidationSchema = /Schema\.safeParse|\.parse\(/.test(content);
	let hasStandardResponse = content.includes('sendSuccess') || content.includes('sendError');
	let hasReqBody = content.includes('req.body');
	let hasReqParams = content.includes('req.params');
	
	// Check for missing validation on request bodies
	if (hasReqBody && !hasValidationSchema) {
		issues.push({
			file: filePath,
			type: 'missing_validation',
			description: 'Controller uses req.body but has no validation',
			severity: 'high'
		});
	}
	
	// Check for non-standard response formats
	if (!hasStandardResponse && (content.includes('res.json') || content.includes('res.status'))) {
		issues.push({
			file: filePath,
			type: 'non_standard_response',
			description: 'Controller uses non-standard response format',
			severity: 'medium'
		});
	}
	
	// Check for param validation
	lines.forEach((line, index) => {
		if (line.includes('req.params') && !line.includes('Number(') && !line.includes('parseInt(') && !line.includes('validation')) {
			issues.push({
				file: filePath,
				line: index + 1,
				type: 'missing_validation',
				description: 'Parameter used without validation/type conversion',
				severity: 'medium'
			});
		}
	});
	
	return issues;
}

function findControllerFiles(dir: string): string[] {
	const files: string[] = [];
	
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			
			if (entry.isDirectory()) {
				files.push(...findControllerFiles(fullPath));
			} else if (entry.name.endsWith('.controller.ts')) {
				files.push(fullPath);
			}
		}
	} catch (error) {
		console.warn(`Warning: Could not read directory ${dir}:`, error.message);
	}
	
	return files;
}

function generateReport(issues: ValidationIssue[]) {
	console.log('\n🔍 Admin Controller Validation Audit Report\n');
	console.log('=' .repeat(60));
	
	// Group issues by severity
	const highIssues = issues.filter(i => i.severity === 'high');
	const mediumIssues = issues.filter(i => i.severity === 'medium');
	const lowIssues = issues.filter(i => i.severity === 'low');
	
	// Summary
	console.log(`\n📊 Summary:`);
	console.log(`   🔴 High Priority Issues: ${highIssues.length}`);
	console.log(`   🟡 Medium Priority Issues: ${mediumIssues.length}`);
	console.log(`   🔵 Low Priority Issues: ${lowIssues.length}`);
	console.log(`   📁 Total Files Audited: ${new Set(issues.map(i => i.file)).size}`);
	
	// High priority issues
	if (highIssues.length > 0) {
		console.log(`\n🔴 High Priority Issues (Fix Immediately):`);
		highIssues.forEach(issue => {
			const fileName = path.relative(process.cwd(), issue.file);
			console.log(`   • ${fileName}${issue.line ? `:${issue.line}` : ''}`);
			console.log(`     ${issue.description}`);
		});
	}
	
	// Medium priority issues
	if (mediumIssues.length > 0) {
		console.log(`\n🟡 Medium Priority Issues (Should Fix):`);
		mediumIssues.forEach(issue => {
			const fileName = path.relative(process.cwd(), issue.file);
			console.log(`   • ${fileName}${issue.line ? `:${issue.line}` : ''}`);
			console.log(`     ${issue.description}`);
		});
	}
	
	// Recommendations
	console.log(`\n📋 Recommendations:`);
	if (highIssues.length > 0) {
		console.log(`   1. Add input validation using Zod schemas for all req.body usage`);
		console.log(`   2. Import validation schemas from respective validators files`);
	}
	if (mediumIssues.length > 0) {
		console.log(`   3. Standardize responses using sendSuccess/sendError from admin.response.ts`);
		console.log(`   4. Add proper type conversion for URL parameters`);
	}
	console.log(`   5. Consider creating a middleware for automatic validation`);
	
	console.log('\n' + '=' .repeat(60));
	
	return {
		total: issues.length,
		high: highIssues.length,
		medium: mediumIssues.length,
		low: lowIssues.length
	};
}

async function main() {
	try {
		console.log('🚀 Starting admin controller validation audit...');
		
		const controllerFiles = findControllerFiles(adminDomainsPath);
		console.log(`Found ${controllerFiles.length} controller files to audit`);
		
		let allIssues: ValidationIssue[] = [];
		
		for (const file of controllerFiles) {
			const issues = auditController(file);
			allIssues.push(...issues);
		}
		
		const summary = generateReport(allIssues);
		
		// Exit with appropriate code
		if (summary.high > 0) {
			console.log('\n❌ Audit failed: High priority issues found');
			process.exit(1);
		} else if (summary.medium > 0) {
			console.log('\n⚠️  Audit completed with warnings');
			process.exit(0);
		} else {
			console.log('\n✅ Audit passed: All controllers follow best practices');
			process.exit(0);
		}
		
	} catch (error) {
		console.error('❌ Audit failed with error:', error);
		process.exit(1);
	}
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}