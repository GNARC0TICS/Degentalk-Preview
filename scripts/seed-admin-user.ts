#!/usr/bin/env tsx

/**
 * Admin User Seeder for Development
 * Creates a proper admin user for DEV_FORCE_AUTH
 */

import '@server/config/loadEnv';
import { db } from '@db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import chalk from 'chalk';

async function seedAdminUser() {
  console.log(chalk.cyan('\n🔐 Seeding Admin User for Development...\n'));

  try {
    // Admin user details
    const adminData = {
      username: 'admin',
      email: 'admin@degentalk.local',
      password: 'admin123', // For dev only!
      displayName: 'Admin'
    };

    // Check if admin already exists
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, adminData.username))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(chalk.yellow(`⚠️  Admin user already exists`));
      console.log(chalk.gray(`   ID: ${existing[0].id}`));
      console.log(chalk.gray(`   Username: ${existing[0].username}`));
      console.log(chalk.gray(`   Email: ${existing[0].email}`));
      
      // Update to ensure admin role
      await db
        .update(schema.users)
        .set({
          isAdmin: true,
          isVerified: true,
          isActive: true
        })
        .where(eq(schema.users.id, existing[0].id));
      
      console.log(chalk.green('✓ Updated admin privileges'));
    } else {
      // Hash password
      const passwordHash = await bcrypt.hash(adminData.password, 10);
      
      // Create admin user
      const [admin] = await db
        .insert(schema.users)
        .values({
          username: adminData.username,
          email: adminData.email,
          password: passwordHash,
          isAdmin: true,
          isModerator: true,
          isStaff: true,
          isVerified: true,
          isActive: true,
          role: 'admin',
          level: 100,
          xp: 999999,
          reputation: 10000,
          createdAt: new Date()
        })
        .returning();
      
      console.log(chalk.green('✅ Admin user created successfully!'));
      console.log(chalk.gray(`   ID: ${admin.id}`));
      console.log(chalk.gray(`   Username: ${admin.username}`));
      console.log(chalk.gray(`   Email: ${admin.email}`));
    }

    console.log(chalk.cyan('\n📋 Dev Login Credentials:'));
    console.log(chalk.white(`   Username: ${adminData.username}`));
    console.log(chalk.white(`   Password: ${adminData.password}`));
    
    console.log(chalk.yellow('\n⚡ For auto-login in dev, set these environment variables:'));
    console.log(chalk.gray('   DEV_FORCE_AUTH=true'));
    console.log(chalk.gray('   DEV_BYPASS_PASSWORD=admin123'));
    console.log(chalk.gray('   VITE_FORCE_AUTH=admin'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Seeding failed:'), error);
    process.exit(1);
  }
}

// Run the seeder
seedAdminUser().then(() => process.exit(0));