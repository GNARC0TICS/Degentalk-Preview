import { Request, Response } from 'express';
import { z } from 'zod';
import { insertAnnouncementSchema } from '@shared/schema';
import {
  getActiveAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deactivateAnnouncement
} from '../services/announcements.service';

/**
 * Helper function to get user ID from req.user, handling both id and user_id formats
 */
function getUserId(req: Request): number {
  return (req.user as any)?.id || (req.user as any)?.user_id || 0;
}

/**
 * Controller for fetching active announcements (public endpoint)
 */
export async function getAnnouncementsController(req: Request, res: Response) {
  try {
    const isTicker = req.query.ticker === 'true';
    const userRole = req.user?.role || 'guest';
    const userId = getUserId(req);
    
    const announcements = await getActiveAnnouncements({
      tickerOnly: isTicker,
      userRole,
      userId,
      limit: 10
    });
    
    return res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Controller for fetching all announcements (admin endpoint)
 */
export async function getAllAnnouncementsController(req: Request, res: Response) {
  try {
    const announcements = await getAllAnnouncements();
    return res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Controller for getting a single announcement (admin endpoint)
 */
export async function getAnnouncementByIdController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    const announcement = await getAnnouncementById(id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    return res.status(200).json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Controller for creating a new announcement (admin endpoint)
 */
export async function createAnnouncementController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate input against schema
    const validatedData = insertAnnouncementSchema.parse({
      ...req.body,
      createdBy: getUserId(req)
    });
    
    const newAnnouncement = await createAnnouncement(validatedData);
    return res.status(201).json(newAnnouncement);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid announcement data', errors: error.errors });
    }
    console.error('Error creating announcement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Controller for updating an announcement (admin endpoint)
 */
export async function updateAnnouncementController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    // First check if the announcement exists
    const existingAnnouncement = await getAnnouncementById(id);
    
    if (!existingAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Update the announcement
    const updatedAnnouncement = await updateAnnouncement(id, req.body);
    
    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Controller for deactivating an announcement (admin endpoint)
 */
export async function deactivateAnnouncementController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    const deactivatedAnnouncement = await deactivateAnnouncement(id);
    
    if (!deactivatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    return res.status(200).json({ message: 'Announcement deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating announcement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 