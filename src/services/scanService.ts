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
  console.log('\x1b[34m[SCAN INITIATED]\x1b[0m', `UID: ${uid}, Service: ${service}`);

  if (!uid || !service) {
    console.log('\x1b[31m[ERROR]\x1b[0m Missing uid or service');
    throw new Error('Missing uid or service');
  }

  if (!SERVICE_FARES[service]) {
    console.log('\x1b[31m[ERROR]\x1b[0m Invalid service type');
    throw new Error('Invalid service');
  }

  const db = getDB();

  const [user] = await db.select().from(users).where(eq(users.id, uid));
  if (!user) {
    console.log('\x1b[31m[ERROR]\x1b[0m User not found for ID:', uid);
    throw new Error('User not found');
  }

  console.log('\x1b[32m[USER FOUND]\x1b[0m', user);

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
    console.log('\x1b[36m[NO ACTIVE TRIP]\x1b[0m Checking balance...');

    if (user.balance < fare) {
      console.log('\x1b[31m[ERROR]\x1b[0m Insufficient balance:', user.balance);
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

    console.log('\x1b[32m[TRIP STARTED]\x1b[0m', {
      service,
      fare,
      newBalance,
      time: now,
    });

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

    console.log('\x1b[33m[TRIP ENDED]\x1b[0m', {
      tripId: activeTrip.id,
      refund: 5,
      newBalance,
      time: now,
    });

    return {
      message: `${service} trip ended, 5 refunded`,
      refund: 5,
      balance: newBalance,
      endTime: now,
    };
  }
};
