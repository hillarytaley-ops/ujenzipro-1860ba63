import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit } from "@/lib/rateLimitService";

/**
 * Enhanced Supabase client with rate limiting and error handling
 */
class EnhancedSupabaseClient {
  private static instance: EnhancedSupabaseClient;
  
  public static getInstance(): EnhancedSupabaseClient {
    if (!EnhancedSupabaseClient.instance) {
      EnhancedSupabaseClient.instance = new EnhancedSupabaseClient();
    }
    return EnhancedSupabaseClient.instance;
  }

  /**
   * Enhanced query with rate limiting and retry logic
   */
  async enhancedQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      rateLimitEndpoint?: string;
      userId?: string;
    } = {}
  ): Promise<{ data: T | null; error: any }> {
    const { 
      maxRetries = 2, 
      retryDelay = 1000, 
      rateLimitEndpoint = 'query',
      userId 
    } = options;

    // Check rate limit first
    const isAllowed = await checkRateLimit({
      userId,
      endpoint: rateLimitEndpoint,
      limit: 100,
      windowMinutes: 10
    });

    if (!isAllowed) {
      return {
        data: null,
        error: new Error('Rate limit exceeded. Please try again later.')
      };
    }

    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await queryFn();
        
        // If successful, return immediately
        if (!result.error) {
          return result;
        }
        
        lastError = result.error;
        
        // Don't retry on certain error types
        if (this.isNonRetryableError(result.error)) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(retryDelay * Math.pow(2, attempt));
        }
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on network errors if we're offline
        if (!navigator.onLine) {
          break;
        }
        
        if (attempt < maxRetries) {
          await this.delay(retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    return { data: null, error: lastError };
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: any): boolean {
    if (!error) return false;
    
    const nonRetryableCodes = [
      'PGRST116', // Permission denied
      'PGRST204', // No data found
      '23505',    // Unique constraint violation
      '23503',    // Foreign key violation
    ];
    
    return nonRetryableCodes.some(code => 
      error.code === code || error.message?.includes(code)
    );
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced insert with validation and error handling
   */
  async enhancedInsert<T>(
    table: string,
    data: any,
    options: { userId?: string } = {}
  ): Promise<{ data: T | null; error: any }> {
    return this.enhancedQuery(
      async () => {
        const result = await (supabase as any).from(table).insert(data).select();
        return result;
      },
      { 
        rateLimitEndpoint: `insert_${table}`,
        userId: options.userId,
        maxRetries: 1 // Don't retry inserts to avoid duplicates
      }
    );
  }

  /**
   * Enhanced update with optimistic concurrency control
   */
  async enhancedUpdate<T>(
    table: string,
    data: any,
    match: any,
    options: { userId?: string } = {}
  ): Promise<{ data: T | null; error: any }> {
    return this.enhancedQuery(
      async () => {
        const result = await (supabase as any).from(table).update(data).match(match).select();
        return result;
      },
      { 
        rateLimitEndpoint: `update_${table}`,
        userId: options.userId
      }
    );
  }

  /**
   * Enhanced select with caching considerations
   */
  async enhancedSelect<T>(
    table: string,
    query?: string,
    options: { userId?: string; useCache?: boolean } = {}
  ): Promise<{ data: T | null; error: any }> {
    return this.enhancedQuery(
      async () => {
        const queryBuilder = (supabase as any).from(table).select(query);
        const result = await queryBuilder;
        return result;
      },
      { 
        rateLimitEndpoint: `select_${table}`,
        userId: options.userId
      }
    );
  }
}

// Export singleton instance
export const enhancedSupabase = EnhancedSupabaseClient.getInstance();