'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

// Guarda contra duplo init (StrictMode em dev roda o efeito duas vezes).
let initialized = false;

function capturePageview() {
  posthog.capture('$pageview', { $current_url: window.location.href });
}

/**
 * Captura $pageview a cada navegação do App Router. Pula o 1º render — o
 * pageview inicial é disparado no efeito de init do provider, garantindo que
 * ocorra DEPOIS do init (no React, efeitos de filhos rodam antes dos do pai).
 */
function PageviewTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    capturePageview();
  }, [pathname]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Init em useEffect (após a hidratação). Inicializar no nível do módulo fazia o
  // posthog injetar o script dele no DOM antes do React hidratar, causando
  // hydration mismatch com o <script> de JSON-LD do layout. Este é o padrão
  // recomendado pelo PostHog no App Router.
  useEffect(() => {
    if (!KEY || initialized) return;
    initialized = true;
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: false, // capturamos manualmente (App Router)
      capture_pageleave: true,
      person_profiles: 'identified_only',
    });
    capturePageview(); // pageview inicial, já com o posthog pronto
  }, []);

  if (!KEY) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      {children}
    </PHProvider>
  );
}
