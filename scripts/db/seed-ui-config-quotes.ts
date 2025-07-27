import type { HeatEventId } from '@shared/types/ids';
import type { ActionId } from '@shared/types/ids';
import type { AuditLogId } from '@shared/types/ids';
import type { EventId } from '@shared/types/ids';
import type { PrefixId } from '@shared/types/ids';
import type { MessageId } from '@shared/types/ids';
import type { FollowRequestId } from '@shared/types/ids';
import type { FriendRequestId } from '@shared/types/ids';
import type { NotificationId } from '@shared/types/ids';
import type { UnlockId } from '@shared/types/ids';
import type { StoreItemId } from '@shared/types/ids';
import type { OrderId } from '@shared/types/ids';
import type { QuoteId } from '@shared/types/ids';
import type { ReplyId } from '@shared/types/ids';
import type { DraftId } from '@shared/types/ids';
import type { IpLogId } from '@shared/types/ids';
import type { ModActionId } from '@shared/types/ids';
import type { SessionId } from '@shared/types/ids';
import type { BanId } from '@shared/types/ids';
import type { VerificationTokenId } from '@shared/types/ids';
import type { SignatureItemId } from '@shared/types/ids';
import type { ContentId } from '@shared/types/ids';
import type { RequestId } from '@shared/types/ids';
import type { ZoneId } from '@shared/types/ids';
import type { WhaleId } from '@shared/types/ids';
import type { VaultLockId } from '@shared/types/ids';
import type { VaultId } from '@shared/types/ids';
import type { UnlockTransactionId } from '@shared/types/ids';
import type { TipId } from '@shared/types/ids';
import type { TemplateId } from '@shared/types/ids';
import type { TagId } from '@shared/types/ids';
import type { SubscriptionId } from '@shared/types/ids';
import type { StickerId } from '@shared/types/ids';
import type { SettingId } from '@shared/types/ids';
import type { RuleId } from '@shared/types/ids';
import type { ParentZoneId } from '@shared/types/ids';
import type { ParentForumId } from '@shared/types/ids';
import type { PackId } from '@shared/types/ids';
import type { ModeratorId } from '@shared/types/ids';
import type { MentionId } from '@shared/types/ids';
import type { ItemId } from '@shared/types/ids';
import type { InventoryId } from '@shared/types/ids';
import type { GroupId } from '@shared/types/ids';
import type { ForumId } from '@shared/types/ids';
import type { EntryId } from '@shared/types/ids';
import type { EntityId } from '@shared/types/ids';
import type { EmojiPackId } from '@shared/types/ids';
import type { EditorId } from '@shared/types/ids';
import type { CosmeticId } from '@shared/types/ids';
import type { AuthorId } from '@shared/types/ids';
import type { CoinId } from '@shared/types/ids';
import type { CategoryId } from '@shared/types/ids';
import type { BackupId } from '@shared/types/ids';
import type { AnimationFrameId } from '@shared/types/ids';
import type { AirdropId } from '@shared/types/ids';
import type { AdminUserId } from '@shared/types/ids';
import type { RoomId } from '@shared/types/ids';
import type { ConversationId } from '@shared/types/ids';
import type { ReportId } from '@shared/types/ids';
import type { ReporterId } from '@shared/types/ids';
import type { AdminId } from '@shared/types/ids';
/**
 * Seed UI Configuration Quotes
 * 
 * Migrates existing hardcoded quotes from ui.config.ts into the database
 */

import { config } from 'dotenv';
config(); // Load environment variables

import { db } from '@core/db.ts';
import { uiQuotes, uiCollections, uiCollectionQuotes } from '../../db/schema/admin/uiConfig.ts';

