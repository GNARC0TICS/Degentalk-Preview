/**
 * Admin Reports Service
 * 
 * Handles business logic for reports and content moderation.
 */

import { db } from '../../../../core/db';
import {
  users,
  reportedContent,
  contentModerationActions,
  userBans,
  posts,
  threads,
  shoutboxMessages,
  adminAuditLogs
} from '@shared/schema';
import { eq, and, like, ilike, or, desc, sql, asc, inArray } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import type { GetReportsQueryInput, ReportActionInput, BanUserInput, DeleteContentInput } from './reports.validators';

async function getContentPreview(type: string, contentId: number): Promise<string | null> {
  try {
    switch (type) {
      case 'post': {
        const [post] = await db.select({ content: posts.content }).from(posts).where(eq(posts.id, contentId));
        return post?.content || 'Content not found';
      }
      case 'thread': {
        const [thread] = await db.select({ title: threads.title }).from(threads).where(eq(threads.id, contentId));
        return thread?.title || 'Content not found';
      }
      case 'message': {
        const [message] = await db.select({ content: shoutboxMessages.content }).from(shoutboxMessages).where(eq(shoutboxMessages.id, contentId));
        return message?.content || 'Content not found';
      }
      case 'user':
        return 'User profile reported'; // Or fetch user profile snippet
      default:
        return 'Unknown content type';
    }
  } catch (error) {
    console.error(`Error getting content preview for ${type} ${contentId}:`, error);
    return 'Error retrieving content preview';
  }
}

