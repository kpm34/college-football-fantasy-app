/**
 * Centralized Authentication Service
 * Single source of truth for all authentication operations
 */

import { Client, Account, ID, Models } from 'appwrite';
import { Client as ServerClient, Account as ServerAccount } from 'node-appwrite';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { env } from '../../config/environment';
import { UnauthorizedError, ValidationError } from '../errors/app-error';

// AuthUser type is just an alias for the Appwrite User model
export type AuthUser = Models.User<Models.Preferences>;

export class AuthService {
  private client: Client | ServerClient;
  private account: Account | ServerAccount;
  private isServerClient: boolean = false;
  
  /**
   * Create AuthService instance
   * @param request - Optional NextRequest for server-side auth
   * @param jwt - Optional JWT token for direct authentication
   */
  constructor(request?: NextRequest, jwt?: string) {
    // Use server client for server-side operations without a request
    if (typeof window === 'undefined' && !request && !jwt) {
      this.isServerClient = true;
      this.client = new ServerClient()
        .setEndpoint(env.server.appwrite.endpoint)
        .setProject(env.server.appwrite.projectId)
        .setKey(env.server.appwrite.apiKey);
    } else {
      this.client = new Client()
        .setEndpoint(env.client.appwrite.endpoint)
        .setProject(env.client.appwrite.projectId);
      
      // Handle different authentication methods
      if (jwt) {
        (this.client as Client).setJWT(jwt);
      } else if (request) {
        const sessionSecret = request.cookies.get('appwrite-session')?.value;
        if (sessionSecret) {
          const webClient = this.client as Client;
          // Prefer Appwrite session secret; fallback to JWT if setSession is unavailable
          const anyClient = webClient as unknown as { setSession?: (s: string) => void };
          if (typeof anyClient.setSession === 'function') {
            anyClient.setSession(sessionSecret);
          } else {
            webClient.setJWT(sessionSecret);
          }
        }
      }
    }
    
    // Create account instance based on client type
    if (this.isServerClient) {
      this.account = new ServerAccount(this.client as ServerClient);
    } else {
      this.account = new Account(this.client as Client);
    }
  }
  
  /**
   * Get current authenticated user
   * @returns User object or null if not authenticated
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await this.account.get();
      return user as AuthUser;
    } catch (error) {
      // Not authenticated
      return null;
    }
  }
  
  /**
   * Require authentication - throws if not authenticated
   * @returns Authenticated user
   * @throws UnauthorizedError if not authenticated
   */
  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    return user;
  }
  
  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Session object
   */
  async login(email: string, password: string): Promise<Models.Session> {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }
    
    try {
      // Create session
      const session = await this.account.createEmailPasswordSession(email, password);
      
      // Set cookie for future requests
      if (typeof window === 'undefined') {
        const cookieStore = await cookies();
        cookieStore.set('appwrite-session', session.secret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
      
      return session;
    } catch (error: any) {
      if (error?.code === 401) {
        throw new UnauthorizedError('Invalid email or password');
      }
      throw error;
    }
  }
  
  /**
   * Register new user
   * @param email - User email
   * @param password - User password
   * @param name - User display name
   * @returns Created user
   */
  async register(email: string, password: string, name: string): Promise<AuthUser> {
    // Validate input
    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }
    
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    
    try {
      // Create user account
      const user = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      // Auto-login after registration
      await this.login(email, password);
      
      return user as AuthUser;
    } catch (error: any) {
      if (error?.code === 409) {
        throw new ValidationError('Email already registered');
      }
      throw error;
    }
  }
  
  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Delete current session
      await this.account.deleteSession('current');
      
      // Clear cookie
      if (typeof window === 'undefined') {
        const cookieStore = await cookies();
        cookieStore.delete('appwrite-session');
      }
    } catch (error) {
      // Session might already be invalid
      console.warn('Logout error:', error);
    }
  }
  
  /**
   * Update user profile
   * @param name - New display name
   * @param prefs - User preferences
   * @returns Updated user
   */
  async updateProfile(name?: string, prefs?: Models.Preferences): Promise<AuthUser> {
    const updates: any = {};
    
    if (name) {
      updates.name = name;
    }
    
    if (prefs) {
      updates.prefs = prefs;
    }
    
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No updates provided');
    }
    
    // Update name if provided
    if (name) {
      await this.account.updateName(name);
    }
    
    // Update preferences if provided
    if (prefs) {
      await this.account.updatePrefs(prefs);
    }
    
    // Return updated user
    return await this.getCurrentUser() as AuthUser;
  }
  
  /**
   * Send password reset email
   * @param email - User email
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!email) {
      throw new ValidationError('Email is required');
    }
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password`;
    
    await this.account.createRecovery(email, resetUrl);
  }
  
  /**
   * Complete password reset
   * @param client_id - User ID from reset link
   * @param secret - Secret from reset link
   * @param password - New password
   */
  async resetPassword(userId: string, secret: string, password: string): Promise<void> {
    if (!userId || !secret || !password) {
      throw new ValidationError('Invalid password reset link');
    }
    
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    
    await this.account.updateRecovery(userId, secret, password);
  }
  
  /**
   * Get client for database operations
   * @returns Configured Appwrite client
   */
  getClient(): Client | ServerClient {
    return this.client;
  }
  
  /**
   * Create server-side auth service with API key
   * @returns AuthService configured for server operations
   */
  static createServerInstance(): AuthService {
    // Constructor will handle server client setup when no params provided
    return new AuthService();
  }
  
  /**
   * Create auth service from request
   * @param request - Next.js request object
   * @returns AuthService configured with user session
   */
  static fromRequest(request: NextRequest): AuthService {
    return new AuthService(request);
  }
  
  /**
   * Create auth service from JWT
   * @param jwt - JWT token
   * @returns AuthService configured with JWT
   */
  static fromJWT(jwt: string): AuthService {
    return new AuthService(undefined, jwt);
  }
}

// Export singleton for server-side operations
export const serverAuth = AuthService.createServerInstance();