// Import existing quotes from the config file
const existingHeroQuotes = [
    {
        headline: "Where the risk is real and the advice is imaginary.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Post first. Cope later.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Built by winners. Maintained by the wreckage.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "The only forum where 'bad idea' is a compliment.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "We chart pain in real-time.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Alpha, anxiety, and the occasional enlightenment.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Proof-of-sanity not required.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "A support group for people who call their losses 'lessons.'",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "No roadmap. No mercy.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Join the conversation before the voices win.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "We eat pump and dumps for breakfast.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Dox your thoughts. Keep your wallet private.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "One rug away from greatness.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "This is not financial advice. It's worse.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "A forum for people banned from better forums.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "More insight than CT. Fewer scams than Discord.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Your subconscious made this site. We're just hosting it.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Built by gamblers pretending to be philosophers.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "The tab you check before blowing your last $20.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Welcome to the frontlines of financial chaos.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "If Reddit and 4chan had a DAO baby.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Lurk. Post. Ascend.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Bridging the gap between genius and gambling addiction.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "No GM's, Not another Web3 project.",
        subheader: "Keep your money... You're gonna need it."
    },
    {
        headline: "The only forum where losing money makes you smarter.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Alpha is temporary. Reputations are forever.",
        subheader: "Post wisely. Or don't."
    },
    {
        headline: "We backtest trauma.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Mentally unwell. Financially overexposed.",
        subheader: "Join thousands of others doing just fine."
    },
    {
        headline: "You're early. But still down bad.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Where your bags get sympathy… and screenshots.",
        subheader: "This is a safe space for unsafe bets."
    },
    {
        headline: "A forum for people who should log off… but won't.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "An experimental forum for financially curious masochists.",
        subheader: "We study losses so you don't have to."
    },
    {
        headline: "Technically legal. Morally bankrupt.",
        subheader: "Welcome to Degentalk™."
    },
    {
        headline: "Lurk harder. Think worse. Win more.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "We're not addicted. We're informed.",
        subheader: "This is the last tab you close before bed."
    },
    {
        headline: "One good post away from greatness.",
        subheader: "And three bad ones from a ban."
    },
    {
        headline: "Sell your SOL, buy DGT 😈",
        subheader: "Discover, Discuss, Degen."
    },
    // Copium-Laced Optimism Batch
    {
        headline: "Still down. But learning.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Might make it. Probably won't. Posting anyway.",
        subheader: "Where hope goes to get rekt — and rebuilt."
    },
    {
        headline: "It's not over until the last cope is posted.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "This time I read the whitepaper.",
        subheader: "We believe in second chances. Sometimes."
    },
    {
        headline: "Recovery arcs start here.",
        subheader: "Write your comeback post in advance."
    },
    {
        headline: "Not all moonshots hit. Some just orbit longer.",
        subheader: "We're still watching the chart."
    },
    {
        headline: "Everyone's early until they sell.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "One more post. One more bet. One more breakthrough.",
        subheader: "We run on fumes and ambition."
    },
    {
        headline: "At least here, the pain is shared.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Somehow, still bullish.",
        subheader: "Not even the mods know why."
    },
    {
        headline: "You might not make it… but your ideas might.",
        subheader: "Post like someone's watching."
    },
    {
        headline: "If you're gonna lose, lose loudly.",
        subheader: "Forum-powered resilience since [insert rug year here]."
    },
    {
        headline: "Hope is a utility. We just don't chart it.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "The Last Stop Before the Moon—or the Bottom.",
        subheader: "Every degen's playground for market chaos."
    },
    {
        headline: "For Those Who Play to Win.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "No Limits. No Filters. All Degen.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "Talk Sharp. Bet Smart. Dream Big.",
        subheader: "Discover, Discuss, Degen."
    },
    {
        headline: "If There's Odds, We're In.",
        subheader: "Profit is the only currency."
    },
    {
        headline: "Fortune Favors the Bold.",
        subheader: "Go hard or go home."
    },
    {
        headline: "Where every thread is a support group.",
        subheader: "Therapy, but with more leverage."
    },
    // Satirical Greatness Batch
    {
        headline: "We don't chase pumps. We start them.",
        subheader: "Shill responsibly."
    },
    {
        headline: "If you're not losing sleep, you're not degen enough.",
        subheader: "Rest is for the risk-averse."
    },
    {
        headline: "Our exit strategy is denial.",
        subheader: "Diamond hands, paper plans."
    },
    {
        headline: "The only thing we diversify is our regrets.",
        subheader: "Collect them all."
    },
    {
        headline: "We turn FOMO into an art form.",
        subheader: "Masterpiece in progress."
    },
    {
        headline: "Here for a good time, not a long time.",
        subheader: "YOLO, but with spreadsheets."
    },
    {
        headline: "We don't time the market. We meme it.",
        subheader: "Charts are just suggestions."
    },
    {
        headline: "If you can't handle the drawdown, stay out of the forum.",
        subheader: "Pain is temporary. Screenshots are forever."
    },
    {
        headline: "We're not early adopters. We're early survivors.",
        subheader: "Still here, still coping."
    },
    {
        headline: "We don't follow trends. We chase chaos.",
        subheader: "Order is overrated."
    },
    {
        headline: "If you're reading this, you're already down bad.",
        subheader: "Welcome home."
    },
    {
        headline: "We celebrate wins. We meme the losses.",
        subheader: "Post your pain for reputation."
    }
];

