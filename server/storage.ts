import { 
  users, type User, type InsertUser,
  jobs, type Job, type InsertJob,
  properties, type Property, type InsertProperty,
  messages, type Message, type InsertMessage,
  payments, type Payment, type InsertPayment,
  verifications, type Verification, type InsertVerification,
  reviews, type Review, type InsertReview,
  favorites, type Favorite, type InsertFavorite,
  referrals, type Referral, type InsertReferral
} from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq, and, or, sql } from 'drizzle-orm';

// Database connection setup
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

// Modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByOwnerId(ownerId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  getJobsByOwnerId(ownerId: number): Promise<Job[]>;
  getJobsByLandscaperId(landscaperId: number): Promise<Job[]>;
  getActiveJobsByOwnerId(ownerId: number): Promise<Job[]>;
  getActiveJobsByLandscaperId(landscaperId: number): Promise<Job[]>;
  getAvailableJobs(): Promise<Job[]>;
  getAllJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, jobData: Partial<Job>): Promise<Job>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByJobId(jobId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByJobId(jobId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment>;
  
  // Verification methods
  getVerification(id: number): Promise<Verification | undefined>;
  getVerificationsByJobId(jobId: number): Promise<Verification[]>;
  getPendingVerifications(): Promise<Verification[]>;
  createVerification(verification: InsertVerification): Promise<Verification>;
  updateVerification(id: number, verificationData: Partial<Verification>): Promise<Verification>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByJobId(jobId: number): Promise<Review[]>;
  getReviewsByRevieweeId(revieweeId: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Favorite methods
  getFavorite(id: number): Promise<Favorite | undefined>;
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
  
  // Referral methods
  getReferral(id: number): Promise<Referral | undefined>;
  getReferralsByInviterId(inviterId: number): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  
  // Other methods
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private propertiesStore: Map<number, Property>;
  private jobsStore: Map<number, Job>;
  private messagesStore: Map<number, Message>;
  private paymentsStore: Map<number, Payment>;
  private verificationsStore: Map<number, Verification>;
  private reviewsStore: Map<number, Review>;
  private favoritesStore: Map<number, Favorite>;
  private referralsStore: Map<number, Referral>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private jobIdCounter: number;
  private messageIdCounter: number;
  private paymentIdCounter: number;
  private verificationIdCounter: number;
  private reviewIdCounter: number;
  private favoriteIdCounter: number;
  private referralIdCounter: number;

  constructor() {
    this.usersStore = new Map();
    this.propertiesStore = new Map();
    this.jobsStore = new Map();
    this.messagesStore = new Map();
    this.paymentsStore = new Map();
    this.verificationsStore = new Map();
    this.reviewsStore = new Map();
    this.favoritesStore = new Map();
    this.referralsStore = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.jobIdCounter = 1;
    this.messageIdCounter = 1;
    this.paymentIdCounter = 1;
    this.verificationIdCounter = 1;
    this.reviewIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.referralIdCounter = 1;
    
    // Seed with some initial data
    this.seedData();
  }

  // Seed the storage with initial data
  private seedData(): void {
    // Create admin user
    this.createUser({
      username: "admin",
      email: "admin@lawnmates.com",
      password: "admin123",
      role: "admin",
      fullName: "Admin User"
    });
    
    // Create property owner
    this.createUser({
      username: "owner",
      email: "owner@example.com",
      password: "owner123",
      role: "property_owner",
      fullName: "Property Owner"
    });
    
    // Create landscaper
    this.createUser({
      username: "landscaper",
      email: "landscaper@example.com",
      password: "landscaper123",
      role: "landscaper",
      fullName: "Landscaper User"
    });
    
    // Create a property
    this.createProperty({
      ownerId: 2, // Property owner ID
      address: "123 Main St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      propertyType: "Residential",
      size: 2500,
      notes: "Backyard needs regular maintenance",
      latitude: 41.8781,
      longitude: -87.6298,
    });
    
    // Create a job
    this.createJob({
      ownerId: 2, // Property owner ID
      propertyId: 1, // Property ID
      title: "Lawn Mowing",
      description: "Need lawn mowing service for a 2500 sq ft yard",
      price: 4500, // $45.00
      status: "posted",
      startDate: new Date("2023-07-15T14:00:00Z").toISOString(),
      endDate: new Date("2023-07-15T17:00:00Z").toISOString(),
      isRecurring: false,
      requiresEquipment: true,
      latitude: 41.8781,
      longitude: -87.6298,
    });
  }

  // ===== User methods =====
  
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date().toISOString();
    
    const user: User = {
      id,
      ...userData,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      loyaltyPoints: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    this.usersStore.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    this.usersStore.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersStore.values());
  }
  
  // ===== Property methods =====
  
  async getProperty(id: number): Promise<Property | undefined> {
    return this.propertiesStore.get(id);
  }
  
  async getPropertiesByOwnerId(ownerId: number): Promise<Property[]> {
    return Array.from(this.propertiesStore.values()).filter(
      (property) => property.ownerId === ownerId
    );
  }
  
  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date().toISOString();
    
    const property: Property = {
      id,
      ...propertyData,
      createdAt: now,
      updatedAt: now,
    };
    
    this.propertiesStore.set(id, property);
    return property;
  }
  
  // ===== Job methods =====
  
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobsStore.get(id);
  }
  
  async getJobsByOwnerId(ownerId: number): Promise<Job[]> {
    return Array.from(this.jobsStore.values()).filter(
      (job) => job.ownerId === ownerId
    );
  }
  
  async getJobsByLandscaperId(landscaperId: number): Promise<Job[]> {
    return Array.from(this.jobsStore.values()).filter(
      (job) => job.landscaperId === landscaperId
    );
  }
  
  async getActiveJobsByOwnerId(ownerId: number): Promise<Job[]> {
    return Array.from(this.jobsStore.values()).filter(
      (job) => job.ownerId === ownerId && 
               ['accepted', 'in_progress', 'verification_pending'].includes(job.status)
    );
  }
  
  async getActiveJobsByLandscaperId(landscaperId: number): Promise<Job[]> {
    return Array.from(this.jobsStore.values()).filter(
      (job) => job.landscaperId === landscaperId && 
               ['accepted', 'in_progress', 'verification_pending'].includes(job.status)
    );
  }
  
  async getAvailableJobs(): Promise<Job[]> {
    return Array.from(this.jobsStore.values()).filter(
      (job) => job.status === 'posted'
    );
  }
  
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobsStore.values());
  }
  
  async createJob(jobData: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const now = new Date().toISOString();
    
    const job: Job = {
      id,
      ...jobData,
      status: 'posted',
      createdAt: now,
      updatedAt: now,
    };
    
    this.jobsStore.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job> {
    const job = await this.getJob(id);
    
    if (!job) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    const updatedJob: Job = {
      ...job,
      ...jobData,
      updatedAt: new Date().toISOString(),
    };
    
    this.jobsStore.set(id, updatedJob);
    return updatedJob;
  }
  
  // ===== Message methods =====
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesStore.get(id);
  }
  
  async getMessagesByJobId(jobId: number): Promise<Message[]> {
    return Array.from(this.messagesStore.values())
      .filter((message) => message.jobId === jobId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getConversations(userId: number): Promise<any[]> {
    // Get all messages where the user is sender or receiver
    const userMessages = Array.from(this.messagesStore.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
    
    // Group messages by job ID
    const jobIds = new Set(userMessages.map((message) => message.jobId));
    
    const conversations: any[] = [];
    
    for (const jobId of jobIds) {
      const job = await this.getJob(jobId);
      
      if (!job) continue;
      
      // Get the counterparty ID (the other user in the conversation)
      const counterpartyId = job.ownerId === userId ? job.landscaperId! : job.ownerId;
      const counterparty = await this.getUser(counterpartyId);
      
      if (!counterparty) continue;
      
      // Get the latest message for this job
      const jobMessages = userMessages.filter((message) => message.jobId === jobId);
      if (jobMessages.length === 0) continue;
      
      jobMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const latestMessage = jobMessages[0];
      
      // Count unread messages
      const unreadCount = jobMessages.filter(
        (message) => message.receiverId === userId && message.status === 'sent'
      ).length;
      
      conversations.push({
        jobId,
        jobTitle: job.title,
        counterparty: {
          id: counterparty.id,
          username: counterparty.username,
          fullName: counterparty.fullName,
          avatar: counterparty.avatar,
        },
        lastMessage: latestMessage.content,
        lastMessageTime: latestMessage.createdAt,
        unreadCount,
      });
    }
    
    return conversations;
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date().toISOString();
    
    const message: Message = {
      id,
      ...messageData,
      status: 'sent',
      createdAt: now,
    };
    
    this.messagesStore.set(id, message);
    return message;
  }
  
  // ===== Payment methods =====
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentsStore.get(id);
  }
  
  async getPaymentsByJobId(jobId: number): Promise<Payment[]> {
    return Array.from(this.paymentsStore.values()).filter(
      (payment) => payment.jobId === jobId
    );
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date().toISOString();
    
    const payment: Payment = {
      id,
      ...paymentData,
      createdAt: now,
      updatedAt: now,
    };
    
    this.paymentsStore.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment> {
    const payment = await this.getPayment(id);
    
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    const updatedPayment: Payment = {
      ...payment,
      ...paymentData,
      updatedAt: new Date().toISOString(),
    };
    
    this.paymentsStore.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // ===== Verification methods =====
  
  async getVerification(id: number): Promise<Verification | undefined> {
    return this.verificationsStore.get(id);
  }
  
  async getVerificationsByJobId(jobId: number): Promise<Verification[]> {
    return Array.from(this.verificationsStore.values()).filter(
      (verification) => verification.jobId === jobId
    );
  }
  
  async getPendingVerifications(): Promise<Verification[]> {
    return Array.from(this.verificationsStore.values()).filter(
      (verification) => verification.status === 'pending'
    );
  }
  
  async createVerification(verificationData: InsertVerification): Promise<Verification> {
    const id = this.verificationIdCounter++;
    const now = new Date().toISOString();
    
    const verification: Verification = {
      id,
      ...verificationData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    this.verificationsStore.set(id, verification);
    return verification;
  }
  
  async updateVerification(id: number, verificationData: Partial<Verification>): Promise<Verification> {
    const verification = await this.getVerification(id);
    
    if (!verification) {
      throw new Error(`Verification with ID ${id} not found`);
    }
    
    const updatedVerification: Verification = {
      ...verification,
      ...verificationData,
      updatedAt: new Date().toISOString(),
    };
    
    this.verificationsStore.set(id, updatedVerification);
    return updatedVerification;
  }
  
  // ===== Review methods =====
  
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsStore.get(id);
  }
  
  async getReviewsByJobId(jobId: number): Promise<Review[]> {
    return Array.from(this.reviewsStore.values()).filter(
      (review) => review.jobId === jobId
    );
  }
  
  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviewsStore.values()).filter(
      (review) => review.revieweeId === revieweeId
    );
  }
  
  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviewsStore.values());
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date().toISOString();
    
    const review: Review = {
      id,
      ...reviewData,
      createdAt: now,
    };
    
    this.reviewsStore.set(id, review);
    
    // Update the reviewee's rating
    const reviewee = await this.getUser(reviewData.revieweeId);
    
    if (reviewee) {
      const reviews = await this.getReviewsByRevieweeId(reviewee.id);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await this.updateUser(reviewee.id, {
        rating: averageRating,
        reviewCount: reviews.length,
      });
    }
    
    return review;
  }
  
  // ===== Favorite methods =====
  
  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favoritesStore.get(id);
  }
  
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return Array.from(this.favoritesStore.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }
  
  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const now = new Date().toISOString();
    
    const favorite: Favorite = {
      id,
      ...favoriteData,
      createdAt: now,
    };
    
    this.favoritesStore.set(id, favorite);
    return favorite;
  }
  
  async deleteFavorite(id: number): Promise<void> {
    this.favoritesStore.delete(id);
  }
  
  // ===== Referral methods =====
  
  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referralsStore.get(id);
  }
  
  async getReferralsByInviterId(inviterId: number): Promise<Referral[]> {
    return Array.from(this.referralsStore.values()).filter(
      (referral) => referral.inviterId === inviterId
    );
  }
  
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const id = this.referralIdCounter++;
    const now = new Date().toISOString();
    
    const referral: Referral = {
      id,
      ...referralData,
      createdAt: now,
    };
    
    this.referralsStore.set(id, referral);
    return referral;
  }
  
  // ===== Other methods =====
  
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return this.updateUser(userId, { stripeCustomerId });
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return this.updateUser(userId, { 
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeConnectId: stripeInfo.stripeSubscriptionId
    });
  }
}

