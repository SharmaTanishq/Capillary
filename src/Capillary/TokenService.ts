import { CapillaryAuth } from './Auth';

interface TokenCache {
  token: string;
  expiresAt: number;
}

export class TokenService {
  private static instance: TokenService;
  private tokenCache: TokenCache | null = null;
  private pendingTokenPromise: Promise<string> | null = null;
  
  private constructor() {}

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  // For testing purposes only
  public static resetInstance(): void {
    TokenService.instance = undefined as any;
  }

  public async getToken(): Promise<string> {
    // Return cached token if it's still valid
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    // If there's already a request in progress, return that promise
    // This prevents multiple concurrent requests from creating multiple tokens
    if (this.pendingTokenPromise) {
      return this.pendingTokenPromise;
    }

    // Create a new token request
    this.pendingTokenPromise = this.fetchNewToken();
    
    try {
      // Wait for the token and return it
      const token = await this.pendingTokenPromise;
      return token;
    } finally {
      // Clear the pending promise when done (success or failure)
      this.pendingTokenPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    const client = new CapillaryAuth();
    const token = await client.authorize();
    
    // Cache the token with expiration (e.g., 23 Hours if token lasts 24 hour)
    this.tokenCache = {
      token,
      expiresAt: Date.now() + 3600 * 1000 // 3600 seconds (1 hour) in milliseconds
    };

    return token;
  }
}