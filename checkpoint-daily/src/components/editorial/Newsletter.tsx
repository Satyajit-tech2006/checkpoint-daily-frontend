import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';

interface NewsletterProps {
  title?: string;
  description?: string;
}

export default function Newsletter({
  title = 'The Leonida Dispatch',
  description = 'Weekly verified GTA VI intelligence, map breakdowns, and arena battle results delivered every Friday. Zero spam.',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'subscribed'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    // Simulated network delay; ready to wire to Supabase newsletter_subscribers table in Phase 3
    await new Promise((resolve) => setTimeout(resolve, 600));

    setStatus('subscribed');
    setEmail('');
    showToast({
      type: 'success',
      title: 'Subscribed to The Leonida Dispatch',
      description: 'You are on the list for Friday editorial briefings.',
    });
  };

  return (
    <section
      aria-label="Newsletter Subscription"
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Mail className="h-3.5 w-3.5" />
            <span>Weekly Briefing</span>
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>

        <div className="w-full lg:max-w-md">
          {status === 'subscribed' ? (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-bold text-white">You&apos;re in the loop.</p>
                <p className="text-xs text-emerald-200/80">
                  Watch your inbox for our next Leonida intelligence report.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-2">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@vicecity.com"
                  aria-invalid={Boolean(error)}
                  className="h-11 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={status === 'submitting'}
                  className="h-11 shrink-0"
                >
                  Subscribe
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-xs font-medium text-red-400">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}