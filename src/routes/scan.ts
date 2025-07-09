import { Router } from 'express';
import { getDB } from '../db';
import { users, trips } from '../models/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

const router = Router();

const SERVICE_FARES: Record<string, number> = {
  Metro: 30,
  Speedo: 20,
  Orange: 40,
};

router.post('/', async (req, res) => {
  console.log('Received scan request:', req.body);
  const { uid, service } = req.body;
  if (!uid || !service) return res.status(400).json({ message: 'Missing uid or service' });

  if (!SERVICE_FARES[service]) {
    return res.status(400).json({ message: 'Invalid service' });
  }

  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.nfc_uid, uid));
  if (!user) return res.status(404).json({ message: 'User not found' });

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
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    await db.insert(trips).values({
      userId: user.id,
      routeId: null,
      startTime: now,
      fare: fare,
      service: service,
    });
    await db
      .update(users)
      .set({ balance: user.balance - fare })
      .where(eq(users.id, user.id));
    return res.json({
      message: `${service} trip started, fare deducted`,
      balance: user.balance - fare,
    });
  } else {
    await db
      .update(trips)
      .set({ endTime: now })
      .where(eq(trips.id, activeTrip.id));
    await db
      .update(users)
      .set({ balance: user.balance + 5 })
      .where(eq(users.id, user.id));
    return res.json({
      message: `${service} trip ended, 5 refunded`,
      balance: user.balance + 5,
    });
  }
});

export default router;
