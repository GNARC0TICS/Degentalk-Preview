import { db } from '../../db'; // Adjust path as necessary
import { 
  forumCategories, threads, posts, users as usersSchema, roles as rolesSchema, 
  tags as tagsSchema, threadPrefixes as prefixesSchema, threadTags as threadTagsSchema, 
  userRoles as userRolesSchema, wallets as walletsSchema, transactions as transactionsSchema,
  products as productsSchema, orders as ordersSchema, orderItems as orderItemsSchema,
  announcements as announcementsSchema
} from '../../db/schema'; // Adjust path
import { transactionTypeEnum, transactionStatusEnum } from '../../db/schema/core/enums'; // Import transaction enums
import { eq, sql } from 'drizzle-orm';
import { slugify } from '../db/utils/seedUtils';
import { faker } from '@faker-js/faker';
import chalk from 'chalk';
import type { ForumRules as ConfigForumRules } from '../../client/src/config/forumMap.config'; // Import ConfigForumRules
import { userRoleEnum } from '../../db/schema/core/enums'; // Import the Drizzle enum

// Define the user role type directly from the Drizzle enum
type UserRole = typeof userRoleEnum.enumValues[number];

interface SeededUser {
  id: number;
  username: string;
  role: UserRole; // This corresponds to users.role (userRoleEnum)
  primaryRoleId?: string | null; // This corresponds to users.primaryRoleId (UUID from roles table)
}

interface SeededRole {
  id: string;
  name: string;
  slug: string;
}

interface SeededTag {
  id: number;
  name: string;
  slug: string;
}

interface SeededPrefix {
  id: number;
  name: string;
}

interface SeededWallet {
  id: number;
  userId: number;
  balance: number;
}

interface SeededTransaction {
  id: number;
  type: typeof transactionTypeEnum.enumValues[number];
  status: typeof transactionStatusEnum.enumValues[number];
  amount: number;
}

interface SeededProduct {
  id: number;
  name: string;
  price: number;
}

interface SeededOrder {
  id: number;
  userId: number | null;
  total: number;
}

interface SeededOrderItem {
  id: number;
  orderId: number;
  productId: number | null;
}

interface SeededAnnouncement {
  id: number;
  content: string;
  type?: string | null;
}

async function truncateDynamicDataIfDev() {
  if (process.env.NODE_ENV === "development") {
    console.log(chalk.yellow("[DEV] Truncating dynamic content tables (users, threads, posts)..."));
    // Add all tables that this script seeds to prevent duplicate key errors on re-runs
    // Be careful with order if there are foreign key constraints without CASCADE DELETE
    await db.delete(posts); // Delete posts first
    await db.delete(threads); // Then threads
    // Truncate users or delete specific seeded users. For full dev reset, truncate is easier.
    // If truncating users, ensure your auth system can handle it or re-seed a default admin.
    // await db.execute(`TRUNCATE TABLE ${usersSchema.table} RESTART IDENTITY CASCADE;`); 
    // For now, let's assume we might want to keep some users, so we'll delete users created by this script later if needed.
    // Or, if users are few and critical, avoid deleting them here and handle conflicts in seedUsers.
    // Also truncate roles, tags, prefixes, threadTags and userRoles if we are re-seeding them
    await db.delete(userRolesSchema); // Junction table
    await db.delete(rolesSchema);
    await db.delete(threadTagsSchema); // Junction table
    await db.delete(tagsSchema);
    await db.delete(prefixesSchema);
    await db.delete(transactionsSchema); // Transactions before wallets if FKs are strict
    await db.delete(walletsSchema);
    await db.delete(orderItemsSchema); // Order items before orders
    await db.delete(ordersSchema);
    await db.delete(productsSchema); 
    await db.delete(announcementsSchema);
    // TODO: Add productCategoriesSchema if/when seeded
  }
}

