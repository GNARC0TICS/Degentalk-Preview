export declare const threadTags: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "thread_tags";
    schema: undefined;
    columns: {
        threadId: import("drizzle-orm/pg-core").PgColumn<{
            name: "thread_id";
            tableName: "thread_tags";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        tagId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tag_id";
            tableName: "thread_tags";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type ThreadTag = typeof threadTags.$inferSelect;
export type InsertThreadTag = typeof threadTags.$inferInsert;
//# sourceMappingURL=threadTags.d.ts.map