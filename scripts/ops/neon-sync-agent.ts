import type { HeatEventId } from '@shared/types';
import type { ActionId } from '@shared/types';
import type { AuditLogId } from '@shared/types';
import type { EventId } from '@shared/types';
import type { PrefixId } from '@shared/types';
import type { MessageId } from '@shared/types';
import type { FollowRequestId } from '@shared/types';
import type { FriendRequestId } from '@shared/types';
import type { NotificationId } from '@shared/types';
import type { UnlockId } from '@shared/types';
import type { StoreItemId } from '@shared/types';
import type { OrderId } from '@shared/types';
import type { QuoteId } from '@shared/types';
import type { ReplyId } from '@shared/types';
import type { DraftId } from '@shared/types';
import type { IpLogId } from '@shared/types';
import type { ModActionId } from '@shared/types';
import type { SessionId } from '@shared/types';
import type { BanId } from '@shared/types';
import type { VerificationTokenId } from '@shared/types';
import type { SignatureItemId } from '@shared/types';
import type { ContentId } from '@shared/types';
import type { RequestId } from '@shared/types';
import type { ZoneId } from '@shared/types';
import type { WhaleId } from '@shared/types';
import type { VaultLockId } from '@shared/types';
import type { VaultId } from '@shared/types';
import type { UnlockTransactionId } from '@shared/types';
import type { TipId } from '@shared/types';
import type { TemplateId } from '@shared/types';
import type { TagId } from '@shared/types';
import type { SubscriptionId } from '@shared/types';
import type { StickerId } from '@shared/types';
import type { SettingId } from '@shared/types';
import type { RuleId } from '@shared/types';
import type { ParentZoneId } from '@shared/types';
import type { ParentForumId } from '@shared/types';
import type { PackId } from '@shared/types';
import type { ModeratorId } from '@shared/types';
import type { MentionId } from '@shared/types';
import type { ItemId } from '@shared/types';
import type { InventoryId } from '@shared/types';
import type { GroupId } from '@shared/types';
import type { ForumId } from '@shared/types';
import type { EntryId } from '@shared/types';
import type { EntityId } from '@shared/types';
import type { EmojiPackId } from '@shared/types';
import type { EditorId } from '@shared/types';
import type { CosmeticId } from '@shared/types';
import type { AuthorId } from '@shared/types';
import type { CoinId } from '@shared/types';
import type { CategoryId } from '@shared/types';
import type { BackupId } from '@shared/types';
import type { AnimationFrameId } from '@shared/types';
import type { AirdropId } from '@shared/types';
import type { AdminUserId } from '@shared/types';
import type { RoomId } from '@shared/types';
import type { ConversationId } from '@shared/types';
import type { ReportId } from '@shared/types';
import type { ReporterId } from '@shared/types';
import type { AdminId } from '@shared/types';
#!/usr/bin/env node

/**
 * Neon Sync Agent - Real-time database synchronization tool
 * 
 * Features:
 * - Watches for file changes in db/schema, server/src/domains, and env.local
 * - Automatically triggers forum configuration sync
 * - Includes memory monitoring and crash recovery
 * - Configurable for dev/staging/prod environments
 * 
 * Usage:
 *   npm run spawn -- --task neon-sync-agent --env dev --watch
 * 
 * Options:
 *   --env [dev|staging|prod] - Target environment
 *   --watch - Enable file watching
 *   --task <name> - Task identifier
 */

