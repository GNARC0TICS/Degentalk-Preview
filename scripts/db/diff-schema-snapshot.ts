import fs from 'fs';
import path from 'path';

/**
 * Quick schema diff utility.
 * Scans the Drizzle introspection snapshot (migrations/postgres/schema.ts)
 * and compares the discovered table names to those declared in the canonical
 * folder-based schema (db/schema/**).
 *
 * The goal is to surface NEW or MISSING tables so developers can quickly
 * patch the relevant schema files without combing through thousands of lines.
 *
 * This is **not** a full DDL diff – columns / indexes are intentionally
 * ignored for this first-pass safety check.
 */

const ROOT = process.cwd();
const SNAPSHOT_PATH = path.join(ROOT, 'migrations', 'postgres', 'schema.ts');
const CANONICAL_SCHEMA_DIR = path.join(ROOT, 'db', 'schema');

function extractTableNamesFromSnapshot(snapshotSource: string): Set<string> {
	const tableNames = new Set<string>();
	// Matches `pgTable('table_name'` or "pgTable( \"table_name\""
	const tableRegex = /pgTable\(\s*['\"]([\w\-]+)['\"]/g;
	let match: RegExpExecArray | null;
	while ((match = tableRegex.exec(snapshotSource))) {
		tableNames.add(match[1]);
	}
	return tableNames;
}

function extractTableNamesFromCanonicalSchema(dir: string): Set<string> {
	const tableNames = new Set<string>();

	function walk(current: string) {
		for (const entry of fs.readdirSync(current)) {
			const full = path.join(current, entry);
			if (fs.statSync(full).isDirectory()) {
				walk(full);
			} else if (full.endsWith('.ts')) {
				const src = fs.readFileSync(full, 'utf8');
				const regex = /pgTable\(\s*['\"]([\w\-]+)['\"]/g;
				let m: RegExpExecArray | null;
				while ((m = regex.exec(src))) {
					tableNames.add(m[1]);
				}
			}
		}
	}

	walk(dir);
	return tableNames;
}

function main() {
	if (!fs.existsSync(SNAPSHOT_PATH)) {
		console.error('Snapshot file not found at', SNAPSHOT_PATH);
		process.exit(1);
	}

	const snapshotSource = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
	const snapshotTables = extractTableNamesFromSnapshot(snapshotSource);
	const canonicalTables = extractTableNamesFromCanonicalSchema(CANONICAL_SCHEMA_DIR);

	const missingInCanonical = [...snapshotTables].filter((t) => !canonicalTables.has(t));
	const missingInSnapshot = [...canonicalTables].filter((t) => !snapshotTables.has(t));

	console.log('Schema Diff Summary');
	console.log('──────────────────────────────');
	console.log('Tables present in snapshot but missing in canonical schema:');
	missingInCanonical.forEach((t) => console.log('  +', t));
	if (missingInCanonical.length === 0) console.log('  ✓ None');

	console.log('\nTables present in canonical schema but missing in snapshot:');
	missingInSnapshot.forEach((t) => console.log('  -', t));
	if (missingInSnapshot.length === 0) console.log('  ✓ None');

	console.log('\nTotal snapshot tables:', snapshotTables.size);
	console.log('Total canonical tables:', canonicalTables.size);
}

// Always run when executed via tsx / node
main(); 