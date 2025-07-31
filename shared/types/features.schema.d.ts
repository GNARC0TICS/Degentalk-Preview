import { z } from 'zod';
/**
 * Feature Flags & Access Control Configuration Schemas
 *
 * Runtime validation for feature gates, access control, and permissions.
 * Enables dynamic feature rollout and granular permission management.
 */
export declare const RolloutStrategySchema: any;
export declare const FeatureFlagSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["core", "experimental", "beta", "premium", "admin"]>;
    rollout: any;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    override: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        environments: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        environments?: Record<string, boolean>;
    }, {
        enabled?: boolean;
        environments?: Record<string, boolean>;
    }>>;
    metadata: z.ZodOptional<z.ZodObject<{
        owner: z.ZodOptional<z.ZodString>;
        jiraTicket: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt?: string;
        updatedAt?: string;
        owner?: string;
        jiraTicket?: string;
    }, {
        createdAt?: string;
        updatedAt?: string;
        owner?: string;
        jiraTicket?: string;
    }>>;
    metrics: z.ZodOptional<z.ZodObject<{
        track: z.ZodDefault<z.ZodBoolean>;
        events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        events?: string[];
        track?: boolean;
    }, {
        events?: string[];
        track?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    description?: string;
    category?: "admin" | "premium" | "core" | "experimental" | "beta";
    override?: {
        enabled?: boolean;
        environments?: Record<string, boolean>;
    };
    metadata?: {
        createdAt?: string;
        updatedAt?: string;
        owner?: string;
        jiraTicket?: string;
    };
    rollout?: any;
    dependencies?: string[];
    metrics?: {
        events?: string[];
        track?: boolean;
    };
}, {
    name?: string;
    id?: string;
    description?: string;
    category?: "admin" | "premium" | "core" | "experimental" | "beta";
    override?: {
        enabled?: boolean;
        environments?: Record<string, boolean>;
    };
    metadata?: {
        createdAt?: string;
        updatedAt?: string;
        owner?: string;
        jiraTicket?: string;
    };
    rollout?: any;
    dependencies?: string[];
    metrics?: {
        events?: string[];
        track?: boolean;
    };
}>;
export declare const PermissionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    resource: z.ZodString;
    action: z.ZodEnum<["create", "read", "update", "delete", "execute", "*"]>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "contains", "greater_than", "less_than", "in", "not_in"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>, "many">]>;
    }, "strip", z.ZodTypeAny, {
        value?: string | number | boolean | (string | number | boolean)[];
        operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
        field?: string;
    }, {
        value?: string | number | boolean | (string | number | boolean)[];
        operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
        field?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    action?: "update" | "create" | "read" | "delete" | "execute" | "*";
    conditions?: {
        value?: string | number | boolean | (string | number | boolean)[];
        operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
        field?: string;
    }[];
    resource?: string;
}, {
    name?: string;
    id?: string;
    action?: "update" | "create" | "read" | "delete" | "execute" | "*";
    conditions?: {
        value?: string | number | boolean | (string | number | boolean)[];
        operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
        field?: string;
    }[];
    resource?: string;
}>;
export declare const RoleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    level: z.ZodNumber;
    permissions: z.ZodArray<z.ZodString, "many">;
    inherits: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limits: z.ZodOptional<z.ZodObject<{
        postsPerDay: z.ZodOptional<z.ZodNumber>;
        threadsPerDay: z.ZodOptional<z.ZodNumber>;
        tipsPerDay: z.ZodOptional<z.ZodNumber>;
        uploadSizeMB: z.ZodOptional<z.ZodNumber>;
        apiRequestsPerHour: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        postsPerDay?: number;
        threadsPerDay?: number;
        tipsPerDay?: number;
        uploadSizeMB?: number;
        apiRequestsPerHour?: number;
    }, {
        postsPerDay?: number;
        threadsPerDay?: number;
        tipsPerDay?: number;
        uploadSizeMB?: number;
        apiRequestsPerHour?: number;
    }>>;
    cosmetics: z.ZodOptional<z.ZodObject<{
        nameColor: z.ZodOptional<z.ZodString>;
        badgeIcon: z.ZodOptional<z.ZodString>;
        specialEffects: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        nameColor?: string;
        badgeIcon?: string;
        specialEffects?: string[];
    }, {
        nameColor?: string;
        badgeIcon?: string;
        specialEffects?: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    description?: string;
    permissions?: string[];
    level?: number;
    features?: string[];
    limits?: {
        postsPerDay?: number;
        threadsPerDay?: number;
        tipsPerDay?: number;
        uploadSizeMB?: number;
        apiRequestsPerHour?: number;
    };
    inherits?: string[];
    cosmetics?: {
        nameColor?: string;
        badgeIcon?: string;
        specialEffects?: string[];
    };
}, {
    name?: string;
    id?: string;
    description?: string;
    permissions?: string[];
    level?: number;
    features?: string[];
    limits?: {
        postsPerDay?: number;
        threadsPerDay?: number;
        tipsPerDay?: number;
        uploadSizeMB?: number;
        apiRequestsPerHour?: number;
    };
    inherits?: string[];
    cosmetics?: {
        nameColor?: string;
        badgeIcon?: string;
        specialEffects?: string[];
    };
}>;
export declare const AccessRuleSchema: z.ZodObject<{
    id: z.ZodString;
    resource: z.ZodString;
    conditions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["level", "role", "permission", "custom"]>;
        operator: z.ZodEnum<["gte", "lte", "equals", "includes", "excludes"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodArray<z.ZodString, "many">]>;
    }, "strip", z.ZodTypeAny, {
        type?: "custom" | "level" | "role" | "permission";
        value?: string | number | string[];
        operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
    }, {
        type?: "custom" | "level" | "role" | "permission";
        value?: string | number | string[];
        operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
    }>, "many">;
    action: z.ZodEnum<["allow", "deny"]>;
    priority: z.ZodDefault<z.ZodNumber>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    message?: string;
    action?: "allow" | "deny";
    priority?: number;
    conditions?: {
        type?: "custom" | "level" | "role" | "permission";
        value?: string | number | string[];
        operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
    }[];
    resource?: string;
}, {
    id?: string;
    message?: string;
    action?: "allow" | "deny";
    priority?: number;
    conditions?: {
        type?: "custom" | "level" | "role" | "permission";
        value?: string | number | string[];
        operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
    }[];
    resource?: string;
}>;
export declare const ForumAccessSchema: z.ZodObject<{
    forumId: z.ZodString;
    view: z.ZodObject<{
        public: z.ZodDefault<z.ZodBoolean>;
        minLevel: z.ZodDefault<z.ZodNumber>;
        requiredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        blockedRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        minLevel?: number;
        public?: boolean;
        requiredRoles?: string[];
        blockedRoles?: string[];
    }, {
        minLevel?: number;
        public?: boolean;
        requiredRoles?: string[];
        blockedRoles?: string[];
    }>;
    post: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        minLevel: z.ZodDefault<z.ZodNumber>;
        requiredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        cooldown: z.ZodDefault<z.ZodNumber>;
        requireEmailVerified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        minLevel?: number;
        enabled?: boolean;
        cooldown?: number;
        requiredRoles?: string[];
        requireEmailVerified?: boolean;
    }, {
        minLevel?: number;
        enabled?: boolean;
        cooldown?: number;
        requiredRoles?: string[];
        requireEmailVerified?: boolean;
    }>;
    moderate: z.ZodObject<{
        requiredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        actions: z.ZodDefault<z.ZodArray<z.ZodEnum<["pin", "lock", "delete", "move", "edit"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
        requiredRoles?: string[];
    }, {
        actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
        requiredRoles?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    post?: {
        minLevel?: number;
        enabled?: boolean;
        cooldown?: number;
        requiredRoles?: string[];
        requireEmailVerified?: boolean;
    };
    forumId?: string;
    view?: {
        minLevel?: number;
        public?: boolean;
        requiredRoles?: string[];
        blockedRoles?: string[];
    };
    moderate?: {
        actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
        requiredRoles?: string[];
    };
}, {
    post?: {
        minLevel?: number;
        enabled?: boolean;
        cooldown?: number;
        requiredRoles?: string[];
        requireEmailVerified?: boolean;
    };
    forumId?: string;
    view?: {
        minLevel?: number;
        public?: boolean;
        requiredRoles?: string[];
        blockedRoles?: string[];
    };
    moderate?: {
        actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
        requiredRoles?: string[];
    };
}>;
export declare const FeaturesConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    flags: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        category: z.ZodEnum<["core", "experimental", "beta", "premium", "admin"]>;
        rollout: any;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        override: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodOptional<z.ZodBoolean>;
            environments: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            environments?: Record<string, boolean>;
        }, {
            enabled?: boolean;
            environments?: Record<string, boolean>;
        }>>;
        metadata: z.ZodOptional<z.ZodObject<{
            owner: z.ZodOptional<z.ZodString>;
            jiraTicket: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            createdAt?: string;
            updatedAt?: string;
            owner?: string;
            jiraTicket?: string;
        }, {
            createdAt?: string;
            updatedAt?: string;
            owner?: string;
            jiraTicket?: string;
        }>>;
        metrics: z.ZodOptional<z.ZodObject<{
            track: z.ZodDefault<z.ZodBoolean>;
            events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            events?: string[];
            track?: boolean;
        }, {
            events?: string[];
            track?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        description?: string;
        category?: "admin" | "premium" | "core" | "experimental" | "beta";
        override?: {
            enabled?: boolean;
            environments?: Record<string, boolean>;
        };
        metadata?: {
            createdAt?: string;
            updatedAt?: string;
            owner?: string;
            jiraTicket?: string;
        };
        rollout?: any;
        dependencies?: string[];
        metrics?: {
            events?: string[];
            track?: boolean;
        };
    }, {
        name?: string;
        id?: string;
        description?: string;
        category?: "admin" | "premium" | "core" | "experimental" | "beta";
        override?: {
            enabled?: boolean;
            environments?: Record<string, boolean>;
        };
        metadata?: {
            createdAt?: string;
            updatedAt?: string;
            owner?: string;
            jiraTicket?: string;
        };
        rollout?: any;
        dependencies?: string[];
        metrics?: {
            events?: string[];
            track?: boolean;
        };
    }>, "many">>;
    permissions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        resource: z.ZodString;
        action: z.ZodEnum<["create", "read", "update", "delete", "execute", "*"]>;
        conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            operator: z.ZodEnum<["equals", "not_equals", "contains", "greater_than", "less_than", "in", "not_in"]>;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>, "many">]>;
        }, "strip", z.ZodTypeAny, {
            value?: string | number | boolean | (string | number | boolean)[];
            operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
            field?: string;
        }, {
            value?: string | number | boolean | (string | number | boolean)[];
            operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
            field?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        action?: "update" | "create" | "read" | "delete" | "execute" | "*";
        conditions?: {
            value?: string | number | boolean | (string | number | boolean)[];
            operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
            field?: string;
        }[];
        resource?: string;
    }, {
        name?: string;
        id?: string;
        action?: "update" | "create" | "read" | "delete" | "execute" | "*";
        conditions?: {
            value?: string | number | boolean | (string | number | boolean)[];
            operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
            field?: string;
        }[];
        resource?: string;
    }>, "many">>;
    roles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        level: z.ZodNumber;
        permissions: z.ZodArray<z.ZodString, "many">;
        inherits: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        limits: z.ZodOptional<z.ZodObject<{
            postsPerDay: z.ZodOptional<z.ZodNumber>;
            threadsPerDay: z.ZodOptional<z.ZodNumber>;
            tipsPerDay: z.ZodOptional<z.ZodNumber>;
            uploadSizeMB: z.ZodOptional<z.ZodNumber>;
            apiRequestsPerHour: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            postsPerDay?: number;
            threadsPerDay?: number;
            tipsPerDay?: number;
            uploadSizeMB?: number;
            apiRequestsPerHour?: number;
        }, {
            postsPerDay?: number;
            threadsPerDay?: number;
            tipsPerDay?: number;
            uploadSizeMB?: number;
            apiRequestsPerHour?: number;
        }>>;
        cosmetics: z.ZodOptional<z.ZodObject<{
            nameColor: z.ZodOptional<z.ZodString>;
            badgeIcon: z.ZodOptional<z.ZodString>;
            specialEffects: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            nameColor?: string;
            badgeIcon?: string;
            specialEffects?: string[];
        }, {
            nameColor?: string;
            badgeIcon?: string;
            specialEffects?: string[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        description?: string;
        permissions?: string[];
        level?: number;
        features?: string[];
        limits?: {
            postsPerDay?: number;
            threadsPerDay?: number;
            tipsPerDay?: number;
            uploadSizeMB?: number;
            apiRequestsPerHour?: number;
        };
        inherits?: string[];
        cosmetics?: {
            nameColor?: string;
            badgeIcon?: string;
            specialEffects?: string[];
        };
    }, {
        name?: string;
        id?: string;
        description?: string;
        permissions?: string[];
        level?: number;
        features?: string[];
        limits?: {
            postsPerDay?: number;
            threadsPerDay?: number;
            tipsPerDay?: number;
            uploadSizeMB?: number;
            apiRequestsPerHour?: number;
        };
        inherits?: string[];
        cosmetics?: {
            nameColor?: string;
            badgeIcon?: string;
            specialEffects?: string[];
        };
    }>, "many">>;
    access: z.ZodObject<{
        rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            resource: z.ZodString;
            conditions: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["level", "role", "permission", "custom"]>;
                operator: z.ZodEnum<["gte", "lte", "equals", "includes", "excludes"]>;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodArray<z.ZodString, "many">]>;
            }, "strip", z.ZodTypeAny, {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }, {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }>, "many">;
            action: z.ZodEnum<["allow", "deny"]>;
            priority: z.ZodDefault<z.ZodNumber>;
            message: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            message?: string;
            action?: "allow" | "deny";
            priority?: number;
            conditions?: {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }[];
            resource?: string;
        }, {
            id?: string;
            message?: string;
            action?: "allow" | "deny";
            priority?: number;
            conditions?: {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }[];
            resource?: string;
        }>, "many">>;
        forums: z.ZodDefault<z.ZodArray<z.ZodObject<{
            forumId: z.ZodString;
            view: z.ZodObject<{
                public: z.ZodDefault<z.ZodBoolean>;
                minLevel: z.ZodDefault<z.ZodNumber>;
                requiredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                blockedRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            }, {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            }>;
            post: z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                minLevel: z.ZodDefault<z.ZodNumber>;
                requiredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                cooldown: z.ZodDefault<z.ZodNumber>;
                requireEmailVerified: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            }, {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            }>;
            moderate: z.ZodObject<{
                requiredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                actions: z.ZodDefault<z.ZodArray<z.ZodEnum<["pin", "lock", "delete", "move", "edit"]>, "many">>;
            }, "strip", z.ZodTypeAny, {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            }, {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            }>;
        }, "strip", z.ZodTypeAny, {
            post?: {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            };
            forumId?: string;
            view?: {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            };
            moderate?: {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            };
        }, {
            post?: {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            };
            forumId?: string;
            view?: {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            };
            moderate?: {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            };
        }>, "many">>;
        defaultPolicy: z.ZodDefault<z.ZodEnum<["allow", "deny"]>>;
    }, "strip", z.ZodTypeAny, {
        rules?: {
            id?: string;
            message?: string;
            action?: "allow" | "deny";
            priority?: number;
            conditions?: {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }[];
            resource?: string;
        }[];
        forums?: {
            post?: {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            };
            forumId?: string;
            view?: {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            };
            moderate?: {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            };
        }[];
        defaultPolicy?: "allow" | "deny";
    }, {
        rules?: {
            id?: string;
            message?: string;
            action?: "allow" | "deny";
            priority?: number;
            conditions?: {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }[];
            resource?: string;
        }[];
        forums?: {
            post?: {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            };
            forumId?: string;
            view?: {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            };
            moderate?: {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            };
        }[];
        defaultPolicy?: "allow" | "deny";
    }>;
    levelGates: z.ZodObject<{
        withdrawals: z.ZodDefault<z.ZodNumber>;
        trading: z.ZodDefault<z.ZodNumber>;
        advancedWallet: z.ZodDefault<z.ZodNumber>;
        createThreads: z.ZodDefault<z.ZodNumber>;
        uploadMedia: z.ZodDefault<z.ZodNumber>;
        customProfile: z.ZodDefault<z.ZodNumber>;
        privateMessages: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        trading?: number;
        withdrawals?: number;
        advancedWallet?: number;
        createThreads?: number;
        uploadMedia?: number;
        customProfile?: number;
        privateMessages?: number;
    }, {
        trading?: number;
        withdrawals?: number;
        advancedWallet?: number;
        createThreads?: number;
        uploadMedia?: number;
        customProfile?: number;
        privateMessages?: number;
    }>;
    rateLimit: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            resource: z.ZodString;
            window: z.ZodNumber;
            limit: z.ZodNumber;
            keyBy: z.ZodDefault<z.ZodEnum<["ip", "userId", "combined"]>>;
            skipRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            message: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            resource?: string;
            window?: number;
            limit?: number;
            keyBy?: "userId" | "combined" | "ip";
            skipRoles?: string[];
        }, {
            message?: string;
            resource?: string;
            window?: number;
            limit?: number;
            keyBy?: "userId" | "combined" | "ip";
            skipRoles?: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        rules?: {
            message?: string;
            resource?: string;
            window?: number;
            limit?: number;
            keyBy?: "userId" | "combined" | "ip";
            skipRoles?: string[];
        }[];
    }, {
        enabled?: boolean;
        rules?: {
            message?: string;
            resource?: string;
            window?: number;
            limit?: number;
            keyBy?: "userId" | "combined" | "ip";
            skipRoles?: string[];
        }[];
    }>;
    experimental: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        features: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        allowList: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        telemetry: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean;
        features?: string[];
        allowList?: string[];
        telemetry?: boolean;
    }, {
        enabled?: boolean;
        features?: string[];
        allowList?: string[];
        telemetry?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    roles?: {
        name?: string;
        id?: string;
        description?: string;
        permissions?: string[];
        level?: number;
        features?: string[];
        limits?: {
            postsPerDay?: number;
            threadsPerDay?: number;
            tipsPerDay?: number;
            uploadSizeMB?: number;
            apiRequestsPerHour?: number;
        };
        inherits?: string[];
        cosmetics?: {
            nameColor?: string;
            badgeIcon?: string;
            specialEffects?: string[];
        };
    }[];
    permissions?: {
        name?: string;
        id?: string;
        action?: "update" | "create" | "read" | "delete" | "execute" | "*";
        conditions?: {
            value?: string | number | boolean | (string | number | boolean)[];
            operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
            field?: string;
        }[];
        resource?: string;
    }[];
    flags?: {
        name?: string;
        id?: string;
        description?: string;
        category?: "admin" | "premium" | "core" | "experimental" | "beta";
        override?: {
            enabled?: boolean;
            environments?: Record<string, boolean>;
        };
        metadata?: {
            createdAt?: string;
            updatedAt?: string;
            owner?: string;
            jiraTicket?: string;
        };
        rollout?: any;
        dependencies?: string[];
        metrics?: {
            events?: string[];
            track?: boolean;
        };
    }[];
    version?: string;
    experimental?: {
        enabled?: boolean;
        features?: string[];
        allowList?: string[];
        telemetry?: boolean;
    };
    access?: {
        rules?: {
            id?: string;
            message?: string;
            action?: "allow" | "deny";
            priority?: number;
            conditions?: {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }[];
            resource?: string;
        }[];
        forums?: {
            post?: {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            };
            forumId?: string;
            view?: {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            };
            moderate?: {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            };
        }[];
        defaultPolicy?: "allow" | "deny";
    };
    levelGates?: {
        trading?: number;
        withdrawals?: number;
        advancedWallet?: number;
        createThreads?: number;
        uploadMedia?: number;
        customProfile?: number;
        privateMessages?: number;
    };
    rateLimit?: {
        enabled?: boolean;
        rules?: {
            message?: string;
            resource?: string;
            window?: number;
            limit?: number;
            keyBy?: "userId" | "combined" | "ip";
            skipRoles?: string[];
        }[];
    };
}, {
    roles?: {
        name?: string;
        id?: string;
        description?: string;
        permissions?: string[];
        level?: number;
        features?: string[];
        limits?: {
            postsPerDay?: number;
            threadsPerDay?: number;
            tipsPerDay?: number;
            uploadSizeMB?: number;
            apiRequestsPerHour?: number;
        };
        inherits?: string[];
        cosmetics?: {
            nameColor?: string;
            badgeIcon?: string;
            specialEffects?: string[];
        };
    }[];
    permissions?: {
        name?: string;
        id?: string;
        action?: "update" | "create" | "read" | "delete" | "execute" | "*";
        conditions?: {
            value?: string | number | boolean | (string | number | boolean)[];
            operator?: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
            field?: string;
        }[];
        resource?: string;
    }[];
    flags?: {
        name?: string;
        id?: string;
        description?: string;
        category?: "admin" | "premium" | "core" | "experimental" | "beta";
        override?: {
            enabled?: boolean;
            environments?: Record<string, boolean>;
        };
        metadata?: {
            createdAt?: string;
            updatedAt?: string;
            owner?: string;
            jiraTicket?: string;
        };
        rollout?: any;
        dependencies?: string[];
        metrics?: {
            events?: string[];
            track?: boolean;
        };
    }[];
    version?: string;
    experimental?: {
        enabled?: boolean;
        features?: string[];
        allowList?: string[];
        telemetry?: boolean;
    };
    access?: {
        rules?: {
            id?: string;
            message?: string;
            action?: "allow" | "deny";
            priority?: number;
            conditions?: {
                type?: "custom" | "level" | "role" | "permission";
                value?: string | number | string[];
                operator?: "includes" | "equals" | "gte" | "lte" | "excludes";
            }[];
            resource?: string;
        }[];
        forums?: {
            post?: {
                minLevel?: number;
                enabled?: boolean;
                cooldown?: number;
                requiredRoles?: string[];
                requireEmailVerified?: boolean;
            };
            forumId?: string;
            view?: {
                minLevel?: number;
                public?: boolean;
                requiredRoles?: string[];
                blockedRoles?: string[];
            };
            moderate?: {
                actions?: ("delete" | "pin" | "lock" | "move" | "edit")[];
                requiredRoles?: string[];
            };
        }[];
        defaultPolicy?: "allow" | "deny";
    };
    levelGates?: {
        trading?: number;
        withdrawals?: number;
        advancedWallet?: number;
        createThreads?: number;
        uploadMedia?: number;
        customProfile?: number;
        privateMessages?: number;
    };
    rateLimit?: {
        enabled?: boolean;
        rules?: {
            message?: string;
            resource?: string;
            window?: number;
            limit?: number;
            keyBy?: "userId" | "combined" | "ip";
            skipRoles?: string[];
        }[];
    };
}>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type RolloutStrategy = z.infer<typeof RolloutStrategySchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type AccessRule = z.infer<typeof AccessRuleSchema>;
export type ForumAccess = z.infer<typeof ForumAccessSchema>;
export declare function validateFeaturesConfig(config: unknown): FeaturesConfig;
export declare function validatePartialFeaturesConfig(config: unknown): Partial<FeaturesConfig>;
export declare const defaultFeaturesConfig: Partial<FeaturesConfig>;
export declare function evaluateFeatureFlag(flag: FeatureFlag, context: {
    userId?: string;
    userLevel?: number;
    userRole?: string;
    timestamp?: Date;
}): boolean;
