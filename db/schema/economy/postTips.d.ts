export declare const postTips: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "post_tips";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "post_tips";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        postId: import("drizzle-orm/pg-core").PgColumn<{
            name: "post_id";
            tableName: "post_tips";
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
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "post_tips";
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
        amount: import("drizzle-orm/pg-core").PgColumn<{
            name: "amount";
            tableName: "post_tips";
            dataType: "number";
            columnType: "PgBigInt53";
            data: number;
            driverParam: string | number;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "post_tips";
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
export declare const insertPostTipSchema: import("zod").ZodObject<Omit<{
    id: import("zod").ZodOptional<import("zod").ZodString>;
    postId: import("zod").ZodString;
    userId: import("zod").ZodString;
    amount: import("zod").ZodOptional<import("zod").ZodNumber>;
    createdAt: import("zod").ZodOptional<import("zod").ZodDate>;
}, "createdAt" | "id">, "strip", import("zod").ZodTypeAny, {
    userId: string;
    postId: string;
    amount?: number | undefined;
}, {
    userId: string;
    postId: string;
    amount?: number | undefined;
}>;
export type PostTip = typeof postTips.$inferSelect;
//# sourceMappingURL=postTips.d.ts.map