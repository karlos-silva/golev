'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

// Init no nível do módulo (client-only) → roda antes dos effects, então o
// posthog já está pronto quando o primeiro $pageview/evento dispara.
if (typeof window !== 'undefined' && KEY) {
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // capturamos manualmente (App Router)
    capture_pageleave: true,
    person_profiles: 'identified_only',
  });
}

function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (KEY) posthog.capture('$pageview', { $current_url: window.location.href });
  }, [pathname]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!KEY) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      {children}
    </PHProvider>
  );
}
