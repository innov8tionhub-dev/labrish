/**
 * Privacy-focused analytics and user behavior tracking
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
}

class Analytics {
  private session: UserSession;
  private userId?: string;
  private isEnabled: boolean = true;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds

  constructor() {
    this.session = this.createSession();
    this.startFlushTimer();
    this.setupPageTracking();
  }

  private createSession(): UserSession {
    return {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
    };
  }

  private startFlushTimer(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupPageTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.track('page_focus');
      } else {
        this.track('page_blur');
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.track('page_unload');
      this.flush();
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
    this.queue = [];
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.userId,
    };

    this.session.events.push(event);
    this.session.lastActivity = Date.now();
    this.queue.push(event);

    // Auto-flush for important events
    const criticalEvents = ['error', 'purchase', 'signup', 'login'];
    if (criticalEvents.includes(eventName)) {
      this.flush();
    }
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Remove sensitive data
      if (this.isSensitiveKey(key)) continue;
      
      // Limit string length
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'ssn',
      'credit_card',
      'email', // Remove if you want to track emails
    ];

    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }

  pageView(path: string, title?: string): void {
    this.session.pageViews++;
    this.track('page_view', {
      path,
      title: title || document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    });
  }

  timing(name: string, duration: number, category?: string): void {
    this.track('timing', {
      name,
      duration,
      category,
    });
  }

  error(error: Error | string, context?: Record<string, any>): void {
    this.track('error', {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
    });
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // In a real implementation, send to your analytics service
      // await this.sendToAnalyticsService(events);
      
      // For now, just log in development
      if (import.meta.env.DEV) {
        console.log('Analytics events:', events);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.queue.unshift(...events);
    }
  }

  getSessionInfo(): UserSession {
    return { ...this.session };
  }

  // Convenience methods for common events
  buttonClick(buttonName: string, location?: string): void {
    this.track('button_click', { button_name: buttonName, location });
  }

  formSubmit(formName: string, success: boolean): void {
    this.track('form_submit', { form_name: formName, success });
  }

  searchPerformed(query: string, results_count?: number): void {
    this.track('search', { 
      query: query.substring(0, 100), // Limit query length
      results_count 
    });
  }

  featureUsed(featureName: string, context?: Record<string, any>): void {
    this.track('feature_used', { feature_name: featureName, ...context });
  }

  audioGenerated(voiceId: string, textLength: number, duration?: number): void {
    this.track('audio_generated', {
      voice_id: voiceId,
      text_length: textLength,
      duration,
    });
  }

  storyCreated(category: string, isPublic: boolean): void {
    this.track('story_created', {
      category,
      is_public: isPublic,
    });
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  const trackEvent = (name: string, properties?: Record<string, any>) => {
    analytics.track(name, properties);
  };

  const trackPageView = (path: string, title?: string) => {
    analytics.pageView(path, title);
  };

  const trackTiming = (name: string, startTime: number, category?: string) => {
    const duration = Date.now() - startTime;
    analytics.timing(name, duration, category);
  };

  return {
    track: trackEvent,
    pageView: trackPageView,
    timing: trackTiming,
    buttonClick: analytics.buttonClick.bind(analytics),
    formSubmit: analytics.formSubmit.bind(analytics),
    searchPerformed: analytics.searchPerformed.bind(analytics),
    featureUsed: analytics.featureUsed.bind(analytics),
    audioGenerated: analytics.audioGenerated.bind(analytics),
    storyCreated: analytics.storyCreated.bind(analytics),
  };
};