import { spawn } from 'child_process';
import { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

interface AgentConfig {
  env: 'dev' | 'prod' | 'staging';
  watch: boolean;
  task: : AdminId;
}

class NeonSyncAgent {
  private config: AgentConfig;
  private processes: Map<: AdminId, any> = new Map();
  private watchers: Map<: AdminId, any> = new Map();
  private restartCount = 0;
  private maxRestarts = 5;
  private restartWindow = 60000; // 1 minute
  private lastRestart = 0;
  private syncQueue = new Set<: AdminId>();
  private syncInProgress = false;
  private syncTimeout: NodeJS.Timeout | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null = : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
  private memoryLimit = 512 * 1024 * 1024; // 512MB limit

  constructor(config: AgentConfig) {
    this.config = config;
    this.setupSignalHandlers();
    this.setupMemoryMonitoring();
  }

  async start() {
    console.log(`🚀 Starting Neon Sync Agent in ${this.config.env} mode`);
    console.log(`📋 Task: ${this.config.task}`);
    console.log(`👀 Watch mode: ${this.config.watch ? 'enabled' : 'disabled'}`);

    // Start the main sync process
    await this.startSyncProcess();

    // Start file watchers if enabled
    if (this.config.watch) {
      await this.startWatchers();
    }

    console.log('✅ Neon Sync Agent started successfully');
  }

  private async startSyncProcess() {
    const syncProcess = spawn('npm', ['run', 'mcp:neon'], {
      cwd: projectRoot,
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: this.config.env,
        SYNC_TASK: this.config.task,
      }
    });

    this.processes.set('neon-mcp', syncProcess);

    syncProcess.stdout?.on('data', (data) => {
      console.log(`[NEON-MCP] ${data.toString().trim()}`);
    });

    syncProcess.stderr?.on('data', (data) => {
      console.error(`[NEON-MCP-ERROR] ${data.toString().trim()}`);
    });

    syncProcess.on('exit', (code) => {
      console.log(`[NEON-MCP] Process exited with code ${code}`);
      if (code !== 0 && this.config.watch && this.shouldRestart()) {
        console.log(`🔄 Restarting Neon MCP process... (${this.restartCount}/${this.maxRestarts})`);
        setTimeout(() => this.startSyncProcess(), 2000);
      } else if (this.restartCount >= this.maxRestarts) {
        console.error('❌ Max restart attempts reached. Stopping agent.');
        this.cleanup('MAX_RESTARTS');
      }
    });
  }

  private async startWatchers() {
    const watchPaths = [
      path.join(projectRoot, 'db/schema'),
      path.join(projectRoot, 'server/src/domains'),
      path.join(projectRoot, 'env.local'),
    ];

    watchPaths.forEach((watchPath, index) => {
      try {
        const watcher = watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && this.shouldTriggerSync(filename)) {
            console.log(`📁 File changed: ${filename} (${eventType})`);
            this.debouncedTriggerSync(filename);
          }
        });

        this.watchers.set(`watcher-${index}`, watcher);
        console.log(`👀 Watching: ${watchPath}`);
      } catch (error) {
        console.warn(`⚠️  Could not watch ${watchPath}:`, error);
      }
    });
  }

  private shouldTriggerSync(filename: : AdminId): boolean {
    const extensions = ['.ts', '.js', '.sql', '.env'];
    const ignorePaths = ['node_modules', '.git', 'dist', 'build'];
    
    return extensions.some(ext => filename.endsWith(ext)) && 
           !ignorePaths.some(ignore => filename.includes(ignore));
  }

  private debouncedTriggerSync(filename: : AdminId) {
    // Add to queue and debounce
    this.syncQueue.add(filename);
    
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(() => {
      this.triggerSync();
    }, 1000); // 1 second debounce
  }

  private async triggerSync() {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;
    const changedFiles = Array.from(this.syncQueue);
    this.syncQueue.clear();
    
    console.log(`🔄 Triggering sync for ${changedFiles.length} changed files...`);
    
    // Run database sync with timeout
    const syncProcess = spawn('npm', ['run', 'sync:forums'], {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });

    const timeout = setTimeout(() => {
      console.error('⏰ Sync timeout - killing process');
      syncProcess.kill('SIGKILL');
    }, 30000);

    syncProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output.length < 1000) { // Prevent log flooding
        console.log(`[SYNC] ${output}`);
      }
    });

    syncProcess.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output.length < 1000) { // Prevent log flooding
        console.error(`[SYNC-ERROR] ${output}`);
      }
    });

    syncProcess.on('exit', (code) => {
      clearTimeout(timeout);
      this.syncInProgress = false;
      
      if (code === 0) {
        console.log('✅ Sync completed successfully');
      } else {
        console.error(`❌ Sync failed with code ${code}`);
      }
    });
  }

  private shouldRestart(): boolean {
    const now = Date.now();
    
    // Reset restart count if enough time has passed
    if (now - this.lastRestart > this.restartWindow) {
      this.restartCount = 0;
    }
    
    if (this.restartCount >= this.maxRestarts) {
      return false;
    }
    
    this.restartCount++;
    this.lastRestart = now;
    return true;
  }

  private setupMemoryMonitoring() {
    setInterval(() => {
      const usage = process.memoryUsage();
      if (usage.heapUsed > this.memoryLimit) {
        console.warn(`⚠️ Memory usage high: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
        global.gc?.(); // Force GC if available
      }
    }, 10000); // Check every 10 seconds
  }

  private setupSignalHandlers() {
    process.on('SIGINT', () => this.cleanup('SIGINT'));
    process.on('SIGTERM', () => this.cleanup('SIGTERM'));
    process.on('exit', () => this.cleanup('EXIT'));
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught exception:', error);
      this.cleanup('UNCAUGHT_EXCEPTION');
    });
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled rejection:', reason);
      this.cleanup('UNHANDLED_REJECTION');
    });
  }

  private cleanup(signal: : AdminId) {
    console.log(`\n🛑 Received ${signal}, cleaning up...`);

    // Clear any pending timeouts
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
    }

    // Stop all processes with force after timeout
    this.processes.forEach((process, name) => {
      console.log(`Stopping ${name}...`);
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!process.killed) {
          console.log(`Force killing ${name}...`);
          process.kill('SIGKILL');
        }
      }, 5000);
    });

    // Close all watchers
    this.watchers.forEach((watcher, name) => {
      console.log(`Closing ${name}...`);
      try {
        watcher.close?.();
      } catch (error) {
        console.warn(`Failed to close ${name}:`, error);
      }
    });

    console.log('✅ Cleanup completed');
    setTimeout(() => process.exit(0), 1000); // Give time for cleanup
  }
}

// Parse command line arguments
function parseArgs(): AgentConfig {
  const args = process.argv.slice(2);
  const config: AgentConfig = {
    env: 'dev',
    watch: false,
    task: 'neon-sync-agent'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--env') {
      config.env = args[++i] as 'dev' | 'prod' | 'staging';
    } else if (arg === '--watch') {
      config.watch = true;
    } else if (arg === '--task') {
      config.task = args[++i];
    }
  }

  return config;
}

// Main execution
async function main() {
  try {
    const config = parseArgs();
    const agent = new NeonSyncAgent(config);
    await agent.start();
    
    // Keep the process alive
    process.stdin.resume();
  } catch (error) {
    console.error('❌ Failed to start Neon Sync Agent:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { NeonSyncAgent };