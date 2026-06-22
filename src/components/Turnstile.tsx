import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    turnstile?: any;
    onloadTurnstileCallback?: () => void;
  }
}

export default function Turnstile({ siteKey, onChange, theme = 'dark' }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Check if turnstile script is already loaded and ready
    if (window.turnstile && window.turnstile.render) {
      setIsLoaded(true);
      return;
    }

    // 2. Define global callback for script load
    window.onloadTurnstileCallback = () => {
      setIsLoaded(true);
    };

    // 3. Inject script if not present
    const scriptId = 'turnstile-script';
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      const timer = setInterval(() => {
        if (window.turnstile && window.turnstile.render) {
          setIsLoaded(true);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile) return;

    try {
      containerRef.current.innerHTML = '';
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        callback: (token: string) => onChange(token),
        'expired-callback': () => onChange(null),
        'error-callback': () => onChange(null)
      });
      widgetIdRef.current = widgetId;
    } catch (e) {
      console.error('Error rendering Turnstile:', e);
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile && window.turnstile.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isLoaded, siteKey, theme, onChange]);

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} />
    </div>
  );
}
