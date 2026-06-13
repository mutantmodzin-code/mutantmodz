import { useEffect, useRef, useState } from 'react';

interface ReCAPTCHAProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    grecaptcha?: any;
    onloadRecaptchaCallback?: () => void;
  }
}

export default function ReCAPTCHA({ siteKey, onChange, theme = 'dark' }: ReCAPTCHAProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Check if recaptcha script is already loaded and ready
    if (window.grecaptcha && window.grecaptcha.render) {
      setIsLoaded(true);
      return;
    }

    // 2. Define global callback for script load
    window.onloadRecaptchaCallback = () => {
      setIsLoaded(true);
    };

    // 3. Inject script if not present
    const existingScript = document.getElementById('recaptcha-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // Script script element exists but callback hasn't fired yet
      const timer = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          setIsLoaded(true);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.grecaptcha) return;

    // Render the recaptcha widget explicitly
    try {
      // Clear previous container content before rendering to avoid duplicate widgets
      containerRef.current.innerHTML = '';
      
      const widgetId = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        callback: (token: string) => onChange(token),
        'expired-callback': () => onChange(null),
        'error-callback': () => onChange(null)
      });
      widgetIdRef.current = widgetId;
    } catch (e) {
      console.error('Error rendering reCAPTCHA:', e);
    }

    return () => {
      // Clean up widget on unmount
      if (widgetIdRef.current !== null && window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isLoaded, siteKey, theme, onChange]);

  return (
    <div className="flex justify-center my-4 overflow-hidden rounded-xl bg-zinc-900/40 p-2 border border-white/5">
      <div ref={containerRef} />
    </div>
  );
}
