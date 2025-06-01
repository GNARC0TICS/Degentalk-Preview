import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import passport from "passport";
import { User, insertUserSchema } from "@shared/schema";
import { storage } from "../../../../storage"; // Will be refactored in a future step
import { hashPassword, storeTempDevMetadata, verifyEmailToken } from "../services/auth.service";
import { isDevMode } from "../../../utils/environment";

/**
 * Handle user registration
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate registration data
    const registerSchema = insertUserSchema.extend({
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

    const validatedData = registerSchema.parse(req.body);
    const { confirmPassword, ...userData } = validatedData as any;

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Store temporary dev metadata if beta tools are enabled
    const tempDevMetadata = await storeTempDevMetadata(userData.password);

    // Create the user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: await hashPassword(userData.password),
      tempDevMeta: tempDevMetadata,
      isActive: isDevMode() ? true : false // Automatically active in dev mode
    });

    // Create default settings for the new user
    try {
      // Import the settings service
      const { createDefaultSettings } = await import('../../../domains/settings/settings.service');
      await createDefaultSettings(user.id);
    } catch (settingsError) {
      console.error('Error creating default user settings:', settingsError);
      // Continue with registration even if settings creation fails
    }

    // In dev mode, we skip verification
    if (isDevMode()) {
      return res.status(201).json({
        message: "Registration successful in development mode. User is automatically activated.",
        devMode: true
      });
    }

    // Generate verification token
    const verificationToken = randomBytes(20).toString('hex');
    // Store token in database (replace with secure token storage later)
    await storage.storeVerificationToken(user.id, verificationToken);

    // Send verification email (replace with actual email sending logic)
    console.log(`Verification email sent to ${userData.email} with token: ${verificationToken}`);

    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors
      });
    }
    next(err);
  }
}

/**
 * Handle user login
 */
export function login(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: Error, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Authentication failed" });
    }
    
    req.login(user, (err) => {
      if (err) return next(err);
      
      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;
      
      res.status(200).json(userResponse);
    });
  })(req, res, next);
}

/**
 * Handle user logout
 */
export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
}

/**
 * Get current user profile
 */
export function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  // Remove password from response
  const userResponse = { ...req.user as any };
  delete userResponse.password;
  
  res.json(userResponse);
}

/**
 * Handle email verification
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Invalid verification token" });
    }
    
    // Find and validate token
    const isValid = await verifyEmailToken(token);
    
    if (!isValid) {
      return res.status(400).json({ 
        message: "Invalid or expired verification token. Please request a new one." 
      });
    }
    
    // Activate the user account
    const userId = isValid.userId;
    await storage.updateUser(userId, { isActive: true });
    
    return res.status(200).json({ 
      message: "Email verified successfully. You can now log in to your account." 
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Resend verification email
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return res.status(200).json({ 
        message: "If your email exists in our system, you will receive a verification email shortly." 
      });
    }
    
    // Check if account is already active
    if (user.isActive) {
      return res.status(400).json({ 
        message: "This account is already active. Please try logging in." 
      });
    }
    
    // Generate new verification token
    const verificationToken = randomBytes(20).toString('hex');
    
    // Store the new token
    await storage.storeVerificationToken(user.id, verificationToken);
    
    // Send verification email (replace with actual email sending logic)
    console.log(`Verification email re-sent to ${email} with token: ${verificationToken}`);
    
    res.status(200).json({ 
      message: "If your email exists in our system, you will receive a verification email shortly." 
    });
  } catch (err) {
    next(err);
  }
} 