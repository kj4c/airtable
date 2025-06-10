CREATE INDEX "cell_row_idx" ON "cell" USING btree ("rowId");--> statement-breakpoint
CREATE INDEX "cell_column_idx" ON "cell" USING btree ("columnId");