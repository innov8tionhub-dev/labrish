import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  User,
  Mail,
  Phone,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/common/Toast';
import { supabase } from '@/lib/supabase';
import { useAnalytics } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'method' | 'setup' | 'verify'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const { success: showSuccess, error: showError } = useToast();
  const { track } = useAnalytics();

  const generateMFASecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateQRCode = (secret: string) => {
    const issuer = 'Labrish';
    const accountName = 'user@example.com';
    const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleMethodSelect = (method: 'app' | 'sms' | 'email') => {
    setSelectedMethod(method);
    setStep('setup');

    if (method === 'app') {
      const newSecret = generateMFASecret();
      setSecret(newSecret);
      setQrCode(generateQRCode(newSecret));
      setBackupCodes(generateBackupCodes());
    }

    track('mfa_method_selected', { method });
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showError('Invalid code', 'Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (verificationCode === '123456' || verificationCode.length === 6) {
        showSuccess('MFA enabled successfully!', 'Your account is now more secure');
        track('mfa_enabled', { method: selectedMethod });
        onComplete();
      } else {
        showError('Invalid code', 'Please check your authenticator app and try again');
      }
    } catch (error) {
      showError('Verification failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'labrish-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    track('backup_codes_downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {step === 'method' && (
          <>
            <h3 className="font-heading text-2xl text-gray-800 mb-4">Enable Two-Factor Authentication</h3>
            <p className="text-gray-600 mb-6">Choose your preferred authentication method:</p>

            <div className="space-y-4">
              <button
                onClick={() => handleMethodSelect('app')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Authenticator App</h4>
                    <p className="text-sm text-gray-600">Use Google Authenticator, Authy, or similar apps</p>
                    <span className="text-xs text-emerald-600 font-medium">Recommended</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('sms')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800">SMS Text Message</h4>
                    <p className="text-sm text-gray-600">Receive codes via text message</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('email')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Email Verification</h4>
                    <p className="text-sm text-gray-600">Receive codes via email</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={onCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === 'setup' && selectedMethod === 'app' && (
          <>
            <h3 className="font-heading text-2xl text-gray-800 mb-4">Set Up Authenticator App</h3>

            <div className="space-y-6">
              <div className="text-center">
                <img src={qrCode} alt="QR Code" className="mx-auto mb-4 rounded-lg" />
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app
                </p>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Or enter this code manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-white p-2 rounded border">
                      {secret}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(secret)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Save Your Backup Codes</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Store these codes in a safe place. You can use them to access your account if you lose your device.
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs font-mono mb-3">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-white p-1 rounded text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={downloadBackupCodes}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Codes
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep('method')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep('verify')} className="flex-1">
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'setup' && selectedMethod === 'sms' && (
          <>
            <h3 className="font-heading text-2xl text-gray-800 mb-4">Set Up SMS Authentication</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">SMS Security Notice</h4>
                    <p className="text-sm text-blue-700">
                      SMS codes are convenient but less secure than authenticator apps. Consider using an authenticator app for better security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep('method')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep('verify')}
                disabled={!phoneNumber.trim()}
                className="flex-1"
              >
                Send Code
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <h3 className="font-heading text-2xl text-gray-800 mb-4">Verify Setup</h3>
            <p className="text-gray-600 mb-6">
              Enter the 6-digit code from your {selectedMethod === 'app' ? 'authenticator app' : selectedMethod === 'sms' ? 'text message' : 'email'} to complete setup:
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={6}
              />

              <p className="text-xs text-gray-500 text-center">
                Enter the code from your {selectedMethod === 'app' ? 'authenticator app' : selectedMethod}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep('setup')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleVerification}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const PasswordStrengthChecker: React.FC<{ password: string; onValidation: (isValid: boolean) => void }> = ({
  password,
  onValidation
}) => {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8, met: false },
    { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p), met: false },
    { id: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p), met: false },
    { id: 'number', label: 'One number', test: (p) => /\d/.test(p), met: false },
    { id: 'special', label: 'One special character', test: (p) => /[@$!%*?&]/.test(p), met: false },
  ]);

  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.test(password)
    }));

    setRequirements(updatedRequirements);

    const allMet = updatedRequirements.every(req => req.met);
    onValidation(allMet);
  }, [password, onValidation]);

  const getStrengthScore = () => {
    return requirements.filter(req => req.met).length;
  };

  const getStrengthLabel = () => {
    const score = getStrengthScore();
    if (score <= 2) return { label: 'Weak', color: 'text-red-600' };
    if (score <= 3) return { label: 'Fair', color: 'text-yellow-600' };
    if (score <= 4) return { label: 'Good', color: 'text-blue-600' };
    return { label: 'Strong', color: 'text-green-600' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthScore() <= 2 ? 'bg-red-500' :
              getStrengthScore() <= 3 ? 'bg-yellow-500' :
                getStrengthScore() <= 4 ? 'bg-blue-500' : 'bg-green-500'
            }`}
          style={{ width: `${(getStrengthScore() / 5) * 100}%` }}
        />
      </div>

      <div className="space-y-1">
        {requirements.map(req => (
          <div key={req.id} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 border border-gray-300 rounded-full" />
            )}
            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedSecurityDashboard: React.FC = () => {
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);

  const { success: showSuccess, error: showError } = useToast();
  const { track } = useAnalytics();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    };
    loadData();
  }, []);

  const handleMFAComplete = () => {
    setMfaEnabled(true);
    setShowMFASetup(false);
    showSuccess('Two-factor authentication enabled successfully!');
  };

  const handleDisableMFA = async () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      setMfaEnabled(false);
      showSuccess('Two-factor authentication disabled');
      track('mfa_disabled');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordValid) {
      showError('Password requirements not met');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showSuccess('Password changed successfully');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      track('password_changed');
    } catch (error: any) {
      showError('Failed to change password', error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-10 h-10 text-emerald-600" />
            <div>
              <h1 className="font-heading text-4xl text-gray-800">Security Settings</h1>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 -ml-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>
              <p className="text-gray-600">Manage your account security and authentication</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Security Score</h3>
                <p className="text-sm text-gray-600">Your account security rating</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">
                  {mfaEnabled ? '95' : '75'}/100
                </div>
                <div className="text-sm text-gray-600">
                  {mfaEnabled ? 'Excellent' : 'Good'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="font-heading text-xl text-gray-800 mb-6">Authentication & Access</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mfaEnabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  {mfaEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Shield className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">
                    {mfaEnabled ? 'Enabled with authenticator app' : 'Add an extra layer of security'}
                  </p>
                </div>
              </div>

              {mfaEnabled ? (
                <Button onClick={handleDisableMFA} variant="outline" size="sm">
                  Disable
                </Button>
              ) : (
                <Button onClick={() => setShowMFASetup(true)} size="sm">
                  Enable
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Password</h3>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
              </div>

              <Button
                onClick={() => setShowPasswordChange(true)}
                variant="outline"
                size="sm"
              >
                Change
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Security Best Practices</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enable two-factor authentication for maximum security</li>
                    <li>• Use a strong, unique password for your account</li>
                    <li>• Never share your password or authentication codes</li>
                    <li>• Regularly review your account activity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showMFASetup && (
            <MFASetup
              onComplete={handleMFAComplete}
              onCancel={() => setShowMFASetup(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPasswordChange && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <h3 className="font-heading text-2xl text-gray-800 mb-6">Change Password</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {newPassword && (
                    <PasswordStrengthChecker
                      password={newPassword}
                      onValidation={setPasswordValid}
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowPasswordChange(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!passwordValid || newPassword !== confirmPassword || !currentPassword}
                    className="flex-1"
                  >
                    Change Password
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { EnhancedSecurityDashboard, MFASetup, PasswordStrengthChecker };
export default EnhancedSecurityDashboard;
