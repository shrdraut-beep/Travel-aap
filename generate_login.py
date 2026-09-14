import sys

with open("src/premium/LoginScreen.tsx", "r") as f:
    premium_code = f.read()

# We will modify the premium_code to match the required interface and include test buttons.
# 1. Imports
premium_code = premium_code.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport { useAuthStore } from "../../store/useAuthStore";\nimport { signInWithGoogle } from "../../firebase";'
)

# 2. Interface
premium_code = premium_code.replace(
    'export interface LoginScreenProps {\n  brandName?: string;\n  onSubmit?: (payload: LoginPayload) => void;\n  onSocial?: (provider: SocialProvider) => void;\n  onForgotPassword?: (identifier: string) => void;\n  onContinueAsGuest?: () => void;\n}',
    'export interface LoginScreenProps {\n  brandName?: string;\n  onLogin: (role: string) => void;\n  onContinueAsGuest?: () => void;\n}'
)

# 3. Component signature
premium_code = premium_code.replace(
    'export const LoginScreen: React.FC<LoginScreenProps> = ({\n  brandName = "RouTripO",\n  onSubmit,\n  onSocial,\n  onForgotPassword,\n  onContinueAsGuest\n}) => {',
    'export const LoginScreen: React.FC<LoginScreenProps> = ({\n  brandName = "RouTripO",\n  onLogin,\n  onContinueAsGuest\n}) => {'
)

# 4. State & Functions to add handleTestLogin and loading
handle_test_login_code = """
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleTestLogin = async (role: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const mockUser = {
        id: `mock-${role}-${Date.now()}`,
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
        email: `${role}@test.com`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(role.charAt(0).toUpperCase() + role.slice(1))}&background=4f46e5&color=fff&bold=true`,
        role: role as 'user' | 'agent' | 'admin'
      };
      const { loginWithUser } = useAuthStore.getState();
      loginWithUser(mockUser);
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(role);
    } catch (err) {
      console.error('Mock login failed:', err);
      setAuthError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLogin('user');
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      setAuthError(err?.message || "Google authentication failed.");
      setLoading(false);
    }
  };
"""

premium_code = premium_code.replace(
    '  const [remember, setRemember] = useState(false);\n  const [errors, setErrors] = useState<Record<string, string>>({});',
    '  const [remember, setRemember] = useState(false);\n  const [errors, setErrors] = useState<Record<string, string>>({});\n' + handle_test_login_code
)

# Replace handleSubmit to just do a test login for now
premium_code = premium_code.replace(
    'onSubmit?.({ mode, identifier: identifier.trim(), password, name: name.trim(), remember });',
    "handleTestLogin('user');"
)
premium_code = premium_code.replace(
    'onForgotPassword?.(identifier.trim())',
    "alert('Forgot Password triggered')"
)

# 5. Social buttons
socials_replacement = """
        <div className="grid grid-cols-3 gap-3">
          {SOCIALS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`Continue with ${label}`}
              onClick={() => {
                if (id === 'google') handleGoogleLogin();
                else handleTestLogin('user');
              }}
              className="flex h-13 flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-200 bg-white py-2 active:bg-slate-50"
            >
              <Icon className="h-5 w-5 text-[var(--premium-violet)]" />
              <span className="text-[11px] font-medium text-[var(--premium-muted)]">
                {label}
              </span>
            </button>
          ))}
        </div>
        
        {/* DEVELOPER / TESTING MODE */}
        <div className="w-full mt-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[var(--premium-pink)]"></span>
            <span className="text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider">
              DEVELOPER / TESTING MODE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={() => handleTestLogin('user')}
              className="bg-[var(--premium-ink)] text-white hover:opacity-90 text-xs font-semibold py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-center cursor-pointer"
            >
              Test as User
            </button>
            <button
              type="button"
              onClick={() => handleTestLogin('agent')}
              className="premium-gradient text-white hover:opacity-90 text-xs font-semibold py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-center cursor-pointer"
            >
              Test as Partner
            </button>
          </div>
        </div>
"""

# use regex to replace the SOCIALS map
import re
premium_code = re.sub(
    r'<div className="grid grid-cols-3 gap-3">.*?</div>',
    socials_replacement,
    premium_code,
    flags=re.DOTALL
)

# Add the loading spinner and auth error display at the bottom before main closes
loading_ui = """
        {authError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold text-center">
            {authError}
          </div>
        )}
        
        {loading && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-[32px] sm:rounded-none">
            <div className="w-9 h-9 border-3 border-white border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-white text-sm font-bold">Authenticating...</p>
          </div>
        )}
"""

premium_code = premium_code.replace(
    '      </main>\n    </div>',
    loading_ui + '\n      </main>\n    </div>'
)

# Remove the Continue as guest link as the screenshot doesn't have it (or we can keep it, let's keep it if we want, or remove to match perfectly)
premium_code = premium_code.replace(
    '<button\n          type="button"\n          onClick={onContinueAsGuest}\n          className="mt-6 w-full text-center text-[13px] font-bold text-[var(--premium-muted)]"\n        >\n          Continue as guest\n        </button>',
    ''
)

with open("src/components/routripo/LoginScreen.tsx", "w") as f:
    f.write(premium_code)

