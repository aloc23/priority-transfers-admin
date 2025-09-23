
\restrict nMkUuB9q8TYCIicwU3PAtqupqzUgUQJUf8b0IVqpSIy659zMJcC2i2pQVpTFH0o


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "driver_id" "uuid",
    "vehicle_id" "uuid",
    "customer_id" "uuid",
    "pickup" "text",
    "dropoff" "text",
    "scheduled_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."bookings" REPLICA IDENTITY FULL;


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "status" "text" DEFAULT 'active'::"text",
    "total_bookings" integer DEFAULT 0,
    "total_spent" numeric DEFAULT 0,
    "last_booking" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."customers" REPLICA IDENTITY FULL;


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drivers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "status" "text" DEFAULT 'available'::"text",
    "rating" numeric DEFAULT 0,
    "user_id" "uuid",
    "license_number" "text",
    "experience" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."drivers" REPLICA IDENTITY FULL;


ALTER TABLE "public"."drivers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text",
    "amount" numeric NOT NULL,
    "vendor" "text",
    "notes" "text",
    "expense_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "partner_id" "uuid",
    "vehicle_id" "uuid",
    "driver_id" "uuid",
    "booking_id" "uuid"
);

ALTER TABLE ONLY "public"."expenses" REPLICA IDENTITY FULL;


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."income" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source" "text",
    "booking_id" "uuid",
    "customer_id" "uuid",
    "amount" numeric NOT NULL,
    "income_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category" "text",
    "type" "text",
    "driver_id" "uuid",
    "vehicle_id" "uuid",
    "partner_id" "uuid"
);

ALTER TABLE ONLY "public"."income" REPLICA IDENTITY FULL;


ALTER TABLE "public"."income" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid",
    "user_id" "uuid",
    "customer_id" "uuid",
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text",
    "status" "text" DEFAULT 'unpaid'::"text",
    "issued_at" timestamp with time zone DEFAULT "now"(),
    "due_date" timestamp with time zone,
    "paid_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."invoices" REPLICA IDENTITY FULL;


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_email" "text",
    "phone" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "contact" "text",
    "email" "text",
    "status" "text" DEFAULT 'active'::"text",
    "rating" numeric DEFAULT 0,
    "address" "text",
    "completed_bookings" integer DEFAULT 0,
    "total_revenue" numeric DEFAULT 0,
    "commission_rate" numeric DEFAULT 0,
    "payment_terms" "text",
    "contract_start" "date",
    "contract_end" "date",
    "contact_person" "text"
);

ALTER TABLE ONLY "public"."partners" REPLICA IDENTITY FULL;


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "role" "text" DEFAULT 'user'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);

ALTER TABLE ONLY "public"."profiles" REPLICA IDENTITY FULL;


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_configurator" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "fuel_type" "text",
    "fuel_cost" numeric DEFAULT 0,
    "insurance_cost" numeric DEFAULT 0,
    "maintenance_cost" numeric DEFAULT 0,
    "depreciation_cost" numeric DEFAULT 0,
    "service_cost" numeric DEFAULT 0,
    "tax_cost" numeric DEFAULT 0,
    "lease_cost" numeric DEFAULT 0,
    "other_costs" numeric DEFAULT 0,
    "total_running_cost" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."vehicle_configurator" REPLICA IDENTITY FULL;


ALTER TABLE "public"."vehicle_configurator" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "driver_id" "uuid",
    "make" "text",
    "model" "text",
    "plate_number" "text",
    "capacity" integer,
    "year" integer,
    "status" "text" DEFAULT 'available'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."vehicles" REPLICA IDENTITY FULL;


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."recent_activity" WITH ("security_invoker"='on') AS
 SELECT 'bookings'::"text" AS "table_name",
    ("bookings"."id")::"text" AS "row_id",
    "bookings"."created_at" AS "at"
   FROM "public"."bookings"
UNION ALL
 SELECT 'customers'::"text" AS "table_name",
    ("customers"."id")::"text" AS "row_id",
    "customers"."created_at" AS "at"
   FROM "public"."customers"
UNION ALL
 SELECT 'vehicles'::"text" AS "table_name",
    ("vehicles"."id")::"text" AS "row_id",
    "vehicles"."created_at" AS "at"
   FROM "public"."vehicles"
UNION ALL
 SELECT 'partners'::"text" AS "table_name",
    ("partners"."id")::"text" AS "row_id",
    "partners"."created_at" AS "at"
   FROM "public"."partners"
UNION ALL
 SELECT 'expenses'::"text" AS "table_name",
    ("expenses"."id")::"text" AS "row_id",
    "expenses"."created_at" AS "at"
   FROM "public"."expenses"
UNION ALL
 SELECT 'income'::"text" AS "table_name",
    ("income"."id")::"text" AS "row_id",
    "income"."created_at" AS "at"
   FROM "public"."income"
