import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';

export interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmitAuth?: (payload: {
    mode: 'login' | 'register';
    email: string;
    password: string;
    username?: string;
  }) => Promise<void>;
}

export default function AuthForm({ mode, onSubmitAuth }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const nextErrors: { username?: string; email?: string; password?: string } = {};
    if (mode === 'register') {
      const cleanUser = username.trim();
      if (cleanUser.length < 3 || cleanUser.length > 20 || !/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
        nextErrors.username = 'Use 3–20 characters (letters, numbers, or underscores).';
      }
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (onSubmitAuth) {
        await onSubmitAuth({
          mode,
          email: email.trim(),
          password,
          username: mode === 'register' ? username.trim() : undefined,
        });
      } else {
        // Temporary simulation until Phase 3 wires Supabase Auth
        await new Promise((r) => setTimeout(r, 600));
      }

      showToast({
        type: 'success',
        title: mode === 'login' ? 'Welcome Back, Operative' : 'Account Created',
        description:
          mode === 'login'
            ? 'Session verified. Redirecting to the Arena...'
            : 'Check your inbox or proceed to choose your faction.',
      });

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/profile';
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 650);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        description: err instanceof Error ? err.message : 'Invalid credentials or network error.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:p-8 shadow-2xl">
      <div className="mb-6 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Checkpoint ID</span>
        </div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          {mode === 'login' ? 'Sign In to Arena' : 'Create Operative ID'}
        </h1>
        <p className="text-sm text-zinc-400">
          {mode === 'login'
            ? 'Access your faction allegiance, weekly ballots, and leaderboard rank.'
            : 'Register once to pledge permanent allegiance to a Leonida faction and vote weekly.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {mode === 'register' && (
          <Input
            label="Operative Handle"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="vice_runner_01"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            hint="Displayed on public faction rosters."
          />
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full"
          >
            {mode === 'login' ? 'Sign In' : 'Register & Enter'}
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-zinc-800/80 pt-5 text-center text-xs text-zinc-400">
        {mode === 'login' ? (
          <p>
            New to Checkpoint Daily?{' '}
            <a href="/register" className="font-bold text-amber-400 hover:underline">
              Create an account
            </a>
          </p>
        ) : (
          <p>
            Already have an Operative ID?{' '}
            <a href="/login" className="font-bold text-amber-400 hover:underline">
              Sign in here
            </a>
          </p>
        )}
      </div>
    </div>
  );
}