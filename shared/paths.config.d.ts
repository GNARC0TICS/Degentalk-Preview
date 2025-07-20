/**
 * Shared path configuration for both frontend and backend
 * This file can be safely imported by both sides without Vite dependencies
 */
/**
 * Path aliases that work in both frontend and backend contexts
 */
export declare const paths: {
    root: string;
    client: string;
    server: string;
    shared: string;
    db: string;
    dbIndex: string;
    schemaIndex: string;
    clientSrc: string;
    clientAssets: string;
    serverUtils: string;
    serverServices: string;
};
/**
 * Path mapping compatible with TypeScript path mapping
 */
export declare const pathMapping: {
    '@/*': string[];
    '@shared/*': string[];
    '@server/*': string[];
    '@db': string[];
    '@schema': string[];
    '@schema/*': string[];
};
export default paths;
