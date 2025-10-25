import { supabase } from './supabase';

export type Theme = 'light' | 'dark' | 'caribbean_dark' | 'high_contrast';
export type FontSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface AccessibilitySettings {
  theme: Theme;
  fontSize: FontSize;
  reduceMotion: boolean;
  keyboardShortcutsEnabled: boolean;
  autoPlay: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;
}

export interface UserPreferences extends AccessibilitySettings {
  id: string;
  user_id: string;
  dashboard_layout: Record<string, any>;
  accessibility_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class AccessibilityManager {
  private currentSettings: AccessibilitySettings | null = null;
  private listeners: Set<(settings: AccessibilitySettings) => void> = new Set();

  constructor() {
    this.loadSettings();
    this.setupKeyboardShortcuts();
  }

  private async loadSettings(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.applyDefaultSettings();
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        this.applyDefaultSettings();
        return;
      }

      if (data) {
        this.currentSettings = {
          theme: data.theme,
          fontSize: data.font_size,
          reduceMotion: data.reduce_motion,
          keyboardShortcutsEnabled: data.keyboard_shortcuts_enabled,
          autoPlay: data.auto_play,
          audioQuality: data.audio_quality,
          notificationsEnabled: data.notifications_enabled,
          emailNotifications: data.email_notifications,
          language: data.language
        };
        this.applySettings(this.currentSettings);
      } else {
        await this.createDefaultPreferences(user.id);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.applyDefaultSettings();
    }
  }

  private async createDefaultPreferences(userId: string): Promise<void> {
    const defaultSettings: AccessibilitySettings = {
      theme: 'light',
      fontSize: 'medium',
      reduceMotion: false,
      keyboardShortcutsEnabled: true,
      autoPlay: false,
      audioQuality: 'high',
      notificationsEnabled: true,
      emailNotifications: true,
      language: 'en'
    };

    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert([{
          user_id: userId,
          theme: defaultSettings.theme,
          font_size: defaultSettings.fontSize,
          reduce_motion: defaultSettings.reduceMotion,
          keyboard_shortcuts_enabled: defaultSettings.keyboardShortcutsEnabled,
          auto_play: defaultSettings.autoPlay,
          audio_quality: defaultSettings.audioQuality,
          notifications_enabled: defaultSettings.notificationsEnabled,
          email_notifications: defaultSettings.emailNotifications,
          language: defaultSettings.language
        }]);

      if (error) throw error;

      this.currentSettings = defaultSettings;
      this.applySettings(defaultSettings);
    } catch (error) {
      console.error('Failed to create default preferences:', error);
      this.applyDefaultSettings();
    }
  }

  private applyDefaultSettings(): void {
    const defaultSettings: AccessibilitySettings = {
      theme: 'light',
      fontSize: 'medium',
      reduceMotion: false,
      keyboardShortcutsEnabled: true,
      autoPlay: false,
      audioQuality: 'high',
      notificationsEnabled: true,
      emailNotifications: true,
      language: 'en'
    };

    this.currentSettings = defaultSettings;
    this.applySettings(defaultSettings);
  }

  private applySettings(settings: AccessibilitySettings): void {
    this.applyTheme(settings.theme);
    this.applyFontSize(settings.fontSize);
    this.applyReduceMotion(settings.reduceMotion);
    this.notifyListeners(settings);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'caribbean-dark', 'high-contrast');

    switch (theme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'caribbean_dark':
        root.classList.add('caribbean-dark');
        break;
      case 'high_contrast':
        root.classList.add('high-contrast');
        break;
      default:
        root.classList.add('light');
    }

    document.body.setAttribute('data-theme', theme);
  }

  private applyFontSize(fontSize: FontSize): void {
    const root = document.documentElement;
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      extra_large: '20px'
    };

    root.style.fontSize = sizes[fontSize];
    root.setAttribute('data-font-size', fontSize);
  }

  private applyReduceMotion(reduceMotion: boolean): void {
    const root = document.documentElement;

    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    root.setAttribute('data-reduce-motion', String(reduceMotion));
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.currentSettings?.keyboardShortcutsEnabled) return;

      if (e.altKey && e.key === '1') {
        e.preventDefault();
        window.location.href = '/dashboard';
      }

      if (e.altKey && e.key === '2') {
        e.preventDefault();
        window.location.href = '/text-to-speech';
      }

      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/';
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }
    });
  }

  async updateSettings(updates: Partial<AccessibilitySettings>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Cannot update settings: user not authenticated');
        return;
      }

      const dbUpdates: any = {};

      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.fontSize !== undefined) dbUpdates.font_size = updates.fontSize;
      if (updates.reduceMotion !== undefined) dbUpdates.reduce_motion = updates.reduceMotion;
      if (updates.keyboardShortcutsEnabled !== undefined) dbUpdates.keyboard_shortcuts_enabled = updates.keyboardShortcutsEnabled;
      if (updates.autoPlay !== undefined) dbUpdates.auto_play = updates.autoPlay;
      if (updates.audioQuality !== undefined) dbUpdates.audio_quality = updates.audioQuality;
      if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;
      if (updates.emailNotifications !== undefined) dbUpdates.email_notifications = updates.emailNotifications;
      if (updates.language !== undefined) dbUpdates.language = updates.language;

      const { error } = await supabase
        .from('user_preferences')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;

      const newSettings = {
        ...this.currentSettings,
        ...updates
      } as AccessibilitySettings;

      this.currentSettings = newSettings;
      this.applySettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  getSettings(): AccessibilitySettings | null {
    return this.currentSettings;
  }

  subscribe(callback: (settings: AccessibilitySettings) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(settings: AccessibilitySettings): void {
    this.listeners.forEach(callback => callback(settings));
  }

  announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  focusFirstFocusable(container: HTMLElement): void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

export const accessibilityManager = new AccessibilityManager();
