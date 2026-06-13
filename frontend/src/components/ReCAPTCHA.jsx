import React, { useEffect, useRef, useState } from 'react';

const ReCAPTCHA = ({ siteKey, onChange, theme = 'light' }) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 1. Check if recaptcha script is already loaded and ready
        if (window.grecaptcha && window.grecaptcha.render) {
            setIsLoaded(true);
            return;
        }

        // 2. Define global callback for script load
        window.onloadRecaptchaCallbackAdmin = () => {
            setIsLoaded(true);
        };

        // 3. Inject script if not present
        const existingScript = document.getElementById('recaptcha-script');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'recaptcha-script';
            script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallbackAdmin&render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        } else {
            // Script exists but callback hasn't fired yet
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
                callback: (token) => onChange(token),
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
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <div ref={containerRef} />
        </div>
    );
};

export default ReCAPTCHA;
