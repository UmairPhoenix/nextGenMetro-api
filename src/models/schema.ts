import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ENUM: Trip status (optional but scalable)
export const tripStatusEnum = pgEnum('trip_status', ['STARTED', 'COMPLETED']);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(), // 'admin' or 'user'
    balance: integer('balance').notNull().default(0),
    nfc_uid: varchar('nfc_uid', { length: 255 }),
  },
  (tbl) => ({
    emailIndex: uniqueIndex('users_email_idx').on(tbl.email),
    uidIndex: uniqueIndex('users_uid_idx').on(tbl.nfc_uid),
  })
);

export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // 'Metro' | 'Speedo' | 'Orange Train'
  start: varchar('start', { length: 255 }).notNull(),
  end: varchar('end', { length: 255 }).notNull(),
});

export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  routeId: integer('route_id').references(() => routes.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'), // null means trip in progress
  fare: integer('fare').notNull().default(0),
  service: varchar('service', { length: 50 }).notNull(), // e.g., 'Metro'
  // status: tripStatusEnum('status').notNull().default('STARTED') // optional alternative to endTime
});
