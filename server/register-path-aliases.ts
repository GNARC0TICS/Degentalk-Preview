import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import moduleAlias from 'module-alias';

// Resolve workspace root
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Register all path aliases from tsconfig.paths.json
// Server paths
moduleAlias.addAlias('@core', resolve(__dirname, 'src/core'));
moduleAlias.addAlias('@domains', resolve(__dirname, 'src/domains'));
moduleAlias.addAlias('@middleware', resolve(__dirname, 'src/middleware'));
moduleAlias.addAlias('@utils', resolve(__dirname, 'src/utils'));
moduleAlias.addAlias('@lib', resolve(__dirname, 'lib'));

// Database paths
moduleAlias.addAlias('@db', resolve(root, 'db'));
moduleAlias.addAlias('@schema', resolve(root, 'db/schema'));

// Shared paths
moduleAlias.addAlias('@shared', resolve(root, 'shared'));

// Legacy alias for backward compatibility
moduleAlias.addAlias('@server/src', resolve(__dirname, 'src'));

// Activate aliases
moduleAlias();
