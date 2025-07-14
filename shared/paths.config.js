"use strict";
/**
 * Shared path configuration for both frontend and backend
 * This file can be safely imported by both sides without Vite dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathMapping = exports.paths = void 0;
var path_1 = require("path");
var url_1 = require("url");
// Get the current file's directory and resolve to project root
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var projectRoot = path_1.default.resolve(__dirname, '..');
/**
 * Path aliases that work in both frontend and backend contexts
 */
exports.paths = {
    // Project structure
    root: projectRoot,
    client: path_1.default.resolve(projectRoot, 'client'),
    server: path_1.default.resolve(projectRoot, 'server'),
    shared: path_1.default.resolve(projectRoot, 'shared'),
    db: path_1.default.resolve(projectRoot, 'db'),
    // Specific files
    dbIndex: path_1.default.resolve(projectRoot, 'db/index.ts'),
    schemaIndex: path_1.default.resolve(projectRoot, 'db/schema/index.ts'),
    // Client specific
    clientSrc: path_1.default.resolve(projectRoot, 'client/src'),
    clientAssets: path_1.default.resolve(projectRoot, 'attached_assets'),
    // Server specific
    serverUtils: path_1.default.resolve(projectRoot, 'server/utils'),
    serverServices: path_1.default.resolve(projectRoot, 'server/services')
};
/**
 * Path mapping compatible with TypeScript path mapping
 */
exports.pathMapping = {
    '@/*': [path_1.default.relative(projectRoot, exports.paths.clientSrc) + '/*'],
    '@shared/*': [path_1.default.relative(projectRoot, exports.paths.shared) + '/*'],
    '@server/*': [path_1.default.relative(projectRoot, exports.paths.server) + '/*'],
    '@db': [path_1.default.relative(projectRoot, exports.paths.dbIndex)],
    '@schema': [path_1.default.relative(projectRoot, exports.paths.schemaIndex)],
    '@schema/*': [path_1.default.relative(projectRoot, path_1.default.resolve(projectRoot, 'db/schema')) + '/*']
};
exports.default = exports.paths;
