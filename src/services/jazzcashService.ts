import { getDB } from '../db';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';

export const processTopUp = async (uid: number, amount: number) => {
  const db = getDB();

  // 🔧 Use users.id for matching (numeric user ID)
  const [user] = await db.select().from(users).where(eq(users.id, uid));
  if (!user) throw new Error('User not found');

  if (amount <= 0) throw new Error('Invalid top-up amount');

  const newBalance = user.balance + amount;

  await db.update(users).set({ balance: newBalance }).where(eq(users.id, user.id));

  const mockTransactionId = `JZ-${Math.floor(Math.random() * 1000000000)}`;

  return {
    message: 'JazzCash top-up successful',
    transactionId: mockTransactionId,
    amount,
    balance: newBalance,
  };
};
