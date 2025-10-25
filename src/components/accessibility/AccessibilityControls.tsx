import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Sun,
  Moon,
  Type,
  Zap,
  Volume2,
  Bell,
  Keyboard,
  Eye,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accessibilityManager, AccessibilitySettings, Theme, FontSize } from '@/lib/accessibilityManager';
import { useToast } from '@/components/common/Toast';

interface AccessibilityControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AccessibilitySettings | null>(null);
  const [saving, setSaving] = useState(false);

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    const currentSettings = accessibilityManager.getSettings();
    if (currentSettings) {
      setSettings(currentSettings);
    }

    const unsubscribe = accessibilityManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const handleUpdateSetting = async <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setSaving(true);
    try {
      await accessibilityManager.updateSettings({ [key]: value });
      accessibilityManager.announceToScreenReader(`${key} updated successfully`);
    } catch (error: any) {
      showError('Update failed', error.message);
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" />, description: 'Clean and bright' },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" />, description: 'Easy on the eyes' },
    { value: 'caribbean_dark', label: 'Caribbean Night', icon: <Moon className="w-5 h-5" />, description: 'Warm Caribbean colors' },
    { value: 'high_contrast', label: 'High Contrast', icon: <Eye className="w-5 h-5" />, description: 'Maximum readability' }
  ];

  const fontSizes: { value: FontSize; label: string; size: string }[] = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'extra_large', label: 'Extra Large', size: '20px' }
  ];

  const audioQualities: { value: 'low' | 'medium' | 'high'; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Faster loading' },
    { value: 'medium', label: 'Medium', description: 'Balanced' },
    { value: 'high', label: 'High', description: 'Best quality' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-2xl font-heading text-gray-800">Accessibility Settings</h2>
                  <p className="text-sm text-gray-600">Customize your experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close accessibility settings"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-emerald-600" />
                  Theme
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleUpdateSetting('theme', theme.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        settings.theme === theme.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-pressed={settings.theme === theme.value}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {theme.icon}
                          <span className="font-medium text-gray-800">{theme.label}</span>
                        </div>
                        {settings.theme === theme.value && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{theme.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-emerald-600" />
                  Font Size
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {fontSizes.map((fontSize) => (
                    <button
                      key={fontSize.value}
                      onClick={() => handleUpdateSetting('fontSize', fontSize.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.fontSize === fontSize.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-pressed={settings.fontSize === fontSize.value}
                    >
                      <div className="text-center">
                        <div className="font-medium text-gray-800 mb-1">{fontSize.label}</div>
                        <div className="text-gray-600" style={{ fontSize: fontSize.size }}>Aa</div>
                      </div>
                      {settings.fontSize === fontSize.value && (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  Audio Quality
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {audioQualities.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => handleUpdateSetting('audioQuality', quality.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        settings.audioQuality === quality.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-pressed={settings.audioQuality === quality.value}
                    >
                      <div className="font-medium text-gray-800 mb-1">{quality.label}</div>
                      <div className="text-sm text-gray-600">{quality.description}</div>
                      {settings.audioQuality === quality.value && (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  Behavior
                </h3>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">Reduce Motion</div>
                      <div className="text-sm text-gray-600">Minimize animations</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) => handleUpdateSetting('reduceMotion', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">Keyboard Shortcuts</div>
                      <div className="text-sm text-gray-600">Enable quick navigation</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.keyboardShortcutsEnabled}
                    onChange={(e) => handleUpdateSetting('keyboardShortcutsEnabled', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">Auto-Play Audio</div>
                      <div className="text-sm text-gray-600">Play next story automatically</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) => handleUpdateSetting('autoPlay', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">Notifications</div>
                      <div className="text-sm text-gray-600">Receive app notifications</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => handleUpdateSetting('notificationsEnabled', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
              </div>

              {settings.keyboardShortcutsEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    Keyboard Shortcuts
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div><kbd className="px-2 py-1 bg-white rounded">Alt + 1</kbd> Dashboard</div>
                    <div><kbd className="px-2 py-1 bg-white rounded">Alt + 2</kbd> Text-to-Speech</div>
                    <div><kbd className="px-2 py-1 bg-white rounded">Alt + H</kbd> Home</div>
                    <div><kbd className="px-2 py-1 bg-white rounded">/</kbd> Focus Search</div>
                    <div><kbd className="px-2 py-1 bg-white rounded">Esc</kbd> Close/Unfocus</div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {saving ? 'Saving...' : 'Changes saved automatically'}
              </div>
              <Button onClick={onClose} className="bg-gradient-to-r from-emerald-500 to-teal-500">
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccessibilityControls;
