import { getDB } from '../db';
import { eq, sql } from 'drizzle-orm';
import { users } from '../models/schema';

export const processTopUp = async (uid: number, amount: number) => {
  if (!uid) throw new Error('Missing user ID');
  if (!amount || amount <= 0) throw new Error('Invalid top-up amount');

  const db = getDB();

  // Ensure user exists
  const [user] = await db.select().from(users).where(eq(users.id, uid));
  if (!user) throw new Error('User not found');

  // Atomic balance update
  await db
    .update(users)
    .set({ balance: sql`${users.balance} + ${amount}` })
    .where(eq(users.id, uid));

  // Get updated balance
  const [updatedUser] = await db.select().from(users).where(eq(users.id, uid));

  const mockTransactionId = `JZ-${Math.floor(Math.random() * 1_000_000_000)}`;

  return {
    message: 'JazzCash top-up successful (mock)',
    transactionId: mockTransactionId,
    amount,
    balance: updatedUser.balance,
    userId: updatedUser.id,
  };
};