async function seedRoles(): Promise<SeededRole[]> {
  console.log(chalk.blue('Seeding roles...'));
  const createdRoles: SeededRole[] = [];
  const roleData = [
    { name: 'Super Administrator', slug: 'super-admin', rank: 100, isStaff: true, isAdmin: true, isModerator: true, xpMultiplier: 1.5, permissions: {godMode: true} },
    { name: 'Administrator', slug: 'admin', rank: 90, isStaff: true, isAdmin: true, isModerator: true, xpMultiplier: 1.2 },
    { name: 'Moderator', slug: 'moderator', rank: 80, isStaff: true, isModerator: true, xpMultiplier: 1.1 },
    { name: 'VIP User', slug: 'vip', rank: 50, xpMultiplier: 1.25 },
    { name: 'Member', slug: 'member', rank: 10, xpMultiplier: 1.0 },
    { name: 'Newbie', slug: 'newbie', rank: 1, xpMultiplier: 1.0 },
  ];

  for (const data of roleData) {
    try {
      const [newRole] = await db
        .insert(rolesSchema)
        .values({
          name: data.name,
          slug: data.slug,
          rank: data.rank,
          isStaff: data.isStaff || false,
          isAdmin: data.isAdmin || false,
          isModerator: data.isModerator || false,
          xpMultiplier: data.xpMultiplier || 1.0,
          permissions: data.permissions || {},
          // badgeImage, textColor, backgroundColor can be added later or faked
        })
        .returning({ id: rolesSchema.id, name: rolesSchema.name, slug: rolesSchema.slug });
      
      if (newRole) {
        createdRoles.push(newRole);
        console.log(chalk.gray(`  Created role: ${newRole.name} (ID: ${newRole.id})`));
      }
    } catch (error) {
      console.error(chalk.red(`Error creating role ${data.name}:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdRoles.length} roles.`));
  return createdRoles;
}

async function seedTags(count: number = 20): Promise<SeededTag[]> {
  console.log(chalk.blue(`Seeding ${count} tags...`));
  const createdTags: SeededTag[] = [];
  const tagNames: string[] = [];

  // Generate unique tag names first to avoid conflicts
  while (tagNames.length < count) {
    const name = faker.lorem.words(faker.number.int({ min: 1, max: 3 })).toLowerCase();
    if (!tagNames.includes(name) && name.length <= 50) {
      tagNames.push(name);
    }
  }
  
  for (const name of tagNames) {
    const slug = await slugify(name);
    try {
      const [newTag] = await db
        .insert(tagsSchema)
        .values({
          name: name,
          slug: slug,
          description: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : undefined,
        })
        .returning({ id: tagsSchema.id, name: tagsSchema.name, slug: tagsSchema.slug });

      if (newTag) {
        createdTags.push(newTag);
        console.log(chalk.gray(`  Created tag: ${newTag.name} (ID: ${newTag.id})`));
      }
    } catch (error) {
      // console.error(chalk.red(`Error creating tag ${name}:`), error); // Can be noisy if unique constraint hit often
      // Try to fetch if it was a unique constraint violation
       const [existingTag] = await db.select().from(tagsSchema).where(eq(tagsSchema.slug, slug));
       if (existingTag) {
           createdTags.push(existingTag);
       } else {
            console.error(chalk.red(`Failed to create or find tag ${name}.`), error);
       }
    }
  }
  console.log(chalk.green(`Seeded ${createdTags.length} tags.`));
  return createdTags;
}

async function seedPrefixes(seededCategories: {id: number}[]): Promise<SeededPrefix[]> {
  console.log(chalk.blue('Seeding thread prefixes...'));
  const createdPrefixes: SeededPrefix[] = [];
  const prefixData = [
    { name: 'Discussion', color: '#3498db' },
    { name: 'Question', color: '#f1c40f' },
    { name: 'Guide', color: '#2ecc71' },
    { name: 'Feedback', color: '#e74c3c' },
    { name: 'Announcement', color: '#9b59b6' },
    { name: 'Bug Report', color: '#e67e22' },
    { name: 'Feature Request', color: '#1abc9c' },
    { name: 'Off-Topic', color: '#95a5a6' },
  ];

  for (const data of prefixData) {
    try {
      // Optionally assign to a random category, or leave categoryId null for global prefixes
      const categoryId = seededCategories.length > 0 && faker.datatype.boolean(0.5) 
        ? faker.helpers.arrayElement(seededCategories).id 
        : undefined;

      const [newPrefix] = await db
        .insert(prefixesSchema)
        .values({
          name: data.name,
          color: data.color,
          categoryId: categoryId,
          position: faker.number.int({min: 0, max: 10}),
        })
        .returning({ id: prefixesSchema.id, name: prefixesSchema.name });
      
      if (newPrefix) {
        createdPrefixes.push(newPrefix);
        console.log(chalk.gray(`  Created prefix: ${newPrefix.name} (ID: ${newPrefix.id})`));
      }
    } catch (error) {
      // console.error(chalk.red(`Error creating prefix ${data.name}:`), error);
      // Try to fetch if it was a unique constraint violation (though name is unique, not slug here)
      const [existingPrefix] = await db.select().from(prefixesSchema).where(eq(prefixesSchema.name, data.name));
      if (existingPrefix) {
          createdPrefixes.push(existingPrefix);
      } else {
           console.error(chalk.red(`Failed to create or find prefix ${data.name}.`), error);
      }
    }
  }
  console.log(chalk.green(`Seeded ${createdPrefixes.length} prefixes.`));
  return createdPrefixes;
}


async function seedUsers(count: number, availableRoles: SeededRole[]): Promise<SeededUser[]> {
  console.log(chalk.blue(`Seeding ${count} users...`));
  const createdUsers: SeededUser[] = [];

  for (let i = 0; i < count; i++) {
    const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20) + `_${faker.string.alphanumeric(3)}`;
    const email = faker.internet.email({firstName: username});
    // Hashing passwords should be done here if your schema expects hashed passwords.
    // For simplicity in seeding, we might store plain text or a known dummy hash.
    // const hashedPassword = await hashPassword('password123'); // Example

    try {
      const selectedPrimaryRole = availableRoles.length > 0 ? faker.helpers.arrayElement(availableRoles) : null;
      const userEnumValueRole = faker.helpers.arrayElement(userRoleEnum.enumValues) as UserRole;

      const [newUser] = await db
        .insert(usersSchema)
        .values({
          username: username,
          email: email,
          password: 'dummyPasswordHash123', // Provide a dummy password hash
          role: userEnumValueRole, // For the users.role column (enum: user, mod, admin)
          primaryRoleId: selectedPrimaryRole?.id, // For the new users.primaryRoleId (UUID from roles table)
          xp: faker.number.int({ min: 0, max: 100000 }),
          lastSeenAt: faker.date.recent({ days: 30 }), // Changed from lastActiveAt to lastSeenAt
          // Add other necessary fields like createdAt, emailVerified, etc.
          // Example for wallet balance (if direct columns on users table, otherwise seed wallets table)
          // dgtBalance: faker.finance.amount(0, 10000, 2), 
          // usdtBalance: faker.finance.amount(0, 5000, 2),
        })
        .onConflictDoNothing() // Or use onConflictDoUpdate if you want to update existing users by email/username
        .returning({ id: usersSchema.id, username: usersSchema.username, role: usersSchema.role, primaryRoleId: usersSchema.primaryRoleId });

      if (newUser) {
        createdUsers.push({
          id: newUser.id, 
          username: newUser.username, 
          role: newUser.role!, // This is the enum role
          primaryRoleId: newUser.primaryRoleId // This is the UUID from roles table
        });
        console.log(chalk.gray(`  Created user: ${newUser.username} (ID: ${newUser.id}, EnumRole: ${newUser.role}, PrimaryRoleID: ${newUser.primaryRoleId})`));
        // TODO: Seed wallet entry if wallets are in a separate table
        // TODO: Seed userRoles junction table for secondary/stacked roles if needed
      } else {
        // If onConflictDoNothing and user existed, try to fetch them to include in createdUsers
        const [existingUser] = await db.select({id: usersSchema.id, username: usersSchema.username, role: usersSchema.role, primaryRoleId: usersSchema.primaryRoleId}).from(usersSchema).where(eq(usersSchema.email, email));
        if (existingUser) {
            createdUsers.push({id: existingUser.id, username: existingUser.username, role: existingUser.role!, primaryRoleId: existingUser.primaryRoleId});
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error creating user ${username}:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdUsers.length} users.`));
  return createdUsers;
}

async function seedUserRoles(seededUsers: SeededUser[], seededRoles: SeededRole[]) {
  if (!seededUsers.length || !seededRoles.length) {
    console.warn(chalk.yellow("Not enough users or roles to seed userRoles. Skipping."));
    return;
  }
  console.log(chalk.blue('Seeding user secondary roles (userRoles junction table)...'));
  let associationsCreated = 0;

  for (const user of seededUsers) {
    const numSecondaryRoles = faker.number.int({ min: 0, max: 2 }); // Assign 0 to 2 secondary roles
    if (numSecondaryRoles === 0) continue;

    // Filter out the user's primary role from available roles to assign as secondary
    const availableSecondaryRoles = seededRoles.filter(r => r.id !== user.primaryRoleId);
    if (availableSecondaryRoles.length === 0) continue;

    const rolesToAssign = faker.helpers.arrayElements(availableSecondaryRoles, Math.min(numSecondaryRoles, availableSecondaryRoles.length));

    for (const role of rolesToAssign) {
      try {
        await db.insert(userRolesSchema).values({
          userId: user.id,
          roleId: role.id,
          // grantedAt: new Date(), // Default is now() in schema
          // grantedBy: adminUser?.id, // If you have a specific admin seeder user
        }).onConflictDoNothing();
        associationsCreated++;
      } catch (error) {
        console.error(chalk.red(`Error assigning role ${role.name} to user ${user.username}:`), error);
      }
    }
  }
  console.log(chalk.green(`Created ${associationsCreated} user-role associations.`));
}

async function seedWallets(seededUsers: SeededUser[]): Promise<SeededWallet[]> {
  console.log(chalk.blue('Seeding wallets for users...'));
  const createdWallets: SeededWallet[] = [];

  for (const user of seededUsers) {
    try {
      const initialBalance = faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
      const [newWallet] = await db
        .insert(walletsSchema)
        .values({
          userId: user.id,
          balance: initialBalance,
          lastTransaction: faker.date.recent({ days: 10 }),
        })
        .returning();
      
      if (newWallet) {
        createdWallets.push(newWallet);
        // console.log(chalk.gray(`  Created wallet for user ${user.username} (ID: ${newWallet.id}) with balance ${initialBalance}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error creating wallet for user ${user.username}:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdWallets.length} wallets.`));
  return createdWallets;
}

async function seedTransactions(seededUsers: SeededUser[], seededWallets: SeededWallet[], count: number = 100): Promise<SeededTransaction[]> {
  if (seededUsers.length < 2 || !seededWallets.length) {
    console.warn(chalk.yellow("Not enough users or wallets to seed transactions. Skipping."));
    return [];
  }
  console.log(chalk.blue(`Seeding ${count} transactions...`));
  const createdTransactions: SeededTransaction[] = [];

  for (let i = 0; i < count; i++) {
    const fromUser = faker.helpers.arrayElement(seededUsers);
    let toUser = faker.helpers.arrayElement(seededUsers);
    while (toUser.id === fromUser.id && seededUsers.length > 1) { // Ensure toUser is different from fromUser
      toUser = faker.helpers.arrayElement(seededUsers);
    }

    const fromWallet = seededWallets.find(w => w.userId === fromUser.id);
    const toWallet = seededWallets.find(w => w.userId === toUser.id);

    if (!fromWallet || !toWallet) continue; // Should not happen if wallets seeded for all users

    const amount = faker.number.int({ min: 1, max: 500 });
    const type = faker.helpers.arrayElement(transactionTypeEnum.enumValues);
    const status = faker.helpers.arrayElement(transactionStatusEnum.enumValues);
    
    try {
      const [newTransaction] = await db
        .insert(transactionsSchema)
        .values({
          userId: fromUser.id, // Or toUser.id depending on transaction type logic
          walletId: fromWallet.id, // Could also be toWallet.id
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          amount: amount,
          type: type,
          status: status,
          description: faker.lorem.sentence(),
          metadata: { reason: faker.lorem.words(3) },
        })
        .returning();
      
      if (newTransaction) {
        createdTransactions.push(newTransaction);
        // console.log(chalk.gray(`  Created transaction: ${type} of ${amount} from ${fromUser.username} to ${toUser.username}`));
        
        // Basic balance update for simplicity (real system would be more complex)
        if (status === 'confirmed') { // Only adjust balance for confirmed transactions
            if (type === 'TIP' || type === 'ADMIN_ADJUST' /* and other debit types */) {
                 await db.update(walletsSchema).set({ balance: sql`${walletsSchema.balance} - ${amount}` }).where(eq(walletsSchema.id, fromWallet.id));
                 await db.update(walletsSchema).set({ balance: sql`${walletsSchema.balance} + ${amount}` }).where(eq(walletsSchema.id, toWallet.id));
            }
            // Add more balance adjustment logic for other types like DEPOSIT, WITHDRAWAL etc.
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error creating transaction:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdTransactions.length} transactions.`));
  return createdTransactions;
}

async function seedProducts(count: number = 15): Promise<SeededProduct[]> {
  console.log(chalk.blue(`Seeding ${count} products...`));
  const createdProducts: SeededProduct[] = [];

  for (let i = 0; i < count; i++) {
    const productName = faker.commerce.productName();
    const slug = await slugify(productName + '-' + faker.string.alphanumeric(4));
    try {
      const [newProduct] = await db
        .insert(productsSchema)
        .values({
          name: productName,
          slug: slug,
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price({ min: 5, max: 200 })),
          stock: faker.number.int({ min: 0, max: 100 }),
          status: faker.helpers.arrayElement(['published', 'draft', 'archived']),
          isDigital: faker.datatype.boolean(0.2),
          // categoryId, featuredImageId, digitalFileId can be null or seeded later
        })
        .returning({ id: productsSchema.id, name: productsSchema.name, price: productsSchema.price });
      
      if (newProduct) {
        createdProducts.push(newProduct);
        console.log(chalk.gray(`  Created product: ${newProduct.name} (ID: ${newProduct.id})`));
      }
    } catch (error) {
      console.error(chalk.red(`Error creating product ${productName}:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdProducts.length} products.`));
  return createdProducts;
}

async function seedOrdersAndItems(seededUsers: SeededUser[], seededProducts: SeededProduct[], orderCount: number = 30): Promise<SeededOrder[]> {
  if (!seededUsers.length || !seededProducts.length) {
    console.warn(chalk.yellow("Not enough users or products to seed orders. Skipping."));
    return [];
  }
  console.log(chalk.blue(`Seeding ${orderCount} orders with items...`));
  const createdOrders: SeededOrder[] = [];

  for (let i = 0; i < orderCount; i++) {
    const user = faker.helpers.arrayElement(seededUsers);
    let orderSubtotal = 0;
    const orderItemsData: any[] = []; // Temp store for items before inserting

    const numItemsInOrder = faker.number.int({ min: 1, max: 3 });
    const selectedProductsForOrder: SeededProduct[] = faker.helpers.arrayElements(seededProducts, numItemsInOrder);

    if (!selectedProductsForOrder.length) continue;

    for (const product of selectedProductsForOrder) {
      const quantity = faker.number.int({ min: 1, max: 2 });
      const priceAtOrder = product.price; // Use the current product price for simplicity
      const itemTotal = quantity * priceAtOrder;
      orderSubtotal += itemTotal;
      orderItemsData.push({
        productId: product.id,
        productName: product.name, // Denormalized
        quantity: quantity,
        price: priceAtOrder,
        total: itemTotal,
      });
    }
    
    const orderTotal = orderSubtotal; // Add tax, shipping, discount later if needed

    try {
      const [newOrder] = await db
        .insert(ordersSchema)
        .values({
          userId: user.id,
          status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
          total: orderTotal,
          subtotal: orderSubtotal,
          paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'points']),
          // billingAddress, shippingAddress can be faked if needed
        })
        .returning({ id: ordersSchema.id, userId: ordersSchema.userId, total: ordersSchema.total });

      if (newOrder) {
        createdOrders.push(newOrder);
        // console.log(chalk.gray(`  Created order ID: ${newOrder.id} for user ID: ${newOrder.userId}`));

        for (const itemData of orderItemsData) {
          await db.insert(orderItemsSchema).values({
            orderId: newOrder.id,
            ...itemData,
          });
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error creating order for user ${user.username}:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdOrders.length} orders.`));
  return createdOrders;
}

async function seedAnnouncements(seededUsers: SeededUser[], count: number = 5): Promise<SeededAnnouncement[]> {
  if (!seededUsers.length) {
    console.warn(chalk.yellow("No users available to create announcements. Skipping announcement seeding."));
    return [];
  }
  console.log(chalk.blue(`Seeding ${count} announcements...`));
  const createdAnnouncements: SeededAnnouncement[] = [];
  const announcementTypes = ['info', 'warning', 'success', 'critical'];

  for (let i = 0; i < count; i++) {
    const creator = faker.helpers.arrayElement(seededUsers.filter(u => u.role === 'admin' || u.role === 'mod')); // Prefer admin/mod
    const actualCreator = creator || faker.helpers.arrayElement(seededUsers); // Fallback to any user

    try {
      const [newAnnouncement] = await db
        .insert(announcementsSchema)
        .values({
          content: faker.lorem.sentence(faker.number.int({min: 5, max: 15})),
          icon: faker.helpers.arrayElement(['🎉', '📢', '⚠️', 'ℹ️', '✅']),
          type: faker.helpers.arrayElement(announcementTypes),
          isActive: faker.datatype.boolean(0.8), // 80% active
          createdBy: actualCreator.id,
          expiresAt: faker.datatype.boolean(0.5) ? faker.date.future({years: 0.1}) : undefined,
          priority: faker.number.int({min: 0, max: 10}),
          visibleTo: ['all'], // Pass as string array
          tickerMode: faker.datatype.boolean(0.6),
          link: faker.datatype.boolean(0.3) ? faker.internet.url() : undefined,
          bgColor: faker.datatype.boolean(0.4) ? faker.internet.color() : undefined,
          textColor: faker.datatype.boolean(0.4) ? faker.internet.color() : undefined,
        })
        .returning({ id: announcementsSchema.id, content: announcementsSchema.content, type: announcementsSchema.type });
      
      if (newAnnouncement) {
        createdAnnouncements.push(newAnnouncement);
        console.log(chalk.gray(`  Created announcement: "${newAnnouncement.content?.substring(0,30)}..." (ID: ${newAnnouncement.id})`));
      }
    } catch (error) {
      console.error(chalk.red(`Error creating announcement:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdAnnouncements.length} announcements.`));
  return createdAnnouncements;
}


async function seedThreadsAndPostsForForums(seededUsers: SeededUser[], seededTags: SeededTag[], seededPrefixes: SeededPrefix[]) {
  if (!seededUsers.length) {
    console.warn(chalk.yellow("No users available to author threads/posts. Skipping thread/post seeding."));
    return;
  }

  const dbForumCategories = await db.select({ id: forumCategories.id, name: forumCategories.name, slug: forumCategories.slug, pluginData: forumCategories.pluginData })
    .from(forumCategories)
    .where(eq(forumCategories.type, "forum")); // Only seed into actual forums

  if (!dbForumCategories.length) {
    console.warn(chalk.yellow("No forums found in the database. Run seedForumsFromConfig first or ensure forums exist."));
    return;
  }

  const threadsPerForum = faker.number.int({ min: 2, max: 8 }); // Variable threads per forum

  for (const category of dbForumCategories) {
    console.log(chalk.blue(`Seeding threads for forum: '${category.name}' (ID: ${category.id})`));
    const forumRules = (category.pluginData as any)?.rules as ConfigForumRules | undefined;

    for (let i = 1; i <= threadsPerForum; i++) {
      const author = faker.helpers.arrayElement(seededUsers);
      const threadTitle = faker.lorem.sentence({ min: 3, max: 10 }).slice(0, 80);
      const threadSlug = await slugify(`${threadTitle}-${faker.string.alphanumeric(6)}`);
      const firstPostContent = faker.lorem.paragraphs({min:1, max:3});
      const randomPrefix = seededPrefixes.length > 0 && faker.datatype.boolean(0.7) ? faker.helpers.arrayElement(seededPrefixes) : null;

      try {
        const [newThread] = await db
          .insert(threads)
          .values({
            title: threadTitle,
            slug: threadSlug,
            prefixId: randomPrefix?.id,
            parentForumSlug: category.slug,
            categoryId: category.id,
            userId: author.id,
            isSticky: faker.datatype.boolean(0.1), // 10% chance of being sticky
            isLocked: faker.datatype.boolean(0.05), // 5% chance of being locked
            isHidden: faker.datatype.boolean(0.02), // 2% chance of being hidden
            viewCount: faker.number.int({ min: 0, max: 5000 }),
            // postCount will be updated after posts are seeded
            // firstPostLikeCount, dgtStaked, hotScore can be seeded later or calculated
            createdAt: faker.date.recent({ days: 90 }), // Threads created in the last 90 days
          })
          .returning({ id: threads.id, createdAt: threads.createdAt });

        if (!newThread) {
          console.error(chalk.red(`  Failed to insert thread: ${threadTitle}`));
          continue;
        }

        const postsInThreadCount = faker.number.int({ min: 0, max: 25 }); // 0 to 25 replies
        let lastPostId: number | null = null; // Explicitly type as number | null
        let lastPostAt: Date | null = newThread.createdAt; // Type as Date | null
        let firstPostLikeCountVal = 0;
        const allPostIdsInThread: number[] = [];

        // Seed first post
        if (postsInThreadCount >= 0) { // Always create first post if thread is created
            const firstPostLikes = faker.number.int({min: 0, max: 50});
            firstPostLikeCountVal = firstPostLikes;
            const [firstPost] = await db
            .insert(posts)
            .values({
              threadId: newThread.id,
              userId: author.id, // First post by thread author
              content: firstPostContent,
              isFirstPost: true,
              createdAt: newThread.createdAt, // First post created at same time as thread
              likeCount: firstPostLikes,
            })
            .returning({ id: posts.id, createdAt: posts.createdAt });

            if (!firstPost) {
                console.error(chalk.red(`  Failed to insert first post for thread: ${threadTitle}`));
                await db.delete(threads).where(eq(threads.id, newThread.id));
                continue;
            }
            lastPostId = firstPost.id;
            lastPostAt = firstPost.createdAt;
            allPostIdsInThread.push(firstPost.id);
        }
        
        // Seed replies
        for (let j = 0; j < postsInThreadCount; j++) {
          const postAuthor = faker.helpers.arrayElement(seededUsers);
          const postCreatedAt = faker.date.between({ from: lastPostAt!, to: new Date() });
          const [replyPost] = await db.insert(posts).values({
            threadId: newThread.id,
            userId: postAuthor.id,
            content: faker.lorem.paragraph(),
            isFirstPost: false,
            createdAt: postCreatedAt,
            likeCount: faker.number.int({min: 0, max: 20}),
          }).returning({id: posts.id, createdAt: posts.createdAt});

          if(replyPost){
            lastPostId = replyPost.id;
            lastPostAt = replyPost.createdAt;
            allPostIdsInThread.push(replyPost.id);
          }
        }
        
        const isSolvedVal = faker.datatype.boolean(0.2); // 20% chance of being solved
        const solvingPostIdVal = isSolvedVal && allPostIdsInThread.length > 0 ? faker.helpers.arrayElement(allPostIdsInThread) : null;

        // Update thread with aggregated post info
        await db
          .update(threads)
          .set({
            lastPostId: lastPostId,
            lastPostAt: lastPostAt,
            postCount: allPostIdsInThread.length,
            firstPostLikeCount: firstPostLikeCountVal,
            isSolved: isSolvedVal,
            solvingPostId: solvingPostIdVal,
            // hotScore and dgtStaked already set during insert or can be further randomized here
          })
          .where(eq(threads.id, newThread.id));

        console.log(chalk.gray(`    Created thread: '${threadTitle}' (ID: ${newThread.id}) with ${allPostIdsInThread.length} post(s)`));
      } catch (error) {
        console.error(chalk.red(`  Error creating thread "${threadTitle}":`), error);
      }
    }
  }
}

async function main() {
  console.log(chalk.bold.magenta('🚀 Starting DegenTalk Dynamic Content Seeder...'));
  
  // Ask user if they want to truncate tables in dev
  // For now, let's always truncate in dev for simplicity during refactor
  await truncateDynamicDataIfDev();

  const seededRoles = await seedRoles();

  const numUsersToSeed = 50; // Configurable
  const seededUsers = await seedUsers(numUsersToSeed, seededRoles);

  await seedUserRoles(seededUsers, seededRoles);

  const seededWallets = await seedWallets(seededUsers);
  await seedTransactions(seededUsers, seededWallets, 200); // Seed 200 transactions

  const seededTags = await seedTags();
  
  // Fetch forum categories to potentially assign prefixes to them
  const dbForumCategoriesForPrefixes = await db.select({ id: forumCategories.id })
    .from(forumCategories)
    .where(eq(forumCategories.type, "forum"));
  const seededPrefixes = await seedPrefixes(dbForumCategoriesForPrefixes);
  
  await seedThreadsAndPostsForForums(seededUsers, seededTags, seededPrefixes);

  const seededProducts = await seedProducts();
  await seedOrdersAndItems(seededUsers, seededProducts);
  // TODO: Seed Product Categories
  
  await seedAnnouncements(seededUsers);
  // TODO: Seed Reports

  // TODO: Seed XP activities (revisit this - might involve seeding userAchievements, userMissionProgress)
  
  console.log(chalk.bold.green('✅ DegenTalk Dynamic Content Seeding Completed Successfully!'));
}

if (import.meta.url === (process.argv[1] ?? '')) {
  main().catch(err => {
    console.error(chalk.red.bold('Seeder failed:'), err);
    process.exit(1);
  }).finally(() => {
    console.log(chalk.gray('Seed script finished.'));
    // process.exit(0); // Drizzle keeps connection open, might need to exit explicitly
  });
}