export class AdminReportsService {
  async getReports(params: GetReportsQueryInput) {
    const { page, limit, status, type, search, sortBy, sortOrder } = params;
    const offset = (page - 1) * limit;

    let query = db.select({
        id: reportedContent.id,
        contentType: reportedContent.contentType,
        contentId: reportedContent.contentId,
        reason: reportedContent.reason,
        status: reportedContent.status,
        createdAt: reportedContent.createdAt,
        resolvedAt: reportedContent.resolvedAt,
        reporterId: reportedContent.reporterId,
        reportedUserId: reportedContent.reportedUserId, // User who authored the content
        resolvedById: reportedContent.resolvedById,
        notes: reportedContent.notes,
      })
      .from(reportedContent)
      .leftJoin(users, eq(reportedContent.reportedUserId, users.id)) // Join with users who created the content
      .$dynamic(); // Required for conditional where clauses with Drizzle

    const conditions = [];
    if (status && status !== 'all') {
      conditions.push(eq(reportedContent.status, status));
    }
    if (type && type !== 'all') {
      conditions.push(eq(reportedContent.contentType, type));
    }
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(reportedContent.reason, searchTerm),
          ilike(reportedContent.notes, searchTerm),
          ilike(users.username, searchTerm) // Search by reported user's username
        )
      );
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(reportedContent).leftJoin(users, eq(reportedContent.reportedUserId, users.id)).$dynamic();
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [totalResult] = await countQuery;
    const totalReports = Number(totalResult?.count) || 0;
    
    const sortColumn = sortBy === 'reporter' ? users.username : reportedContent.createdAt; // Example, adapt as needed
    const sortDirection = sortOrder === 'asc' ? asc : desc;

    const reportsData = await query
      .orderBy(sortDirection(sortColumn))
      .limit(limit)
      .offset(offset);

    // Enhance reports with usernames and previews
    const enhancedReports = await Promise.all(reportsData.map(async (report) => {
      let reporterUsername: string | null = null;
      let reportedUsername: string | null = null;
      let resolvedByUsername: string | null = null;

      if(report.reporterId) {
        const [rUser] = await db.select({username: users.username}).from(users).where(eq(users.id, report.reporterId));
        reporterUsername = rUser?.username || 'Unknown';
      }
      if(report.reportedUserId) {
        const [ruUser] = await db.select({username: users.username}).from(users).where(eq(users.id, report.reportedUserId));
        reportedUsername = ruUser?.username || 'System/Unknown';
      }
      if(report.resolvedById) {
        const [resUser] = await db.select({username: users.username}).from(users).where(eq(users.id, report.resolvedById));
        resolvedByUsername = resUser?.username || 'Unknown';
      }

      const preview = await getContentPreview(report.contentType, report.contentId);
      return { ...report, reporterUsername, reportedUsername, resolvedByUsername, contentPreview: preview };
    }));

    return {
      data: enhancedReports,
      pagination: {
        total: totalReports,
        page,
        limit,
        totalPages: Math.ceil(totalReports / limit)
      }
    };
  }

  async getReportById(reportId: number) {
    const [report] = await db.select().from(reportedContent).where(eq(reportedContent.id, reportId));
    if (!report) {
      throw new AdminError('Report not found', 404, AdminErrorCodes.NOT_FOUND);
    }
    
    let reporterUsername: string | null = null;
    let reportedUsername: string | null = null;
    let resolvedByUsername: string | null = null;

    if(report.reporterId) {
      const [rUser] = await db.select({username: users.username}).from(users).where(eq(users.id, report.reporterId));
      reporterUsername = rUser?.username || 'Unknown';
    }
    // reportedUserId might be null if the content itself represents a user report
    if(report.reportedUserId) { 
      const [ruUser] = await db.select({username: users.username}).from(users).where(eq(users.id, report.reportedUserId));
      reportedUsername = ruUser?.username || 'System/Unknown';
    }
    if(report.resolvedById) {
      const [resUser] = await db.select({username: users.username}).from(users).where(eq(users.id, report.resolvedById));
      resolvedByUsername = resUser?.username || 'Unknown';
    }

    const contentPreview = await getContentPreview(report.contentType, report.contentId);
    return { ...report, reporterUsername, reportedUsername, resolvedByUsername, contentPreview };
  }

  async updateReportStatus(reportId: number, newStatus: 'resolved' | 'dismissed', adminUserId: number, notes?: string) {
    const [existingReport] = await db.select().from(reportedContent).where(eq(reportedContent.id, reportId));
    if (!existingReport) {
      throw new AdminError('Report not found', 404, AdminErrorCodes.NOT_FOUND);
    }
    if (existingReport.status !== 'pending') {
      throw new AdminError(`Report is already ${existingReport.status}`, 400, AdminErrorCodes.OPERATION_FAILED);
    }

    const [updatedReport] = await db.update(reportedContent)
      .set({
        status: newStatus,
        resolvedAt: new Date(),
        resolvedById: adminUserId,
        notes: notes || null
      })
      .where(eq(reportedContent.id, reportId))
      .returning();
    
    // Log moderation action
    await db.insert(contentModerationActions).values({
        moderatorId: adminUserId, // Changed from userId to moderatorId
        action: newStatus === 'resolved' ? 'resolve_report' : 'dismiss_report',
        contentType: existingReport.contentType,
        contentId: existingReport.contentId,
        targetUserId: existingReport.reportedUserId, // Assuming reportedUserId is the author of content
        reason: notes || 'No reason provided',
        // reportId: reportId // contentModerationActions might not have reportId, check schema
      });

    return updatedReport;
  }

  async banUser(userIdToBan: number, input: BanUserInput, adminUserId: number) {
    const { reason, duration } = input;
    const [user] = await db.select().from(users).where(eq(users.id, userIdToBan));
    if (!user) {
      throw new AdminError('User to ban not found', 404, AdminErrorCodes.USER_NOT_FOUND);
    }

    const [existingBan] = await db.select().from(userBans)
      .where(and(eq(userBans.userId, userIdToBan), eq(userBans.isActive, true)));
    if (existingBan) {
      throw new AdminError('User is already actively banned', 400, AdminErrorCodes.DUPLICATE_ENTRY);
    }

    let expiresAt: Date | null = null;
    let isPermanent = false;
    if (!duration || duration.toLowerCase() === 'permanent') {
      isPermanent = true;
    } else {
      const match = duration.match(/^(\d+)([dhm])$/i);
      if (!match) throw new AdminError('Invalid ban duration format. Use N[d|h|m] or permanent.', 400, AdminErrorCodes.VALIDATION_ERROR);
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      expiresAt = new Date();
      if (unit === 'd') expiresAt.setDate(expiresAt.getDate() + value);
      else if (unit === 'h') expiresAt.setHours(expiresAt.getHours() + value);
      else if (unit === 'm') expiresAt.setMinutes(expiresAt.getMinutes() + value);
    }

    const [ban] = await db.insert(userBans).values({
      userId: userIdToBan,
      reason,
      bannedBy: adminUserId,
      isActive: true,
      isPermanent,
      expiresAt,
    }).returning();

    await db.update(users).set({ isBanned: true }).where(eq(users.id, userIdToBan));
    
    // Log moderation action
    await db.insert(contentModerationActions).values({
        moderatorId: adminUserId,
        action: 'ban_user',
        targetUserId: userIdToBan,
        reason,
        // details: JSON.stringify({ duration, isPermanent, expiresAt }) // Check schema for details field
      });
    return ban;
  }

  async deleteContent(contentType: 'post' | 'thread' | 'message', contentId: number, input: DeleteContentInput, adminUserId: number) {
    const { reason } = input;
    let contentAuthorId: number | null = null;

    if (contentType === 'post') {
      const [postData] = await db.select({userId: posts.userId}).from(posts).where(eq(posts.id, contentId));
      if(!postData) throw new AdminError('Post not found', 404, AdminErrorCodes.NOT_FOUND);
      contentAuthorId = postData.userId;
      await db.update(posts).set({ 
          isDeleted: true, 
          content: '[Post removed by moderator]', 
          deletedAt: new Date(), 
          deletedBy: adminUserId,
          // deletionReason: reason // Check schema for deletionReason field
        }).where(eq(posts.id, contentId));
    } else if (contentType === 'thread') {
      const [threadData] = await db.select({userId: threads.userId}).from(threads).where(eq(threads.id, contentId));
      if(!threadData) throw new AdminError('Thread not found', 404, AdminErrorCodes.NOT_FOUND);
      contentAuthorId = threadData.userId;
      await db.update(threads).set({ 
          isDeleted: true, 
          title: '[Thread removed by moderator]',
          // content: '[Content removed by moderator]', // Check schema for content field on threads
          deletedAt: new Date(), 
          deletedBy: adminUserId,
          // deletionReason: reason 
        }).where(eq(threads.id, contentId));
    } else if (contentType === 'message') {
      const [msgData] = await db.select({userId: shoutboxMessages.userId}).from(shoutboxMessages).where(eq(shoutboxMessages.id, contentId));
      if(!msgData) throw new AdminError('Shoutbox message not found', 404, AdminErrorCodes.NOT_FOUND);
      contentAuthorId = msgData.userId;
      await db.update(shoutboxMessages).set({ 
          isDeleted: true, 
          content: '[Message removed by moderator]', 
          // deletedAt: new Date(), // Check schema for deletedAt on shoutboxMessages
          // deletedBy: adminUserId,
          // deletionReason: reason 
        }).where(eq(shoutboxMessages.id, contentId));
    } else {
      throw new AdminError('Invalid content type for deletion', 400, AdminErrorCodes.INVALID_REQUEST);
    }
    
    // Log moderation action
    if (contentAuthorId !== null) {
        await db.insert(contentModerationActions).values({
            moderatorId: adminUserId,
            action: `delete_${contentType}`,
            contentType,
            contentId,
            targetUserId: contentAuthorId,
            reason,
          });
    }
    return { success: true, message: `${contentType} deleted successfully.` };
  }
}

export const adminReportsService = new AdminReportsService();
