CREATE TABLE IF NOT EXISTS "beesly_bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"location_id" varchar(36) NOT NULL,
	"customer_name" varchar(256) NOT NULL,
	"customer_email" varchar(256) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"total_cost" numeric(10, 2),
	"tax_amount" numeric(10, 2),
	"status" varchar(50) NOT NULL,
	"email_reminder_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beesly_location_settings" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"location_id" varchar(256) NOT NULL,
	"daily_availability" json NOT NULL,
	"tax_settings" numeric(10, 2) DEFAULT '12.50' NOT NULL,
	"initial_cost_of_booking" numeric(10, 2) DEFAULT '25.00' NOT NULL,
	"initial_booking_length" smallint DEFAULT 60 NOT NULL,
	"booking_length_increments" smallint DEFAULT 30 NOT NULL,
	"max_advance_booking_days" smallint DEFAULT 60 NOT NULL,
	"same_day_lead_time_buffer" smallint DEFAULT 120 NOT NULL,
	"buffer_time" smallint DEFAULT 10 NOT NULL,
	"time_slot_increments" smallint DEFAULT 15 NOT NULL,
	"display_unavailable_slots" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beesly_locations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"owner_id" varchar(36) NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"type" varchar(50),
	"phone" varchar(30),
	"email" varchar(100),
	"website" varchar(256),
	"street_address" varchar(256),
	"city" varchar(100),
	"state" varchar(30),
	"zip_code" varchar(20),
	"country" varchar(100),
	"timezone" varchar(256) NOT NULL,
	"logo" varchar(2048),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "beesly_locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beesly_resource_bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"resource_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beesly_resources" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"location_id" varchar(36) NOT NULL,
	"type" varchar(50),
	"name" varchar(256) NOT NULL,
	"status" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beesly_users" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"email" varchar(256),
	"username" varchar(256),
	"display_name" varchar(256),
	"user_image" varchar(2048),
	"onboarded" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" varchar(256),
	"stripe_subscription_id" varchar(256),
	"stripe_price_id" varchar(256),
	"stripe_current_period_end" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "beesly_users_email_unique" UNIQUE("email"),
	CONSTRAINT "beesly_users_username_unique" UNIQUE("username"),
	CONSTRAINT "beesly_users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "beesly_users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_id_idx" ON "beesly_bookings" ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reminder_status_idx" ON "beesly_bookings" ("start_time","email_reminder_sent","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "settings_location_id_idx" ON "beesly_location_settings" ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "owner_id_idx" ON "beesly_locations" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "slug_idx" ON "beesly_locations" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_id_idx" ON "beesly_resource_bookings" ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resource_id_idx" ON "beesly_resource_bookings" ("resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resources_location_id_idx" ON "beesly_resources" ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "beesly_users" ("email");