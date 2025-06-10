import express, { type Express } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, createLogger } from 'vite';
import { type Server } from 'http';
import viteConfig from '../../../config/vite.config';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Get the directory name from the URL
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Polyfill for crypto.getRandomValues in Node.js v22
if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
	(globalThis as any).crypto = {
		...(globalThis.crypto ?? {}),
		// Provide a type-safe implementation that matches the Web Crypto signature
		getRandomValues<T extends NodeJS.ArrayBufferView>(array: T): T {
			// crypto.randomFillSync mutates the passed array and also returns it
			return crypto.randomFillSync(array) as T;
		}
	} as Crypto;
}

// Ensure Node's built-in 'crypto' module has getRandomValues too (used by Vite internals)
if (typeof (crypto as any).getRandomValues !== 'function') {
	(crypto as any).getRandomValues = function <T extends NodeJS.ArrayBufferView>(array: T): T {
		return crypto.randomFillSync(array) as T;
	};
}

const viteLogger = createLogger();

export function log(message: string, source = 'express') {
	const formattedTime = new Date().toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	});

	console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
	const serverOptions = {
		middlewareMode: true,
		hmr: { server },
		allowedHosts: true as const
	};

	const vite = await createViteServer({
		...viteConfig,
		configFile: false,
		customLogger: {
			...viteLogger,
			error: (msg, options) => {
				viteLogger.error(msg, options);
				process.exit(1);
			}
		},
		server: serverOptions,
		appType: 'custom'
	});

	app.use(vite.middlewares);
	app.use('*', async (req, res, next) => {
		const url = req.originalUrl;

		try {
			const clientTemplate = path.resolve(
				__dirname, // server/src/core
				'..', // server/src
				'..', // server
				'..', // ForumFusion (project root)
				'client', // ForumFusion/client
				'index.html'
			);

			// always reload the index.html file from disk incase it changes
			let template = await fs.promises.readFile(clientTemplate, 'utf-8');
			template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
			const page = await vite.transformIndexHtml(url, template);
			res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
		} catch (e) {
			vite.ssrFixStacktrace(e as Error);
			next(e);
		}
	});
}

export function serveStatic(app: Express) {
	const distPath = path.resolve(__dirname, 'public');

	if (!fs.existsSync(distPath)) {
		throw new Error(
			`Could not find the build directory: ${distPath}, make sure to build the client first`
		);
	}

	app.use(express.static(distPath));

	// fall through to index.html if the file doesn't exist
	app.use('*', (_req, res) => {
		res.sendFile(path.resolve(distPath, 'index.html'));
	});
}
