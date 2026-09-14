import { secureLogger } from "./logger.ts";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  maxHourlyFallbacks: number;
  resetTimeoutMs: number;
  providerCostBudgetUSD: number;
}

export interface CircuitBreakerStatus {
  state: CircuitState;
  fallbackCountInWindow: number;
  maxHourlyFallbacks: number;
  windowStartTime: string;
  nextResetTime: string;
  totalTrippedEvents: number;
  lastTripReason: string | null;
}

/**
 * AI Fallback Circuit Breaker & Billing Protection Engine
 * 
 * Prevents runaway API costs when primary Gemini AI fails and traffic routes to
 * expensive fallback models (GPT-4o or Claude 3.5 Sonnet).
 * Automatically monitors usage, alerts administrators, and enforces cost caps.
 */
export class AiFallbackCircuitBreaker {
  private state: CircuitState = "CLOSED";
  private hourlyFallbackCount = 0;
  private windowStart = Date.now();
  private maxHourlyFallbacks: number;
  private resetTimeoutMs: number;
  private totalTrippedEvents = 0;
  private lastTripReason: string | null = null;
  private lastAlertTime = 0;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.maxHourlyFallbacks = config?.maxHourlyFallbacks ?? Number(process.env.AI_FALLBACK_HOURLY_LIMIT || 50);
    this.resetTimeoutMs = config?.resetTimeoutMs ?? (60 * 60 * 1000); // 1 hour window
  }

  private checkWindowRoll(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.resetTimeoutMs) {
      this.windowStart = now;
      this.hourlyFallbackCount = 0;
      if (this.state === "OPEN") {
        this.state = "HALF_OPEN";
        secureLogger.info("[AiFallbackCircuitBreaker] Window rolled over. State transitioning from OPEN to HALF_OPEN.");
      }
    }
  }

  /**
   * Checks whether a fallback AI model call is permitted
   */
  public canExecuteFallback(provider: "openai" | "anthropic"): { allowed: boolean; reason?: string } {
    this.checkWindowRoll();

    if (this.state === "OPEN") {
      const remainingSec = Math.ceil((this.windowStart + this.resetTimeoutMs - Date.now()) / 1000);
      const reason = `[CIRCUIT_BREAKER_ACTIVE] AI Fallback to ${provider} is capped to protect against runaway billing spikes. Resets in ${remainingSec}s.`;
      
      // Rate-limit console alerts to at most once per 60s
      if (Date.now() - this.lastAlertTime > 60000) {
        secureLogger.warn(reason);
        this.lastAlertTime = Date.now();
      }

      return { allowed: false, reason };
    }

    if (this.hourlyFallbackCount >= this.maxHourlyFallbacks) {
      this.trip(`Hourly limit of ${this.maxHourlyFallbacks} fallback calls reached for ${provider}`);
      return { 
        allowed: false, 
        reason: `[CIRCUIT_BREAKER_TRIPPED] Fallback quota exceeded (${this.maxHourlyFallbacks}/hr). Capping requests to protect API billing.` 
      };
    }

    return { allowed: true };
  }

  /**
   * Records a successful execution of a fallback AI call
   */
  public recordFallbackUsage(provider: "openai" | "anthropic", model = "gpt-4o"): void {
    this.checkWindowRoll();
    this.hourlyFallbackCount++;

    const remaining = this.maxHourlyFallbacks - this.hourlyFallbackCount;

    if (remaining <= 5 && remaining > 0) {
      secureLogger.warn(
        `[BILLING WARNING] Approaching AI fallback cost threshold: ${this.hourlyFallbackCount}/${this.maxHourlyFallbacks} calls used in current window. Provider: ${provider} (${model}).`
      );
    }

    if (this.hourlyFallbackCount >= this.maxHourlyFallbacks) {
      this.trip(`Exceeded maximum ${this.maxHourlyFallbacks} fallback requests/hr with ${provider}/${model}`);
    } else if (this.state === "HALF_OPEN") {
      // Transition back to normal closed state
      this.state = "CLOSED";
      secureLogger.info("[AiFallbackCircuitBreaker] Health probe succeeded. State restored to CLOSED.");
    }
  }

  /**
   * Trips the circuit breaker to prevent further fallback charges
   */
  public trip(reason: string): void {
    this.state = "OPEN";
    this.totalTrippedEvents++;
    this.lastTripReason = reason;
    this.lastAlertTime = Date.now();

    console.error(
      `🚨 [CRITICAL_BILLING_ALERT] AI Fallback Circuit Breaker TRIPPED! Reason: ${reason}. ` +
      `Traffic to OpenAI/Anthropic fallback models is temporarily suspended to protect enterprise quotas.`
    );
  }

  /**
   * Retrieves current circuit breaker metrics for monitoring
   */
  public getStatus(): CircuitBreakerStatus {
    this.checkWindowRoll();
    return {
      state: this.state,
      fallbackCountInWindow: this.hourlyFallbackCount,
      maxHourlyFallbacks: this.maxHourlyFallbacks,
      windowStartTime: new Date(this.windowStart).toISOString(),
      nextResetTime: new Date(this.windowStart + this.resetTimeoutMs).toISOString(),
      totalTrippedEvents: this.totalTrippedEvents,
      lastTripReason: this.lastTripReason
    };
  }

  /**
   * Manual reset by administrator
   */
  public reset(): void {
    this.state = "CLOSED";
    this.hourlyFallbackCount = 0;
    this.windowStart = Date.now();
    this.lastTripReason = null;
    secureLogger.info("[AiFallbackCircuitBreaker] Circuit breaker manually reset by administrator.");
  }
}

export const aiFallbackCircuitBreaker = new AiFallbackCircuitBreaker();
