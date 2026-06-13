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

const isEnterprise = (siteKey: string): boolean => {
  if (import.meta.env.VITE_RECAPTCHA_IS_ENTERPRISE === 'true' || import.meta.env.VITE_RECAPTCHA_IS_ENTERPRISE === true) {
    return true;
  }
  if (siteKey.startsWith('6Led') || siteKey.startsWith('6LdL')) {
    return true;
  }
  return false;
};

export default function ReCAPTCHA({ siteKey, onChange, theme = 'dark' }: ReCAPTCHAProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const enterprise = isEnterprise(siteKey);
    const apiObject = enterprise ? (window.grecaptcha && window.grecaptcha.enterprise) : window.grecaptcha;

    // 1. Check if recaptcha script is already loaded and ready
    if (apiObject && apiObject.render) {
      setIsLoaded(true);
      return;
    }

    // 2. Define global callback for script load
    window.onloadRecaptchaCallback = () => {
      setIsLoaded(true);
    };

    // 3. Inject script if not present
    const scriptId = enterprise ? 'recaptcha-enterprise-script' : 'recaptcha-script';
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = enterprise
        ? `https://www.google.com/recaptcha/enterprise.js?onload=onloadRecaptchaCallback&render=explicit`
        : `https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // Script script element exists but callback hasn't fired yet
      const timer = setInterval(() => {
        const currentApiObject = enterprise ? (window.grecaptcha && window.grecaptcha.enterprise) : window.grecaptcha;
        if (currentApiObject && currentApiObject.render) {
          setIsLoaded(true);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [siteKey]);

  useEffect(() => {
    const enterprise = isEnterprise(siteKey);
    const apiObject = enterprise ? (window.grecaptcha && window.grecaptcha.enterprise) : window.grecaptcha;

    if (!isLoaded || !containerRef.current || !apiObject) return;

    // Render the recaptcha widget explicitly
    try {
      // Clear previous container content before rendering to avoid duplicate widgets
      containerRef.current.innerHTML = '';
      
      const widgetId = apiObject.render(containerRef.current, {
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
      if (widgetIdRef.current !== null && apiObject && apiObject.reset) {
        try {
          apiObject.reset(widgetIdRef.current);
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
