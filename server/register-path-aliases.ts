import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import moduleAlias from 'module-alias';

// Resolve workspace root (3 levels up from this file: server/register-path-aliases.ts)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Map "@server/src" alias used in older imports to the real directory
moduleAlias.addAlias('@server/src', resolve(root, 'server/src'));
moduleAlias.addAlias('@db', resolve(root, 'db/index.js'));
moduleAlias.addAlias('@schema', resolve(root, 'db/schema/index.js'));

// Activate aliases
moduleAlias();