const existingFooterQuotes = [
    "This is not financial advice. But if it works, you're welcome.",
    "Degentalk™ is powered by caffeine, cope, and completely unlicensed opinions.",
    "We are not financial advisors. We just yell louder when we're right.",
    "Not financial advice. Consult your local psychic for better accuracy.",
    "Any gains you make are pure coincidence. Any losses are definitely your fault.",
    "This isn't financial advice. It's just aggressive optimism with a side of chaos.",
    "If this feels like good advice, please reconsider everything.",
    "Everything here is entirely theoretical. Especially your profits.",
    "Don't sue us. Sue the market.",
    "Side effects of listening to Degentalk™ may include delusion, euphoria, or margin calls.",
    "DYOR. Then ignore it and ape anyway.",
    "This is not financial advice, seriously.",
    "Shoutout to the guy who lost his paycheck today.",
    "Up only... in spirit.",
    "Post your wins. Hide your losses.",
    "No charts. Just vibes.",
    "Rugged? Good. Now you're one of us.",
    "Built different. Just not financially stable.",
    "Degens don't cry—we redeposit.",
    "Who needs therapy when you have leverage?",
    "Your portfolio is our entertainment.",
    "Welcome to group therapy with bonus rounds.",
    "0xFaith, 100x Cope.",
    "Lose fast, post faster.",
    "If this site loads, you haven't been liquidated yet.",
    "Do NOT try this at home. Try it on-chain.",
    "The only thing guaranteed here is the disclaimer.",
    "Every loss is a lesson—some just cost more than others.",
    "Remember: Regret is not a refund policy.",
    "If you're looking for a sign, this isn't it.",
    "Winners take profits. Degens take screenshots.",
    "If you can't handle the heat, turn off your notifications."
];

