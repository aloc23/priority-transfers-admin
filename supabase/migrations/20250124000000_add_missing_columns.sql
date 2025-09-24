-- Add missing columns to bookings table
ALTER TABLE "public"."bookings" 
ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS "price" numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "pickup_completed" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "return_completed" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "notes" text DEFAULT NULL;

-- Add missing columns to customers table
ALTER TABLE "public"."customers"
ADD COLUMN IF NOT EXISTS "address" text DEFAULT NULL;

-- Update existing bookings to have default values for new columns
UPDATE "public"."bookings" 
SET 
  "type" = 'single' WHERE "type" IS NULL,
  "source" = 'internal' WHERE "source" IS NULL,
  "pickup_completed" = false WHERE "pickup_completed" IS NULL,
  "return_completed" = false WHERE "return_completed" IS NULL;