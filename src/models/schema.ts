// src/schemas/schema.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ───────────────────────────────────────────────────────────────────────────────
// ENUМS
// ───────────────────────────────────────────────────────────────────────────────

// Restrict all services to these 3 so "Daewoo" etc. can't slip in.
export const serviceEnum = pgEnum('service', ['Orange', 'Speedo', 'Metro']);

// (Optional) If you want to track trip lifecycle instead of using endTime.
export const tripStatusEnum = pgEnum('trip_status', ['STARTED', 'COMPLETED']);

// ───────────────────────────────────────────────────────────────────────────────
// TABLES
// ───────────────────────────────────────────────────────────────────────────────

// Users
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(), // 'admin' | 'user'
    balance: integer('balance').notNull().default(0),
  },
  (tbl) => ({
    emailIndex: uniqueIndex('users_email_idx').on(tbl.email),
  })
);

export const fares = pgTable(
  'fares',
  {
    id: serial('id').primaryKey(),
    service: serviceEnum('service').notNull(),
    price: integer('price').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (tbl) => ({
    uniqueService: uniqueIndex('fares_service_unique_idx').on(tbl.service),
  })
);

// Routes
export const routes = pgTable(
  'routes',
  {
    id: serial('id').primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),

    service: serviceEnum('service').notNull(), // Orange | Speedo | Metro

    start: varchar('start', { length: 255 }).notNull(),
    end: varchar('end', { length: 255 }).notNull(),

    startCity: varchar('start_city', { length: 120 }).notNull(),
    endCity: varchar('end_city', { length: 120 }).notNull(),
  },
  (tbl) => ({
    uniqueRoutePerService: uniqueIndex('routes_unique_service_start_end_idx').on(
      tbl.service,
      tbl.start,
      tbl.end
    ),
  })
);

// Trips
export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),

  userId: integer('user_id').references(() => users.id).notNull(),
  routeId: integer('route_id').references(() => routes.id),

  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'), // null → in progress
  fare: integer('fare').notNull().default(0),
  service: serviceEnum('service').notNull(),
});
