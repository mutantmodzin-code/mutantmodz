const isEnterprise = (siteKey) => {
  // Check if explicitly configured via env
  if (import.meta.env.VITE_RECAPTCHA_IS_ENTERPRISE === 'true' || import.meta.env.VITE_RECAPTCHA_IS_ENTERPRISE === true) {
    return true;
  }
  // Auto-detect based on the user's enterprise site key prefixes
  if (siteKey && (siteKey.startsWith('6Led') || siteKey.startsWith('6LdL'))) {
    return true;
  }
  return false;
};

export const loadRecaptchaV3 = (siteKey) => {
  return new Promise((resolve) => {
    const enterprise = isEnterprise(siteKey);
    const apiObject = enterprise ? (window.grecaptcha && window.grecaptcha.enterprise) : window.grecaptcha;

    if (apiObject && apiObject.execute) {
      resolve();
      return;
    }

    const scriptId = enterprise ? 'recaptcha-enterprise-script' : 'recaptcha-v3-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      const scriptUrl = enterprise 
        ? `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`
        : `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkLoaded = setInterval(() => {
      const currentApiObject = enterprise ? (window.grecaptcha && window.grecaptcha.enterprise) : window.grecaptcha;
      if (currentApiObject && currentApiObject.execute) {
        clearInterval(checkLoaded);
        resolve();
      }
    }, 100);
  });
};

export const executeRecaptchaV3 = async (siteKey, action) => {
  try {
    await loadRecaptchaV3(siteKey);
    const enterprise = isEnterprise(siteKey);
    return new Promise((resolve) => {
      const readyFunc = enterprise ? window.grecaptcha.enterprise.ready : window.grecaptcha.ready;
      readyFunc(async () => {
        try {
          const executeFunc = enterprise ? window.grecaptcha.enterprise.execute : window.grecaptcha.execute;
          const token = await executeFunc(siteKey, { action });
          resolve(token);
        } catch (err) {
          console.error('reCAPTCHA execution failed:', err);
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.error('reCAPTCHA load failed:', err);
    return null;
  }
};
