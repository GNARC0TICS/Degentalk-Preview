import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { User } from '@schema';
import { storage } from '../../../storage'; // Will be refactored in a future step
import { 
  comparePasswords, 
  getSessionCookieSettings, 
  createMockUser
} from './services/auth.service';
import { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  verifyEmail, 
  resendVerification 
} from './controllers/auth.controller';
import { 
  isAuthenticated,
  isAuthenticatedOptional,
  isAdmin, 
  isModerator, 
  isAdminOrModerator,
  devModeAuthHandler
} from './middleware/auth.middleware';
import { isDevMode } from '../../utils/environment';

const router = Router();

/**
 * Initialize Passport.js and configure authentication
 */
export function setupAuthPassport(sessionStore: any) {
  // Configure the local strategy for Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // In dev mode, we can bypass the password check
        if (isDevMode() && process.env.DEV_BYPASS_PASSWORD === 'true') {
          const user = await storage.getUserByUsername(username);
          
          if (!user) {
            return done(null, false, { message: "Invalid username or password" });
          }
          
          // Skip password check in dev mode with bypass flag
          console.log('🛠️ DEV MODE: Bypassing password check!');
          
          // Still check other user status fields
          if (user.isBanned) {
            return done(null, false, { message: "Your account has been banned" });
          }
          
          if (!user.isActive) {
            return done(null, false, { message: "Your account is inactive" });
          }
          
          if (user.isDeleted) {
            return done(null, false, { message: "Your account has been deleted" });
          }
          
          return done(null, user);
        }
        
        // Normal authentication flow
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (user.isBanned) {
          return done(null, false, { message: "Your account has been banned" });
        }
        
        if (!user.isActive) {
          return done(null, false, { message: "Your account is inactive" });
        }
        
        if (user.isDeleted) {
          return done(null, false, { message: "Your account has been deleted" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Configure user serialization (for session storage)
  passport.serializeUser((user: any, done) => {
    // Support either 'id' or 'user_id' as field name
    const userId = user.id || user.user_id;
    if (!userId) {
      return done(new Error('User has no id field'), null);
    }
    return done(null, userId);
  });
  
  // Configure user deserialization (retrieving user from session)
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Try to get user from storage
      try {
        const user = await storage.getUser(id);
        if (user) {
          return done(null, user);
        }
      } catch (storageErr) {
        console.log("Storage getUser error:", storageErr);
        // Fall through to direct SQL approach or mock user in dev mode
      }

      // If in development mode, create a mock user
      if (isDevMode()) {
        // Check if there's a dev role stored in session
        const role = (global as any).devRole || 'user';
        const mockUser = createMockUser(id, role as any);
        return done(null, mockUser);
      }
      
      // If we get here, no approach worked
      done(new Error(`User with id ${id} not found`));
    } catch (err) {
      done(err);
    }
  });

  // Return session settings for express-session middleware
  return {
    secret: process.env.SESSION_SECRET || "sonnet-forum-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: getSessionCookieSettings()
  };
}

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', getCurrentUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Dev mode auth switching endpoint
router.get('/dev-mode/set-role', devModeAuthHandler);

// Export middleware for use in other routes
export { 
  isAuthenticated,
  isAuthenticatedOptional,
  isAdmin, 
  isModerator, 
  isAdminOrModerator 
};

export default router; 