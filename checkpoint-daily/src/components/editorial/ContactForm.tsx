import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('tip');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Fields',
        description: 'Please fill in your name, email, and message.',
      });
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
    setSubmitted(true);
    showToast({
      type: 'success',
      title: 'Dispatch Received',
      description: 'Our editorial desk will review your message shortly.',
    });
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
        <h3 className="font-display text-xl font-bold text-white">Transmission Logged</h3>
        <p className="text-sm text-zinc-300">
          Thank you for reaching out to Checkpoint Daily. If you submitted a news tip, our verification team will review your sources.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Your Name / Handle"
          placeholder="Alex Rivera"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Select
        label="Inquiry Department"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        options={[
          { value: 'tip', label: 'News Tip / Rumour Radar Lead' },
          { value: 'correction', label: 'Editorial Correction' },
          { value: 'community', label: 'Arena & Account Support' },
          { value: 'press', label: 'Press & Partnerships' },
        ]}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Include links, patent numbers, or details..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        leftIcon={<Send className="h-4 w-4" />}
      >
        Send Transmission
      </Button>
    </form>
  );
}