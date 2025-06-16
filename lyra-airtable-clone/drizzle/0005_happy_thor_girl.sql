CREATE INDEX "column_table_id_idx" ON "column" USING btree ("tableId");--> statement-breakpoint
CREATE INDEX "row_table_id_idx" ON "row" USING btree ("tableId");--> statement-breakpoint
CREATE INDEX "table_base_id_idx" ON "table" USING btree ("baseId");--> statement-breakpoint
CREATE INDEX "filter_view_id_idx" ON "view_filter" USING btree ("viewId");--> statement-breakpoint
CREATE INDEX "hiddencol_view_id_idx" ON "view_hidden_column" USING btree ("viewId");--> statement-breakpoint
CREATE INDEX "sort_view_id_idx" ON "view_sort" USING btree ("viewId");--> statement-breakpoint
CREATE INDEX "view_table_id_idx" ON "view" USING btree ("tableId");