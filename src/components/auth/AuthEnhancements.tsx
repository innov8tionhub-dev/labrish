import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Settings,
  Lock,
  Unlock,
  Globe,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/common/Toast';
import { supabase } from '@/lib/supabase';
import { useAnalytics } from '@/lib/analytics';

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface SecuritySession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  ipAddress: string;
  userAgent: string;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'mfa_enabled' | 'suspicious_activity';
  timestamp: string;
  location: string;
  device: string;
  success: boolean;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'method' | 'setup' | 'verify'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'app' | 'sms'>('app');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { success: showSuccess, error: showError } = useToast();
  const { track } = useAnalytics();

  const generateMFASecret = () => {
    // Generate a base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateQRCode = (secret: string) => {
    const user = supabase.auth.getUser();
    const issuer = 'Labrish';
    const accountName = 'user@example.com'; // Replace with actual user email
    const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
    
    // In a real implementation, you'd use a QR code library
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

  const handleMethodSelect = (method: 'app' | 'sms') => {
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
      // In a real implementation, verify the TOTP code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
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
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleMethodSelect('sms')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-gray-400" />
                  <div>
                    <h4 className="font-semibold text-gray-800">SMS (Coming Soon)</h4>
                    <p className="text-sm text-gray-600">Receive codes via text message</p>
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

        {step === 'verify' && (
          <>
            <h3 className="font-heading text-2xl text-gray-800 mb-4">Verify Setup</h3>
            <p className="text-gray-600 mb-6">
              Enter the 6-digit code from your authenticator app to complete setup:
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
                Enter the code from your authenticator app
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

const SecurityDashboard: React.FC = () => {
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { success: showSuccess, error: showError } = useToast();
  const { track } = useAnalytics();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    
    // Simulate loading security data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSessions([
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'Kingston, Jamaica',
        lastActive: '2 minutes ago',
        current: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'Port of Spain, Trinidad',
        lastActive: '2 hours ago',
        current: false,
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
      }
    ]);
    
    setSecurityEvents([
      {
        id: '1',
        type: 'login',
        timestamp: '2024-01-15T10:30:00Z',
        location: 'Kingston, Jamaica',
        device: 'Chrome on Windows',
        success: true
      },
      {
        id: '2',
        type: 'password_change',
        timestamp: '2024-01-14T15:45:00Z',
        location: 'Kingston, Jamaica',
        device: 'Chrome on Windows',
        success: true
      }
    ]);
    
    setLoading(false);
  };

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

  const terminateSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showSuccess('Session terminated');
    track('session_terminated', { session_id: sessionId });
  };

  const terminateAllOtherSessions = async () => {
    if (confirm('This will sign you out of all other devices. Continue?')) {
      setSessions(prev => prev.filter(s => s.current));
      showSuccess('All other sessions terminated');
      track('all_sessions_terminated');
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return <User className="w-4 h-4 text-green-600" />;
      case 'logout': return <User className="w-4 h-4 text-gray-600" />;
      case 'password_change': return <Key className="w-4 h-4 text-blue-600" />;
      case 'mfa_enabled': return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-red-600" />;
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
        {/* Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="font-heading text-3xl text-gray-800">Security Settings</h1>
              <p className="text-gray-600">Manage your account security and privacy</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Authentication Settings */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-heading text-xl text-gray-800 mb-6">Authentication</h2>
            
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mfaEnabled ? 'bg-green-100' : 'bg-gray-100'
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
                      {mfaEnabled ? 'Enabled' : 'Add an extra layer of security'}
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

              {/* Password */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Password</h3>
                    <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              {/* Recovery Options */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Account Recovery</h3>
                    <p className="text-sm text-gray-600">Set up recovery methods</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Active Sessions */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl text-gray-800">Active Sessions</h2>
              <Button onClick={terminateAllOtherSessions} variant="outline" size="sm">
                End All Others
              </Button>
            </div>
            
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.current ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Globe className={`w-5 h-5 ${
                          session.current ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          {session.device}
                          {session.current && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{session.location}</p>
                        <p className="text-xs text-gray-500">Last active: {session.lastActive}</p>
                      </div>
                    </div>
                    
                    {!session.current && (
                      <Button
                        onClick={() => terminateSession(session.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        End
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Security Events */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="font-heading text-xl text-gray-800 mb-6">Recent Security Activity</h2>
          
          <div className="space-y-4">
            {securityEvents.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">
                    {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {event.location} • {event.device}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.success 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {event.success ? 'Success' : 'Failed'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* MFA Setup Modal */}
        {showMFASetup && (
          <MFASetup
            onComplete={handleMFAComplete}
            onCancel={() => setShowMFASetup(false)}
          />
        )}
      </div>
    </div>
  );
};

export { SecurityDashboard, MFASetup };
export default SecurityDashboard;