import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Terminal,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  X,
  Database,
  Cloud,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  type EnvKey,
  type EnvValidationResult,
  REQUIRED_ENV_KEYS,
  saveEphemeralEnv,
  clearEphemeralEnv,
  dismissEnvPromptForSession,
} from '../utils/envValidator';

interface EnvValidationModalProps {
  isOpen: boolean;
  validation: EnvValidationResult;
  onClose: () => void;
  onApplySessionEnv: (values: Record<EnvKey, string>) => Promise<void>;
  onClearSessionEnv: () => void;
}

export const EnvValidationModal: React.FC<EnvValidationModalProps> = ({
  isOpen,
  validation,
  onClose,
  onApplySessionEnv,
  onClearSessionEnv,
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'dotenv'>('session');
  const [formValues, setFormValues] = useState<Record<EnvKey, string>>({
    VITE_CLOUDINARY_CLOUD_NAME: validation.values.VITE_CLOUDINARY_CLOUD_NAME || '',
    VITE_CLOUDINARY_UPLOAD_PRESET: validation.values.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    TURSO_DATABASE_URL: validation.values.TURSO_DATABASE_URL || '',
    TURSO_AUTH_TOKEN: validation.values.TURSO_AUTH_TOKEN || '',
  });
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormValues({
      VITE_CLOUDINARY_CLOUD_NAME: validation.values.VITE_CLOUDINARY_CLOUD_NAME || '',
      VITE_CLOUDINARY_UPLOAD_PRESET: validation.values.VITE_CLOUDINARY_UPLOAD_PRESET || '',
      TURSO_DATABASE_URL: validation.values.TURSO_DATABASE_URL || '',
      TURSO_AUTH_TOKEN: validation.values.TURSO_AUTH_TOKEN || '',
    });
  }, [validation]);

  if (!isOpen) return null;

  const handleInputChange = (key: EnvKey, value: string) => {
    setValidationMessage(null);
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplySession = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyValue = REQUIRED_ENV_KEYS.some((k) => formValues[k]?.trim().length > 0);
    if (!hasAnyValue) {
      setValidationMessage(
        'Please enter at least one environment variable or click "Continue in Local Demo Mode" below.'
      );
      return;
    }

    setIsApplying(true);
    setValidationMessage(null);
    try {
      saveEphemeralEnv(formValues);
      await onApplySessionEnv(formValues);
      dismissEnvPromptForSession();
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const handleSkipForSession = () => {
    dismissEnvPromptForSession();
    onClose();
  };

  const handleCopyDotEnv = () => {
    const template = [
      '# GAZU Storefront Environment Configuration (.env)',
      `VITE_CLOUDINARY_CLOUD_NAME="${formValues.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloudinary_cloud_name'}"`,
      `VITE_CLOUDINARY_UPLOAD_PRESET="${formValues.VITE_CLOUDINARY_UPLOAD_PRESET || 'your_unsigned_upload_preset'}"`,
      `TURSO_DATABASE_URL="${formValues.TURSO_DATABASE_URL || 'libsql://your-db-name-org.turso.io'}"`,
      `TURSO_AUTH_TOKEN="${formValues.TURSO_AUTH_TOKEN || 'your_turso_auth_token'}"`,
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(template).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const hasSessionOverrides = validation.statuses.some((s) => s.source === 'session');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="env-validation-title"
    >
      <div className="bg-[#f8f7f4] border border-neutral-300 shadow-2xl w-full max-w-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-neutral-950 text-white px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-amber-500/15 border border-amber-400/30 text-amber-300 mt-0.5 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="env-validation-title"
                  className="text-sm sm:text-base font-bold uppercase tracking-wider text-white"
                >
                  Environment Configuration Check
                </h2>
                <span
                  className={`text-[10px] sm:text-[11px] font-mono uppercase px-2 py-0.5 border shrink-0 ${
                    validation.isValid
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  }`}
                >
                  {validation.presentKeys.length} / {REQUIRED_ENV_KEYS.length} Ready
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {validation.isValid
                  ? 'All Cloudinary and Turso environment variables are active.'
                  : `Missing ${validation.missingKeys.length} environment variable(s). Supply them ephemerally for this session or update your .env file.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipForSession}
            aria-label="Close environment configuration dialog"
            className="text-neutral-400 hover:text-white p-2 -mr-1 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Summary Strip */}
        <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Detected Variable Status
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {validation.statuses.map((item) => (
              <div
                key={item.key}
                className={`flex items-center justify-between px-3 py-2 border text-xs ${
                  item.present
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.present ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <code className="font-mono text-[11px] truncate font-medium">{item.key}</code>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ml-2 shrink-0 ${
                    item.source === 'env'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.source === 'session'
                        ? 'bg-blue-100 text-blue-800'
                        : item.source === 'local'
                          ? 'bg-neutral-200 text-neutral-800'
                          : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.source === 'env'
                    ? '.env'
                    : item.source === 'session'
                      ? 'Session'
                      : item.source === 'local'
                        ? 'Saved'
                        : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-neutral-200 bg-neutral-100 px-3 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'session'
                ? 'border-neutral-900 text-neutral-950 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            1. Ephemeral Session Input
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dotenv')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dotenv'
                ? 'border-neutral-900 text-neutral-950 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 shrink-0" />
            2. Update .env File Guide
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'session' ? (
          <form onSubmit={handleApplySession} className="p-4 sm:p-6 space-y-5">
            <div className="bg-neutral-900 text-neutral-100 p-3.5 text-xs flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">Ephemeral Session Storage:</span> Values
                entered below are held strictly in browser{' '}
                <code className="font-mono text-amber-300">sessionStorage</code> for this tab only
                and are automatically wiped as soon as you close the tab.
              </div>
            </div>

            {validationMessage && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                {validationMessage}
              </div>
            )}

            {/* Cloudinary Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                <Cloud className="w-4 h-4 text-neutral-600" />
                Cloudinary Media Delivery & Unsigned Upload
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="env-cloudinary-cloud-name"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    VITE_CLOUDINARY_CLOUD_NAME
                  </label>
                  <input
                    id="env-cloudinary-cloud-name"
                    type="text"
                    value={formValues.VITE_CLOUDINARY_CLOUD_NAME}
                    onChange={(e) =>
                      handleInputChange('VITE_CLOUDINARY_CLOUD_NAME', e.target.value)
                    }
                    placeholder="e.g. dxyz12345"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="env-cloudinary-upload-preset"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    VITE_CLOUDINARY_UPLOAD_PRESET
                  </label>
                  <input
                    id="env-cloudinary-upload-preset"
                    type="text"
                    value={formValues.VITE_CLOUDINARY_UPLOAD_PRESET}
                    onChange={(e) =>
                      handleInputChange('VITE_CLOUDINARY_UPLOAD_PRESET', e.target.value)
                    }
                    placeholder="e.g. gazu_unsigned"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Turso Section */}
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                <Database className="w-4 h-4 text-neutral-600" />
                Turso Edge SQLite Database
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="env-turso-url"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    TURSO_DATABASE_URL
                  </label>
                  <input
                    id="env-turso-url"
                    type="text"
                    value={formValues.TURSO_DATABASE_URL}
                    onChange={(e) => handleInputChange('TURSO_DATABASE_URL', e.target.value)}
                    placeholder="libsql://your-db-org.turso.io"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="env-turso-token"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    TURSO_AUTH_TOKEN
                  </label>
                  <div className="relative">
                    <input
                      id="env-turso-token"
                      type={showToken ? 'text' : 'password'}
                      value={formValues.TURSO_AUTH_TOKEN}
                      onChange={(e) => handleInputChange('TURSO_AUTH_TOKEN', e.target.value)}
                      placeholder="eyJhbGciOiJFZERTQSI..."
                      className="w-full pl-3 pr-9 py-2 bg-white border border-neutral-300 text-xs font-mono focus:outline-none focus:border-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((prev) => !prev)}
                      aria-label={showToken ? 'Hide Turso auth token' : 'Show Turso auth token'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkipForSession}
                  className="px-4 py-2.5 border border-neutral-300 bg-white text-neutral-800 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                >
                  Continue in Local Demo Mode
                </button>
                {hasSessionOverrides && (
                  <button
                    type="button"
                    onClick={() => {
                      clearEphemeralEnv();
                      onClearSessionEnv();
                    }}
                    className="px-3 py-2.5 border border-red-200 bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-wider hover:bg-red-100 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Session
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isApplying}
                className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isApplying ? 'Applying...' : 'Apply for Current Session'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            <div className="space-y-2 text-xs text-neutral-700 leading-relaxed">
              <p className="font-semibold text-neutral-950">
                Permanent Configuration via <code className="font-mono">.env</code> File:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-700">
                <li>
                  Create or open the <code className="font-mono bg-neutral-200 px-1 py-0.5">.env</code>{' '}
                  file in the root directory of your project (alongside{' '}
                  <code className="font-mono bg-neutral-200 px-1 py-0.5">package.json</code>).
                </li>
                <li>
                  Paste the 4 environment variables below and replace the placeholder strings with
                  your live Cloudinary and Turso credentials.
                </li>
                <li>
                  Restart the development server (<code className="font-mono">npm run dev</code>) or
                  redeploy on Cloudflare Pages so Vite loads the new values at startup.
                </li>
              </ol>
            </div>

            <div className="bg-neutral-950 text-neutral-100 p-4 border border-neutral-800 relative">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-800">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  .env File Configuration
                </span>
                <button
                  type="button"
                  onClick={handleCopyDotEnv}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-mono transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy .env Template
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`# Cloudinary Media Delivery & Unsigned Upload
VITE_CLOUDINARY_CLOUD_NAME="${formValues.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloudinary_cloud_name'}"
VITE_CLOUDINARY_UPLOAD_PRESET="${formValues.VITE_CLOUDINARY_UPLOAD_PRESET || 'your_unsigned_upload_preset'}"

# Turso Edge SQLite Database
TURSO_DATABASE_URL="${formValues.TURSO_DATABASE_URL || 'libsql://your-db-name-org.turso.io'}"
TURSO_AUTH_TOKEN="${formValues.TURSO_AUTH_TOKEN ? '••••••••••••' : 'your_turso_auth_token'}"`}
              </pre>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkipForSession}
                className="px-4 py-2.5 border border-neutral-300 bg-white text-neutral-800 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors"
              >
                Continue in Local Demo Mode
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('session')}
                className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Enter Values for Current Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
