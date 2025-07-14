"use strict";
// Shared constants for the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTENT_STATUS_CONFIG = void 0;
exports.CONTENT_STATUS_CONFIG = {
    draft: { color: 'gray', label: 'Draft', visibleTo: 'author' },
    pending_review: { color: 'orange', label: 'Pending Review', visibleTo: 'mods' },
    published: { color: 'green', label: 'Published', visibleTo: 'all' },
    rejected: { color: 'red', label: 'Rejected', visibleTo: 'author+mods' },
    archived: { color: 'gray', label: 'Archived', visibleTo: 'mods+admins' }
};
// Add other shared constants below as needed
