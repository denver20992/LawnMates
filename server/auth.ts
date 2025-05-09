import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { insertUserSchema, User } from "@shared/schema";
import * as z from "zod";
import MemoryStore from "memorystore";

// Augment the Express Request type to include our user
declare global {
  namespace Express {
    interface User extends Omit<User, "password"> {}
  }
}

// Setup authentication middleware and routes
export function setupAuth(app: Express): void {
  // Initialize session middleware
  const SessionStore = MemoryStore(session);
  
  app.use(
    session({
      cookie: {
        maxAge: 86400000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "lawnmates-default-secret",
    })
  );
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        // In a real application, you would use a proper password hashing library
        // like bcrypt to compare the password
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Remove password from the user object before serializing
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        return done(null, false);
      }
      
      // Remove password from the user object
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
  
  // Authentication routes
  
  // Login route
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.json(user);
      });
    })(req, res, next);
  });
  
  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate user data
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create the user
      const newUser = await storage.createUser(userData);
      
      // Remove password from the response
      const { password, ...userWithoutPassword } = newUser;
      
      // Log in the new user
      req.logIn(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error during registration" });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      
      res.json({ message: "Logged out successfully" });
    });
  });
}

// Middleware to check if a user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if a user is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  
  res.status(403).json({ message: "Forbidden" });
}

// Middleware to check if a user is accessing their own resource or is an admin
export function isSelfOrAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated() && req.user) {
    const userId = parseInt(req.params.id);
    
    if (req.user.id === userId || req.user.role === "admin") {
      return next();
    }
  }
  
  res.status(403).json({ message: "Forbidden" });
}
