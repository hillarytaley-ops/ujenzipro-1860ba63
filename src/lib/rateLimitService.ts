import { supabase } from "@/integrations/supabase/client";

interface RateLimitOptions {
  userId?: string;
  endpoint?: string;
  limit?: number;
  windowMinutes?: number;
}

export class RateLimitService {
  private static instance: RateLimitService;
  
  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  /**
   * Check if the current request is within rate limits
   */
  async checkRateLimit(options: RateLimitOptions = {}): Promise<boolean> {
    const {
      userId,
      endpoint = 'general',
      limit = 100,
      windowMinutes = 60
    } = options;

    try {
      // Get client IP (in real application, this would come from server)
      const clientIP = await this.getClientIP();
      
      // For now, we'll use localStorage for client-side rate limiting
      // In production, this should be handled server-side
      const rateLimitKey = `rate_limit_${userId || 'anonymous'}_${endpoint}`;
      const now = Date.now();
      const windowMs = windowMinutes * 60 * 1000;
      
      const stored = localStorage.getItem(rateLimitKey);
      const rateData = stored ? JSON.parse(stored) : { count: 0, windowStart: now };
      
      // Reset if window expired
      if (now - rateData.windowStart > windowMs) {
        rateData.count = 0;
        rateData.windowStart = now;
      }
      
      // Check if limit exceeded
      if (rateData.count >= limit) {
        console.warn(`Rate limit exceeded for ${endpoint}. Limit: ${limit} requests per ${windowMinutes} minutes`);
        return false;
      }
      
      // Increment counter
      rateData.count++;
      localStorage.setItem(rateLimitKey, JSON.stringify(rateData));
      
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // If rate limiting fails, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get client IP address (placeholder - would be implemented server-side)
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '127.0.0.1'; // Fallback
    }
  }

  /**
   * Clear rate limit data for a specific endpoint
   */
  clearRateLimit(userId?: string, endpoint = 'general'): void {
    const rateLimitKey = `rate_limit_${userId || 'anonymous'}_${endpoint}`;
    localStorage.removeItem(rateLimitKey);
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(userId?: string, endpoint = 'general'): { count: number; limit: number; remaining: number } | null {
    const rateLimitKey = `rate_limit_${userId || 'anonymous'}_${endpoint}`;
    const stored = localStorage.getItem(rateLimitKey);
    
    if (!stored) return null;
    
    const rateData = JSON.parse(stored);
    const limit = 100; // Default limit
    
    return {
      count: rateData.count,
      limit,
      remaining: Math.max(0, limit - rateData.count)
    };
  }
}

// Utility function for easy use
export const checkRateLimit = (options?: RateLimitOptions) => {
  return RateLimitService.getInstance().checkRateLimit(options);
};