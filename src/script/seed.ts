import { getDB } from '../db';
import { users } from '../models/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
  const db = getDB();

  const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@nextgen.com'));
  const existingUser = await db.select().from(users).where(eq(users.email, 'testuser@nextgen.com'));

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await db.insert(users).values({
      name: 'Admin',
      email: 'admin@nextgen.com',
      phone: '03000000001',
      passwordHash,
      role: 'admin',
      balance: 1000,
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  if (existingUser.length === 0) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await db.insert(users).values({
      name: 'Test User',
      email: 'testuser@nextgen.com',
      phone: '03000000002',
      passwordHash,
      role: 'user',
      balance: 500,
    });
    console.log('✅ Test user created');
  } else {
    console.log('ℹ️ Test user already exists');
  }

  process.exit();
}

seed();