async function seedUiConfigQuotes() {
    console.log('🌱 Starting UI config quotes seeding...');

    try {
        // Check if quotes already exist
        const existingQuotes = await db.select().from(uiQuotes).limit(1);
        if (existingQuotes.length > 0) {
            console.log('⚠️  UI quotes already exist. Skipping seeding.');
            console.log('   To re-seed, clear the ui_quotes table first.');
            return;
        }

        // Seed hero quotes
        console.log('📝 Seeding hero quotes...');
        const heroQuoteData = existingHeroQuotes.map((quote, index) => ({
            type: 'hero',
            headline: quote.headline,
            subheader: quote.subheader,
            tags: ['default', 'degen', 'crypto'],
            intensity: Math.floor(Math.random() * 5) + 1, // Random intensity 1-5
            theme: 'default',
            targetAudience: 'all',
            isActive: true,
            displayOrder: index,
            weight: 1,
            metadata: {
                source: 'ui.config.ts',
                migrated: true,
                batch: index < 20 ? 'core' : index < 40 ? 'optimism' : 'satirical'
            }
        }));

        const insertedHeroQuotes = await db.insert(uiQuotes).values(heroQuoteData).returning();
        console.log(`✅ Inserted ${insertedHeroQuotes.length} hero quotes`);

        // Seed footer quotes
        console.log('📝 Seeding footer quotes...');
        const footerQuoteData = existingFooterQuotes.map((quote, index) => ({
            type: 'footer',
            headline: quote,
            subheader: null,
            tags: ['disclaimer', 'humor', 'legal'],
            intensity: Math.floor(Math.random() * 3) + 1, // Random intensity 1-3 (footer is less intense)
            theme: 'default',
            targetAudience: 'all',
            isActive: true,
            displayOrder: index,
            weight: 1,
            metadata: {
                source: 'ui.config.ts',
                migrated: true,
                type: 'disclaimer'
            }
        }));

        const insertedFooterQuotes = await db.insert(uiQuotes).values(footerQuoteData).returning();
        console.log(`✅ Inserted ${insertedFooterQuotes.length} footer quotes`);

        // Create default collections
        console.log('📚 Creating default collections...');

        // Create collections
        const collections = await db.insert(uiCollections).values([
            {
                name: 'Core Degen Quotes',
                description: 'The original hardcoded hero quotes that define the Degentalk experience',
                type: 'default',
                isActive: true,
                priority: 10,
                config: {
                    rotationSpeed: 5000,
                    displayStyle: 'fade'
                }
            },
            {
                name: 'Optimistic Copium',
                description: 'Hope-filled quotes for users who still believe in their bags',
                type: 'mood',
                isActive: true,
                priority: 8,
                config: {
                    rotationSpeed: 6000,
                    displayStyle: 'slide'
                }
            },
            {
                name: 'Satirical Greatness',
                description: 'The most savage and witty quotes for peak degen entertainment',
                type: 'mood',
                isActive: true,
                priority: 9,
                config: {
                    rotationSpeed: 4000,
                    displayStyle: 'bounce'
                }
            },
            {
                name: 'Footer Disclaimers',
                description: 'Legal disclaimers and humorous warnings for the footer',
                type: 'default',
                isActive: true,
                priority: 10,
                config: {
                    rotationSpeed: 8000,
                    displayStyle: 'fade'
                }
            }
        ]).returning();

        console.log(`✅ Created ${collections.length} collections`);

        // Link quotes to collections
        console.log('🔗 Linking quotes to collections...');

        // Core collection gets first 25 hero quotes
        const coreHeroQuotes = insertedHeroQuotes.slice(0, 25);
        const coreLinks = coreHeroQuotes.map((quote, index) => ({
            collectionId: collections[0].id,
            quoteId: quote.id,
            orderInCollection: index
        }));

        // Optimism collection gets quotes 25-45
        const optimismHeroQuotes = insertedHeroQuotes.slice(25, 45);
        const optimismLinks = optimismHeroQuotes.map((quote, index) => ({
            collectionId: collections[1].id,
            quoteId: quote.id,
            orderInCollection: index
        }));

        // Satirical collection gets remaining hero quotes
        const satiricalHeroQuotes = insertedHeroQuotes.slice(45);
        const satiricalLinks = satiricalHeroQuotes.map((quote, index) => ({
            collectionId: collections[2].id,
            quoteId: quote.id,
            orderInCollection: index
        }));

        // Footer collection gets all footer quotes
        const footerLinks = insertedFooterQuotes.map((quote, index) => ({
            collectionId: collections[3].id,
            quoteId: quote.id,
            orderInCollection: index
        }));

        // Insert all collection links
        const allLinks = [...coreLinks, ...optimismLinks, ...satiricalLinks, ...footerLinks];
        await db.insert(uiCollectionQuotes).values(allLinks);

        console.log(`✅ Created ${allLinks.length} quote-collection associations`);

        console.log('\n🎉 UI config seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   • ${insertedHeroQuotes.length} hero quotes imported`);
        console.log(`   • ${insertedFooterQuotes.length} footer quotes imported`);
        console.log(`   • ${collections.length} collections created`);
        console.log(`   • ${allLinks.length} quote associations created`);
        console.log('\n✨ Your hardcoded quotes are now database-driven!');
        console.log('   Access them via the admin panel at /api/admin/ui-config');

    } catch (error) {
        console.error('❌ Error seeding UI config quotes:', error);
        process.exit(1);
    }
}

// Run if called directly
// Run the seeding function
seedUiConfigQuotes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

export { seedUiConfigQuotes }; 