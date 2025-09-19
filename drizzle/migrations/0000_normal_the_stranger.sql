CREATE TABLE "price_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category1" varchar(50) NOT NULL,
	"category2" varchar(50),
	"category3" varchar(50),
	"material" varchar(100),
	"thickness" integer,
	"min_hole_diameter" numeric(10, 2),
	"max_hole_diameter" numeric(10, 2),
	"min_holes" integer,
	"max_holes" integer,
	"f25_price" numeric(10, 4),
	"f26_price" numeric(10, 4),
	"f27_price" numeric(10, 4),
	"f28_price" numeric(10, 4),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_number" varchar(50) NOT NULL,
	"old_material_code" varchar(100),
	"sap_material_code" varchar(100),
	"material_description" varchar(200),
	"version_number" varchar(50),
	"processing_content" varchar(200),
	"tube_plate_material" varchar(100),
	"price_year" varchar(10),
	"thickness" integer,
	"length_or_diameter" numeric(10, 2),
	"width" numeric(10, 2),
	"drilling_hole_diameter" numeric(10, 2),
	"drilling_hole_count" integer,
	"drilling_unit_price" numeric(10, 4),
	"thread_category" varchar(50),
	"thread_specification" numeric(10, 2),
	"thread_hole_count" integer,
	"category3" varchar(50),
	"threading_unit_price" numeric(10, 4),
	"grooving_hole_count" integer,
	"grooving_unit_price" numeric(10, 4),
	"total_price" numeric(12, 2),
	"project_name" varchar(200),
	"customer_name" varchar(100),
	"notes" text,
	"status" varchar(20) DEFAULT 'draft',
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quotes_quote_number_unique" UNIQUE("quote_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'admin',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;