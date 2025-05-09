import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isSelfOrAdmin } from "./auth";
import { setupWebsocket } from "./websocket";
import * as z from "zod";
import Stripe from "stripe";
import { 
  insertUserSchema, 
  insertJobSchema, 
  insertMessageSchema, 
  insertVerificationSchema,
  jobStatusEnum
} from "@shared/schema";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebsocket(httpServer);
  
  // Setup authentication routes and middleware
  setupAuth(app);
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ==== User routes ====
  
  // Get current user
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Get user by ID
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Exclude sensitive information
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // ==== Job routes ====
  
  // Get all available jobs (for landscapers)
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      let jobs;
      
      // Landscapers see available jobs
      if (req.user!.role === 'landscaper') {
        jobs = await storage.getAvailableJobs();
      } 
      // Admins see all jobs
      else if (req.user!.role === 'admin') {
        jobs = await storage.getAllJobs();
      } 
      // Property owners see jobs they created
      else {
        jobs = await storage.getJobsByOwnerId(req.user!.id);
      }
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // Get a user's active jobs
  app.get("/api/jobs/active", isAuthenticated, async (req, res) => {
    try {
      let activeJobs;
      
      if (req.user!.role === 'landscaper') {
        activeJobs = await storage.getActiveJobsByLandscaperId(req.user!.id);
      } else {
        activeJobs = await storage.getActiveJobsByOwnerId(req.user!.id);
      }
      
      res.json(activeJobs);
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      res.status(500).json({ error: "Failed to fetch active jobs" });
    }
  });

  // Get a user's jobs (both as owner and landscaper)
  app.get("/api/jobs/mine", isAuthenticated, async (req, res) => {
    try {
      let myJobs;
      
      if (req.user!.role === 'landscaper') {
        myJobs = await storage.getJobsByLandscaperId(req.user!.id);
      } else {
        myJobs = await storage.getJobsByOwnerId(req.user!.id);
      }
      
      res.json(myJobs);
    } catch (error) {
      console.error("Error fetching my jobs:", error);
      res.status(500).json({ error: "Failed to fetch my jobs" });
    }
  });

  // Get a specific job
  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    const jobId = parseInt(req.params.id);
    
    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if user is authorized to view this job
      if (req.user!.role !== 'admin' && 
          job.ownerId !== req.user!.id && 
          job.landscaperId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to view this job" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Create a new job
  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    // Only property owners can create jobs
    if (req.user!.role !== 'property_owner') {
      return res.status(403).json({ error: "Only property owners can create jobs" });
    }
    
    try {
      // Validate job data
      const jobData = insertJobSchema.parse({
        ...req.body,
        ownerId: req.user!.id
      });
      
      const newJob = await storage.createJob(jobData);
      res.status(201).json(newJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // Accept a job (for landscapers)
  app.post("/api/jobs/:id/accept", isAuthenticated, async (req, res) => {
    const jobId = parseInt(req.params.id);
    
    // Only landscapers can accept jobs
    if (req.user!.role !== 'landscaper') {
      return res.status(403).json({ error: "Only landscapers can accept jobs" });
    }
    
    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if job is available
      if (job.status !== 'posted') {
        return res.status(400).json({ error: "Job is not available for acceptance" });
      }
      
      const updatedJob = await storage.updateJob(jobId, {
        landscaperId: req.user!.id,
        status: 'accepted'
      });
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error accepting job:", error);
      res.status(500).json({ error: "Failed to accept job" });
    }
  });

  // Mark job as in progress
  app.post("/api/jobs/:id/start", isAuthenticated, async (req, res) => {
    const jobId = parseInt(req.params.id);
    
    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Only the assigned landscaper can start the job
      if (job.landscaperId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to start this job" });
      }
      
      // Check if job is accepted
      if (job.status !== 'accepted') {
        return res.status(400).json({ error: "Job must be accepted before starting" });
      }
      
      const updatedJob = await storage.updateJob(jobId, {
        status: 'in_progress'
      });
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error starting job:", error);
      res.status(500).json({ error: "Failed to start job" });
    }
  });

  // Mark job as complete (requires verification)
  app.post("/api/jobs/:id/complete", isAuthenticated, async (req, res) => {
    const jobId = parseInt(req.params.id);
    
    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Only the assigned landscaper can complete the job
      if (job.landscaperId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to complete this job" });
      }
      
      // Check if job is in progress
      if (job.status !== 'in_progress') {
        return res.status(400).json({ error: "Job must be in progress before completing" });
      }
      
      const updatedJob = await storage.updateJob(jobId, {
        status: 'verification_pending'
      });
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error completing job:", error);
      res.status(500).json({ error: "Failed to complete job" });
    }
  });

  // ==== Message routes ====
  
  // Get messages for a specific job
  app.get("/api/messages/:jobId", isAuthenticated, async (req, res) => {
    const jobId = parseInt(req.params.jobId);
    
    try {
      // Check if user is authorized to view messages for this job
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (req.user!.role !== 'admin' && 
          job.ownerId !== req.user!.id && 
          job.landscaperId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to view messages for this job" });
      }
      
      const messages = await storage.getMessagesByJobId(jobId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Get all user's conversations
  app.get("/api/messages/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user!.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Send a message
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });
      
      // Check if job exists
      const job = await storage.getJob(messageData.jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if user is authorized to send messages for this job
      if (req.user!.role !== 'admin' && 
          job.ownerId !== req.user!.id && 
          job.landscaperId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to send messages for this job" });
      }
      
      // Check if receiver is involved in the job
      if (messageData.receiverId !== job.ownerId && messageData.receiverId !== job.landscaperId) {
        return res.status(400).json({ error: "Receiver must be involved in the job" });
      }
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ==== Verification routes ====
  
  // Submit job verification
  app.post("/api/verifications", isAuthenticated, async (req, res) => {
    // In a real implementation, we would handle file uploads
    // For now, we'll just use the request body
    try {
      const jobId = parseInt(req.body.jobId);
      
      // Check if job exists and user is the landscaper
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (job.landscaperId !== req.user!.id) {
        return res.status(403).json({ error: "Only the assigned landscaper can submit verification" });
      }
      
      // Check if job is in the verification_pending state
      if (job.status !== 'verification_pending') {
        return res.status(400).json({ error: "Job is not awaiting verification" });
      }
      
      // In a real implementation, we would upload the photos to a storage service
      // and store the URLs in the verification object
      const verificationData = {
        jobId,
        beforePhoto: req.body.beforePhoto || "https://example.com/before.jpg",
        afterPhoto: req.body.afterPhoto || "https://example.com/after.jpg",
        status: 'pending'
      };
      
      const verification = await storage.createVerification(verificationData);
      res.status(201).json(verification);
    } catch (error) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ error: "Failed to submit verification" });
    }
  });

  // Get all pending verifications (admin only)
  app.get("/api/verifications", isAdmin, async (req, res) => {
    try {
      const verifications = await storage.getPendingVerifications();
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });

  // Review a verification (admin only)
  app.post("/api/verifications/:id/review", isAdmin, async (req, res) => {
    const verificationId = parseInt(req.params.id);
    const { approved } = req.body;
    
    try {
      const verification = await storage.getVerification(verificationId);
      
      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }
      
      // Update verification status
      const status = approved ? 'approved' : 'rejected';
      const updatedVerification = await storage.updateVerification(verificationId, {
        status,
        adminId: req.user!.id,
        approvedAt: approved ? new Date().toISOString() : undefined
      });
      
      // If approved, update job status and release payment
      if (approved) {
        const job = await storage.getJob(verification.jobId);
        if (job) {
          await storage.updateJob(job.id, { status: 'completed' });
          
          // In a real implementation, this would trigger payment release
          // through Stripe or another payment processor
        }
      }
      
      res.json(updatedVerification);
    } catch (error) {
      console.error("Error reviewing verification:", error);
      res.status(500).json({ error: "Failed to review verification" });
    }
  });

  // ==== Payment routes ====
  
  // Create a payment intent for a job
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.body;
      
      // Verify the job exists and the user is the property owner
      const job = await storage.getJob(parseInt(jobId));
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (job.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Only the property owner can make a payment for this job" });
      }
      
      // Ensure customer has a Stripe customer ID
      let user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create a Stripe customer if the user doesn't have one
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName || user.username,
        });
        
        user = await storage.updateStripeCustomerId(user.id, customer.id);
      }
      
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: job.price, // already in cents
        currency: "cad",
        customer: user.stripeCustomerId,
        metadata: {
          jobId: job.id.toString(),
          propertyOwnerId: job.ownerId.toString(),
          landscaperId: job.landscaperId?.toString() || '',
        },
      });
      
      // Record the payment intent
      await storage.createPayment({
        jobId: job.id,
        amount: job.price,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id
      });
      
      // Return the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  
  // Release payment to landscaper after job is verified
  app.post("/api/release-payment", isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.body;
      
      // Verify the job exists and is completed
      const job = await storage.getJob(parseInt(jobId));
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (job.status !== 'completed') {
        return res.status(400).json({ error: "Job must be completed before releasing payment" });
      }
      
      if (!job.landscaperId) {
        return res.status(400).json({ error: "Job has no assigned landscaper" });
      }
      
      // Get the payment for this job
      const payments = await storage.getPaymentsByJobId(job.id);
      const payment = payments.find(p => p.status === 'escrow');
      
      if (!payment) {
        return res.status(404).json({ error: "No payment in escrow found for this job" });
      }
      
      // Get the landscaper's Stripe Connect account
      const landscaper = await storage.getUser(job.landscaperId);
      
      if (!landscaper || !landscaper.stripeConnectId) {
        return res.status(400).json({ error: "Landscaper does not have a Stripe Connect account" });
      }
      
      // Create a transfer to the landscaper's account
      const transfer = await stripe.transfers.create({
        amount: payment.amount,
        currency: "cad",
        destination: landscaper.stripeConnectId,
        source_transaction: payment.stripePaymentIntentId,
        metadata: {
          jobId: job.id.toString(),
          landscaperId: job.landscaperId.toString(),
        },
      });
      
      // Update the payment status
      await storage.updatePayment(payment.id, {
        status: 'released',
        stripeTransferId: transfer.id
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error releasing payment:", error);
      res.status(500).json({ error: "Failed to release payment" });
    }
  });
  
  // ==== Admin routes ====
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get all jobs (admin only)
  app.get("/api/admin/jobs", isAdmin, async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  return httpServer;
}
