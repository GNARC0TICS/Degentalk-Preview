import type { ComponentType, LazyExoticComponent } from 'react';
export declare const ADMIN_PERMISSIONS: {
    readonly 'admin.users.view': "View users";
    readonly 'admin.users.manage': "Manage users";
    readonly 'admin.users.delete': "Delete users";
    readonly 'admin.users.bulk': "Bulk user operations";
    readonly 'admin.xp.view': "View XP configuration";
    readonly 'admin.xp.manage': "Manage XP levels and rewards";
    readonly 'admin.xp.grant': "Grant XP to users";
    readonly 'admin.shop.view': "View shop products";
    readonly 'admin.shop.manage': "Manage shop products";
    readonly 'admin.shop.categories': "Manage shop categories";
    readonly 'admin.shop.inventory': "Manage inventory";
    readonly 'admin.wallet.view': "View wallet information";
    readonly 'admin.wallet.manage': "Manage DGT balances";
    readonly 'admin.wallet.transactions': "View transactions";
    readonly 'admin.wallet.grant': "Grant DGT tokens";
    readonly 'admin.wallet.user-wallets.view': "View individual user wallets";
    readonly 'admin.wallet.user-wallets.manage': "Manage individual user wallets (credit/debit crypto/DGT)";
    readonly 'admin.wallet.treasury.view': "View platform treasury balances";
    readonly 'admin.wallet.treasury.manage': "Manage platform treasury (manual transfers)";
    readonly 'admin.forum.view': "View forum structure";
    readonly 'admin.forum.manage': "Manage forums and categories";
    readonly 'admin.forum.moderate': "Moderate content";
    readonly 'admin.reports.view': "View reports";
    readonly 'admin.reports.manage': "Manage reports";
    readonly 'admin.analytics.view': "View analytics";
    readonly 'admin.analytics.export': "Export analytics data";
    readonly 'admin.system.view': "View system settings";
    readonly 'admin.system.manage': "Manage system settings";
    readonly 'admin.system.backup': "Manage backups";
    readonly 'admin.system.audit': "View audit logs";
    readonly 'admin.database.view': "View database tables";
    readonly 'admin.database.edit': "Edit database records";
    readonly 'admin.database.export': "Export database data";
};
export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;
export interface AdminModuleV2 {
    slug: string;
    label: string;
    icon: string;
    permission: AdminPermission;
    component: LazyExoticComponent<ComponentType<any>>;
    path: string;
    children?: AdminModuleV2[];
    disabled?: boolean;
}
export declare const adminModulesV2: AdminModuleV2[];
/**
 * Generate sidebar links in the old `adminLinks` shape ({ label, href, children? })
 */
export declare function generateSidebarLinks(): ({
    label: string;
    children: {
        label: string;
        href: string;
    }[];
    href?: undefined;
} | {
    label: string;
    href: string;
    children?: undefined;
})[];
/**
 * Generate route groups compatible with legacy `adminRouteGroups` typing so we don't break pages while migrating.
 */
export declare function generateAdminRouteGroups(): {
    id: string;
    label: string;
    icon: any;
    permissions: any[];
    routes: {
        path: string;
        label: string;
        icon: any;
        permissions: any[];
    }[];
}[];
/** Map of permission -> module for quick RBAC checks */
export declare const permissionToModuleMap: Record<string, AdminModuleV2>;
