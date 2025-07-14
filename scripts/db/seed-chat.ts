import { db } from '../db';
import { sql } from "drizzle-orm";

export async function seedChatRooms() {
  console.log("🗣️ Seeding chat rooms...");
  
  try {
    // Insert default chat room
    await db.run(sql`
      INSERT OR IGNORE INTO "chat_rooms" ("name", "description", "is_default")
      VALUES ('Main Shoutbox', 'The default chat for all degenerates', 1);
    `);
    console.log("✅ Created Main Shoutbox room");

    // Insert additional chat rooms
    await db.run(sql`
      INSERT OR IGNORE INTO "chat_rooms" ("name", "description", "is_default")
      VALUES ('Trading Signals', 'Share your hottest trading signals', 0);
    `);
    console.log("✅ Created Trading Signals room");

    await db.run(sql`
      INSERT OR IGNORE INTO "chat_rooms" ("name", "description", "is_default")
      VALUES ('General Discussion', 'Talk about anything crypto-related', 0);
    `);
    console.log("✅ Created General Discussion room");

    // Insert some test messages (requires existing users)
    const userCheck = await db.run(sql`SELECT COUNT(*) as count FROM users LIMIT 1;`);
    
    if (userCheck) {
      await db.run(sql`
        INSERT OR IGNORE INTO "chat_messages" ("room_id", "user_id", "message")
        SELECT 1, 1, 'Welcome to the Degentalk shoutbox! 🚀'
        WHERE EXISTS (SELECT 1 FROM users WHERE user_id = 1);
      `);
      
      await db.run(sql`
        INSERT OR IGNORE INTO "chat_messages" ("room_id", "user_id", "message")
        SELECT 1, 1, 'Share your latest trades and thoughts here!'
        WHERE EXISTS (SELECT 1 FROM users WHERE user_id = 1);
      `);
      
      console.log("✅ Created test chat messages");
    } else {
      console.log("⚠️ Skipped test messages - no users found");
    }

    console.log("✅ Chat rooms seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding chat rooms:", error);
    throw error;
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedChatRooms()
    .then(() => {
      console.log("✅ Chat seeding complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Chat seeding failed:", err);
      process.exit(1);
    });
} 