UNION ALL
 SELECT 'invoices'::"text" AS "table_name",
    ("invoices"."id")::"text" AS "row_id",
    "invoices"."issued_at" AS "at"
   FROM "public"."invoices"
UNION ALL
 SELECT 'vehicle_configurator'::"text" AS "table_name",
    ("vehicle_configurator"."id")::"text" AS "row_id",
    "vehicle_configurator"."created_at" AS "at"
   FROM "public"."vehicle_configurator"
UNION ALL
 SELECT 'profiles'::"text" AS "table_name",
    ("profiles"."id")::"text" AS "row_id",
    "profiles"."created_at" AS "at"
   FROM "public"."profiles"
UNION ALL
 SELECT 'user_settings'::"text" AS "table_name",
    ("user_settings"."id")::"text" AS "row_id",
    "user_settings"."updated_at" AS "at"
   FROM "public"."user_settings"
UNION ALL
 SELECT 'drivers'::"text" AS "table_name",
    ("drivers"."id")::"text" AS "row_id",
    "drivers"."updated_at" AS "at"
   FROM "public"."drivers";


ALTER VIEW "public"."recent_activity" OWNER TO "postgres";


ALTER TABLE "public"."user_settings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drivers"
    ADD CONSTRAINT "drivers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."drivers"
    ADD CONSTRAINT "drivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."vehicle_configurator"
    ADD CONSTRAINT "vehicle_configurator_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_plate_number_key" UNIQUE ("plate_number");



CREATE INDEX "idx_bookings_created_at" ON "public"."bookings" USING "btree" ("created_at");



CREATE INDEX "idx_bookings_customer_id" ON "public"."bookings" USING "btree" ("customer_id");



CREATE INDEX "idx_bookings_driver_id" ON "public"."bookings" USING "btree" ("driver_id");



CREATE INDEX "idx_bookings_user_id" ON "public"."bookings" USING "btree" ("user_id");



CREATE INDEX "idx_bookings_vehicle_id" ON "public"."bookings" USING "btree" ("vehicle_id");



CREATE INDEX "idx_customers_created_at" ON "public"."customers" USING "btree" ("created_at");



CREATE INDEX "idx_drivers_updated_at" ON "public"."drivers" USING "btree" ("updated_at");



CREATE INDEX "idx_drivers_user_id" ON "public"."drivers" USING "btree" ("user_id");



CREATE INDEX "idx_expenses_booking_id" ON "public"."expenses" USING "btree" ("booking_id");



CREATE INDEX "idx_expenses_created_at" ON "public"."expenses" USING "btree" ("created_at");



CREATE INDEX "idx_expenses_driver_id" ON "public"."expenses" USING "btree" ("driver_id");



CREATE INDEX "idx_expenses_partner_id" ON "public"."expenses" USING "btree" ("partner_id");



CREATE INDEX "idx_expenses_vehicle_id" ON "public"."expenses" USING "btree" ("vehicle_id");



CREATE INDEX "idx_income_booking_id" ON "public"."income" USING "btree" ("booking_id");



CREATE INDEX "idx_income_created_at" ON "public"."income" USING "btree" ("created_at");



CREATE INDEX "idx_income_customer_id" ON "public"."income" USING "btree" ("customer_id");



CREATE INDEX "idx_income_driver_id" ON "public"."income" USING "btree" ("driver_id");



CREATE INDEX "idx_income_partner_id" ON "public"."income" USING "btree" ("partner_id");



CREATE INDEX "idx_income_vehicle_id" ON "public"."income" USING "btree" ("vehicle_id");



CREATE INDEX "idx_invoices_booking_id" ON "public"."invoices" USING "btree" ("booking_id");



CREATE INDEX "idx_invoices_customer_id" ON "public"."invoices" USING "btree" ("customer_id");



CREATE INDEX "idx_invoices_issued_at" ON "public"."invoices" USING "btree" ("issued_at");



CREATE INDEX "idx_invoices_user_id" ON "public"."invoices" USING "btree" ("user_id");



CREATE INDEX "idx_partners_created_at" ON "public"."partners" USING "btree" ("created_at");



CREATE INDEX "idx_profiles_created_at" ON "public"."profiles" USING "btree" ("created_at");



CREATE INDEX "idx_user_settings_updated_at" ON "public"."user_settings" USING "btree" ("updated_at");



CREATE INDEX "idx_user_settings_user_id" ON "public"."user_settings" USING "btree" ("user_id");



CREATE INDEX "idx_vehicle_configurator_created_at" ON "public"."vehicle_configurator" USING "btree" ("created_at");



CREATE INDEX "idx_vehicle_configurator_vehicle_id" ON "public"."vehicle_configurator" USING "btree" ("vehicle_id");



CREATE INDEX "idx_vehicles_created_at" ON "public"."vehicles" USING "btree" ("created_at");



CREATE INDEX "idx_vehicles_driver_id" ON "public"."vehicles" USING "btree" ("driver_id");



