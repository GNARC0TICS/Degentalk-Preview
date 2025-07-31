/**
 * Forum Status Enums
 * Shared across client/server/db layers
 */
export var ThreadStatus;
(function (ThreadStatus) {
    ThreadStatus["DRAFT"] = "draft";
    ThreadStatus["PUBLISHED"] = "published";
    ThreadStatus["HIDDEN"] = "hidden";
    ThreadStatus["SHADOWBANNED"] = "shadowbanned";
    ThreadStatus["ARCHIVED"] = "archived";
    ThreadStatus["DELETED"] = "deleted";
})(ThreadStatus || (ThreadStatus = {}));
export var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "draft";
    PostStatus["PUBLISHED"] = "published";
    PostStatus["HIDDEN"] = "hidden";
    PostStatus["SHADOWBANNED"] = "shadowbanned";
    PostStatus["ARCHIVED"] = "archived";
    PostStatus["DELETED"] = "deleted";
})(PostStatus || (PostStatus = {}));
