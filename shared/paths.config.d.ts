/**
 * Shared path configuration for both frontend and backend
 * This file can be safely imported by both sides without Vite dependencies
 */
/**
 * Path aliases that work in both frontend and backend contexts
 */
export declare const paths: {
    root: any;
    client: any;
    server: any;
    shared: any;
    db: any;
    dbIndex: any;
    schemaIndex: any;
    clientSrc: any;
    clientAssets: any;
    serverUtils: any;
    serverServices: any;
};
/**
 * Path mapping compatible with TypeScript path mapping
 */
export declare const pathMapping: {
    '@/*': string[];
    '@shared/*': string[];
    '@server/*': string[];
    '@db': any[];
    '@schema': any[];
    '@schema/*': string[];
};
export default paths;
