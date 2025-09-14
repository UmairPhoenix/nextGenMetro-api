// src/services/scanService.ts
import { getDB } from '../db';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { users, fares, trips, routes } from '../models/schema';

type ScanInput = {
  uid: number; // user.id from DB
  service: 'Metro' | 'Speedo' | 'Orange';
};

export const processScan = async ({ uid, service }: ScanInput) => {
  if (!uid || !service) {
    throw new Error('Missing uid or service');
  }

  const db = getDB();

  // 🔹 1. Fetch user
  const [user] = await db.select().from(users).where(eq(users.id, uid));
  if (!user) {
    throw new Error('User not found');
  }

  // 🔹 2. Get fare for service from DB
  const [fareRow] = await db.select().from(fares).where(eq(fares.service, service));
  if (!fareRow) {
    throw new Error(`No fare configured for ${service}`);
  }
  const fare = fareRow.price;

  // 🔹 3. Find if user already has an active trip for this service
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

  const now = new Date();

  if (!activeTrip) {
    // 🟢 Start new trip

    if (user.balance < fare) {
      throw new Error('Insufficient balance');
    }

    // Pick a random route for this service
    const serviceRoutes = await db.select().from(routes).where(eq(routes.service, service));
    if (serviceRoutes.length === 0) {
      throw new Error(`No routes available for ${service}`);
    }
    const randomRoute = serviceRoutes[Math.floor(Math.random() * serviceRoutes.length)];

    await db.insert(trips).values({
      userId: user.id,
      routeId: randomRoute.id,
      startTime: now,
      fare,
      service,
    });

    const newBalance = user.balance - fare;
    await db.update(users).set({ balance: newBalance }).where(eq(users.id, user.id));

    return {
      message: `${service} trip started on route "${randomRoute.name}", fare of ${fare} deducted`,
      route: {
        id: randomRoute.id,
        name: randomRoute.name,
        start: randomRoute.start,
        end: randomRoute.end,
      },
      fare,
      balance: newBalance,
      startTime: now,
    };
  } else {
    // 🔴 End active trip
    await db.update(trips).set({ endTime: now }).where(eq(trips.id, activeTrip.id));

    // Refund logic – still refund 5 for ending trip
    const refund = 5;
    const newBalance = user.balance + refund;

    await db.update(users).set({ balance: newBalance }).where(eq(users.id, user.id));

    return {
      message: `${service} trip ended, ${refund} refunded`,
      tripId: activeTrip.id,
      refund,
      balance: newBalance,
      endTime: now,
    };
  }
};
