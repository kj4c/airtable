CREATE TABLE "view_filter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewId" uuid NOT NULL,
	"columnId" uuid NOT NULL,
	"operator" varchar(50) NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "view_hidden_column" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewId" uuid NOT NULL,
	"columnId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "view_sort" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewId" uuid NOT NULL,
	"columnId" uuid NOT NULL,
	"direction" varchar(4) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "view" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "view_filter" ADD CONSTRAINT "view_filter_viewId_view_id_fk" FOREIGN KEY ("viewId") REFERENCES "public"."view"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_filter" ADD CONSTRAINT "view_filter_columnId_column_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."column"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_hidden_column" ADD CONSTRAINT "view_hidden_column_viewId_view_id_fk" FOREIGN KEY ("viewId") REFERENCES "public"."view"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_hidden_column" ADD CONSTRAINT "view_hidden_column_columnId_column_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."column"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_sort" ADD CONSTRAINT "view_sort_viewId_view_id_fk" FOREIGN KEY ("viewId") REFERENCES "public"."view"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "view_sort" ADD CONSTRAINT "view_sort_columnId_column_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."column"("id") ON DELETE no action ON UPDATE no action;