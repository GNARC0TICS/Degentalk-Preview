export declare const postReactions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "post_reactions";
    schema: undefined;
    columns: {
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "post_reactions";
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
        postId: import("drizzle-orm/pg-core").PgColumn<{
            name: "post_id";
            tableName: "post_reactions";
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
        reactionType: import("drizzle-orm/pg-core").PgColumn<{
            name: any;
            tableName: "post_reactions";
            dataType: any;
            columnType: any;
            data: any;
            driverParam: any;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: any;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            [x: string]: any;
            [x: number]: any;
            [x: symbol]: any;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "post_reactions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
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
export declare const insertPostReactionSchema: import("zod").ZodObject<Omit<{
    [x: string]: any;
    userId: import("zod").ZodString;
    postId: import("zod").ZodString;
    createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
}, any>, "strip", import("zod").ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}>;
export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;
//# sourceMappingURL=postReactions.d.ts.map