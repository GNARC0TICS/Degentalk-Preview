export declare const CONTENT_STATUS_CONFIG: {
    readonly draft: {
        readonly color: "gray";
        readonly label: "Draft";
        readonly visibleTo: "author";
    };
    readonly pending_review: {
        readonly color: "orange";
        readonly label: "Pending Review";
        readonly visibleTo: "mods";
    };
    readonly published: {
        readonly color: "green";
        readonly label: "Published";
        readonly visibleTo: "all";
    };
    readonly rejected: {
        readonly color: "red";
        readonly label: "Rejected";
        readonly visibleTo: "author+mods";
    };
    readonly archived: {
        readonly color: "gray";
        readonly label: "Archived";
        readonly visibleTo: "mods+admins";
    };
};
export type ContentStatusKey = keyof typeof CONTENT_STATUS_CONFIG;