CREATE OR REPLACE TRIGGER "trg_drivers_set_updated_at" BEFORE UPDATE ON "public"."drivers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."drivers"
    ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicle_configurator"
    ADD CONSTRAINT "vehicle_configurator_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id");



CREATE POLICY "Admin delete" ON "public"."bookings" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."customers" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."drivers" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."expenses" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."income" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."invoices" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."partners" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."profiles" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."user_settings" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."vehicle_configurator" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin delete" ON "public"."vehicles" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."bookings" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."customers" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."drivers" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."expenses" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."income" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."invoices" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."partners" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."vehicle_configurator" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full delete v2" ON "public"."vehicles" FOR DELETE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."drivers" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."income" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."partners" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."vehicle_configurator" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full insert v2" ON "public"."vehicles" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."bookings" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."customers" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."drivers" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."expenses" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."income" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."invoices" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."partners" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."vehicle_configurator" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full select v2" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."bookings" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."customers" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."drivers" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."expenses" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."income" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."invoices" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."partners" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."vehicle_configurator" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin full update v2" ON "public"."vehicles" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."drivers" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."income" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."partners" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."user_settings" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."vehicle_configurator" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert" ON "public"."vehicles" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin read" ON "public"."profiles" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."bookings" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."customers" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."drivers" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."expenses" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."income" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."invoices" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."partners" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."user_settings" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."vehicle_configurator" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin select" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."bookings" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."customers" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."drivers" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."expenses" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."income" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."invoices" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."partners" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."user_settings" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."vehicle_configurator" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update" ON "public"."vehicles" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin write" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "All users delete" ON "public"."bookings" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."customers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."drivers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."expenses" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."income" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."invoices" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."partners" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."vehicle_configurator" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users delete" ON "public"."vehicles" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "All users insert" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."drivers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."income" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."partners" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."vehicle_configurator" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users insert" ON "public"."vehicles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "All users select" ON "public"."bookings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."customers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."drivers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."income" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."invoices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."partners" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."vehicle_configurator" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users select" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All users update" ON "public"."bookings" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."customers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."drivers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."expenses" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."income" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."invoices" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."partners" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."vehicle_configurator" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All users update" ON "public"."vehicles" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."drivers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."income" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert (auth)" ON "public"."vehicles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Read all (auth)" ON "public"."bookings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."customers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."drivers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."income" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."invoices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read all (auth)" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."bookings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."customers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."drivers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."income" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."invoices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select (auth)" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Self delete" ON "public"."user_settings" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Self insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Self insert" ON "public"."user_settings" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Self read" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Self read" ON "public"."user_settings" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Self update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Self update" ON "public"."user_settings" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "admin_full_access_bookings" ON "public"."bookings" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_customers" ON "public"."customers" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_drivers" ON "public"."drivers" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_expenses" ON "public"."expenses" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_income" ON "public"."income" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_invoices" ON "public"."invoices" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_partners" ON "public"."partners" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_vehicle_configurator" ON "public"."vehicle_configurator" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_full_access_vehicles" ON "public"."vehicles" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admins bookings full" ON "public"."bookings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins customers full" ON "public"."customers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins drivers full" ON "public"."drivers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins expenses full" ON "public"."expenses" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins income full" ON "public"."income" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins invoices full" ON "public"."invoices" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins partners full" ON "public"."partners" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins vehicle_configurator full" ON "public"."vehicle_configurator" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "admins vehicles full" ON "public"."vehicles" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK (true);



CREATE POLICY "allow auth delete v3" ON "public"."bookings" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."customers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."drivers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."expenses" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."income" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."invoices" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."partners" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."vehicle_configurator" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth delete v3" ON "public"."vehicles" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow auth insert v3" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."drivers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."income" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."partners" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."vehicle_configurator" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth insert v3" ON "public"."vehicles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow auth select v3" ON "public"."bookings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."customers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."drivers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."income" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."invoices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."partners" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."vehicle_configurator" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth select v3" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow auth update v3" ON "public"."bookings" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."customers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."drivers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."expenses" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."income" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."invoices" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."partners" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."vehicle_configurator" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow auth update v3" ON "public"."vehicles" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."income" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_configurator" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."bookings";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."customers";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."drivers";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."expenses";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."income";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."invoices";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."partners";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."vehicle_configurator";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."vehicles";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."drivers" TO "anon";
GRANT ALL ON TABLE "public"."drivers" TO "authenticated";
GRANT ALL ON TABLE "public"."drivers" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."income" TO "anon";
GRANT ALL ON TABLE "public"."income" TO "authenticated";
GRANT ALL ON TABLE "public"."income" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_configurator" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_configurator" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_configurator" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";



GRANT ALL ON TABLE "public"."recent_activity" TO "anon";
GRANT ALL ON TABLE "public"."recent_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_activity" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_settings_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























\unrestrict nMkUuB9q8TYCIicwU3PAtqupqzUgUQJUf8b0IVqpSIy659zMJcC2i2pQVpTFH0o

RESET ALL;
