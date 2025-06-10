import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path'; // Added for path resolution
import { config as dotenvConfig } from 'dotenv'; // Added for .env loading
import { logger, initLogger } from './src/core/logger'; // Adjusted path
import { globalErrorHandler, walletErrorHandler, adminErrorHandler } from './src/core/errors'; // Adjusted path

// Explicitly load .env.local for the workspace
dotenvConfig({ path: path.resolve(__dirname, '../.env.local') });

// Initialize logger (adjust config if needed for workspace)
initLogger({
  filePath: './logs', // Log within the workspace
  fileName: 'wallet-server.log'
});

const app: Express = express();
const PORT = process.env.PORT || 5002; // Changed to use PORT from .env.local

app.use(express.json());

// --- Import and use Wallet related routes ---
// Example:
// import walletRoutes from './src/domains/wallet/wallet.routes';
// import ccpaymentWebhookRoutes from './src/domains/ccpayment-webhook/ccpayment-webhook.routes';
// import tipRoutes from './src/domains/engagement/tip/tip.routes';
// import rainRoutes from './src/domains/engagement/rain/rain.routes';
// import airdropRoutes from './src/domains/engagement/airdrop/airdrop.routes';
// import adminTreasuryRoutes from './src/domains/admin/sub-domains/treasury/treasury.routes';

// app.use('/api/wallet', walletRoutes);
// app.use('/api/ccpayment-webhook', ccpaymentWebhookRoutes); // Ensure correct base path
// app.use('/api/tip', tipRoutes);
// app.use('/api/rain', rainRoutes);
// app.use('/api/airdrop', airdropRoutes);
// app.use('/api/admin/treasury', adminTreasuryRoutes); // Ensure correct base path

logger.info('SERVER_SETUP', 'Placeholder for wallet routes - uncomment and adjust above.');
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Wallet server is healthy' });
});


// --- Error Handlers ---
// Register domain-specific error handlers first
app.use(walletErrorHandler);
// app.use(adminErrorHandler); // If admin routes related to wallet are used

// Global error handler should be last
app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info('SERVER_STARTUP', `Wallet test server running on http://localhost:${PORT}`);
  if (!process.env.DATABASE_URL) {
    logger.warn('SERVER_STARTUP', 'DATABASE_URL is not set. Database operations will likely fail.');
  }
  if (!process.env.CCPAYMENT_APP_ID || !process.env.CCPAYMENT_APP_SECRET) {
    logger.warn('SERVER_STARTUP', 'CCPAYMENT_APP_ID or CCPAYMENT_APP_SECRET is not set. CCPayment features will not work.');
  }
});

export default app;
