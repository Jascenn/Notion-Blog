'use client';

import { useState } from 'react';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function EmailSubscribeForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'submitting') return;

    setState('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setState('success');
        setMessage(data.duplicate ? '这个邮箱已经订阅过了。' : '订阅成功！新文章发布后会通过邮件通知你。');
      } else {
        setState('error');
        setMessage(data.error || '订阅失败，请稍后重试。');
      }
    } catch {
      setState('error');
      setMessage('网络错误，请稍后重试。');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="shrink-0 rounded bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm text-white dark:text-gray-900 transition-colors hover:bg-gray-700 dark:hover:bg-white disabled:opacity-50"
        >
          {state === 'submitting' ? '提交中…' : '订阅更新'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${state === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>{message}</p>
      )}
      <p className="text-xs text-gray-400">只在新文章发布时发送邮件，随时可以退订。</p>
    </form>
  );
}
