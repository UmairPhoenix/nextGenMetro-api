import { getDB } from '../db';
import { users, trips } from '../models/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

const SERVICE_FARES: Record<string, number> = {
  Metro: 30,
  Speedo: 20,
  Orange: 40,
};

type ScanInput = {
  uid: number; // this is user.id from the DB
  service: keyof typeof SERVICE_FARES;
};

export const processScan = async ({ uid, service }: ScanInput) => {
  if (!uid || !service) {
    throw new Error('Missing uid or service');
  }

  if (!SERVICE_FARES[service]) {
    throw new Error('Invalid service');
  }

  const db = getDB();

  // 🔧 Use users.id instead of users.nfc_uid
  const [user] = await db.select().from(users).where(eq(users.id, uid));
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();

  const [activeTrip] = await db
    .select()
    .from(trips)
    .where(
      and(
        eq(trips.userId, user.id),
        eq(trips.service, service),
        isNull(trips.endTime)
      )
    )
    .orderBy(desc(trips.startTime))
    .limit(1);

  if (!activeTrip) {
    const fare = SERVICE_FARES[service];

    if (user.balance < fare) {
      throw new Error('Insufficient balance');
    }

    await db.insert(trips).values({
      userId: user.id,
      routeId: null,
      startTime: now,
      fare,
      service,
    });

    const newBalance = user.balance - fare;

    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, user.id));

    return {
      message: `${service} trip started, fare of ${fare} deducted`,
      fare,
      balance: newBalance,
      startTime: now,
    };
  } else {
    await db
      .update(trips)
      .set({ endTime: now })
      .where(eq(trips.id, activeTrip.id));

    const newBalance = user.balance + 5;

    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, user.id));

    return {
      message: `${service} trip ended, 5 refunded`,
      refund: 5,
      balance: newBalance,
      endTime: now,
    };
  }
};
