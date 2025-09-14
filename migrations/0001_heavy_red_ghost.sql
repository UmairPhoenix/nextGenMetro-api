CREATE TYPE "public"."service" AS ENUM('Orange', 'Speedo', 'Metro');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('STARTED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "fares" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" "service" NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "routes" RENAME COLUMN "category" TO "service";--> statement-breakpoint
DROP INDEX "users_uid_idx";--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "fare" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "fare" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "service" SET DATA TYPE "public"."service" USING "service"::"public"."service";--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "start_city" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "end_city" varchar(120) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "fares_service_unique_idx" ON "fares" USING btree ("service");--> statement-breakpoint
CREATE UNIQUE INDEX "routes_unique_service_start_end_idx" ON "routes" USING btree ("service","start","end");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "nfc_uid";