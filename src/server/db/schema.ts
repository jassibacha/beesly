// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  boolean,
  decimal,
  smallint,
  index,
  pgTableCreator,
  timestamp,
  varchar,
  bigint,
  json,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

// Original, single export
export const createTable = pgTableCreator((name) => `beesly_${name}`);

// // Modify the table creator to use an environment-specific prefix
// export const createTable = pgTableCreator((name) => {
//   // Determine the prefix based on the environment
//   const prefix = process.env.APP_ENV === "test" ? "beesly_test_" : "beesly_";

//   console.log("PG Table Prefix: ", prefix);
//   return `${prefix}${name}`;
// });

export const users = createTable(
  "users",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    email: varchar("email", { length: 256 }).unique(),
    username: varchar("username", { length: 256 }).unique(),
    displayName: varchar("display_name", { length: 256 }),
    userImage: varchar("user_image", { length: 2048 }),
    onboarded: boolean("onboarded").default(false).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 }).unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 256,
    }).unique(),
    stripePriceId: varchar("stripe_price_id", { length: 256 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    emailIndex: index("email_idx").on(table.email),
    // TODO: We can do uniqueIndex as well, look into the difference
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  location: one(locations, {
    fields: [users.id],
    references: [locations.ownerId],
  }),
  // locations: many(locations), // Phase 2: Multiple locations per owner
}));

export const locations = createTable(
  "locations",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    ownerId: varchar("owner_id", { length: 36 }).notNull(), // Foreign key didn't work here
    name: varchar("name", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 50 }).unique().notNull(),
    type: varchar("type", { length: 50 }),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 100 }),
    website: varchar("website", { length: 256 }),
    streetAddress: varchar("street_address", { length: 256 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 30 }),
    zipCode: varchar("zip_code", { length: 20 }),
    country: varchar("country", { length: 100 }),
    timezone: varchar("timezone", { length: 256 }).notNull(),
    logo: varchar("logo", { length: 2048 }),
    //settings: json("settings"), // Phase2
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    ownerIdIdx: index("owner_id_idx").on(table.ownerId),
    slugIdx: index("slug_idx").on(table.slug),
  }),
);

export type Location = typeof locations.$inferSelect;

export const locationsRelations = relations(locations, ({ one, many }) => ({
  owner: one(users, {
    fields: [locations.ownerId],
    references: [users.id],
  }),
  settings: one(locationSettings, {
    fields: [locations.id],
    references: [locationSettings.locationId],
  }),
  resources: many(resources),
}));

export const locationSettings = createTable(
  "location_settings",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    locationId: varchar("location_id", { length: 256 }).notNull(), // Foreign key didn't work here
    //timeZone: varchar("time_zone", { length: 256 }).notNull(),
    dailyAvailability: json("daily_availability").notNull(),
    // taxSettings: json("tax_settings"),
    taxSettings: decimal("tax_settings", { precision: 10, scale: 2 })
      .notNull()
      .default("12.50"),
    initialCostOfBooking: decimal("initial_cost_of_booking", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("25.00"),
    initialBookingLength: smallint("initial_booking_length")
      .notNull()
      .default(60), // in minutes
    bookingLengthIncrements: smallint("booking_length_increments")
      .notNull()
      .default(30), // in minutes
    maxAdvanceBookingDays: smallint("max_advance_booking_days")
      .notNull()
      .default(60), // in days
    sameDayLeadTimeBuffer: smallint("same_day_lead_time_buffer")
      .notNull()
      .default(120), // in minutes
    bufferTime: smallint("buffer_time").notNull().default(10), // in minutes
    timeSlotIncrements: smallint("time_slot_increments").notNull().default(15), // in minutes
    displayUnavailableSlots: boolean("display_unavailable_slots")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    settingsLocationIdIdx: index("settings_location_id_idx").on(
      table.locationId,
    ),
    // timeZoneIdx: index("time_zone_idx").on(table.timeZone),
  }),
);

export const locationSettingsRelations = relations(
  locationSettings,
  ({ one }) => ({
    location: one(locations, {
      fields: [locationSettings.locationId],
      references: [locations.id],
    }),
  }),
);

export const resources = createTable(
  "resources",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    locationId: varchar("location_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 50 }),
    name: varchar("name", { length: 256 }).notNull(),
    status: varchar("status", { length: 50 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    resourcesLocationIdIdx: index("resources_location_id_idx").on(
      table.locationId,
    ),
  }),
);

export const resourcesRelations = relations(resources, ({ one }) => ({
  location: one(locations, {
    fields: [resources.locationId],
    references: [locations.id],
  }),
}));

export const bookings = createTable(
  "bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    locationId: varchar("location_id", { length: 36 }).notNull(),
    customerName: varchar("customer_name", { length: 256 }).notNull(),
    customerEmail: varchar("customer_email", { length: 256 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 50 }).notNull(), // Enum: "ACTIVE", "CANCELLED", "COMPLETED"
    emailReminderSent: boolean("email_reminder_sent").default(false).notNull(),
    // EmailFollowUpSent PHASE 2
    // smsReminderSent PHASE 2
    // smsFollowUpSent PHASE 2
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    locationIdIdx: index("location_id_idx").on(table.locationId),
    // Composite index to search location id, startTime, emailReminderSent and status
    // Used for the reminder cron job
    reminderStatusIdx: index("reminder_status_idx").on(
      table.startTime,
      table.emailReminderSent,
      table.status,
    ),
  }),
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  location: one(locations, {
    fields: [bookings.locationId],
    references: [locations.id],
  }),
  resourceBookings: many(resourceBookings),
}));

export const resourceBookings = createTable(
  "resource_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    bookingId: varchar("booking_id", { length: 36 }).notNull(),
    resourceId: varchar("resource_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    bookingIdIdx: index("booking_id_idx").on(table.bookingId),
    resourceIdIdx: index("resource_id_idx").on(table.resourceId),
    // TODO: Look into composite index of both of the above
  }),
);

export const resourceBookingsRelations = relations(
  resourceBookings,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [resourceBookings.bookingId],
      references: [bookings.id],
    }),
    resource: one(resources, {
      fields: [resourceBookings.resourceId],
      references: [resources.id],
    }),
  }),
);