// Database storage implementation
export class DrizzleStorage implements IStorage {
  // ===== User methods =====
  
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const results = await db.insert(users).values({
      ...userData,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      loyaltyPoints: 0,
    }).returning();
    
    return results[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const results = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (results.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return results[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // ===== Property methods =====
  
  async getProperty(id: number): Promise<Property | undefined> {
    const results = await db.select().from(properties).where(eq(properties.id, id));
    return results[0];
  }
  
  async getPropertiesByOwnerId(ownerId: number): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
  }
  
  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const results = await db.insert(properties).values(propertyData).returning();
    return results[0];
  }
  
  // ===== Job methods =====
  
  async getJob(id: number): Promise<Job | undefined> {
    const results = await db.select().from(jobs).where(eq(jobs.id, id));
    return results[0];
  }
  
  async getJobsByOwnerId(ownerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.ownerId, ownerId));
  }
  
  async getJobsByLandscaperId(landscaperId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.landscaperId, landscaperId));
  }
  
  async getActiveJobsByOwnerId(ownerId: number): Promise<Job[]> {
    return await db.select().from(jobs)
      .where(and(
        eq(jobs.ownerId, ownerId),
        // Using SQL 'in' operator for status check
        sql`${jobs.status} IN ('accepted', 'in_progress', 'verification_pending')`
      ));
  }
  
  async getActiveJobsByLandscaperId(landscaperId: number): Promise<Job[]> {
    return await db.select().from(jobs)
      .where(and(
        eq(jobs.landscaperId, landscaperId),
        // Using SQL 'in' operator for status check
        sql`${jobs.status} IN ('accepted', 'in_progress', 'verification_pending')`
      ));
  }
  
  async getAvailableJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, 'posted'));
  }
  
  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }
  
  async createJob(jobData: InsertJob): Promise<Job> {
    const results = await db.insert(jobs).values({
      ...jobData,
      status: 'posted',
    }).returning();
    
    return results[0];
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job> {
    const results = await db.update(jobs)
      .set({ ...jobData, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    
    if (results.length === 0) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    return results[0];
  }
  
  // ===== Message methods =====
  
  async getMessage(id: number): Promise<Message | undefined> {
    const results = await db.select().from(messages).where(eq(messages.id, id));
    return results[0];
  }
  
  async getMessagesByJobId(jobId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.jobId, jobId))
      .orderBy(messages.createdAt);
  }
  
  async getConversations(userId: number): Promise<any[]> {
    // This is a more complex query that requires joins
    // First, get all messages where the user is sender or receiver
    const userMessages = await db.select().from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );
    
    // Group messages by job ID
    const jobIds = [...new Set(userMessages.map(msg => msg.jobId))];
    
    const conversations: any[] = [];
    
    for (const jobId of jobIds) {
      const job = await this.getJob(jobId);
      
      if (!job) continue;
      
      // Get the counterparty ID (the other user in the conversation)
      const counterpartyId = job.ownerId === userId ? job.landscaperId! : job.ownerId;
      const counterparty = await this.getUser(counterpartyId);
      
      if (!counterparty) continue;
      
      // Get the latest message for this job
      const jobMessages = userMessages.filter(msg => msg.jobId === jobId);
      if (jobMessages.length === 0) continue;
      
      // Sort messages by timestamp (descending)
      jobMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const latestMessage = jobMessages[0];
      
      // Count unread messages
      const unreadCount = jobMessages.filter(
        msg => msg.receiverId === userId && msg.status === 'sent'
      ).length;
      
      conversations.push({
        jobId,
        jobTitle: job.title,
        counterparty: {
          id: counterparty.id,
          username: counterparty.username,
          fullName: counterparty.fullName,
          avatar: counterparty.avatar,
        },
        lastMessage: latestMessage.content,
        lastMessageTime: latestMessage.createdAt,
        unreadCount,
      });
    }
    
    return conversations;
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const results = await db.insert(messages).values({
      ...messageData,
      status: 'sent',
    }).returning();
    
    return results[0];
  }
  
  // ===== Payment methods =====
  
  async getPayment(id: number): Promise<Payment | undefined> {
    const results = await db.select().from(payments).where(eq(payments.id, id));
    return results[0];
  }
  
  async getPaymentsByJobId(jobId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.jobId, jobId));
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const results = await db.insert(payments).values(paymentData).returning();
    return results[0];
  }
  
  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment> {
    const results = await db.update(payments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    
    if (results.length === 0) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    return results[0];
  }
  
  // ===== Verification methods =====
  
  async getVerification(id: number): Promise<Verification | undefined> {
    const results = await db.select().from(verifications).where(eq(verifications.id, id));
    return results[0];
  }
  
  async getVerificationsByJobId(jobId: number): Promise<Verification[]> {
    return await db.select().from(verifications).where(eq(verifications.jobId, jobId));
  }
  
  async getPendingVerifications(): Promise<Verification[]> {
    return await db.select().from(verifications).where(eq(verifications.status, 'pending'));
  }
  
  async createVerification(verificationData: InsertVerification): Promise<Verification> {
    const results = await db.insert(verifications).values({
      ...verificationData,
      status: 'pending',
    }).returning();
    
    return results[0];
  }
  
  async updateVerification(id: number, verificationData: Partial<Verification>): Promise<Verification> {
    const results = await db.update(verifications)
      .set({ ...verificationData, updatedAt: new Date() })
      .where(eq(verifications.id, id))
      .returning();
    
    if (results.length === 0) {
      throw new Error(`Verification with ID ${id} not found`);
    }
    
    return results[0];
  }
  
  // ===== Review methods =====
  
  async getReview(id: number): Promise<Review | undefined> {
    const results = await db.select().from(reviews).where(eq(reviews.id, id));
    return results[0];
  }
  
  async getReviewsByJobId(jobId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.jobId, jobId));
  }
  
  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.revieweeId, revieweeId));
  }
  
  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews);
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const results = await db.insert(reviews).values(reviewData).returning();
    return results[0];
  }
  
  // ===== Favorite methods =====
  
  async getFavorite(id: number): Promise<Favorite | undefined> {
    const results = await db.select().from(favorites).where(eq(favorites.id, id));
    return results[0];
  }
  
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }
  
  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const results = await db.insert(favorites).values(favoriteData).returning();
    return results[0];
  }
  
  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }
  
  // ===== Referral methods =====
  
  async getReferral(id: number): Promise<Referral | undefined> {
    const results = await db.select().from(referrals).where(eq(referrals.id, id));
    return results[0];
  }
  
  async getReferralsByInviterId(inviterId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.inviterId, inviterId));
  }
  
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const results = await db.insert(referrals).values(referralData).returning();
    return results[0];
  }
  
  // ===== Stripe methods =====
  
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    return this.updateUser(userId, { stripeCustomerId });
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    return this.updateUser(userId, { 
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeConnectId: stripeInfo.stripeSubscriptionId
    });
  }
}

// Choose storage implementation
// For development, check if DATABASE_URL is defined - if not, use MemStorage
// For production, always use DrizzleStorage
const useMemStorage = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL;
export const storage = useMemStorage ? new MemStorage() : new DrizzleStorage();
