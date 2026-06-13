import React, { useEffect, useRef, useState } from 'react';

const isEnterprise = (siteKey) => {
    if (import.meta.env.VITE_RECAPTCHA_IS_ENTERPRISE === 'true' || import.meta.env.VITE_RECAPTCHA_IS_ENTERPRISE === true) {
        return true;
    }
    if (siteKey && (siteKey.startsWith('6Led') || siteKey.startsWith('6LdL'))) {
        return true;
    }
    return false;
};

const ReCAPTCHA = ({ siteKey, onChange, theme = 'light' }) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
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
        window.onloadRecaptchaCallbackAdmin = () => {
            setIsLoaded(true);
        };

        // 3. Inject script if not present
        const scriptId = enterprise ? 'recaptcha-enterprise-script' : 'recaptcha-script';
        const existingScript = document.getElementById(scriptId);
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = enterprise
                ? `https://www.google.com/recaptcha/enterprise.js?onload=onloadRecaptchaCallbackAdmin&render=explicit`
                : `https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallbackAdmin&render=explicit`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        } else {
            // Script exists but callback hasn't fired yet
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
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <div ref={containerRef} />
        </div>
    );
};

export default ReCAPTCHA;
